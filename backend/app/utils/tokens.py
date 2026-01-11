"""Token tracking utilities."""

import logging
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)


@dataclass
class TokenUsage:
    """Track token usage for a single LLM call."""
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    model: str = ""
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class TokenTracker:
    """Track cumulative token usage for a report."""
    report_id: str
    total_prompt_tokens: int = 0
    total_completion_tokens: int = 0
    total_tokens: int = 0
    call_count: int = 0
    
    # Cost estimates (per 1M tokens, approximate for Gemini 2.5 Pro)
    COST_PER_1M_INPUT = 1.25   # Gemini 2.5 Pro input
    COST_PER_1M_OUTPUT = 10.0  # Gemini 2.5 Pro output
    
    def add_usage(self, usage: TokenUsage) -> None:
        """Add token usage from an LLM call."""
        self.total_prompt_tokens += usage.prompt_tokens
        self.total_completion_tokens += usage.completion_tokens
        self.total_tokens += usage.total_tokens
        self.call_count += 1
        
        logger.debug(
            f"Token usage [{self.report_id[:8]}]: "
            f"+{usage.total_tokens} tokens ({usage.model})"
        )
    
    def estimate_cost(self) -> float:
        """Estimate cost in USD based on token usage."""
        input_cost = (self.total_prompt_tokens / 1_000_000) * self.COST_PER_1M_INPUT
        output_cost = (self.total_completion_tokens / 1_000_000) * self.COST_PER_1M_OUTPUT
        return input_cost + output_cost
    
    def get_summary(self) -> dict:
        """Get summary of token usage."""
        return {
            "total_tokens": self.total_tokens,
            "prompt_tokens": self.total_prompt_tokens,
            "completion_tokens": self.total_completion_tokens,
            "llm_calls": self.call_count,
            "estimated_cost_usd": round(self.estimate_cost(), 4),
        }


# Global tracker storage (in production, use proper storage)
_trackers: dict[str, TokenTracker] = {}


def get_tracker(report_id: str) -> TokenTracker:
    """Get or create a token tracker for a report."""
    if report_id not in _trackers:
        _trackers[report_id] = TokenTracker(report_id=report_id)
    return _trackers[report_id]


def track_llm_response(report_id: str, response: any, model: str = "gemini-2.5-pro") -> None:
    """Track token usage from an LLM response."""
    tracker = get_tracker(report_id)
    
    # Extract token usage from response metadata if available
    usage = TokenUsage(model=model)
    
    if hasattr(response, "usage_metadata"):
        metadata = response.usage_metadata
        usage.prompt_tokens = getattr(metadata, "prompt_token_count", 0)
        usage.completion_tokens = getattr(metadata, "candidates_token_count", 0)
        usage.total_tokens = usage.prompt_tokens + usage.completion_tokens
    elif hasattr(response, "response_metadata"):
        metadata = response.response_metadata
        if "usage_metadata" in metadata:
            um = metadata["usage_metadata"]
            usage.prompt_tokens = um.get("prompt_token_count", 0)
            usage.completion_tokens = um.get("candidates_token_count", 0)
            usage.total_tokens = usage.prompt_tokens + usage.completion_tokens
    
    tracker.add_usage(usage)


def get_report_token_summary(report_id: str) -> dict:
    """Get token usage summary for a report."""
    if report_id in _trackers:
        return _trackers[report_id].get_summary()
    return {
        "total_tokens": 0,
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "llm_calls": 0,
        "estimated_cost_usd": 0.0,
    }


def cleanup_tracker(report_id: str) -> None:
    """Remove tracker for a completed report."""
    if report_id in _trackers:
        del _trackers[report_id]
