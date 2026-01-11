"""Structured data extractor for visualization data."""

import json
import logging
from typing import Optional, Any

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.config import get_settings
from app.models.enums import SectionId
from app.prompts.extraction_prompts import EXTRACTION_SYSTEM_PROMPT, get_extraction_prompt

logger = logging.getLogger(__name__)


async def extract_structured_data(
    raw_data: str,
    section_id: SectionId,
    company_name: str = None,
) -> Optional[dict[str, Any]]:
    """
    Extract structured data from raw research text for visualizations.
    
    Args:
        raw_data: Raw research data from Research Agent
        section_id: Which section to extract data for
        company_name: Name of the company being researched
        
    Returns:
        Structured data dict for visualization, or None if not applicable
    """
    # Get extraction prompt for this section
    extraction_prompt = get_extraction_prompt(section_id, raw_data, company_name)
    
    if not extraction_prompt:
        # No visualization for this section
        logger.debug(f"No extraction needed for section: {section_id.value}")
        return None
    
    logger.info(f"Extracting structured data for section: {section_id.value}")
    logger.debug(f"Raw data length: {len(raw_data)} chars")
    
    settings = get_settings()
    
    # Initialize model
    model = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        temperature=settings.extraction_temperature,
        google_api_key=settings.google_api_key,
    )
    
    messages = [
        SystemMessage(content=EXTRACTION_SYSTEM_PROMPT),
        HumanMessage(content=extraction_prompt),
    ]
    
    try:
        response = await model.ainvoke(messages)
        
        # Extract content
        content = response.content if hasattr(response, 'content') else str(response)
        logger.debug(f"Raw LLM response type: {type(content)}")
        
        # Handle Gemini 3+ list content format
        if isinstance(content, list):
            text_parts = []
            for block in content:
                if isinstance(block, dict) and 'text' in block:
                    text_parts.append(block['text'])
                elif isinstance(block, str):
                    text_parts.append(block)
            content = '\n'.join(text_parts)
        
        logger.debug(f"Extraction response (first 500 chars): {content[:500] if content else 'EMPTY'}")
        
        # Parse JSON from response
        structured_data = _parse_json_response(content)
        
        if structured_data:
            logger.info(f"Successfully extracted data for section: {section_id.value}")
            logger.debug(f"Extracted keys: {list(structured_data.keys())}")
        else:
            logger.warning(f"No structured data extracted for section: {section_id.value}")
            logger.warning(f"Failed to parse JSON from response: {content[:200] if content else 'EMPTY'}")
        
        return structured_data
        
    except Exception as e:
        logger.error(f"Failed to extract data for {section_id.value}: {str(e)}", exc_info=True)
        return None


def _parse_json_response(content: str) -> Optional[dict]:
    """Parse JSON from LLM response, handling various formats."""
    # Try direct JSON parse first
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass
    
    # Try to extract JSON from markdown code block
    import re
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass
    
    # Try to find JSON object in text
    json_match = re.search(r'\{[\s\S]*\}', content)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass
    
    return None


