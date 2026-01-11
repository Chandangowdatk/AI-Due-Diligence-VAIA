"""Enums for the due diligence platform."""

from enum import Enum


class SectionId(str, Enum):
    """The 10 standardized due diligence sections."""
    EXECUTIVE_SUMMARY = "executive_summary"
    COMPANY_OVERVIEW = "company_overview"
    LEADERSHIP_GOVERNANCE = "leadership_governance"
    BUSINESS_MODEL = "business_model"
    MARKET_INDUSTRY = "market_industry"
    COMPETITIVE_LANDSCAPE = "competitive_landscape"
    FINANCIALS = "financials"
    OPERATIONS = "operations"
    RISKS_MITIGANTS = "risks_mitigants"
    ESG = "esg"


class SectionStatus(str, Enum):
    """Status of each section in the research pipeline."""
    PENDING = "pending"           # Waiting in queue
    RESEARCHING = "researching"   # Research Agent working
    WRITING = "writing"           # Writer Agent formatting
    COMPLETE = "complete"         # Ready to display
    INCOMPLETE = "incomplete"     # Finished but missing data
    TIMEOUT = "timeout"           # Exceeded 90s limit
    ERROR = "error"               # Failed


class ReportStatus(str, Enum):
    """Overall report status."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETE = "complete"
    FAILED = "failed"


class SourceType(str, Enum):
    """Type of data source for reliability assessment."""
    OFFICIAL_FILING = "official_filing"   # SEC, company filings
    PRESS_RELEASE = "press_release"       # Official company PR
    NEWS_ARTICLE = "news_article"         # Reuters, Bloomberg, etc.
    DATABASE = "database"                 # Crunchbase, Tracxn, PitchBook
    SOCIAL_MEDIA = "social_media"         # LinkedIn, Twitter
    OTHER = "other"
