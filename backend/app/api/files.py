"""File upload API endpoints."""

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from app.services.gemini_files import upload_file_to_gemini

logger = logging.getLogger(__name__)

router = APIRouter()

# Supported file types
ALLOWED_EXTENSIONS = {".pdf", ".ppt", ".pptx", ".csv", ".xlsx", ".xls", ".doc", ".docx"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


class FileUploadResponse(BaseModel):
    """Response after uploading a single file."""
    success: bool
    filename: str
    gemini_file_name: str | None = None
    error: str | None = None


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a single file to Gemini File API.
    
    Called for each file as user selects them.
    Frontend tracks upload status per file.
    """
    filename = file.filename or "unknown"
    
    # Validate file extension
    import os
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return FileUploadResponse(
            success=False,
            filename=filename,
            error=f"File type {ext} not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content
    try:
        content = await file.read()
    except Exception as e:
        logger.error(f"Failed to read file {filename}: {e}")
        return FileUploadResponse(
            success=False,
            filename=filename,
            error="Failed to read file"
        )
    
    # Check file size
    if len(content) > MAX_FILE_SIZE:
        return FileUploadResponse(
            success=False,
            filename=filename,
            error=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Upload to Gemini
    try:
        result = await upload_file_to_gemini(
            file_content=content,
            filename=filename,
            mime_type=file.content_type or "application/octet-stream",
        )
        
        logger.info(f"✅ File uploaded successfully: {filename} -> {result['name']}")
        
        return FileUploadResponse(
            success=True,
            filename=filename,
            gemini_file_name=result["name"],
        )
        
    except Exception as e:
        logger.error(f"Failed to upload {filename} to Gemini: {e}")
        return FileUploadResponse(
            success=False,
            filename=filename,
            error=str(e)
        )