def generate_visualization_data(
    section_id: SectionId,
    structured_data: Optional[dict],
) -> Optional[dict[str, Any]]:
    """
    Transform extracted structured data into Recharts-compatible format.
    
    The output format must match what the frontend VisualizationRenderer expects:
    - leadership_governance: { ownership: [...], funding_history: [...] }
    - business_model: { revenue_breakdown: [...] }
    - competitive_landscape: { competitor_funding: [...], market_share: [...], target_company: str }
    - financials: { financial_metrics: [...] }
    
    Args:
        section_id: Which section this is for
        structured_data: Extracted data from extract_structured_data()
        
    Returns:
        Visualization data ready for Recharts, or empty dict if no valid data
    """
    if not structured_data:
        logger.warning(f"No structured data provided for {section_id.value}")
        return {}
    
    logger.info(f"Generating visualization data for {section_id.value}")
    logger.debug(f"Input structured_data keys: {list(structured_data.keys())}")
    
    try:
        if section_id == SectionId.LEADERSHIP_GOVERNANCE:
            result = _generate_ownership_chart(structured_data)
        elif section_id == SectionId.BUSINESS_MODEL:
            result = _generate_revenue_chart(structured_data)
        elif section_id == SectionId.COMPETITIVE_LANDSCAPE:
            result = _generate_competitor_chart(structured_data)
        elif section_id == SectionId.FINANCIALS:
            result = _generate_financials_chart(structured_data)
        else:
            result = {}
        
        if result:
            logger.info(f"Successfully generated visualization for {section_id.value}: {list(result.keys())}")
        else:
            logger.warning(f"No visualization data generated for {section_id.value}")
        
        return result or {}
    except Exception as e:
        logger.error(f"Failed to generate visualization for {section_id.value}: {str(e)}", exc_info=True)
        return {}


def _categorize_owner(name: str) -> str:
    """Categorize owner type based on name for color coding."""
    name_lower = name.lower()
    if any(term in name_lower for term in ['founder', 'promoter', 'ceo', 'executive', 'management']):
        return 'founder'
    elif any(term in name_lower for term in ['institutional', 'venture', 'vc', 'pe', 'fund', 'capital', 'investor']):
        return 'investor'
    elif any(term in name_lower for term in ['public', 'retail', 'individual']):
        return 'public'
    elif any(term in name_lower for term in ['employee', 'esop', 'stock option']):
        return 'employee'
    return 'other'


def _generate_ownership_chart(data: dict) -> dict:
    """Generate ownership pie chart data matching frontend OwnershipPieChart expectations."""
    ownership_data = data.get("ownership_data", [])
    funding_rounds = data.get("funding_rounds", [])
    
    result = {}
    
    # Generate ownership data for OwnershipPieChart
    # Frontend expects: { name: string, value: number, type: 'founder'|'investor'|'public'|'employee'|'other' }
    if ownership_data and len(ownership_data) > 0:
        chart_data = []
        for item in ownership_data:
            if isinstance(item, dict):
                name = item.get("name", "Unknown")
                value = item.get("value", 0)
                if value and value > 0:  # Only include items with positive values
                    chart_data.append({
                        "name": name,
                        "value": value,
                        "type": _categorize_owner(name),
                    })
        if chart_data:
            result["ownership"] = chart_data
    
    # Generate funding history for FundingLineChart
    # Frontend expects: { date: string, amount: number, round: string, valuation?: number }
    if funding_rounds and len(funding_rounds) > 0:
        funding_data = []
        for round_info in funding_rounds:
            if isinstance(round_info, dict):
                amount = round_info.get("amount_raised", 0)
                if amount and amount > 0:  # Only include rounds with funding amounts
                    funding_data.append({
                        "date": round_info.get("date", ""),
                        "amount": amount,
                        "round": round_info.get("round_name", "Unknown"),
                        "valuation": round_info.get("post_money_valuation"),
                    })
        if funding_data:
            result["funding_history"] = funding_data
    
    return result


def _generate_revenue_chart(data: dict) -> dict:
    """Generate revenue breakdown bar chart data matching frontend RevenueBarChart expectations."""
    revenue_streams = data.get("revenue_streams", [])
    
    if not revenue_streams or len(revenue_streams) == 0:
        return {}
    
    # Frontend expects: { segment: string, revenue: number, percentage?: number }
    chart_data = []
    for item in revenue_streams:
        if isinstance(item, dict):
            segment = item.get("segment", "Unknown")
            revenue = item.get("revenue", 0)
            if segment and (revenue or item.get("percentage")):  # Include if has revenue or percentage
                chart_data.append({
                    "segment": segment,
                    "revenue": revenue or 0,
                    "percentage": item.get("percentage"),
                })
    
    if not chart_data:
        return {}
    
    return {
        "revenue_breakdown": chart_data,
    }


