"""Agent prompts module."""

from app.prompts.research_prompts import get_research_prompt, SECTION_REQUIREMENTS
from app.prompts.writer_prompts import WRITER_SYSTEM_PROMPT, get_writer_prompt
from app.prompts.extraction_prompts import EXTRACTION_SYSTEM_PROMPT, get_extraction_prompt

__all__ = [
    "get_research_prompt",
    "SECTION_REQUIREMENTS",
    "WRITER_SYSTEM_PROMPT",
    "get_writer_prompt",
    "EXTRACTION_SYSTEM_PROMPT",
    "get_extraction_prompt",
]
