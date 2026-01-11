"""Section-specific structured data models."""

from datetime import date
from typing import Optional, Literal
from pydantic import BaseModel, Field

from app.models.enums import SectionId


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 2: Company Overview
# ─────────────────────────────────────────────────────────────────────────────

class Subsidiary(BaseModel):
    """Subsidiary, JV, or associate company."""
    name: str
    ownership_percentage: Optional[float] = None
    type: str  # "subsidiary", "joint_venture", "associate"
    location: Optional[str] = None


class CompanyOverviewData(BaseModel):
    """Structured data for Company Overview section."""
    founding_date: Optional[date] = None
    founders: list[str] = Field(default_factory=list)
    mission_statement: Optional[str] = None
    legal_structure: Optional[str] = None
    incorporation_jurisdiction: Optional[str] = None
    business_history: Optional[str] = None
    operating_geographies: list[str] = Field(default_factory=list)
    primary_market: Optional[str] = None
    secondary_markets: list[str] = Field(default_factory=list)
    business_segments: list[dict] = Field(default_factory=list)
    subsidiaries: list[Subsidiary] = Field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 3: Leadership, Governance & Cap Table
# ─────────────────────────────────────────────────────────────────────────────

class LeadershipMember(BaseModel):
    """Single leadership team member."""
    name: str
    title: str
    tenure_years: Optional[float] = None
    start_date: Optional[date] = None
    background_summary: Optional[str] = None
    previous_companies: list[str] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)
    linkedin_url: Optional[str] = None
    is_founder: bool = False


class BoardMember(BaseModel):
    """Single board member."""
    name: str
    role: str
    is_independent: bool = False
    committees: list[str] = Field(default_factory=list)
    other_boards: list[str] = Field(default_factory=list)
    background_summary: Optional[str] = None


class Shareholder(BaseModel):
    """Single shareholder entry."""
    name: str
    type: str  # "promoter", "institutional", "public", "esop"
    ownership_percentage: float
    shares_held: Optional[int] = None
    investor_type: Optional[str] = None


class FundingRoundDetail(BaseModel):
    """Detailed funding round for cap table."""
    round_name: str
    date: Optional[date] = None
    amount_raised: Optional[float] = None
    pre_money_valuation: Optional[float] = None
    post_money_valuation: Optional[float] = None
    lead_investors: list[str] = Field(default_factory=list)
    participating_investors: list[str] = Field(default_factory=list)


class LeadershipGovernanceData(BaseModel):
    """Structured data for Leadership & Governance section."""
    leadership_team: list[LeadershipMember] = Field(default_factory=list)
    key_person_risk: Optional[str] = None
    succession_planning: Optional[str] = None
    employee_count: Optional[int] = None
    department_breakdown: Optional[dict] = None
    board_members: list[BoardMember] = Field(default_factory=list)
    board_committees: list[str] = Field(default_factory=list)
    governance_notes: Optional[str] = None
    shareholders: list[Shareholder] = Field(default_factory=list)
    funding_rounds: list[FundingRoundDetail] = Field(default_factory=list)
    total_funding_raised: Optional[float] = None
    latest_valuation: Optional[float] = None
    esop_pool_percentage: Optional[float] = None
    esop_details: Optional[str] = None
    performance_pay_structure: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 4: Business Model
# ─────────────────────────────────────────────────────────────────────────────

class RevenueStream(BaseModel):
    """Single revenue stream."""
    name: str
    description: Optional[str] = None
    revenue_percentage: Optional[float] = None
    pricing_model: Optional[str] = None
    contract_type: Optional[str] = None


class UnitEconomics(BaseModel):
    """Unit economics metrics."""
    contribution_margin: Optional[float] = None
    customer_acquisition_cost: Optional[float] = None
    lifetime_value: Optional[float] = None
    ltv_cac_ratio: Optional[float] = None
    payback_period_months: Optional[int] = None
    gross_margin: Optional[float] = None


class BusinessModelData(BaseModel):
    """Structured data for Business Model section."""
    revenue_streams: list[RevenueStream] = Field(default_factory=list)
    primary_revenue_model: Optional[str] = None
    customer_concentration: Optional[str] = None
    fixed_costs_percentage: Optional[float] = None
    variable_costs_percentage: Optional[float] = None
    major_cost_drivers: list[str] = Field(default_factory=list)
    operating_leverage: Optional[str] = None
    unit_economics: Optional[UnitEconomics] = None
    tam: Optional[float] = None
    sam: Optional[float] = None
    som: Optional[float] = None
    market_growth_rate: Optional[float] = None


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 5: Market & Industry
# ─────────────────────────────────────────────────────────────────────────────

