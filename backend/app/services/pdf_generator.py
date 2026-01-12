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
        # Launch browser with specific args for better rendering
        browser = await p.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--font-render-hinting=none',
            ]
        )
        
        try:
            # Create new page with specific settings
            context = await browser.new_context(
                viewport={"width": 1200, "height": 800},
                device_scale_factor=2,  # Higher resolution for better quality
            )
            page = await context.new_page()
            
            # Enable console logging for debugging
            page.on("console", lambda msg: logger.debug(f"Browser console: {msg.text}"))
            
            # Navigate to print view with longer timeout
            logger.info(f"Navigating to {print_url}")
            await page.goto(print_url, wait_until="networkidle", timeout=60000)
            
            # Wait for the report to load (loading class should disappear)
            logger.info("Waiting for report to load...")
            try:
                await page.wait_for_selector(".loading", state="hidden", timeout=30000)
            except:
                pass  # No loading indicator or already hidden
            
            # Wait for Recharts SVG elements to render
            logger.info("Waiting for charts to render...")
            try:
                await page.wait_for_selector(".recharts-wrapper", timeout=10000)
                # Give extra time for chart animations to complete
                await page.wait_for_timeout(2000)
            except:
                logger.info("No Recharts found or timeout - continuing")
            
            # Additional wait for any lazy-loaded content
            await page.wait_for_timeout(1000)
            
            # Inject print-specific CSS to ensure colors print correctly
            await page.add_style_tag(content="""
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            """)
            
            # Generate PDF with professional settings
            logger.info("Generating PDF...")
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                prefer_css_page_size=True,
                margin={
                    "top": "0",
                    "bottom": "0",
                    "left": "0",
                    "right": "0",
                },
                display_header_footer=False,  # We handle headers/footers in the page itself
            )
            
            logger.info(f"PDF generated successfully for report {research_id} ({len(pdf_bytes)} bytes)")
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"PDF generation error: {str(e)}")
            raise
            
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
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )
        
        try:
            context = await browser.new_context(
                viewport={"width": 1200, "height": 800},
                device_scale_factor=2,
            )
            page = await context.new_page()
            
            await page.set_content(html_content, wait_until="networkidle")
            await page.wait_for_timeout(2000)
            
            # Inject print CSS
            await page.add_style_tag(content="""
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            """)
            
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                prefer_css_page_size=True,
                margin={
                    "top": "0",
                    "bottom": "0",
                    "left": "0",
                    "right": "0",
                },
            )
            
            return pdf_bytes
            
        finally:
            await browser.close()
