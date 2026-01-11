"""Storage layer for the due diligence platform."""

from app.storage.memory_store import (
    report_store,
    ReportStore,
    init_storage,
    save_report,
    load_report,
    update_section,
    get_all_reports,
)

__all__ = [
    "report_store",
    "ReportStore",
    "init_storage",
    "save_report",
    "load_report",
    "update_section",
    "get_all_reports",
]
