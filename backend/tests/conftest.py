"""Pytest configuration and fixtures for backend tests."""

import pytest
from datetime import datetime
from unittest.mock import MagicMock, AsyncMock

from app.models.enums import SectionId, SectionStatus, ReportStatus
from app.models.schemas import CompanyReport, SectionData, SourceCitation
from app.storage.memory_store import ReportStore


@pytest.fixture
def mock_report_store():
    """Create a fresh report store for testing."""
    return ReportStore()


@pytest.fixture
def sample_report():
    """Create a sample report for testing."""
    now = datetime.utcnow()
    sections = {}
    for section_id in SectionId:
        sections[section_id] = SectionData(
            section_id=section_id,
            section_name=section_id.value.replace('_', ' ').title(),
            status=SectionStatus.PENDING,
        )
    
    return CompanyReport(
        id="test-report-123",
        company_name="Test Company Inc",
        status=ReportStatus.PENDING,
        sections=sections,
        created_at=now,
        updated_at=now,
    )


@pytest.fixture
def sample_section_data():
    """Create sample section data for testing."""
    return SectionData(
        section_id=SectionId.EXECUTIVE_SUMMARY,
        section_name="Executive Summary",
        status=SectionStatus.COMPLETE,
        raw_data="Raw research data about the company...",
        formatted_content="# Executive Summary\n\nTest Company is a leading...",
        sources=[
            SourceCitation(
                url="https://example.com/article",
                title="Test Article",
                snippet="A snippet about the company...",
                source_type="news_article",
                retrieved_at=datetime.utcnow(),
                verified=True,
            )
        ],
        search_iterations=2,
        data_gaps=["Historical revenue data not found"],
    )


@pytest.fixture
def mock_tavily_response():
    """Mock Tavily API response."""
    return {
        "results": [
            {
                "url": "https://example.com/article1",
                "title": "Company Overview Article",
                "content": "Detailed content about the company...",
                "score": 0.95,
            },
            {
                "url": "https://sec.gov/filing",
                "title": "SEC 10-K Filing",
                "content": "Annual report content...",
                "score": 0.92,
            },
        ]
    }


@pytest.fixture
def mock_llm():
    """Create a mock LLM for testing."""
    mock = MagicMock()
    mock.invoke = MagicMock(return_value=MagicMock(content="Mocked LLM response"))
    mock.ainvoke = AsyncMock(return_value=MagicMock(content="Mocked async LLM response"))
    return mock
