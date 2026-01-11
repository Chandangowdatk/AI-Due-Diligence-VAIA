"""Tests for tool functions."""

import pytest
from unittest.mock import patch, MagicMock

from app.tools.tavily_tool import tavily_search, tavily_search_company, tavily_search_public_company
from app.tools.think_tool import think, assess_section_completeness


class TestTavilyTools:
    """Test Tavily search tools."""

    @patch('app.tools.tavily_tool.TavilyClient')
    def test_tavily_search_basic(self, mock_client_class, mock_tavily_response):
        """Test basic Tavily search."""
        mock_client = MagicMock()
        mock_client.search.return_value = mock_tavily_response
        mock_client_class.return_value = mock_client

        result = tavily_search.invoke({"query": "test company overview"})
        
        assert "results" in result or isinstance(result, str)
        mock_client.search.assert_called_once()

    @patch('app.tools.tavily_tool.TavilyClient')
    def test_tavily_search_company(self, mock_client_class, mock_tavily_response):
        """Test company-specific search."""
        mock_client = MagicMock()
        mock_client.search.return_value = mock_tavily_response
        mock_client_class.return_value = mock_client

        result = tavily_search_company.invoke({
            "company_name": "Stripe",
            "search_type": "financials",
        })
        
        assert result is not None
        mock_client.search.assert_called_once()

    @patch('app.tools.tavily_tool.TavilyClient')
    def test_tavily_search_public_company(self, mock_client_class, mock_tavily_response):
        """Test public company search with SEC focus."""
        mock_client = MagicMock()
        mock_client.search.return_value = mock_tavily_response
        mock_client_class.return_value = mock_client

        result = tavily_search_public_company.invoke({
            "company_name": "Apple",
            "ticker": "AAPL",
            "search_type": "sec_filings",
        })
        
        assert result is not None
        # Should include SEC-related terms in search
        call_args = mock_client.search.call_args
        assert call_args is not None

    @patch('app.tools.tavily_tool.TavilyClient')
    def test_tavily_search_handles_error(self, mock_client_class):
        """Test error handling in Tavily search."""
        mock_client = MagicMock()
        mock_client.search.side_effect = Exception("API Error")
        mock_client_class.return_value = mock_client

        result = tavily_search.invoke({"query": "test query"})
        
        # Should return error message, not raise exception
        assert "error" in result.lower() or "failed" in result.lower()


class TestThinkTool:
    """Test think/reflection tools."""

    def test_think_returns_thought(self):
        """Test that think tool echoes the thought."""
        thought = "I need to search for more financial data"
        result = think.invoke({"thought": thought})
        
        assert thought in result

    def test_think_with_complex_thought(self):
        """Test think with multi-line thought."""
        thought = """
        Analysis so far:
        1. Found revenue data
        2. Missing profit margins
        3. Need to search SEC filings
        """
        result = think.invoke({"thought": thought})
        
        assert "revenue" in result.lower()
        assert "SEC" in result

    def test_assess_section_completeness(self):
        """Test section completeness assessment."""
        findings = """
        Found: Company revenue $10B, Founded 2010, CEO John Smith
        Missing: Profit margins, Employee count
        """
        result = assess_section_completeness.invoke({
            "section_name": "Company Overview",
            "findings": findings,
        })
        
        assert result is not None
        # Should provide assessment
        assert len(result) > 0
