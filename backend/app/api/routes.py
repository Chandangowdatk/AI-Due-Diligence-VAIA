"""Main API router combining all endpoints."""

from fastapi import APIRouter

from app.api.research import router as research_router
from app.api.export import router as export_router

router = APIRouter()

router.include_router(research_router, prefix="/research", tags=["research"])
router.include_router(export_router, prefix="/research", tags=["export"])


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
