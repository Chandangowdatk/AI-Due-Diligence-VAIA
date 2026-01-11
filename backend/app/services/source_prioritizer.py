"""Source prioritization service for public vs private companies."""

import logging
from typing import Optional

from app.models.enums import SourceType

logger = logging.getLogger(__name__)


# Source reliability scores (higher = more reliable)
SOURCE_RELIABILITY = {
    SourceType.OFFICIAL_FILING: 100,  # SEC filings, regulatory documents
    SourceType.PRESS_RELEASE: 80,     # Official company announcements
    SourceType.DATABASE: 70,          # Crunchbase, Tracxn, PitchBook
    SourceType.NEWS_ARTICLE: 50,      # Reuters, Bloomberg, etc.
    SourceType.SOCIAL_MEDIA: 20,      # LinkedIn, Twitter
    SourceType.OTHER: 10,
}


# Domain patterns for source type detection
DOMAIN_PATTERNS = {
    SourceType.OFFICIAL_FILING: [
        "sec.gov",
        "edgar-online.com",
        "investor.",
        "ir.",
        "investors.",
    ],
    SourceType.PRESS_RELEASE: [
        "prnewswire.com",
        "businesswire.com",
        "globenewswire.com",
        "newsroom.",
        "press.",
    ],
    SourceType.DATABASE: [
        "crunchbase.com",
        "tracxn.com",
        "pitchbook.com",
        "cbinsights.com",
        "dealroom.co",
        "linkedin.com/company",
    ],
    SourceType.NEWS_ARTICLE: [
        "reuters.com",
        "bloomberg.com",
        "wsj.com",
        "ft.com",
        "techcrunch.com",
        "forbes.com",
        "cnbc.com",
        "bbc.com",
        "nytimes.com",
    ],
    SourceType.SOCIAL_MEDIA: [
        "twitter.com",
        "x.com",
        "linkedin.com/posts",
        "facebook.com",
    ],
}


def detect_source_type(url: str) -> SourceType:
    """
    Detect the type of source from its URL.
    
    Args:
        url: Source URL
        
    Returns:
        Detected SourceType
    """
    url_lower = url.lower()
    
    for source_type, patterns in DOMAIN_PATTERNS.items():
        for pattern in patterns:
            if pattern in url_lower:
                return source_type
    
    return SourceType.OTHER


def get_source_reliability(source_type: SourceType) -> int:
    """
    Get reliability score for a source type.
    
    Args:
        source_type: The type of source
        
    Returns:
        Reliability score (0-100)
    """
    return SOURCE_RELIABILITY.get(source_type, 10)


def prioritize_sources(urls: list[str]) -> list[tuple[str, SourceType, int]]:
    """
    Prioritize sources by reliability.
    
    Args:
        urls: List of source URLs
        
    Returns:
        List of (url, source_type, reliability_score) tuples, sorted by reliability
    """
    prioritized = []
    
    for url in urls:
        source_type = detect_source_type(url)
        reliability = get_source_reliability(source_type)
        prioritized.append((url, source_type, reliability))
    
    # Sort by reliability (descending)
    prioritized.sort(key=lambda x: x[2], reverse=True)
    
    return prioritized


def get_public_company_search_queries(company_name: str, ticker: Optional[str] = None) -> list[str]:
    """
    Generate optimized search queries for public companies.
    
    Prioritizes SEC filings and official sources.
    
    Args:
        company_name: Company name
        ticker: Stock ticker symbol (optional)
        
    Returns:
        List of search queries
    """
    queries = []
    
    if ticker:
        queries.extend([
            f"{company_name} {ticker} SEC 10-K annual report",
            f"{company_name} {ticker} SEC 10-Q quarterly report",
            f"{company_name} {ticker} investor relations",
            f"{company_name} {ticker} earnings report",
        ])
    else:
        queries.extend([
            f"{company_name} SEC 10-K annual report",
            f"{company_name} SEC filing",
            f"{company_name} investor relations",
            f"{company_name} annual report",
        ])
    
    return queries


def get_private_company_search_queries(company_name: str) -> list[str]:
    """
    Generate optimized search queries for private companies.
    
    Prioritizes startup databases and news sources.
    
    Args:
        company_name: Company name
        
    Returns:
        List of search queries
    """
    return [
        f"{company_name} Crunchbase funding",
        f"{company_name} Tracxn company profile",
        f"{company_name} PitchBook",
        f"{company_name} funding round investors",
        f"{company_name} TechCrunch",
        f"{company_name} company overview",
    ]
