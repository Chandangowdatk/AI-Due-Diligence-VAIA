"""PDF generation service using Playwright."""

import logging
from typing import Optional

from app.config import get_settings
from app.models.schemas import CompanyReport

logger = logging.getLogger(__name__)


async def generate_pdf(research_id: str, report: CompanyReport) -> bytes:
    """
    Generate PDF from the print-optimized frontend view.
    
    Uses Playwright to render the frontend and capture as PDF.
    This ensures exact visual fidelity with the web version,
    including Recharts visualizations.
    
    Args:
        research_id: The report ID
        report: The CompanyReport object
        
    Returns:
        PDF file as bytes
    """
    settings = get_settings()
    
    # Import playwright here to avoid startup issues if not installed
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        raise RuntimeError(
            "Playwright is not installed. Run: pip install playwright && playwright install chromium"
        )
    
    # Build the print URL
    print_url = f"{settings.frontend_url}/report/{research_id}/print"
    
    logger.info(f"Generating PDF for report {research_id} from {print_url}")
    
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        
        try:
            # Create new page
            page = await browser.new_page()
            
            # Set viewport for consistent rendering
            await page.set_viewport_size({"width": 1200, "height": 800})
            
            # Navigate to print view
            await page.goto(print_url, wait_until="networkidle")
            
            # Wait for Recharts to render (they use SVG)
            # Give extra time for charts to fully render
            await page.wait_for_timeout(2000)
            
            # Wait for any loading indicators to disappear
            try:
                await page.wait_for_selector(".loading", state="hidden", timeout=5000)
            except:
                pass  # No loading indicator found, continue
            
            # Generate PDF
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,  # Include background colors
                margin={
                    "top": "20mm",
                    "bottom": "20mm",
                    "left": "15mm",
                    "right": "15mm",
                },
                display_header_footer=True,
                header_template=_get_header_template(report.company_name),
                footer_template=_get_footer_template(),
            )
            
            logger.info(f"PDF generated successfully for report {research_id}")
            return pdf_bytes
            
        finally:
            await browser.close()


async def generate_pdf_from_html(html_content: str, report: CompanyReport) -> bytes:
    """
    Generate PDF from raw HTML content.
    
    Alternative method that doesn't require frontend to be running.
    Useful for testing or when frontend is not available.
    
    Args:
        html_content: The HTML to render
        report: The CompanyReport object
        
    Returns:
        PDF file as bytes
    """
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        raise RuntimeError(
            "Playwright is not installed. Run: pip install playwright && playwright install chromium"
        )
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        try:
            page = await browser.new_page()
            await page.set_content(html_content, wait_until="networkidle")
            await page.wait_for_timeout(1000)
            
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                margin={
                    "top": "20mm",
                    "bottom": "20mm",
                    "left": "15mm",
                    "right": "15mm",
                },
                display_header_footer=True,
                header_template=_get_header_template(report.company_name),
                footer_template=_get_footer_template(),
            )
            
            return pdf_bytes
            
        finally:
            await browser.close()


def _get_header_template(company_name: str) -> str:
    """Generate PDF header template."""
    return f"""
    <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
        <span>{company_name} - Due Diligence Report</span>
    </div>
    """


def _get_footer_template() -> str:
    """Generate PDF footer template with page numbers."""
    return """
    <div style="font-size: 10px; width: 100%; display: flex; justify-content: space-between; padding: 0 20px; color: #666;">
        <span>Confidential</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>
    """
