"""API response models for the due diligence platform."""

from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field

from app.models.enums import SectionId, SectionStatus, ReportStatus
from app.models.schemas import SourceCitation


class SectionStatusInfo(BaseModel):
    """Status info for a single section (used in polling response)."""
    section_id: SectionId
    section_name: str
    status: SectionStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class ResearchStatusResponse(BaseModel):
    """Response for GET /api/research/{id}/status (polled by frontend)."""
    research_id: str
    company_name: str
    status: ReportStatus
    sections: list[SectionStatusInfo]
    sections_complete: int
    total_sections: int
    current_section: Optional[SectionId] = None
    created_at: datetime
    updated_at: datetime


class SectionContentResponse(BaseModel):
    """Response for GET /api/research/{id}/section/{section_id}."""
    section_id: SectionId
    section_name: str
    status: SectionStatus
    formatted_content: Optional[str] = None
    structured_data: Optional[dict[str, Any]] = None
    visualization_data: Optional[dict[str, Any]] = None
    sources: list[SourceCitation] = Field(default_factory=list)
    data_gaps: list[str] = Field(default_factory=list)
