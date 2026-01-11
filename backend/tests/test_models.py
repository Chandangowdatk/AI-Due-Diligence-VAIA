"""Tests for data models and validation."""

import pytest
from datetime import datetime
from pydantic import ValidationError

from app.models.enums import SectionId, SectionStatus, ReportStatus, SourceType
from app.models.schemas import (
    ResearchRequest,
    SourceCitation,
    SectionData,
    CompanyReport,
    CompanyMetadata,
)
from app.models.responses import (
    ResearchStatusResponse,
    SectionStatusInfo,
    SectionContentResponse,
)


class TestEnums:
    """Test enum definitions."""

    def test_section_id_values(self):
        """Verify all 10 section IDs exist."""
        assert len(SectionId) == 10
        assert SectionId.EXECUTIVE_SUMMARY.value == "executive_summary"
        assert SectionId.FINANCIALS.value == "financials"
        assert SectionId.ESG.value == "esg"

    def test_section_status_values(self):
        """Verify all section statuses exist."""
        statuses = [s.value for s in SectionStatus]
        assert "pending" in statuses
        assert "researching" in statuses
        assert "writing" in statuses
        assert "complete" in statuses
        assert "error" in statuses

    def test_report_status_values(self):
        """Verify report statuses."""
        assert ReportStatus.PENDING.value == "pending"
        assert ReportStatus.IN_PROGRESS.value == "in_progress"
        assert ReportStatus.COMPLETE.value == "complete"
        assert ReportStatus.FAILED.value == "failed"


class TestResearchRequest:
    """Test ResearchRequest model."""

    def test_valid_request(self):
        """Test valid research request."""
        request = ResearchRequest(company_name="Stripe")
        assert request.company_name == "Stripe"
        assert request.sections is None

    def test_request_with_sections(self):
        """Test request with specific sections."""
        request = ResearchRequest(
            company_name="OpenAI",
            sections=[SectionId.EXECUTIVE_SUMMARY, SectionId.FINANCIALS],
        )
        assert len(request.sections) == 2

    def test_empty_company_name_fails(self):
        """Test that empty company name fails validation."""
        with pytest.raises(ValidationError):
            ResearchRequest(company_name="")


class TestSourceCitation:
    """Test SourceCitation model."""

    def test_valid_citation(self):
        """Test valid source citation."""
        citation = SourceCitation(
            url="https://example.com/article",
            title="Test Article",
            snippet="A brief snippet...",
            source_type=SourceType.NEWS_ARTICLE,
            retrieved_at=datetime.utcnow(),
            verified=True,
        )
        assert citation.url == "https://example.com/article"
        assert citation.verified is True

    def test_citation_defaults(self):
        """Test citation default values."""
        citation = SourceCitation(
            url="https://example.com",
            title="Test",
            snippet="Snippet",
            source_type=SourceType.OTHER,
            retrieved_at=datetime.utcnow(),
        )
        assert citation.verified is False


class TestSectionData:
    """Test SectionData model."""

    def test_minimal_section(self):
        """Test section with minimal data."""
        section = SectionData(
            section_id=SectionId.EXECUTIVE_SUMMARY,
            section_name="Executive Summary",
            status=SectionStatus.PENDING,
        )
        assert section.sources == []
        assert section.data_gaps == []
        assert section.search_iterations == 0

    def test_complete_section(self, sample_section_data):
        """Test fully populated section."""
        assert sample_section_data.status == SectionStatus.COMPLETE
        assert len(sample_section_data.sources) == 1
        assert sample_section_data.formatted_content is not None


class TestCompanyReport:
    """Test CompanyReport model."""

    def test_report_creation(self, sample_report):
        """Test report creation."""
        assert sample_report.id == "test-report-123"
        assert sample_report.company_name == "Test Company Inc"
        assert len(sample_report.sections) == 10

    def test_report_with_metadata(self):
        """Test report with company metadata."""
        metadata = CompanyMetadata(
            name="Tesla",
            is_public=True,
            stock_ticker="TSLA",
            stock_exchange="NASDAQ",
            industry="Automotive",
        )
        report = CompanyReport(
            id="test-123",
            company_name="Tesla",
            company_metadata=metadata,
            status=ReportStatus.PENDING,
            sections={},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        assert report.company_metadata.is_public is True
        assert report.company_metadata.stock_ticker == "TSLA"


class TestResponseModels:
    """Test API response models."""

    def test_section_status_info(self):
        """Test SectionStatusInfo model."""
        info = SectionStatusInfo(
            section_id=SectionId.FINANCIALS,
            section_name="Financial Analysis",
            status=SectionStatus.RESEARCHING,
            started_at=datetime.utcnow(),
        )
        assert info.completed_at is None

    def test_research_status_response(self):
        """Test ResearchStatusResponse model."""
        response = ResearchStatusResponse(
            research_id="test-123",
            company_name="Test Co",
            status=ReportStatus.IN_PROGRESS,
            sections=[],
            sections_complete=3,
            total_sections=10,
            current_section=SectionId.BUSINESS_MODEL,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        assert response.sections_complete == 3
        assert response.current_section == SectionId.BUSINESS_MODEL

    def test_section_content_response(self):
        """Test SectionContentResponse model."""
        response = SectionContentResponse(
            section_id=SectionId.EXECUTIVE_SUMMARY,
            section_name="Executive Summary",
            status=SectionStatus.COMPLETE,
            formatted_content="# Summary\n\nContent here...",
            sources=[],
            data_gaps=[],
        )
        assert response.formatted_content is not None
