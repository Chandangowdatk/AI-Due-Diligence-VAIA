"""Tavily search tool for web research."""

import logging
from typing import Optional
from datetime import datetime

from langchain_core.tools import tool
from tavily import TavilyClient

from app.config import get_settings

logger = logging.getLogger(__name__)

# Global variable to track the current company being researched
# This is set by the research_agent before starting research
_current_company_name: Optional[str] = None


def set_current_company(company_name: str) -> None:
    """Set the current company being researched for query validation."""
    global _current_company_name
    _current_company_name = company_name
    logger.info(f"Set current research target company: {company_name}")


def get_current_company() -> Optional[str]:
    """Get the current company being researched."""
    return _current_company_name


def get_tavily_client() -> TavilyClient:
    """Get configured Tavily client."""
    settings = get_settings()
    return TavilyClient(api_key=settings.tavily_api_key)


# Minimum relevance score threshold for search results
MIN_RELEVANCE_SCORE = 0.75

# Get current year and fiscal year for queries
def get_current_fiscal_context() -> dict:
    """Get current year and fiscal year context for search queries."""
    now = datetime.now()
    current_year = now.year
    current_month = now.month
    
    # For Indian companies, fiscal year ends in March
    # If we're in Jan-Mar, current FY is still the previous calendar year
    # If we're in Apr-Dec, current FY is the current calendar year
    if current_month <= 3:
        current_fy = current_year  # FY ends in March of current year
        previous_fy = current_year - 1
    else:
        current_fy = current_year + 1  # FY will end in March of next year
        previous_fy = current_year
    
    return {
        "current_year": current_year,
        "current_fy": f"FY{current_fy}",
        "previous_fy": f"FY{previous_fy}",
        "fy_year": current_fy,
        "calendar_year": current_year,
    }


@tool
def tavily_search(query: str, max_results: int = 5, days: int = 365) -> str:
    """Search the web for company information using Tavily.
    
    IMPORTANT: Your search query MUST include the target company name.
    The system will automatically prepend the company name if missing.
    
    Use this tool to find information about companies, their financials,
    leadership, funding, competitors, and other due diligence data.
    
    Args:
        query: Search query string targeting specific company data.
               MUST include the company name you are researching.
               For LATEST data, include current year/FY in your query.
               Examples:
               - "Tata Motors revenue FY2025 Q3 2024 latest results"
               - "Reliance Industries annual report 2024 financials"
               - "Infosys quarterly results Q3 FY2025"
        max_results: Maximum number of results to return (default: 5)
        days: Only return results from the last N days (default: 365 for 1 year)
        
    Returns:
        Formatted search results with titles, URLs, and content snippets.
        Each result includes the source URL for citation.
        Only results with relevance score >= 0.75 are included.
    """
    # Ensure company name is in the query
    company_name = get_current_company()
    if company_name:
        # Check if company name is already in query (case-insensitive)
        if company_name.lower() not in query.lower():
            # Prepend company name to query
            original_query = query
            query = f"{company_name} {query}"
            logger.warning(f"Query missing company name. Modified: '{original_query}' -> '{query}'")
    
    # Get fiscal context
    fiscal_context = get_current_fiscal_context()
    
    logger.info(f"🔍 TAVILY SEARCH: '{query}' (last {days} days)")
    
    try:
        client = get_tavily_client()
        
        # Execute search with Tavily - with time filtering
        response = client.search(
            query=query,
            max_results=max_results,
            search_depth="advanced",  # More thorough search
            include_answer=True,      # Include AI-generated answer
            include_raw_content=False, # Don't need full page content
            days=days,                # Time filter - only recent results
        )
        
        # Filter results by relevance score
        all_results = response.get("results", [])
        filtered_results = [r for r in all_results if r.get("score", 0) >= MIN_RELEVANCE_SCORE]
        
        # Log the filtering
        logger.info(f"📊 TAVILY RESPONSE: {len(all_results)} total results, {len(filtered_results)} above score threshold ({MIN_RELEVANCE_SCORE})")
        if response.get("answer"):
            logger.debug(f"📝 TAVILY AI ANSWER: {response['answer'][:200]}...")
        
        # Format results
        results = []
        
        # Include Tavily's AI answer if available
        if response.get("answer"):
            results.append(f"**AI Summary:** {response['answer']}\n")
        
        # Format only high-relevance results
        for i, result in enumerate(filtered_results, 1):
            title = result.get("title", "No title")
            url = result.get("url", "")
            content = result.get("content", "No content available")
            score = result.get("score", 0)
            published_date = result.get("published_date", "")
            
            # Log each result for debugging
            logger.debug(f"  Result {i} (score: {score:.3f}): {title[:50]}... | {url[:50]}...")
            
            date_info = f"Published: {published_date}\n" if published_date else ""
            results.append(
                f"**Result {i}:** {title}\n"
                f"URL: {url}\n"
                f"{date_info}"
                f"Relevance: {score:.2f}\n"
                f"Content: {content}\n"
            )
        
        if not results or (len(results) == 1 and results[0].startswith("**AI Summary:**")):
            logger.warning(f"⚠️ No high-relevance results found for query: {query}")
            # Still return the AI summary if available
            if response.get("answer"):
                return f"Search results for: '{query}'\n\n**AI Summary:** {response['answer']}\n\nNo individual results met the relevance threshold ({MIN_RELEVANCE_SCORE})."
            return f"No results found for query: {query}"
        
        formatted_output = f"Search results for: '{query}'\n"
        formatted_output += f"Retrieved at: {datetime.utcnow().isoformat()}\n"
        formatted_output += f"Time filter: Last {days} days\n"
        formatted_output += f"Current fiscal context: {fiscal_context['current_fy']} (Year: {fiscal_context['current_year']})\n"
        formatted_output += f"Showing {len(filtered_results)} results with relevance >= {MIN_RELEVANCE_SCORE}\n\n"
        formatted_output += "\n---\n".join(results)
        
        logger.info(f"✅ Tavily search completed: {len(filtered_results)} high-relevance results for '{query}'")
        
        return formatted_output
        
    except Exception as e:
        logger.error(f"❌ Tavily search failed for query '{query}': {str(e)}")
        return f"Search failed: {str(e)}. Please try a different query."