class MarketIndustryData(BaseModel):
    """Structured data for Market & Industry section."""
    industry_name: Optional[str] = None
    market_size: Optional[float] = None
    market_size_year: Optional[int] = None
    historical_growth_rate: Optional[float] = None
    projected_growth_rate: Optional[float] = None
    demand_drivers: list[str] = Field(default_factory=list)
    structural_drivers: list[str] = Field(default_factory=list)
    cyclical_drivers: list[str] = Field(default_factory=list)
    industry_structure: Optional[str] = None
    entry_barriers: list[str] = Field(default_factory=list)
    substitution_risks: list[str] = Field(default_factory=list)
    regulatory_environment: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 6: Competitive Landscape
# ─────────────────────────────────────────────────────────────────────────────

class Competitor(BaseModel):
    """Single competitor profile."""
    name: str
    type: str  # "direct", "indirect", "substitute"
    description: Optional[str] = None
    headquarters: Optional[str] = None
    founded_year: Optional[int] = None
    employee_count: Optional[int] = None
    total_funding: Optional[float] = None
    estimated_revenue: Optional[float] = None
    market_share: Optional[float] = None
    key_strengths: list[str] = Field(default_factory=list)
    key_weaknesses: list[str] = Field(default_factory=list)


class CompetitiveLandscapeData(BaseModel):
    """Structured data for Competitive Landscape section."""
    competitors: list[Competitor] = Field(default_factory=list)
    target_company_market_share: Optional[float] = None
    competitive_moat: list[str] = Field(default_factory=list)
    moat_assessment: Optional[str] = None
    switching_costs: Optional[str] = None
    brand_strength: Optional[str] = None
    network_effects: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 7: Financials
# ─────────────────────────────────────────────────────────────────────────────

class AnnualFinancials(BaseModel):
    """Single year of financial data."""
    fiscal_year: str
    period_end_date: Optional[date] = None
    revenue: Optional[float] = None
    revenue_growth_yoy: Optional[float] = None
    gross_profit: Optional[float] = None
    gross_margin: Optional[float] = None
    ebitda: Optional[float] = None
    ebitda_margin: Optional[float] = None
    operating_income: Optional[float] = None
    net_income: Optional[float] = None
    net_margin: Optional[float] = None
    total_assets: Optional[float] = None
    total_liabilities: Optional[float] = None
    total_equity: Optional[float] = None
    cash_and_equivalents: Optional[float] = None
    total_debt: Optional[float] = None
    operating_cash_flow: Optional[float] = None
    free_cash_flow: Optional[float] = None
    capex: Optional[float] = None
    debt_to_equity: Optional[float] = None
    current_ratio: Optional[float] = None
    roce: Optional[float] = None
    roe: Optional[float] = None


class WorkingCapitalMetrics(BaseModel):
    """Working capital analysis."""
    receivables_days: Optional[int] = None
    inventory_days: Optional[int] = None
    payables_days: Optional[int] = None
    cash_conversion_cycle: Optional[int] = None


class FinancialsData(BaseModel):
    """Structured data for Financials section."""
    annual_financials: list[AnnualFinancials] = Field(default_factory=list)
    one_off_items: list[str] = Field(default_factory=list)
    normalized_ebitda: Optional[float] = None
    accounting_notes: Optional[str] = None
    working_capital: Optional[WorkingCapitalMetrics] = None
    leverage_assessment: Optional[str] = None
    liquidity_assessment: Optional[str] = None
    contingent_liabilities: list[str] = Field(default_factory=list)
    off_balance_sheet_items: list[str] = Field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 8: Operations
# ─────────────────────────────────────────────────────────────────────────────

class OperationsData(BaseModel):
    """Structured data for Operations section."""
    supply_chain_description: Optional[str] = None
    key_suppliers: list[str] = Field(default_factory=list)
    supplier_concentration: Optional[str] = None
    supply_chain_risks: list[str] = Field(default_factory=list)
    manufacturing_locations: list[str] = Field(default_factory=list)
    production_capacity: Optional[str] = None
    capacity_utilization: Optional[float] = None
    technology_stack: list[str] = Field(default_factory=list)
    tech_infrastructure: Optional[str] = None
    r_and_d_spend: Optional[float] = None
    patents_held: Optional[int] = None
    quality_certifications: list[str] = Field(default_factory=list)
    quality_control_measures: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 9: Risks & Mitigants
# ─────────────────────────────────────────────────────────────────────────────

class Risk(BaseModel):
    """Single risk item with assessment."""
    category: str  # "strategic", "financial", "regulatory", "execution", "black_swan"
    title: str
    description: str
    probability: str  # "low", "medium", "high"
    impact: str       # "low", "medium", "high"
    mitigation_plan: Optional[str] = None
    owner: Optional[str] = None


class RisksData(BaseModel):
    """Structured data for Risks section."""
    strategic_risks: list[Risk] = Field(default_factory=list)
    financial_risks: list[Risk] = Field(default_factory=list)
    regulatory_risks: list[Risk] = Field(default_factory=list)
    execution_risks: list[Risk] = Field(default_factory=list)
    black_swan_risks: list[Risk] = Field(default_factory=list)
    overall_risk_assessment: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 10: ESG
