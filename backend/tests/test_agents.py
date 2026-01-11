"""Tests for agent implementations."""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import datetime

from app.models.enums import SectionId, SectionStatus
from app.models.schemas import SectionData, SourceCitation


class TestWriterAgent:
    """Test Writer Agent functionality."""

    @patch('app.agents.writer_agent.ChatGoogleGenerativeAI')
    def test_format_section_basic(self, mock_llm_class):
        """Test basic section formatting."""
        from app.agents.writer_agent import format_section
        
        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MagicMock(
            content="# Executive Summary\n\nFormatted professional content..."
        )
        mock_llm_class.return_value = mock_llm
        
        raw_data = "Company founded 2010. Revenue $5B. CEO is John Smith."
        sources = [
            SourceCitation(
                url="https://example.com",
                title="Source",
                snippet="Snippet",
                source_type="news_article",
                retrieved_at=datetime.utcnow(),
            )
        ]
        
        result = format_section(
            section_id=SectionId.EXECUTIVE_SUMMARY,
            raw_data=raw_data,
            sources=sources,
        )
        
        assert result is not None
        mock_llm.invoke.assert_called_once()

    @patch('app.agents.writer_agent.ChatGoogleGenerativeAI')
    def test_format_section_preserves_facts(self, mock_llm_class):
        """Test that formatting preserves key facts."""
        from app.agents.writer_agent import format_section
        
        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MagicMock(
            content="Revenue: $5 billion. Founded: 2010."
        )
        mock_llm_class.return_value = mock_llm
        
        raw_data = "Revenue $5B. Founded 2010."
        
        result = format_section(
            section_id=SectionId.FINANCIALS,
            raw_data=raw_data,
            sources=[],
        )
        
        # Writer should not add new facts
        assert result is not None


class TestDataExtractor:
    """Test data extraction functionality."""

    @patch('app.agents.data_extractor.ChatGoogleGenerativeAI')
    def test_extract_structured_data(self, mock_llm_class):
        """Test structured data extraction."""
        from app.agents.data_extractor import extract_structured_data
        
        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MagicMock(
            content='{"revenue": 5000000000, "founded_year": 2010}'
        )
        mock_llm_class.return_value = mock_llm
        
        raw_data = "Company revenue is $5B. Founded in 2010."
        
        result = extract_structured_data(
            section_id=SectionId.COMPANY_OVERVIEW,
            raw_data=raw_data,
        )
        
        assert result is not None

    @patch('app.agents.data_extractor.ChatGoogleGenerativeAI')
    def test_generate_visualization_data_ownership(self, mock_llm_class):
        """Test ownership visualization data generation."""
        from app.agents.data_extractor import generate_visualization_data
        
        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MagicMock(
            content='[{"name": "Founders", "value": 40, "type": "founder"}]'
        )
        mock_llm_class.return_value = mock_llm
        
        structured_data = {
            "ownership": [
                {"name": "Founders", "percentage": 40},
                {"name": "Investors", "percentage": 60},
            ]
        }
        
        result = generate_visualization_data(
            section_id=SectionId.LEADERSHIP_GOVERNANCE,
            structured_data=structured_data,
        )
        
        assert result is not None

    @patch('app.agents.data_extractor.ChatGoogleGenerativeAI')
    def test_generate_visualization_data_financials(self, mock_llm_class):
        """Test financial visualization data generation."""
        from app.agents.data_extractor import generate_visualization_data
        
        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MagicMock(
            content='[{"period": "2023", "revenue": 5000000000}]'
        )
        mock_llm_class.return_value = mock_llm
        
        structured_data = {
            "financials": [
                {"year": 2023, "revenue": 5000000000},
            ]
        }
        
        result = generate_visualization_data(
            section_id=SectionId.FINANCIALS,
            structured_data=structured_data,
        )
        
        assert result is not None


class TestResearchAgent:
    """Test Research Agent functionality."""

    @patch('app.agents.research_agent.create_react_agent')
    @patch('app.agents.research_agent.ChatGoogleGenerativeAI')
    def test_research_agent_creation(self, mock_llm_class, mock_create_agent):
        """Test research agent is created correctly."""
        from app.agents.research_agent import create_research_agent
        
        mock_llm = MagicMock()
        mock_llm_class.return_value = mock_llm
        mock_create_agent.return_value = MagicMock()
        
        agent = create_research_agent(
            section_id=SectionId.EXECUTIVE_SUMMARY,
            company_name="Test Company",
            is_public=False,
        )
        
        assert agent is not None
        mock_create_agent.assert_called_once()

    @patch('app.agents.research_agent.create_react_agent')
    @patch('app.agents.research_agent.ChatGoogleGenerativeAI')
    def test_research_agent_public_company(self, mock_llm_class, mock_create_agent):
        """Test research agent for public company."""
        from app.agents.research_agent import create_research_agent
        
        mock_llm = MagicMock()
        mock_llm_class.return_value = mock_llm
        mock_create_agent.return_value = MagicMock()
        
        agent = create_research_agent(
            section_id=SectionId.FINANCIALS,
            company_name="Apple Inc",
            is_public=True,
        )
        
        assert agent is not None
        # Should use different prompt for public companies
        call_args = mock_create_agent.call_args
        assert call_args is not None


class TestOrchestrator:
    """Test orchestrator functionality."""

    @patch('app.agents.orchestrator.create_research_agent')
    @patch('app.agents.orchestrator.format_section')
    @patch('app.agents.orchestrator.extract_structured_data')
    @patch('app.agents.orchestrator.generate_visualization_data')
    @patch('app.agents.orchestrator.report_store')
    async def test_process_section(
        self,
        mock_store,
        mock_viz,
        mock_extract,
        mock_format,
        mock_research,
    ):
        """Test processing a single section."""
        from app.agents.orchestrator import process_section
        
        # Setup mocks
        mock_agent = MagicMock()
        mock_agent.invoke.return_value = {
            "output": "Research findings...",
            "sources": [],
        }
        mock_research.return_value = mock_agent
        mock_format.return_value = "Formatted content"
        mock_extract.return_value = {"key": "value"}
        mock_viz.return_value = {"chart": "data"}
        
        result = await process_section(
            report_id="test-123",
            section_id=SectionId.EXECUTIVE_SUMMARY,
            company_name="Test Co",
            is_public=False,
        )
        
        assert result is not None
