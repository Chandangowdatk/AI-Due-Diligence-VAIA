"""Company Classifier Agent for determining if a company is public or private and its region."""

import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.config import get_settings
from app.tools.tavily_tool import tavily_search

logger = logging.getLogger(__name__)

CLASSIFIER_SYSTEM_PROMPT = """You are a company classification expert. Your task is to determine:
1. Whether a company is PUBLICLY TRADED or PRIVATELY HELD
2. The company's PRIMARY REGION/COUNTRY of operation

## CLASSIFICATION CRITERIA

A company is PUBLIC if:
- Listed on ANY stock exchange worldwide
- Has a stock ticker symbol
- Files with securities regulators (SEC, SEBI, FCA, ASIC, etc.)

A company is PRIVATE if:
- Not listed on any stock exchange
- Funded by venture capital, private equity, or founders
- No stock ticker symbol

## REGION DETECTION

Identify the company's primary region based on:
- Headquarters location
- Primary stock exchange (if public)
- Country of incorporation

Common regions and their stock exchanges:
- USA: NYSE, NASDAQ, AMEX
- INDIA: BSE (Bombay Stock Exchange), NSE (National Stock Exchange)
- UK: LSE (London Stock Exchange), AIM
- EUROPE: Euronext, Frankfurt (XETRA), SIX Swiss
- CHINA: Shanghai (SSE), Shenzhen (SZSE), Hong Kong (HKEX)
- JAPAN: Tokyo Stock Exchange (TSE)
- AUSTRALIA: ASX (Australian Securities Exchange)
- CANADA: TSX, TSX Venture
- BRAZIL: B3 (Brasil Bolsa Balcão)
- SINGAPORE: SGX
- SOUTH_KOREA: KRX (Korea Exchange)

## OUTPUT FORMAT

After your research, respond with EXACTLY this format:

CLASSIFICATION: [PUBLIC or PRIVATE]
REGION: [USA, INDIA, UK, EUROPE, CHINA, JAPAN, AUSTRALIA, CANADA, BRAZIL, SINGAPORE, SOUTH_KOREA, or OTHER]
COUNTRY: [Specific country name, e.g., "India", "United States", "Germany"]
CONFIDENCE: [HIGH, MEDIUM, or LOW]
EVIDENCE: [Brief explanation of why]
STOCK_EXCHANGE: [Exchange name if public, or "N/A" if private]
TICKER: [Stock ticker if public, or "N/A" if private]
"""


async def classify_company(company_name: str) -> dict:
    """
    Determine if a company is publicly traded or privately held, and identify its region.
    
    Args:
        company_name: Name of the company to classify
        
    Returns:
        dict with keys:
            - is_public: bool - Whether company is publicly traded
            - region: str - Company's primary region (USA, INDIA, UK, etc.)
            - country: str - Specific country name
            - confidence: str - HIGH, MEDIUM, or LOW
            - evidence: str - Explanation for classification
            - stock_exchange: str - Exchange name if public
            - ticker: str - Stock ticker if public
    """
    logger.info(f"Classifying company: {company_name}")
    
    settings = get_settings()
    
    # Initialize model
    model = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        temperature=0.1,  # Low temperature for factual classification
        google_api_key=settings.google_api_key,
    )
    
    # Search for company info including region
    search_query = f"{company_name} stock ticker listed stock exchange headquarters country"
    
    try:
        search_result = tavily_search.invoke({"query": search_query})
        search_context = search_result if isinstance(search_result, str) else str(search_result)
    except Exception as e:
        logger.warning(f"Search failed during classification: {e}")
        search_context = "Search failed - using general knowledge only"
    
    # Create the classification prompt
    user_message = f"""Classify the following company:

Company Name: {company_name}

Search Results:
{search_context[:3000]}

Based on the search results and your knowledge:
1. Determine if "{company_name}" is publicly traded or privately held
2. Identify the company's primary region/country of operation
3. Find the stock exchange and ticker if it's a public company

Remember to respond in the exact format specified."""

    try:
        # Get classification from the model
        response = await model.ainvoke([
            SystemMessage(content=CLASSIFIER_SYSTEM_PROMPT),
            HumanMessage(content=user_message),
        ])
        
        result_text = response.content if hasattr(response, 'content') else str(response)
        
        # Parse the response
        classification = _parse_classification(result_text)
        
        logger.info(f"Company '{company_name}' classified as: "
                   f"{'PUBLIC' if classification['is_public'] else 'PRIVATE'} "
                   f"(region: {classification['region']}, "
                   f"confidence: {classification['confidence']}, "
                   f"ticker: {classification.get('ticker', 'N/A')})")
        
        return classification
        
    except Exception as e:
        logger.error(f"Classification failed for {company_name}: {e}")
        # Default to private if classification fails (safer assumption)
        return {
            "is_public": False,
            "region": "OTHER",
            "country": "Unknown",
            "confidence": "LOW",
            "evidence": f"Classification failed: {str(e)}. Defaulting to private.",
            "stock_exchange": "N/A",
            "ticker": "N/A",
        }


def _parse_classification(text: str) -> dict:
    """Parse the classification response from the model."""
    result = {
        "is_public": False,
        "region": "OTHER",
        "country": "Unknown",
        "confidence": "MEDIUM",
        "evidence": "",
        "stock_exchange": "N/A",
        "ticker": "N/A",
    }
    
    lines = text.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        
        if line.startswith("CLASSIFICATION:"):
            value = line.replace("CLASSIFICATION:", "").strip().upper()
            result["is_public"] = value == "PUBLIC"
            
        elif line.startswith("REGION:"):
            value = line.replace("REGION:", "").strip().upper()
            valid_regions = ["USA", "INDIA", "UK", "EUROPE", "CHINA", "JAPAN", 
                          "AUSTRALIA", "CANADA", "BRAZIL", "SINGAPORE", "SOUTH_KOREA", "OTHER"]
            result["region"] = value if value in valid_regions else "OTHER"
            
        elif line.startswith("COUNTRY:"):
            result["country"] = line.replace("COUNTRY:", "").strip()
            
        elif line.startswith("CONFIDENCE:"):
            value = line.replace("CONFIDENCE:", "").strip().upper()
            if value in ["HIGH", "MEDIUM", "LOW"]:
                result["confidence"] = value
                
        elif line.startswith("EVIDENCE:"):
            result["evidence"] = line.replace("EVIDENCE:", "").strip()
            
        elif line.startswith("STOCK_EXCHANGE:"):
            result["stock_exchange"] = line.replace("STOCK_EXCHANGE:", "").strip()
            
        elif line.startswith("TICKER:"):
            result["ticker"] = line.replace("TICKER:", "").strip()
    
    return result
