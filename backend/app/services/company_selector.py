"""Company auto-selection service."""

import logging
from typing import Optional

from app.models.schemas import CompanySearchResult, CompanyMetadata

logger = logging.getLogger(__name__)


async def select_best_company(
    search_results: list[CompanySearchResult],
    query: str,
) -> Optional[CompanySearchResult]:
    """
    Auto-select the most relevant company from search results.
    
    Selection criteria (in order of priority):
    1. Exact name match
    2. Company prominence (size, funding, employee count)
    3. Data availability
    
    Args:
        search_results: List of potential company matches
        query: Original search query
        
    Returns:
        Best matching company, or None if no good match
    """
    if not search_results:
        return None
    
    query_lower = query.lower().strip()
    
    # Score each result
    scored_results = []
    for result in search_results:
        score = _calculate_match_score(result, query_lower)
        scored_results.append((score, result))
        logger.debug(f"Company '{result.name}' scored {score}")
    
    # Sort by score (descending)
    scored_results.sort(key=lambda x: x[0], reverse=True)
    
    # Return best match if score is above threshold
    best_score, best_result = scored_results[0]
    if best_score >= 50:  # Minimum threshold
        logger.info(f"Selected company: '{best_result.name}' with score {best_score}")
        return best_result
    
    logger.warning(f"No good match found for query: '{query}'")
    return None


def _calculate_match_score(result: CompanySearchResult, query: str) -> int:
    """
    Calculate match score for a company result.
    
    Scoring:
    - Exact name match: +100
    - Name contains query: +50
    - Query contains name: +30
    - Has description: +10
    - Has employee count: +5
    - Is public company: +10
    - Has website: +5
    """
    score = 0
    name_lower = result.name.lower()
    
    # Name matching
    if name_lower == query:
        score += 100
    elif query in name_lower:
        score += 50
    elif name_lower in query:
        score += 30
    
    # Data availability
    if result.description:
        score += 10
    if result.employee_count:
        score += 5
    if result.is_public:
        score += 10
    if result.website:
        score += 5
    if result.industry:
        score += 5
    
    return score


def build_company_metadata(result: CompanySearchResult) -> CompanyMetadata:
    """
    Convert search result to company metadata.
    
    Args:
        result: Selected company search result
        
    Returns:
        CompanyMetadata object
    """
    return CompanyMetadata(
        name=result.name,
        description=result.description,
        founded_year=result.founded_year,
        industry=result.industry,
        employee_count=result.employee_count,
        website=result.website,
        logo_url=result.logo_url,
        is_public=result.is_public,
    )
