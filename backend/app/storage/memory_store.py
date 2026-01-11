"""In-memory storage for reports."""

from typing import Dict, Optional
from pathlib import Path

from app.models.schemas import CompanyReport, SectionData
from app.models.enums import SectionId


class ReportStore:
    """In-memory report storage with optional file persistence."""
    
    def __init__(self):
        self._reports: Dict[str, CompanyReport] = {}
        self._data_dir: Optional[Path] = None
    
    async def init_storage(self, data_dir: str) -> None:
        """Initialize storage and load persisted reports."""
        self._data_dir = Path(data_dir)
        self._data_dir.mkdir(parents=True, exist_ok=True)
        
        # Load existing reports from disk
        from app.storage.file_persistence import load_all_reports
        loaded = await load_all_reports(self._data_dir)
        self._reports.update(loaded)
    
    def get_report(self, report_id: str) -> Optional[CompanyReport]:
        """Get report from memory."""
        return self._reports.get(report_id)
    
    def create_report(self, report: CompanyReport) -> None:
        """Create a new report in memory."""
        self._reports[report.id] = report
    
    def update_report(self, report: CompanyReport) -> None:
        """Update report in memory."""
        self._reports[report.id] = report
    
    async def save_report(self, report: CompanyReport) -> None:
        """Save report to memory and persist to disk."""
        self._reports[report.id] = report
        
        # Persist to disk
        if self._data_dir:
            from app.storage.file_persistence import persist_report
            await persist_report(report, self._data_dir)
    
    def update_section(
        self,
        report_id: str,
        section_id: SectionId,
        section_data: SectionData,
    ) -> None:
        """Update a specific section in a report."""
        report = self._reports.get(report_id)
        if report:
            report.sections[section_id] = section_data
    
    def get_all_reports(self) -> Dict[str, CompanyReport]:
        """Get all reports from memory."""
        return self._reports.copy()
    
    def delete_report(self, report_id: str) -> bool:
        """Delete a report from memory."""
        if report_id in self._reports:
            del self._reports[report_id]
            return True
        return False


# Global singleton instance
report_store = ReportStore()


# Legacy async function interface for backward compatibility
async def init_storage(data_dir: str) -> None:
    """Initialize storage and load persisted reports."""
    await report_store.init_storage(data_dir)


async def save_report(report: CompanyReport) -> None:
    """Save report to memory and disk."""
    await report_store.save_report(report)


async def load_report(report_id: str) -> Optional[CompanyReport]:
    """Load report from memory."""
    return report_store.get_report(report_id)


async def update_section(
    report_id: str,
    section_id: SectionId,
    section_data: SectionData,
) -> None:
    """Update a specific section in a report."""
    report_store.update_section(report_id, section_id, section_data)


async def get_all_reports() -> Dict[str, CompanyReport]:
    """Get all reports from memory."""
    return report_store.get_all_reports()
