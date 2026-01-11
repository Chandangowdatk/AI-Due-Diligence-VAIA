"""Tests for API endpoints."""

import pytest
from datetime import datetime
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.models.enums import SectionId, SectionStatus, ReportStatus
from app.models.schemas import CompanyReport, SectionData
from app.storage.memory_store import report_store


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def setup_test_report():
    """Set up a test report in storage."""
    now = datetime.utcnow()
    sections = {}
    for section_id in SectionId:
        sections[section_id] = SectionData(
            section_id=section_id,
            section_name=section_id.value.replace('_', ' ').title(),
            status=SectionStatus.PENDING,
        )
    
    # Mark one section as complete
    sections[SectionId.EXECUTIVE_SUMMARY].status = SectionStatus.COMPLETE
    sections[SectionId.EXECUTIVE_SUMMARY].formatted_content = "# Summary\n\nTest content"
    
    report = CompanyReport(
        id="test-api-report",
        company_name="API Test Company",
        status=ReportStatus.IN_PROGRESS,
        sections=sections,
        created_at=now,
        updated_at=now,
    )
    
    report_store.create_report(report)
    yield report
    # Cleanup
    report_store.delete_report(report.id)


class TestResearchEndpoints:
    """Test research API endpoints."""

    @patch('app.api.research.process_report')
    def test_start_research(self, mock_process, client):
        """Test POST /api/research endpoint."""
        response = client.post(
            "/api/research",
            json={"company_name": "Test Company"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "research_id" in data
        assert data["company_name"] == "Test Company"
        assert data["status"] == "pending"

    @patch('app.api.research.process_report')
    def test_start_research_empty_name(self, mock_process, client):
        """Test that empty company name fails."""
        response = client.post(
            "/api/research",
            json={"company_name": ""}
        )
        
        assert response.status_code == 422  # Validation error

    def test_get_research_status(self, client, setup_test_report):
        """Test GET /api/research/{id}/status endpoint."""
        response = client.get(f"/api/research/{setup_test_report.id}/status")
        
        assert response.status_code == 200
        data = response.json()
        assert data["research_id"] == setup_test_report.id
        assert data["company_name"] == "API Test Company"
        assert data["total_sections"] == 10
        assert len(data["sections"]) == 10

    def test_get_research_status_not_found(self, client):
        """Test status endpoint with invalid ID."""
        response = client.get("/api/research/nonexistent-id/status")
        
        assert response.status_code == 404

    def test_get_section_content(self, client, setup_test_report):
        """Test GET /api/research/{id}/section/{section_id} endpoint."""
        response = client.get(
            f"/api/research/{setup_test_report.id}/section/executive_summary"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["section_id"] == "executive_summary"
        assert data["status"] == "complete"
        assert data["formatted_content"] is not None

    def test_get_section_content_pending(self, client, setup_test_report):
        """Test getting content for pending section."""
        response = client.get(
            f"/api/research/{setup_test_report.id}/section/financials"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "pending"
        assert data["formatted_content"] is None

    def test_get_section_invalid_id(self, client, setup_test_report):
        """Test getting section with invalid section ID."""
        response = client.get(
            f"/api/research/{setup_test_report.id}/section/invalid_section"
        )
        
        assert response.status_code == 422  # Validation error

    def test_get_full_report(self, client, setup_test_report):
        """Test GET /api/research/{id}/report endpoint."""
        response = client.get(f"/api/research/{setup_test_report.id}/report")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == setup_test_report.id
        assert "sections" in data
        assert len(data["sections"]) == 10


class TestExportEndpoints:
    """Test export API endpoints."""

    def test_export_json(self, client, setup_test_report):
        """Test GET /api/research/{id}/export/json endpoint."""
        response = client.get(f"/api/research/{setup_test_report.id}/export/json")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
        # Should be downloadable
        assert "attachment" in response.headers.get("content-disposition", "")

    def test_export_json_not_found(self, client):
        """Test JSON export with invalid ID."""
        response = client.get("/api/research/nonexistent/export/json")
        
        assert response.status_code == 404

    @patch('app.api.export.generate_pdf')
    def test_export_pdf(self, mock_pdf, client, setup_test_report):
        """Test GET /api/research/{id}/export/pdf endpoint."""
        # Mock PDF generation
        mock_pdf.return_value = b"%PDF-1.4 mock pdf content"
        
        response = client.get(f"/api/research/{setup_test_report.id}/export/pdf")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"


class TestHealthEndpoint:
    """Test health check endpoint."""

    def test_health_check(self, client):
        """Test health endpoint."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