# ─────────────────────────────────────────────────────────────────────────────

class ESGData(BaseModel):
    """Structured data for ESG section."""
    carbon_footprint: Optional[str] = None
    emissions_data: Optional[str] = None
    resource_usage: Optional[str] = None
    climate_risk_exposure: Optional[str] = None
    environmental_initiatives: list[str] = Field(default_factory=list)
    employee_count: Optional[int] = None
    employee_safety_record: Optional[str] = None
    labor_practices: Optional[str] = None
    diversity_metrics: Optional[str] = None
    community_impact: Optional[str] = None
    board_independence_ratio: Optional[float] = None
    audit_quality: Optional[str] = None
    related_party_transactions: list[str] = Field(default_factory=list)
    transparency_rating: Optional[str] = None
    esg_rating: Optional[str] = None
    esg_certifications: list[str] = Field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
# SECTION CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

class SectionConfig(BaseModel):
    """Configuration for each DD section."""
    section_id: SectionId
    display_name: str
    description: str
    max_word_count: int
    visualization_type: Optional[str] = None
    required_data_points: list[str]


SECTION_CONFIGS: dict[SectionId, SectionConfig] = {
    SectionId.EXECUTIVE_SUMMARY: SectionConfig(
        section_id=SectionId.EXECUTIVE_SUMMARY,
        display_name="Executive Summary",
        description="High-level overview of the company and investment thesis",
        max_word_count=500,
        visualization_type=None,
        required_data_points=["business_description", "key_metrics", "investment_highlights"]
    ),
    SectionId.COMPANY_OVERVIEW: SectionConfig(
        section_id=SectionId.COMPANY_OVERVIEW,
        display_name="Company Overview",
        description="Company background, history, and structure",
        max_word_count=1000,
        visualization_type=None,
        required_data_points=["founding_date", "founders", "legal_structure", "geographies"]
    ),
    SectionId.LEADERSHIP_GOVERNANCE: SectionConfig(
        section_id=SectionId.LEADERSHIP_GOVERNANCE,
        display_name="Leadership, Governance & Cap Table",
        description="Management team, board, ownership structure, and funding history",
        max_word_count=1000,
        visualization_type="ownership_pie",
        required_data_points=["leadership_team", "board_composition", "shareholding", "funding_rounds"]
    ),
    SectionId.BUSINESS_MODEL: SectionConfig(
        section_id=SectionId.BUSINESS_MODEL,
        display_name="Business Model & Market Context",
        description="Revenue model, cost structure, and unit economics",
        max_word_count=1000,
        visualization_type="revenue_bar",
        required_data_points=["revenue_streams", "pricing", "cost_structure"]
    ),
    SectionId.MARKET_INDUSTRY: SectionConfig(
        section_id=SectionId.MARKET_INDUSTRY,
        display_name="Market & Industry Analysis",
        description="Industry overview, market size, and growth drivers",
        max_word_count=1000,
        visualization_type=None,
        required_data_points=["market_size", "growth_rate", "demand_drivers"]
    ),
    SectionId.COMPETITIVE_LANDSCAPE: SectionConfig(
        section_id=SectionId.COMPETITIVE_LANDSCAPE,
        display_name="Competitive Landscape",
        description="Competitor analysis and market positioning",
        max_word_count=1000,
        visualization_type="competitor_bar",
        required_data_points=["competitors", "market_share", "competitive_moat"]
    ),
    SectionId.FINANCIALS: SectionConfig(
        section_id=SectionId.FINANCIALS,
        display_name="Financial Analysis",
        description="Historical financials, profitability, and cash flow",
        max_word_count=1000,
        visualization_type="financials_composed",
        required_data_points=["revenue", "ebitda", "margins", "cash_flow"]
    ),
    SectionId.OPERATIONS: SectionConfig(
        section_id=SectionId.OPERATIONS,
        display_name="Operations",
        description="Supply chain, manufacturing, and technology",
        max_word_count=1000,
        visualization_type=None,
        required_data_points=["supply_chain", "technology", "quality_control"]
    ),
    SectionId.RISKS_MITIGANTS: SectionConfig(
        section_id=SectionId.RISKS_MITIGANTS,
        display_name="Risks & Mitigants",
        description="Risk assessment and mitigation strategies",
        max_word_count=1000,
        visualization_type=None,
        required_data_points=["strategic_risks", "financial_risks", "regulatory_risks"]
    ),
    SectionId.ESG: SectionConfig(
        section_id=SectionId.ESG,
        display_name="ESG Analysis",
        description="Environmental, social, and governance factors",
        max_word_count=1000,
        visualization_type=None,
        required_data_points=["environmental", "social", "governance"]
    ),
}
