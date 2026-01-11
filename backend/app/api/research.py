"""Research API endpoints."""

import uuid
import logging
import asyncio
from datetime import datetime

from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.models.enums import SectionId, SectionStatus, ReportStatus
from app.models.schemas import ResearchRequest, ResearchInitResponse, CompanyReport, SectionData
from app.models.responses import ResearchStatusResponse, SectionStatusInfo, SectionContentResponse
from app.models.sections import SECTION_CONFIGS
from app.storage.memory_store import report_store
from app.agents.orchestrator import process_report, SECTION_ORDER
from app.agents.company_classifier import classify_company

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
    
    # Use AI to classify company as public or private and detect region
    # This runs quickly and determines the search strategy
    try:
        classification = await classify_company(request.company_name)
        is_public = classification["is_public"]
        region = classification.get("region", "OTHER")
        logger.info(f"Company '{request.company_name}' classified as: "
                   f"{'PUBLIC' if is_public else 'PRIVATE'} "
                   f"(region: {region}, "
                   f"confidence: {classification['confidence']}, "
                   f"ticker: {classification.get('ticker', 'N/A')})")
    except Exception as e:
        logger.warning(f"Company classification failed, defaulting to private: {e}")
        is_public = False
        region = "OTHER"
    
    # Start background processing
    background_tasks.add_task(
        process_report,
        report_id=research_id,
        company_name=request.company_name,
        is_public=is_public,
        region=region,
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
