"""Research Agent for gathering company information."""

import logging
from typing import Optional

from langgraph.prebuilt import create_react_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.config import get_settings
from app.models.enums import SectionId
from app.prompts.research_prompts import get_research_prompt
from app.tools.tavily_tool import (
    tavily_search, 
    tavily_search_company, 
    tavily_search_public_company,
    set_current_company,
)
from app.tools.think_tool import think, assess_section_completeness

logger = logging.getLogger(__name__)


async def research_section(
    company_name: str,
    section_id: SectionId,
    is_public: bool = False,
    region: str = "OTHER",
    max_iterations: int = 3,
) -> dict:
    """
    Research a specific section for a company.
    
    Args:
        company_name: Name of the company to research
        section_id: Which DD section to research
        is_public: Whether the company is publicly traded
        region: Company's primary region (USA, INDIA, UK, etc.)
        max_iterations: Maximum search-think cycles
        
    Returns:
        dict with keys:
            - raw_data: str - The gathered research data
            - sources: list[str] - Source URLs found
            - search_iterations: int - Number of search cycles
            - data_gaps: list[str] - Information not found
    """
    logger.info(f"Starting research for {company_name} - Section: {section_id.value} "
               f"(public={is_public}, region={region})")
    
    # CRITICAL: Set the current company for query validation
    # This ensures all search queries include the company name
    set_current_company(company_name)
    
    # Get section-specific system prompt with region-aware source prioritization
    system_prompt = get_research_prompt(
        section_id=section_id,
        company_name=company_name,
        is_public=is_public,
        region=region,
        max_iterations=max_iterations,
    )
    
    settings = get_settings()
    
    # Initialize model
    model = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        temperature=settings.research_temperature,
        google_api_key=settings.google_api_key,
    )
    
    # Define tools
    tools = [
        tavily_search,
        tavily_search_company,
        tavily_search_public_company,
        think,
        assess_section_completeness,
    ]
    
    # Create the agent with system prompt as SystemMessage
    agent = create_react_agent(
        model=model,
        tools=tools,
        prompt=SystemMessage(content=system_prompt),
    )
    
    # Create the user message - be VERY explicit about the company
    section_name = section_id.value.replace('_', ' ').title()
    user_message = f"""Research the {section_name} section for **{company_name}**.

⚠️ CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. You are researching ONLY "{company_name}" - no other company
2. EVERY search query MUST start with "{company_name}"
3. If you find information about a different company, IGNORE it completely
4. Only report facts that are specifically about "{company_name}"
5. VERIFY every data point mentions "{company_name}" before including it

START YOUR RESEARCH with these exact searches:
1. Use tavily_search with query: "{company_name} {section_name.lower()} overview"
2. Use tavily_search with query: "{company_name} official website {section_name.lower()}"

Then use the think tool to analyze what you found and identify gaps.
Continue searching until you have comprehensive coverage or reach {max_iterations} iterations.

⛔ VALIDATION CHECKLIST (before including ANY data):
- Does this data explicitly mention "{company_name}"?
- Is this data from a credible source about "{company_name}"?
- Am I 100% certain this is not about a different company?

If you cannot verify the data is about "{company_name}", DO NOT include it.

REMEMBER: 
- Target company: {company_name}
- Section: {section_name}
- All data must be about {company_name} ONLY"""

    try:
        # Invoke the agent
        result = await agent.ainvoke({
            "messages": [HumanMessage(content=user_message)]
        })
        
        # Extract the final response
        messages = result.get("messages", [])
        final_message = messages[-1] if messages else None
        
        if final_message:
            raw_data = final_message.content if hasattr(final_message, 'content') else str(final_message)
        else:
            raw_data = "No data gathered"
        
        # Handle list content format from Gemini
        if isinstance(raw_data, list):
            text_parts = []
            for block in raw_data:
                if isinstance(block, dict) and 'text' in block:
                    text_parts.append(block['text'])
                elif isinstance(block, str):
                    text_parts.append(block)
            raw_data = '\n'.join(text_parts)
        
        # Parse sources and gaps from the response
        sources = _extract_sources(raw_data)
        data_gaps = _extract_data_gaps(raw_data)
        search_iterations = _count_search_iterations(messages)
        
        logger.info(f"Completed research for {company_name} - {section_id.value}: "
                   f"{len(sources)} sources, {search_iterations} iterations")
        
        return {
            "raw_data": raw_data,
            "sources": sources,
            "search_iterations": search_iterations,
            "data_gaps": data_gaps,
        }
        
    except Exception as e:
        logger.error(f"Research failed for {company_name} - {section_id.value}: {str(e)}")
        return {
            "raw_data": f"Research failed: {str(e)}",
            "sources": [],
            "search_iterations": 0,
            "data_gaps": ["Research process failed"],
        }


def _extract_sources(text: str) -> list[str]:
    """Extract source URLs from research output."""
    import re
    
    # Find all URLs in the text
    url_pattern = r'https?://[^\s\]\)>"\']+'
    urls = re.findall(url_pattern, text)
    
    # Deduplicate while preserving order
    seen = set()
    unique_urls = []
    for url in urls:
        # Clean up URL (remove trailing punctuation)
        url = url.rstrip('.,;:')
        if url not in seen:
            seen.add(url)
            unique_urls.append(url)
    
    return unique_urls


def _extract_data_gaps(text: str) -> list[str]:
    """Extract data gaps mentioned in research output."""
    gaps = []
    
    # Look for common gap indicators
    lines = text.split('\n')
    in_gaps_section = False
    
    for line in lines:
        line_lower = line.lower().strip()
        
        # Check if we're entering a gaps section
        if 'data gap' in line_lower or 'couldn\'t find' in line_lower or 'not found' in line_lower:
            in_gaps_section = True
            continue
        
        # Check if we're leaving the gaps section
        if in_gaps_section and line.startswith('#'):
            in_gaps_section = False
            continue
        
        # Extract gap items
        if in_gaps_section and line.strip().startswith('-'):
            gap = line.strip().lstrip('-').strip()
            if gap:
                gaps.append(gap)
    
    return gaps


def _count_search_iterations(messages: list) -> int:
    """Count the number of search tool calls in the conversation."""
    count = 0
    
    for msg in messages:
        # Check for tool calls
        if hasattr(msg, 'tool_calls') and msg.tool_calls:
            for tool_call in msg.tool_calls:
                tool_name = tool_call.get('name', '') if isinstance(tool_call, dict) else getattr(tool_call, 'name', '')
                if 'search' in tool_name.lower():
                    count += 1
    
    return count
