"""Core Pydantic schemas for the due diligence platform."""

from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field, HttpUrl

from app.models.enums import SectionId, SectionStatus, ReportStatus, SourceType


# ─────────────────────────────────────────────────────────────────────────────
# API REQUEST MODELS
# ─────────────────────────────────────────────────────────────────────────────

class UploadedFileReference(BaseModel):
    """Reference to a file uploaded to Gemini."""
    filename: str = Field(..., description="Original filename")
    gemini_file_name: str = Field(..., description="Gemini file name (e.g., 'files/abc123')")


class ResearchRequest(BaseModel):
    """Request to initiate due diligence research."""
    company_name: str = Field(..., description="Company name to research")
    sections: Optional[list[SectionId]] = Field(
        default=None,
        description="Specific sections to research. If None, runs all 10 sections"
    )
    uploaded_files: Optional[list[UploadedFileReference]] = Field(
        default=None,
        description="References to files uploaded to Gemini for document analysis"
    )


class CompanySearchResult(BaseModel):
    """Result from company disambiguation search."""
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    industry: Optional[str] = None
    founded_year: Optional[int] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    employee_count: Optional[int] = None
    is_public: bool = False


# ─────────────────────────────────────────────────────────────────────────────
# API RESPONSE MODELS
# ─────────────────────────────────────────────────────────────────────────────

class ResearchInitResponse(BaseModel):
    """Response after initiating research."""
    research_id: str
    company_name: str
    status: ReportStatus
    created_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
# SOURCE & CITATION
# ─────────────────────────────────────────────────────────────────────────────

class SourceCitation(BaseModel):
    """A single source citation for a factual claim."""
    url: str = Field(..., description="Source URL")
    title: str
    snippet: str = Field(..., description="Relevant excerpt from source")
    source_type: SourceType = SourceType.OTHER
    retrieved_at: datetime = Field(default_factory=datetime.utcnow)
    verified: bool = Field(
        default=False,
        description="True if from official filings or verified database"
    )


# ─────────────────────────────────────────────────────────────────────────────
# COMPANY METADATA
# ─────────────────────────────────────────────────────────────────────────────

class CompanyMetadata(BaseModel):
    """Basic company information gathered during initial search."""
    name: str
    legal_name: Optional[str] = None
    description: Optional[str] = None
    founded_year: Optional[int] = None
    headquarters: Optional[str] = None
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    employee_count: Optional[int] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    is_public: bool = False
    stock_ticker: Optional[str] = None
    stock_exchange: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# SECTION DATA
# ─────────────────────────────────────────────────────────────────────────────

class SectionData(BaseModel):
    """Data for a single report section."""
    section_id: SectionId
    section_name: str = Field(..., description="Human-readable section name")
    status: SectionStatus = SectionStatus.PENDING
    
    # Content
    raw_data: Optional[str] = Field(
        default=None,
        description="Raw extracted data from Research Agent"
    )
    formatted_content: Optional[str] = Field(
        default=None,
        description="Professional prose from Writer Agent"
    )
    structured_data: Optional[dict[str, Any]] = Field(
        default=None,
        description="Parsed structured data for the section"
    )
    
    # Metadata
    sources: list[SourceCitation] = Field(default_factory=list)
    search_iterations: int = Field(default=0, description="Number of search cycles")
    data_gaps: list[str] = Field(
        default_factory=list,
        description="Information that couldn't be found"
    )
    
    # Visualization (section-specific)
    visualization_data: Optional[dict[str, Any]] = Field(
        default=None,
        description="Chart data for Recharts rendering"
    )
    
    # Timing
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None


# ─────────────────────────────────────────────────────────────────────────────
# FULL REPORT
# ─────────────────────────────────────────────────────────────────────────────

class CompanyReport(BaseModel):
    """Complete due diligence report."""
    id: str = Field(..., description="Unique report identifier (UUID)")
    company_name: str
    company_metadata: Optional[CompanyMetadata] = None
    
    status: ReportStatus = ReportStatus.PENDING
    sections: dict[SectionId, SectionData] = Field(
        default_factory=dict,
        description="Map of section_id to section data"
    )
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    
    # Usage tracking
    total_tokens_used: int = 0
    total_search_queries: int = 0
    total_duration_seconds: Optional[float] = None
