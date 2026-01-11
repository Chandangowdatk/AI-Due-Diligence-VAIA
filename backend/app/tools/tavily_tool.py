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


@tool
def tavily_search(query: str, max_results: int = 5) -> str:
    """Search the web for company information using Tavily.
    
    IMPORTANT: Your search query MUST include the target company name.
    The system will automatically prepend the company name if missing.
    
    Use this tool to find information about companies, their financials,
    leadership, funding, competitors, and other due diligence data.
    
    Args:
        query: Search query string targeting specific company data.
               MUST include the company name you are researching.
               Examples:
               - "Reliance Industries revenue 2023 financials"
               - "Reliance Industries CEO Mukesh Ambani background"
               - "Reliance Industries competitors oil gas"
        max_results: Maximum number of results to return (default: 5)
        
    Returns:
        Formatted search results with titles, URLs, and content snippets.
        Each result includes the source URL for citation.
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
    try:
        client = get_tavily_client()
        
        # Execute search with Tavily
        response = client.search(
            query=query,
            max_results=max_results,
            search_depth="advanced",  # More thorough search
            include_answer=True,      # Include AI-generated answer
            include_raw_content=False, # Don't need full page content
        )
        
        # Format results
        results = []
        
        # Include Tavily's AI answer if available
        if response.get("answer"):
            results.append(f"**AI Summary:** {response['answer']}\n")
        
        # Format individual results
        for i, result in enumerate(response.get("results", []), 1):
            title = result.get("title", "No title")
            url = result.get("url", "")
            content = result.get("content", "No content available")
            
            results.append(
                f"**Result {i}:** {title}\n"
                f"URL: {url}\n"
                f"Content: {content}\n"
            )
        
        if not results:
            return f"No results found for query: {query}"
        
        formatted_output = f"Search results for: '{query}'\n"
        formatted_output += f"Retrieved at: {datetime.utcnow().isoformat()}\n\n"
        formatted_output += "\n---\n".join(results)
        
        logger.info(f"Tavily search completed: {len(response.get('results', []))} results for '{query}'")
        
        return formatted_output
        
    except Exception as e:
        logger.error(f"Tavily search failed for query '{query}': {str(e)}")
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
    # Build optimized query based on search type
    query_templates = {
        "general": f"{company_name} company overview business description",
        "financials": f"{company_name} revenue funding valuation financial performance",
        "leadership": f"{company_name} CEO founder management team executives",
        "competitors": f"{company_name} competitors market share competitive landscape",
        "funding": f"{company_name} funding rounds investors Series valuation",
        "news": f"{company_name} latest news press release announcement",
    }
    
    query = query_templates.get(search_type, query_templates["general"])
    
    return tavily_search.invoke({"query": query, "max_results": 5})


@tool
def tavily_search_public_company(
    company_name: str,
    ticker: Optional[str] = None,
) -> str:
    """Search for public company information from official sources.
    
    Prioritizes SEC filings, investor relations, and stock exchange data.
    Use this for publicly traded companies.
    
    Args:
        company_name: Name of the public company
        ticker: Stock ticker symbol (optional, improves results)
        
    Returns:
        Formatted search results prioritizing official sources.
    """
    # Build query prioritizing official sources
    if ticker:
        query = f"{company_name} {ticker} SEC 10-K investor relations annual report"
    else:
        query = f"{company_name} SEC filing investor relations annual report stock"
    
    return tavily_search.invoke({"query": query, "max_results": 5})
