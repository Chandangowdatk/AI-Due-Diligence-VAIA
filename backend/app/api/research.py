"""Research API endpoints."""

import uuid
import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.models.enums import SectionId, SectionStatus, ReportStatus
from app.models.schemas import ResearchRequest, ResearchInitResponse, CompanyReport, SectionData
from app.models.responses import ResearchStatusResponse, SectionStatusInfo, SectionContentResponse
from app.models.sections import SECTION_CONFIGS
from app.storage.memory_store import report_store
from app.agents.orchestrator import process_report, SECTION_ORDER

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=ResearchInitResponse)
async def start_research(
    request: ResearchRequest,
    background_tasks: BackgroundTasks,
):
    """
    Initiate due diligence research for a company.
    
    Creates a new report, starts background processing, and returns immediately.
    Frontend should poll /status endpoint to track progress.
    """
    # Generate unique research ID
    research_id = str(uuid.uuid4())
    
    logger.info(f"Starting research for '{request.company_name}' with ID: {research_id}")
    
    # Initialize report with all sections in PENDING status
    now = datetime.utcnow()
    sections = {}
    for section_id in SECTION_ORDER:
        config = SECTION_CONFIGS.get(section_id)
        sections[section_id] = SectionData(
            section_id=section_id,
            section_name=config.display_name if config else section_id.value,
            status=SectionStatus.PENDING,
        )
    
    report = CompanyReport(
        id=research_id,
        company_name=request.company_name,
        status=ReportStatus.PENDING,
        sections=sections,
        created_at=now,
        updated_at=now,
    )
    
    # Save to storage
    report_store.create_report(report)
    
    # Determine if company is public (simple heuristic for now)
    # In production, this would use a company lookup service
    is_public = _detect_public_company(request.company_name)
    
    # Start background processing
    background_tasks.add_task(
        process_report,
        report_id=research_id,
        company_name=request.company_name,
        is_public=is_public,
        sections=request.sections,
    )
    
    return ResearchInitResponse(
        research_id=research_id,
        company_name=request.company_name,
        status=ReportStatus.PENDING,
        created_at=now,
    )


@router.get("/{research_id}/status", response_model=ResearchStatusResponse)
async def get_research_status(research_id: str):
    """
    Get current research status (polled by frontend every 3 seconds).
    
    Returns status of all sections for sidebar updates.
    """
    report = report_store.get_report(research_id)
    if not report:
        raise HTTPException(status_code=404, detail="Research not found")
    
    # Build section status list
    section_statuses = []
    sections_complete = 0
    current_section = None
    
    for section_id in SECTION_ORDER:
        section = report.sections.get(section_id)
        if section:
            section_statuses.append(SectionStatusInfo(
                section_id=section_id,
                section_name=section.section_name,
                status=section.status,
                started_at=section.started_at,
                completed_at=section.completed_at,
            ))
            
            # Count completed sections
            if section.status in [SectionStatus.COMPLETE, SectionStatus.INCOMPLETE]:
                sections_complete += 1
            
            # Find current section being processed
            if current_section is None and section.status in [
                SectionStatus.RESEARCHING, 
                SectionStatus.WRITING
            ]:
                current_section = section_id
        else:
            # Section not yet initialized
            config = SECTION_CONFIGS.get(section_id)
            section_statuses.append(SectionStatusInfo(
                section_id=section_id,
                section_name=config.display_name if config else section_id.value,
                status=SectionStatus.PENDING,
            ))
    
    return ResearchStatusResponse(
        research_id=research_id,
        company_name=report.company_name,
        status=report.status,
        sections=section_statuses,
        sections_complete=sections_complete,
        total_sections=len(SECTION_ORDER),
        current_section=current_section,
        created_at=report.created_at,
        updated_at=report.updated_at,
    )


@router.get("/{research_id}/section/{section_id}", response_model=SectionContentResponse)
async def get_section_content(research_id: str, section_id: SectionId):
    """
    Get content for a specific section.
    
    Called when user clicks a section in the sidebar.
    Returns 404 if section doesn't exist, or content with current status.
    """
    report = report_store.get_report(research_id)
    if not report:
        raise HTTPException(status_code=404, detail="Research not found")
    
    section = report.sections.get(section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    return SectionContentResponse(
        section_id=section.section_id,
        section_name=section.section_name,
        status=section.status,
        formatted_content=section.formatted_content,
        structured_data=section.structured_data,
        visualization_data=section.visualization_data,
        sources=section.sources,
        data_gaps=section.data_gaps,
    )


@router.get("/{research_id}/report", response_model=CompanyReport)
async def get_full_report(research_id: str):
    """
    Get full report with all sections.
    
    Used for export functionality and full report view.
    """
    report = report_store.get_report(research_id)
    if not report:
        raise HTTPException(status_code=404, detail="Research not found")
    
    return report


def _detect_public_company(company_name: str) -> bool:
    """
    Simple heuristic to detect if a company is publicly traded.
    
    In production, this would use a company database or API.
    For now, we check for common public company indicators.
    """
    name_lower = company_name.lower()
    
    # Known public companies (expand this list)
    public_companies = [
        "apple", "microsoft", "google", "alphabet", "amazon", "meta", "facebook",
        "tesla", "nvidia", "netflix", "adobe", "salesforce", "oracle", "ibm",
        "intel", "amd", "qualcomm", "cisco", "walmart", "target", "costco",
        "jpmorgan", "bank of america", "wells fargo", "goldman sachs",
        "johnson & johnson", "pfizer", "merck", "abbvie", "eli lilly",
        "exxon", "chevron", "conocophillips", "shell",
        "coca-cola", "pepsi", "pepsico", "procter & gamble", "unilever",
        "disney", "comcast", "at&t", "verizon", "t-mobile",
        "boeing", "lockheed martin", "raytheon", "general dynamics",
        "ford", "general motors", "toyota", "honda",
        "visa", "mastercard", "american express", "paypal",
        "uber", "lyft", "airbnb", "doordash", "instacart",
        "snowflake", "datadog", "cloudflare", "mongodb", "elastic",
        "reliance", "tata", "infosys", "wipro", "hdfc", "icici",
    ]
    
    for company in public_companies:
        if company in name_lower:
            return True
    
    # Check for common suffixes indicating public companies
    public_suffixes = [" inc", " inc.", " corp", " corp.", " ltd", " plc", " ag", " sa"]
    for suffix in public_suffixes:
        if name_lower.endswith(suffix):
            return True
    
    return False
