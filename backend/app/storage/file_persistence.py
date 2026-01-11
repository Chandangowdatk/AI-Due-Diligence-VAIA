"""File-based persistence for reports."""

import json
from typing import Dict
from pathlib import Path

from app.models.schemas import CompanyReport


async def persist_report(report: CompanyReport, data_dir: Path) -> None:
    """Persist a report to JSON file."""
    file_path = data_dir / f"{report.id}.json"
    with open(file_path, "w") as f:
        f.write(report.model_dump_json(indent=2))


async def load_all_reports(data_dir: Path) -> Dict[str, CompanyReport]:
    """Load all reports from disk."""
    reports = {}
    
    if not data_dir.exists():
        return reports
    
    for file_path in data_dir.glob("*.json"):
        try:
            with open(file_path, "r") as f:
                data = json.load(f)
                report = CompanyReport.model_validate(data)
                reports[report.id] = report
        except Exception as e:
            print(f"Error loading report {file_path}: {e}")
    
    return reports
