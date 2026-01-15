"""Tool for querying uploaded documents using Gemini."""

import logging
from typing import Optional
from langchain_core.tools import tool

from app.config import get_settings
from app.services.gemini_files import get_gemini_client, get_gemini_file_objects

logger = logging.getLogger(__name__)

# Module-level storage for current research context
_current_research_id: Optional[str] = None
_current_company_name: Optional[str] = None


def set_document_context(research_id: str, company_name: str) -> None:
    """
    Set the current research context for document queries.
    
    Args:
        research_id: The research/report ID
        company_name: The company being researched
    """
    global _current_research_id, _current_company_name
    _current_research_id = research_id
    _current_company_name = company_name
    logger.info(f"Document context set: research={research_id}, company={company_name}")


def clear_document_context() -> None:
    """Clear the current research context."""
    global _current_research_id, _current_company_name
    _current_research_id = None
    _current_company_name = None


def has_uploaded_documents() -> bool:
    """Check if there are uploaded documents for the current research."""
    if not _current_research_id:
        return False
    files = get_gemini_file_objects(_current_research_id)
    return len(files) > 0


@tool
def query_uploaded_documents(question: str) -> str:
    """
    Query the uploaded documents (pitch decks, investment memos, financial statements, etc.) for information.
    
    ⚠️ IMPORTANT: Use this tool FIRST before web search to extract data from user-provided files.
    These documents contain proprietary information not available on the web.
    
    Args:
        question: The specific question to answer from the documents.
                  Be specific about what information you need.
                  Example: "What are the revenue figures for the last 3 years?"
                  Example: "Who are the founders and their backgrounds?"
                  Example: "What is the company's business model?"
    
    Returns:
        Extracted information from the uploaded documents, or a message if no documents available.
    """
    global _current_research_id, _current_company_name
    
    if not _current_research_id:
        return "No research context set. Cannot query documents."
    
    # Get uploaded files
    file_objects = get_gemini_file_objects(_current_research_id)
    
    if not file_objects:
        return "No documents were uploaded for this research. Use web search instead."
    
    logger.info(f"📄 Querying {len(file_objects)} documents: {question[:100]}...")
    
    try:
        client = get_gemini_client()
        settings = get_settings()
        
        # Build the prompt
        company_context = f" about {_current_company_name}" if _current_company_name else ""
        
        prompt = f"""You are analyzing uploaded documents{company_context}.

QUESTION: {question}

INSTRUCTIONS:
1. Search through ALL uploaded documents to find relevant information
2. Extract specific facts, numbers, names, and data points
3. If information is found, cite which document it came from (e.g., "From the pitch deck...", "According to the financial statements...")
4. If the information is not found in any document, clearly state "This information was not found in the uploaded documents"
5. Be precise and factual - only report what is explicitly stated in the documents

Provide a comprehensive answer based on the uploaded documents."""

        # Call Gemini with files
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=[prompt, *file_objects],
        )
        
        result = response.text if hasattr(response, 'text') else str(response)
        
        logger.info(f"✅ Document query successful, response length: {len(result)}")
        
        # Add source attribution
        file_names = [f.display_name or f.name for f in file_objects]
        source_note = f"\n\n[Source: Uploaded documents - {', '.join(file_names)}]"
        
        return result + source_note
        
    except Exception as e:
        logger.error(f"Failed to query documents: {e}")
        return f"Error querying documents: {str(e)}. Try using web search instead."