def _generate_competitor_chart(data: dict) -> dict:
    """Generate competitor funding comparison chart data matching frontend expectations."""
    competitors = data.get("competitors", [])
    
    if not competitors or len(competitors) == 0:
        return {}
    
    result = {}
    target_company = None
    
    # Filter and sort by funding (descending)
    valid_competitors = []
    for item in competitors:
        if isinstance(item, dict):
            company_name = item.get("company", "Unknown")
            funding = item.get("funding", 0) or 0
            valid_competitors.append({
                "company": company_name,
                "funding": funding,
                "market_share": item.get("market_share"),
                "is_target": item.get("is_target", False),
            })
    
    if not valid_competitors:
        return {}
    
    sorted_competitors = sorted(
        valid_competitors,
        key=lambda x: x.get("funding", 0) or 0,
        reverse=True
    )
    
    # Frontend CompetitorFundingChart expects: { name: string, funding: number }
    funding_data = []
    # Frontend MarketSharePieChart expects: { company: string, share: number, isTarget?: boolean }
    market_share_data = []
    
    for item in sorted_competitors:
        company_name = item.get("company", "Unknown")
        is_target = item.get("is_target", False)
        
        # Track target company
        if is_target:
            target_company = company_name
        
        funding_data.append({
            "name": company_name,
            "funding": item.get("funding", 0),
        })
        
        # Build market share data if available
        market_share = item.get("market_share")
        if market_share is not None and market_share > 0:
            market_share_data.append({
                "company": company_name,
                "share": market_share,
                "isTarget": is_target,
            })
    
    if funding_data:
        result["competitor_funding"] = funding_data
    
    if target_company:
        result["target_company"] = target_company
    
    if market_share_data:
        result["market_share"] = market_share_data
    
    return result


def _generate_financials_chart(data: dict) -> dict:
    """Generate financial trends composed chart data matching frontend FinancialComposedChart expectations."""
    annual_data = data.get("annual_data", [])
    
    if not annual_data or len(annual_data) == 0:
        return {}
    
    # Frontend expects: { period: string, revenue: number, ebitda?: number, profit?: number, 
    #                     grossMargin?: number, ebitdaMargin?: number, profitMargin?: number }
    chart_data = []
    for item in annual_data:
        if not isinstance(item, dict):
            continue
            
        period = item.get("year", "")
        revenue = item.get("revenue")
        
        # Skip entries without period or revenue
        if not period:
            continue
        
        entry = {
            "period": period,
            "revenue": revenue,
        }
        
        # Add EBITDA
        if item.get("ebitda") is not None:
            entry["ebitda"] = item.get("ebitda")
        
        # Add profit (use net_profit)
        if item.get("net_profit") is not None:
            entry["profit"] = item.get("net_profit")
        
        # Add gross profit if available
        if item.get("gross_profit") is not None:
            entry["grossProfit"] = item.get("gross_profit")
        
        # Add margins
        if item.get("gross_margin") is not None:
            entry["grossMargin"] = item.get("gross_margin")
        
        if item.get("ebitda_margin") is not None:
            entry["ebitdaMargin"] = item.get("ebitda_margin")
        elif item.get("ebitda") is not None and revenue is not None and revenue > 0:
            # Calculate EBITDA margin if not provided
            entry["ebitdaMargin"] = round((item.get("ebitda") / revenue) * 100, 1)
        
        if item.get("net_margin") is not None:
            entry["profitMargin"] = item.get("net_margin")
        elif item.get("net_profit") is not None and revenue is not None and revenue > 0:
            # Calculate profit margin if not provided
            entry["profitMargin"] = round((item.get("net_profit") / revenue) * 100, 1)
        
        chart_data.append(entry)
    
    if not chart_data:
        return {}
    
    return {
        "financial_metrics": chart_data,
    }
