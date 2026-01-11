"""Tests for storage layer."""

import pytest
from datetime import datetime

from app.models.enums import SectionId, SectionStatus, ReportStatus
from app.models.schemas import SectionData
from app.storage.memory_store import ReportStore


class TestReportStore:
    """Test in-memory report storage."""

    def test_create_report(self, mock_report_store, sample_report):
        """Test creating a new report."""
        mock_report_store.create_report(sample_report)
        
        retrieved = mock_report_store.get_report(sample_report.id)
        assert retrieved is not None
        assert retrieved.id == sample_report.id
        assert retrieved.company_name == sample_report.company_name

    def test_get_nonexistent_report(self, mock_report_store):
        """Test getting a report that doesn't exist."""
        result = mock_report_store.get_report("nonexistent-id")
        assert result is None

    def test_update_report(self, mock_report_store, sample_report):
        """Test updating a report."""
        mock_report_store.create_report(sample_report)
        
        sample_report.status = ReportStatus.IN_PROGRESS
        mock_report_store.update_report(sample_report)
        
        retrieved = mock_report_store.get_report(sample_report.id)
        assert retrieved.status == ReportStatus.IN_PROGRESS

    def test_update_section(self, mock_report_store, sample_report):
        """Test updating a specific section."""
        mock_report_store.create_report(sample_report)
        
        updated_section = SectionData(
            section_id=SectionId.EXECUTIVE_SUMMARY,
            section_name="Executive Summary",
            status=SectionStatus.COMPLETE,
            formatted_content="Updated content",
        )
        
        mock_report_store.update_section(sample_report.id, updated_section)
        
        retrieved = mock_report_store.get_report(sample_report.id)
        section = retrieved.sections[SectionId.EXECUTIVE_SUMMARY]
        assert section.status == SectionStatus.COMPLETE
        assert section.formatted_content == "Updated content"

    def test_update_section_status(self, mock_report_store, sample_report):
        """Test updating just section status."""
        mock_report_store.create_report(sample_report)
        
        mock_report_store.update_section_status(
            sample_report.id,
            SectionId.FINANCIALS,
            SectionStatus.RESEARCHING,
        )
        
        retrieved = mock_report_store.get_report(sample_report.id)
        section = retrieved.sections[SectionId.FINANCIALS]
        assert section.status == SectionStatus.RESEARCHING

    def test_list_reports(self, mock_report_store, sample_report):
        """Test listing all reports."""
        mock_report_store.create_report(sample_report)
        
        reports = mock_report_store.list_reports()
        assert len(reports) == 1
        assert reports[0].id == sample_report.id

    def test_delete_report(self, mock_report_store, sample_report):
        """Test deleting a report."""
        mock_report_store.create_report(sample_report)
        
        result = mock_report_store.delete_report(sample_report.id)
        assert result is True
        
        retrieved = mock_report_store.get_report(sample_report.id)
        assert retrieved is None

    def test_delete_nonexistent_report(self, mock_report_store):
        """Test deleting a report that doesn't exist."""
        result = mock_report_store.delete_report("nonexistent-id")
        assert result is False
