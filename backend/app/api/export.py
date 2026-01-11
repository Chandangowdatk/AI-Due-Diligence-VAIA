"""Export API endpoints."""

import logging
from io import BytesIO
from datetime import datetime

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, Response

from app.storage.memory_store import report_store
from app.models.enums import ReportStatus
from app.services.pdf_generator import generate_pdf

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/{research_id}/export/json")
async def export_json(research_id: str):
    """
    Export report as JSON.
    
    Returns the full report data as a downloadable JSON file.
    """
    report = report_store.get_report(research_id)
    if not report:
        raise HTTPException(status_code=404, detail="Research not found")
    
    # Generate filename with company name and date
    safe_name = "".join(c if c.isalnum() or c in "- " else "_" for c in report.company_name)
    safe_name = safe_name.replace(" ", "_")
    date_str = datetime.utcnow().strftime("%Y%m%d")
    filename = f"{safe_name}_DD_Report_{date_str}.json"
    
    return JSONResponse(
        content=report.model_dump(mode="json"),
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get("/{research_id}/export/pdf")
async def export_pdf(research_id: str):
    """
    Export report as PDF using Playwright.
    
    Renders the print-optimized frontend view and generates a PDF
    with exact visual fidelity to the web version.
    """
    report = report_store.get_report(research_id)
    if not report:
        raise HTTPException(status_code=404, detail="Research not found")
    
    # Check if report is complete enough for export
    if report.status == ReportStatus.PENDING:
        raise HTTPException(
            status_code=400, 
            detail="Report has not started processing yet"
        )
    
    try:
        # Generate PDF using Playwright
        pdf_bytes = await generate_pdf(research_id, report)
        
        # Generate filename
        safe_name = "".join(c if c.isalnum() or c in "- " else "_" for c in report.company_name)
        safe_name = safe_name.replace(" ", "_")
        date_str = datetime.utcnow().strftime("%Y%m%d")
        filename = f"{safe_name}_DD_Report_{date_str}.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
        
    except Exception as e:
        logger.error(f"PDF generation failed for {research_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"PDF generation failed: {str(e)}"
        )
