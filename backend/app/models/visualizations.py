"""Visualization data schemas for Recharts."""

from typing import Optional, Literal
from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 3: Leadership & Governance - Ownership PieChart
# ─────────────────────────────────────────────────────────────────────────────

class OwnershipSlice(BaseModel):
    """Single slice in ownership pie chart."""
    name: str  # "Promoters", "Institutional Investors", "Public"
    value: float  # Percentage (0-100)
    color: Optional[str] = None  # Hex color code


class OwnershipVisualization(BaseModel):
    """Ownership distribution pie chart data."""
    chart_type: Literal["pie"] = "pie"
    title: str = "Ownership Distribution"
    data: list[OwnershipSlice]


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 3: Funding History - Valuation LineChart
# ─────────────────────────────────────────────────────────────────────────────

class FundingRoundPoint(BaseModel):
    """Single funding round data point."""
    date: str  # "2020-03-15"
    round: str  # "Seed", "Series A", "Series B"
    amount: float  # Amount raised in millions
    post_money_valuation: Optional[float] = None  # In millions
    lead_investor: Optional[str] = None


class FundingVisualization(BaseModel):
    """Funding history and valuation line chart."""
    chart_type: Literal["line"] = "line"
    title: str = "Funding History & Valuation"
    currency: str = "USD"
    unit: str = "millions"
    data: list[FundingRoundPoint]


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 4: Business Model - Revenue BarChart
# ─────────────────────────────────────────────────────────────────────────────

class RevenueSegment(BaseModel):
    """Single bar in revenue breakdown chart."""
    segment: str  # "Product A", "Services", "Subscriptions"
    revenue: float  # In millions USD
    percentage: float  # Of total revenue
    color: Optional[str] = None


class RevenueVisualization(BaseModel):
    """Revenue breakdown bar chart data."""
    chart_type: Literal["bar"] = "bar"
    title: str = "Revenue by Segment"
    currency: str = "USD"
    unit: str = "millions"
    data: list[RevenueSegment]


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 6: Competitive Landscape - Competitor Funding BarChart
# ─────────────────────────────────────────────────────────────────────────────

class CompetitorFunding(BaseModel):
    """Single bar in competitor funding comparison."""
    company: str
    funding: float  # Total funding in millions USD
    stage: Optional[str] = None  # "Series A", "Series D", "Public"
    is_target: bool = False  # True for the company being analyzed


class CompetitorFundingVisualization(BaseModel):
    """Competitor funding comparison bar chart."""
    chart_type: Literal["bar_horizontal"] = "bar_horizontal"
    title: str = "Competitor Funding Comparison"
    currency: str = "USD"
    unit: str = "millions"
    data: list[CompetitorFunding]


class MarketShareSlice(BaseModel):
    """Single slice in market share pie chart."""
    company: str
    share: float  # Percentage (0-100)
    is_target: bool = False
    color: Optional[str] = None


class MarketShareVisualization(BaseModel):
    """Market share distribution pie chart."""
    chart_type: Literal["pie"] = "pie"
    title: str = "Market Share Distribution"
    data: list[MarketShareSlice]


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 7: Financials - ComposedChart (bars + lines)
# ─────────────────────────────────────────────────────────────────────────────

class FinancialYearData(BaseModel):
    """Single year of financial data for chart."""
    year: str  # "FY2022", "FY2023"
    revenue: Optional[float] = None  # In millions
    ebitda: Optional[float] = None
    net_profit: Optional[float] = None
    gross_margin: Optional[float] = None  # Percentage
    ebitda_margin: Optional[float] = None  # Percentage
    net_margin: Optional[float] = None  # Percentage


class FinancialsVisualization(BaseModel):
    """Financial trends composed chart (bars + lines)."""
    chart_type: Literal["composed"] = "composed"
    title: str = "Financial Performance"
    currency: str = "USD"
    unit: str = "millions"
    data: list[FinancialYearData]
    bar_metrics: list[str] = Field(default=["revenue", "ebitda"])
    line_metrics: list[str] = Field(default=["gross_margin", "ebitda_margin"])
