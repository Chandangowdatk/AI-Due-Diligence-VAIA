"""Agent Orchestrator for coordinating research and writing."""

import asyncio
import logging
from datetime import datetime
from typing import Optional

from app.models.enums import SectionId, SectionStatus, ReportStatus
from app.models.schemas import CompanyReport, SectionData
from app.models.sections import SECTION_CONFIGS
from app.storage.memory_store import report_store
from app.agents.research_agent import research_section
from app.agents.writer_agent import format_section
from app.agents.data_extractor import extract_structured_data, generate_visualization_data

logger = logging.getLogger(__name__)

# Section processing order
SECTION_ORDER = [
    SectionId.EXECUTIVE_SUMMARY,
    SectionId.COMPANY_OVERVIEW,
    SectionId.LEADERSHIP_GOVERNANCE,
    SectionId.BUSINESS_MODEL,
    SectionId.MARKET_INDUSTRY,
    SectionId.COMPETITIVE_LANDSCAPE,
    SectionId.FINANCIALS,
    SectionId.OPERATIONS,
    SectionId.RISKS_MITIGANTS,
    SectionId.ESG,
]

# Timeout per section (seconds)
SECTION_TIMEOUT = 90


async def process_report(
    report_id: str,
    company_name: str,
    is_public: bool = False,
    sections: Optional[list[SectionId]] = None,
) -> None:
    """
    Process a complete due diligence report.
    
    This is the main orchestration function that:
    1. Processes sections sequentially
    2. For each section: Research → Extract → Write
    3. Updates storage after each section completes
    
    Args:
        report_id: Unique report identifier
        company_name: Company to research
        is_public: Whether company is publicly traded
        sections: Specific sections to process (None = all)
    """
    logger.info(f"Starting report processing: {report_id} for {company_name}")
    
    # Get or create report
    report = report_store.get_report(report_id)
    if not report:
        logger.error(f"Report not found: {report_id}")
        return
    
    # Update status to in progress
    report.status = ReportStatus.IN_PROGRESS
    report.updated_at = datetime.utcnow()
    report_store.update_report(report)
    
    # Determine which sections to process
    sections_to_process = sections or SECTION_ORDER
    
    try:
        for section_id in sections_to_process:
            await _process_section(
                report=report,
                section_id=section_id,
                company_name=company_name,
                is_public=is_public,
            )
        
        # Mark report as complete
        report.status = ReportStatus.COMPLETE
        report.completed_at = datetime.utcnow()
        report.total_duration_seconds = (
            report.completed_at - report.created_at
        ).total_seconds()
        
        logger.info(f"Report completed: {report_id}")
        
    except Exception as e:
        logger.error(f"Report processing failed: {report_id} - {str(e)}")
        report.status = ReportStatus.FAILED
    
    finally:
        report.updated_at = datetime.utcnow()
        report_store.update_report(report)


async def _process_section(
    report: CompanyReport,
    section_id: SectionId,
    company_name: str,
    is_public: bool,
) -> None:
    """
    Process a single section through the Research → Extract → Write pipeline.
    """
    section_config = SECTION_CONFIGS.get(section_id)
    section_name = section_config.display_name if section_config else section_id.value
    
    logger.info(f"Processing section: {section_name}")
    
    # Initialize section data
    section_data = report.sections.get(section_id) or SectionData(
        section_id=section_id,
        section_name=section_name,
    )
    section_data.status = SectionStatus.RESEARCHING
    section_data.started_at = datetime.utcnow()
    
    # Update report with current section status
    report.sections[section_id] = section_data
    report.updated_at = datetime.utcnow()
    report_store.update_report(report)
    
    try:
        # Step 1: Research
        research_result = await asyncio.wait_for(
            research_section(
                company_name=company_name,
                section_id=section_id,
                is_public=is_public,
                max_iterations=3,
            ),
            timeout=SECTION_TIMEOUT,
        )
        
        section_data.raw_data = research_result["raw_data"]
        section_data.search_iterations = research_result["search_iterations"]
        section_data.data_gaps = research_result["data_gaps"]
        
        # Parse sources into SourceCitation objects
        from app.models.schemas import SourceCitation
        from app.models.enums import SourceType
        section_data.sources = [
            SourceCitation(
                url=url,
                title="Source",
                snippet="",
                source_type=SourceType.OTHER,
                retrieved_at=datetime.utcnow(),
            )
            for url in research_result["sources"]
        ]
        
        # Update status
        section_data.status = SectionStatus.WRITING
        report.sections[section_id] = section_data
        report.updated_at = datetime.utcnow()
        report_store.update_report(report)
        
        # Step 2: Extract structured data (for visualizations)
        structured_data = await extract_structured_data(
            raw_data=section_data.raw_data,
            section_id=section_id,
            company_name=company_name,
        )
        
        logger.info(f"Extraction result for {section_name}: {'SUCCESS' if structured_data else 'NONE'}")
        if structured_data:
            logger.debug(f"Extracted data keys: {list(structured_data.keys())}")
        
        # Generate visualization data (always set, even if empty)
        section_data.visualization_data = generate_visualization_data(
            section_id=section_id,
            structured_data=structured_data,
        )
        logger.info(f"Visualization data for {section_name}: {list(section_data.visualization_data.keys()) if section_data.visualization_data else 'EMPTY'}")
        
        # Step 3: Write formatted content
        section_data.formatted_content = await format_section(
            raw_data=section_data.raw_data,
            section_name=section_name,
        )
        
        # Mark complete
        section_data.status = SectionStatus.COMPLETE
        section_data.completed_at = datetime.utcnow()
        section_data.duration_seconds = (
            section_data.completed_at - section_data.started_at
        ).total_seconds()
        
        logger.info(f"Section completed: {section_name} in {section_data.duration_seconds:.1f}s")
        
    except asyncio.TimeoutError:
        logger.warning(f"Section timed out: {section_name}")
        section_data.status = SectionStatus.TIMEOUT
        section_data.completed_at = datetime.utcnow()
        section_data.data_gaps.append("Section processing timed out")
        
    except Exception as e:
        logger.error(f"Section failed: {section_name} - {str(e)}")
        section_data.status = SectionStatus.ERROR
        section_data.completed_at = datetime.utcnow()
        section_data.data_gaps.append(f"Processing error: {str(e)}")
    
    finally:
        # Always update the report
        report.sections[section_id] = section_data
        report.updated_at = datetime.utcnow()
        report_store.update_report(report)


def get_section_status_summary(report: CompanyReport) -> dict:
    """Get a summary of section statuses for polling response."""
    sections_complete = sum(
        1 for s in report.sections.values()
        if s.status in [SectionStatus.COMPLETE, SectionStatus.INCOMPLETE]
    )
    
    current_section = None
    for section_id in SECTION_ORDER:
        section = report.sections.get(section_id)
        if section and section.status in [SectionStatus.RESEARCHING, SectionStatus.WRITING]:
            current_section = section_id
            break
    
    return {
        "sections_complete": sections_complete,
        "total_sections": len(SECTION_ORDER),
        "current_section": current_section,
    }
