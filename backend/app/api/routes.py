"""Main API router combining all endpoints."""

from fastapi import APIRouter

from app.api.research import router as research_router
from app.api.export import router as export_router
from app.api.files import router as files_router

router = APIRouter()

router.include_router(research_router, prefix="/research", tags=["research"])
router.include_router(export_router, prefix="/research", tags=["export"])
router.include_router(files_router, prefix="/files", tags=["files"])


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
