"""Gemini File API service for uploading and managing documents."""

import time
import logging
from pathlib import Path
from typing import Optional
from google import genai

from app.config import get_settings

logger = logging.getLogger(__name__)

# Module-level storage for uploaded file references per research session
_uploaded_files: dict[str, list] = {}  # research_id -> list of Gemini file objects


def get_gemini_client() -> genai.Client:
    """Get Gemini client instance."""
    settings = get_settings()
    return genai.Client(api_key=settings.google_api_key)


def wait_for_file_active(
    client: genai.Client,
    file_name: str,
    timeout: int = 120,
    poll_interval: int = 2,
):
    """
    Poll file status until it becomes ACTIVE or fails.
    
    Args:
        client: Gemini client
        file_name: The file name/ID from upload (e.g., "files/abc123")
        timeout: Max seconds to wait
        poll_interval: Seconds between polls
        
    Returns:
        The file object when ACTIVE
        
    Raises:
        RuntimeError: If file processing fails
        TimeoutError: If timeout exceeded
    """
    start = time.time()
    
    while True:
        file = client.files.get(name=file_name)
        state = str(file.state)
        
        logger.debug(f"File {file_name} state: {state}")
        
        if "ACTIVE" in state:
            logger.info(f"✅ File ready: {file.display_name or file_name}")
            return file
        
        if "FAILED" in state:
            raise RuntimeError(f"File processing failed: {file.display_name or file_name}")
        
        if time.time() - start > timeout:
            raise TimeoutError(f"Timeout waiting for file: {file.display_name or file_name}")
        
        time.sleep(poll_interval)


async def upload_file_to_gemini(
    file_content: bytes,
    filename: str,
    mime_type: str,
) -> dict:
    """
    Upload a single file to Gemini File API.
    
    Args:
        file_content: Raw file bytes
        filename: Original filename
        mime_type: MIME type of the file
        
    Returns:
        Dict with file info: {name, display_name, state}
    """
    import tempfile
    import os
    
    client = get_gemini_client()
    
    # Write to temp file (Gemini SDK requires file path)
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(filename).suffix) as tmp:
        tmp.write(file_content)
        tmp_path = tmp.name
    
    try:
        logger.info(f"📤 Uploading to Gemini: {filename}")
        
        # Upload to Gemini
        uploaded = client.files.upload(file=Path(tmp_path))
        
        logger.info(f"➡️ Uploaded: {uploaded.name} | State: {uploaded.state}")
        
        # Wait for file to be ready
        ready_file = wait_for_file_active(client, uploaded.name)
        
        return {
            "name": ready_file.name,
            "display_name": filename,
            "state": str(ready_file.state),
            "uri": ready_file.uri if hasattr(ready_file, 'uri') else None,
        }
        
    finally:
        # Cleanup temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def set_uploaded_files(research_id: str, files: list) -> None:
    """
    Store uploaded Gemini file objects for a research session.
    
    Args:
        research_id: The research/report ID
        files: List of Gemini file objects or file info dicts
    """
    _uploaded_files[research_id] = files
    logger.info(f"Stored {len(files)} files for research {research_id}")


def get_uploaded_files(research_id: str) -> list:
    """
    Get uploaded Gemini file objects for a research session.
    
    Args:
        research_id: The research/report ID
        
    Returns:
        List of Gemini file objects/info, or empty list if none
    """
    return _uploaded_files.get(research_id, [])


def clear_uploaded_files(research_id: str) -> None:
    """
    Clear uploaded files for a research session.
    
    Args:
        research_id: The research/report ID
    """
    if research_id in _uploaded_files:
        del _uploaded_files[research_id]
        logger.info(f"Cleared files for research {research_id}")


def get_gemini_file_objects(research_id: str) -> list:
    """
    Get actual Gemini file objects for use in model calls.
    
    Args:
        research_id: The research/report ID
        
    Returns:
        List of Gemini file objects ready for model.generate_content()
    """
    file_infos = get_uploaded_files(research_id)
    if not file_infos:
        return []
    
    client = get_gemini_client()
    file_objects = []
    
    for info in file_infos:
        try:
            # Get the actual file object from Gemini
            file_name = info.get("name") if isinstance(info, dict) else info.name
            file_obj = client.files.get(name=file_name)
            file_objects.append(file_obj)
        except Exception as e:
            logger.warning(f"Failed to get file {info}: {e}")
    
    return file_objects
