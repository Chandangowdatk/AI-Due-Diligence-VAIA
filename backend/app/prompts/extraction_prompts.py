"""Extraction prompts for structured data and visualizations."""

from app.models.enums import SectionId

EXTRACTION_SYSTEM_PROMPT = """You are a data extraction specialist. Your job is to extract structured data from raw research text for visualization purposes.

## RULES

1. Extract data that is explicitly stated OR can be reasonably inferred from the text
2. Use null for values that cannot be determined - DO NOT make up numbers
3. Preserve numerical precision as stated in source
4. Return valid JSON matching the requested schema
5. If percentages are mentioned without exact numbers, estimate based on context
6. Convert all monetary values to millions (e.g., $1.5B = 1500, $500M = 500, $10M = 10)
7. If you find partial data, include what you can find - partial data is better than no data
8. Look for data in various formats: tables, lists, prose, etc.

## HANDLING MISSING DATA

- If a required field cannot be found, use null
- If you can only find some items in a list, include those items
- If you can estimate a value from context (e.g., "majority stake" = ~51%), do so and note it
- Return an empty object {} ONLY if absolutely no relevant data can be extracted

## OUTPUT FORMAT

Return ONLY valid JSON. No explanations, no markdown code blocks, just the JSON object.
"""


# Section-specific extraction prompts
EXTRACTION_PROMPTS = {
    SectionId.LEADERSHIP_GOVERNANCE: """Extract ownership/shareholding and funding data for visualizations.

From the text, extract:
1. Shareholder categories and their ownership percentages (Founders/Promoters, Institutional Investors, Public/Retail, ESOP, etc.)
2. Funding rounds with dates, amounts, and valuations

Return JSON in this format:
{
    "ownership_data": [
        {"name": "Founders/Promoters", "value": 45.5},
        {"name": "Institutional Investors", "value": 30.0},
        {"name": "Public/Retail", "value": 20.0},
        {"name": "ESOP", "value": 4.5}
    ],
    "funding_rounds": [
        {
            "round_name": "Series A",
            "date": "2020-03",
            "amount_raised": 10.0,
            "post_money_valuation": 50.0
        }
    ],
    "total_funding": 150.0,
    "latest_valuation": 500.0
}

IMPORTANT:
- All monetary values should be in MILLIONS (e.g., $1.5B = 1500, $500M = 500)
- Ownership percentages should sum to approximately 100
- If exact percentages aren't given, estimate based on context (e.g., "majority stake" = ~51%)
- Include any ownership data you can find, even if incomplete
""",

    SectionId.BUSINESS_MODEL: """Extract revenue breakdown data for a bar chart.

From the text, extract revenue streams/segments and their contributions.

Return JSON in this format:
{
    "revenue_streams": [
        {"segment": "Product Sales", "revenue": 100.0, "percentage": 60.0},
        {"segment": "Services", "revenue": 50.0, "percentage": 30.0},
        {"segment": "Subscriptions", "revenue": 16.7, "percentage": 10.0}
    ],
    "total_revenue": 166.7,
    "currency": "USD",
    "unit": "millions",
    "fiscal_year": "2023"
}

IMPORTANT:
- All revenue values should be in MILLIONS
- If only percentages are given, estimate revenue based on total if available
- If only revenue is given, calculate percentages
- Include any revenue breakdown you can find (by product, geography, customer segment, etc.)
""",

    SectionId.COMPETITIVE_LANDSCAPE: """Extract competitor data for visualization.

From the text, extract competitor information including funding and market share.

Return JSON in this format:
{
    "competitors": [
        {
            "company": "Competitor A",
            "funding": 200.0,
            "market_share": 25.0,
            "is_target": false
        },
        {
            "company": "Target Company",
            "funding": 150.0,
            "market_share": 15.0,
            "is_target": true
        }
    ],
    "currency": "USD",
    "unit": "millions"
}

IMPORTANT:
- Mark the target company (the one being researched) with "is_target": true
- All funding values should be in MILLIONS
- Market share should be a percentage (0-100)
- Include the target company in the competitors list for comparison
- If funding isn't available, use 0 or null
""",

    SectionId.FINANCIALS: """Extract financial data for a composed chart showing revenue, profit, and margins over time.

From the text, extract yearly financial metrics.

Return JSON in this format:
{
    "annual_data": [
        {
            "year": "FY2021",
            "revenue": 100.0,
            "gross_profit": 45.0,
            "ebitda": 20.0,
            "net_profit": 10.0,
            "gross_margin": 45.0,
            "ebitda_margin": 20.0,
            "net_margin": 10.0
        },
        {
            "year": "FY2022",
            "revenue": 130.0,
            "gross_profit": 60.0,
            "ebitda": 28.0,
            "net_profit": 15.0,
            "gross_margin": 46.0,
            "ebitda_margin": 21.5,
            "net_margin": 11.5
        }
    ],
    "currency": "USD",
    "unit": "millions"
}

IMPORTANT:
- All monetary values (revenue, gross_profit, ebitda, net_profit) should be in MILLIONS
- Margins should be percentages (0-100)
- Include as many years as available in the data (at least 3-5 years if possible)
- If some metrics are missing for a year, include what's available
- Calculate margins if you have the raw numbers but not the percentages
- Net profit can be negative (losses) - include negative values
""",
}


def get_extraction_prompt(section_id: SectionId, raw_data: str, company_name: str = None) -> str:
    """Generate extraction prompt for a specific section."""
    section_prompt = EXTRACTION_PROMPTS.get(section_id)
    
    if not section_prompt:
        return None  # No visualization for this section
    
    company_context = f"\nThe target company being researched is: {company_name}\n" if company_name else ""
    
    return f"""{section_prompt}
{company_context}
RAW DATA TO EXTRACT FROM:
{raw_data}

Return ONLY the JSON object, no other text.
"""
