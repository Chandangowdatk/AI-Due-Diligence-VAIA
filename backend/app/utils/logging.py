"""Logging configuration for the due diligence platform."""

import logging
import sys
from datetime import datetime
from typing import Optional


def setup_logging(level: str = "INFO") -> None:
    """Configure logging for the application."""
    log_level = getattr(logging, level.upper(), logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    
    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(console_handler)
    
    # Reduce noise from third-party libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("langchain").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger with the given name."""
    return logging.getLogger(name)


class ResearchLogger:
    """Specialized logger for research operations."""
    
    def __init__(self, report_id: str, company_name: str):
        self.report_id = report_id
        self.company_name = company_name
        self.logger = logging.getLogger(f"research.{report_id[:8]}")
    
    def _format_msg(self, msg: str) -> str:
        return f"[{self.company_name}] {msg}"
    
    def info(self, msg: str) -> None:
        self.logger.info(self._format_msg(msg))
    
    def warning(self, msg: str) -> None:
        self.logger.warning(self._format_msg(msg))
    
    def error(self, msg: str, exc: Optional[Exception] = None) -> None:
        if exc:
            self.logger.error(self._format_msg(f"{msg}: {exc}"), exc_info=True)
        else:
            self.logger.error(self._format_msg(msg))
    
    def section_start(self, section_name: str) -> None:
        self.info(f"Starting section: {section_name}")
    
    def section_complete(self, section_name: str, duration: float) -> None:
        self.info(f"Completed section: {section_name} ({duration:.1f}s)")
    
    def section_error(self, section_name: str, error: str) -> None:
        self.error(f"Section failed: {section_name} - {error}")
    
    def search_query(self, query: str) -> None:
        self.info(f"Search: {query[:100]}...")
    
    def token_usage(self, tokens: int, model: str) -> None:
        self.info(f"Tokens used: {tokens} ({model})")
