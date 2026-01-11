"""Writer Agent for professional report formatting."""

import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.config import get_settings
from app.prompts.writer_prompts import WRITER_SYSTEM_PROMPT, get_writer_prompt

logger = logging.getLogger(__name__)


async def format_section(raw_data: str, section_name: str) -> str:
    """
    Transform raw research data into professional prose.
    
    This is a simple LLM call - NOT an agent with tools.
    The Writer Agent's ONLY job is formatting, not research.
    
    Args:
        raw_data: Raw extracted data from Research Agent
        section_name: Human-readable section name
        
    Returns:
        Professionally formatted section content
    """
    logger.info(f"Formatting section: {section_name}")
    
    settings = get_settings()
    
    # Initialize model (no tools - formatting only)
    model = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        temperature=settings.writer_temperature,
        google_api_key=settings.google_api_key,
    )
    
    # Build messages
    messages = [
        SystemMessage(content=WRITER_SYSTEM_PROMPT),
        HumanMessage(content=get_writer_prompt(section_name, raw_data)),
    ]
    
    try:
        # Simple LLM invocation
        response = await model.ainvoke(messages)
        
        # Extract content
        formatted_content = response.content if hasattr(response, 'content') else str(response)
        
        # Handle Gemini 3+ list content format
        if isinstance(formatted_content, list):
            # Extract text from content blocks
            text_parts = []
            for block in formatted_content:
                if isinstance(block, dict) and 'text' in block:
                    text_parts.append(block['text'])
                elif isinstance(block, str):
                    text_parts.append(block)
            formatted_content = '\n'.join(text_parts)
        
        logger.info(f"Successfully formatted section: {section_name}")
        return formatted_content
        
    except Exception as e:
        logger.error(f"Failed to format section {section_name}: {str(e)}")
        # Return raw data with error note if formatting fails
        return f"[Formatting Error: {str(e)}]\n\n{raw_data}"