@tool
def tavily_search_company(
    company_name: str,
    search_type: str = "general",
) -> str:
    """Search for specific company information using optimized queries.
    
    This is a specialized search tool for due diligence research.
    It constructs optimized queries based on the search type.
    
    Args:
        company_name: Name of the company to research
        search_type: Type of information to search for. Options:
            - "general": Basic company information
            - "financials": Revenue, funding, valuation
            - "leadership": CEO, founders, management team
            - "competitors": Competitive landscape
            - "funding": Investment rounds, investors
            - "news": Recent news and press releases
            
    Returns:
        Formatted search results with source URLs for citation.
    """
    # Get current fiscal context for time-relevant queries
    fiscal_context = get_current_fiscal_context()
    current_year = fiscal_context["current_year"]
    current_fy = fiscal_context["current_fy"]
    
    # Build optimized query based on search type - include current year for freshness
    query_templates = {
        "general": f"{company_name} company overview business description {current_year}",
        "financials": f"{company_name} revenue {current_fy} {current_year} latest financial results quarterly",
        "leadership": f"{company_name} CEO founder management team executives {current_year}",
        "competitors": f"{company_name} competitors market share competitive landscape {current_year}",
        "funding": f"{company_name} funding rounds investors Series valuation {current_year}",
        "news": f"{company_name} latest news press release announcement {current_year}",
    }
    
    query = query_templates.get(search_type, query_templates["general"])
    
    # Use shorter time window for news, longer for other types
    days = 90 if search_type == "news" else 365
    
    return tavily_search.invoke({"query": query, "max_results": 5, "days": days})


@tool
def tavily_search_public_company(
    company_name: str,
    ticker: Optional[str] = None,
    region: str = "USA",
) -> str:
    """Search for public company information from official sources.
    
    Prioritizes official filings and investor relations based on region.
    Use this for publicly traded companies.
    
    Args:
        company_name: Name of the public company
        ticker: Stock ticker symbol (optional, improves results)
        region: Company's region (USA, INDIA, UK, etc.) - affects which sources to prioritize
        
    Returns:
        Formatted search results prioritizing official sources.
    """
    # Get current fiscal context
    fiscal_context = get_current_fiscal_context()
    current_year = fiscal_context["current_year"]
    current_fy = fiscal_context["current_fy"]
    previous_fy = fiscal_context["previous_fy"]
    
    # Build region-specific query with current year/FY
    if region == "INDIA":
        if ticker:
            query = f"{company_name} {ticker} BSE NSE {current_fy} {previous_fy} annual report quarterly results latest"
        else:
            query = f"{company_name} BSE NSE {current_fy} {previous_fy} annual report quarterly results SEBI filing latest"
    elif region == "UK":
        if ticker:
            query = f"{company_name} {ticker} LSE Companies House {current_year} annual report latest"
        else:
            query = f"{company_name} LSE Companies House {current_year} annual report investor relations latest"
    elif region == "CHINA":
        if ticker:
            query = f"{company_name} {ticker} HKEX Shanghai Stock Exchange {current_year} annual report latest"
        else:
            query = f"{company_name} Hong Kong Shanghai Stock Exchange {current_year} annual report latest"
    elif region == "JAPAN":
        if ticker:
            query = f"{company_name} {ticker} TSE Tokyo Stock Exchange {current_year} annual report latest"
        else:
            query = f"{company_name} Tokyo Stock Exchange {current_year} annual report investor relations latest"
    else:  # USA and others
        if ticker:
            query = f"{company_name} {ticker} SEC 10-K 10-Q {current_year} investor relations latest quarterly"
        else:
            query = f"{company_name} SEC filing {current_year} investor relations annual report latest quarterly"
    
    return tavily_search.invoke({"query": query, "max_results": 5, "days": 365})
