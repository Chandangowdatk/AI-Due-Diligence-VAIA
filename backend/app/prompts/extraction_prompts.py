"""Extraction prompts for structured data and visualizations."""

from app.models.enums import SectionId

EXTRACTION_SYSTEM_PROMPT = """You are a data extraction specialist. Your job is to extract structured data from raw research text for visualization purposes.

## RULES

1. Extract data that is explicitly stated OR can be reasonably inferred from the text
2. Use null for values that cannot be determined - DO NOT make up numbers
3. Preserve numerical precision as stated in source
4. Return valid JSON matching the requested schema
5. If percentages are mentioned without exact numbers, estimate based on context
6. If you find partial data, include what you can find - partial data is better than no data
7. Look for data in various formats: tables, lists, prose, etc.

## CURRENCY HANDLING (CRITICAL)

STEP 1 - DETECT THE CURRENCY from the source text:
- Look for currency indicators: ₹, Rs, INR, Crores, Cr, Lakhs → Indian Rupees
- Look for currency indicators: $, USD, Millions, M, Billions, B → US Dollars
- Look for explicit statements like "CURRENCY: INR" or "in crores"

STEP 2 - PRESERVE THE ORIGINAL CURRENCY AND UNITS:
- If data is in Indian Rupees (₹, INR, Rs), keep it in INR with unit "crores" or "lakhs"
- If data is in US Dollars ($, USD), keep it in USD with unit "millions" or "billions"
- NEVER convert between currencies

STEP 3 - PARSE NUMBERS CORRECTLY:
- Remove commas: "9,738" → 9738
- "₹9,738 Crores" → value: 9738, currency: "INR", unit: "crores"
- "$115,532 M" → value: 115532, currency: "USD", unit: "millions"
- "Rs. 97,380 Cr" → value: 97380, currency: "INR", unit: "crores"
- "301,228 Mn" → value: 301228, unit: "millions"

CONVERSION REFERENCE (DO NOT CONVERT - just for understanding):
- 1 Crore INR = 10 Million INR = ~$120,000 USD (varies with exchange rate)
- 1 Lakh INR = 100,000 INR
- 1 Billion = 1000 Million

ALWAYS include the "currency" and "unit" fields to specify what the numbers represent:
- currency: "INR", "USD", "EUR", "GBP", etc.
- unit: "crores", "lakhs", "millions", "billions", "thousands"

Example: If source says "Revenue: ₹9,738 Crores"
- revenue: 9738
- currency: "INR"
- unit: "crores"

DO NOT convert 9,738 crores to billions or any other unit - keep it as 9738 with unit "crores"

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
    SectionId.LEADERSHIP_GOVERNANCE: """Extract ownership/shareholding data for visualizations.

From the text, extract shareholder categories and their ownership percentages (Founders/Promoters, Institutional Investors, Public/Retail, ESOP, etc.)

⚠️ IMPORTANT - LOOK FOR THESE PATTERNS:
- "Promoters: 52.71%" or "Promoter holding: 52.71%"
- "FII: 25.5%" or "Foreign Institutional Investors: 25.5%"
- "DII: 15.3%" or "Domestic Institutional Investors: 15.3%"
- "Public: 6.49%" or "Retail: 6.49%"
- Shareholding pattern tables with percentages

Return JSON in this format:
{
    "ownership_data": [
        {"name": "Promoters", "value": 52.71},
        {"name": "Foreign Institutional Investors (FII)", "value": 25.5},
        {"name": "Domestic Institutional Investors (DII)", "value": 15.3},
        {"name": "Public/Retail", "value": 6.49}
    ]
}

IMPORTANT:
- Ownership percentages should sum to approximately 100
- If exact percentages aren't given, estimate based on context (e.g., "majority stake" = ~51%)
- Include any ownership data you can find, even if incomplete
- For Indian companies, look for: Promoters, FII, DII, Public shareholding
- Parse percentages correctly: "52.71%" means value = 52.71
""",

    SectionId.BUSINESS_MODEL: """Extract revenue breakdown data for a bar chart visualization.

From the text, extract revenue streams/segments and their contributions.

⚠️ THIS IS CRITICAL FOR VISUALIZATION - You MUST extract segment-wise revenue data.

Look for patterns like:
- "India Mobile: 57% of revenue" or "Mobile Services contributed 57%"
- "Revenue from Africa: ₹40,500 Crores (27%)"
- "Segment-wise: Mobile 57%, Africa 27%, Enterprise 16%"
- Tables showing segment revenue breakdown

⚠️ NUMBER PARSING RULES:
- Look for revenue data in various formats: "₹301,228 Mn", "Rs. 301,228 million", "301228 crores", etc.
- Convert "Mn" or "million" to the actual number (e.g., ₹301,228 Mn = 301228)
- If data is in percentages only (e.g., "India Mobile: 57%"), use the percentage as the main value
- Extract BOTH absolute revenue numbers AND percentages if available
- If only percentages are available, that's still valuable - include them!

Return JSON in this format:
{
    "revenue_streams": [
        {"segment": "India Mobile Services", "revenue": 85500, "percentage": 57.0},
        {"segment": "Airtel Africa", "revenue": 40500, "percentage": 27.0},
        {"segment": "India Enterprise & Homes", "revenue": 24000, "percentage": 16.0}
    ],
    "total_revenue": 150000,
    "currency": "INR",
    "unit": "crores",
    "fiscal_year": "FY2024"
}

IMPORTANT:
- PRESERVE the original currency and units from the source data
- If data is in INR (₹, Rs), use currency: "INR"
- If numbers are in Crores (Cr), use unit: "crores"
- If numbers are in Millions (Mn, M), use unit: "millions"
- Parse numbers correctly: "₹85,500 Cr" means revenue = 85500, unit = "crores"
- Remove commas from numbers: "85,500" becomes 85500
- If only percentages are available, set revenue to 0 but INCLUDE the percentage
- Include any revenue breakdown you can find (by product, geography, customer segment, etc.)
- Even partial data is valuable - if you find 2 segments out of 4, include those 2

⚠️ FALLBACK: If you cannot find absolute revenue numbers but find percentages like:
"India Mobile: 57%, Africa: 27%, Enterprise: 16%"
Then return:
{
    "revenue_streams": [
        {"segment": "India Mobile", "revenue": 0, "percentage": 57.0},
        {"segment": "Africa", "revenue": 0, "percentage": 27.0},
        {"segment": "Enterprise", "revenue": 0, "percentage": 16.0}
    ],
    "total_revenue": 0,
    "currency": "INR",
    "unit": "crores"
}
""",

    SectionId.COMPETITIVE_LANDSCAPE: """Extract market share data for visualization.

From the text, extract competitor market share information for the TARGET COMPANY and its competitors.

⚠️ IMPORTANT FOR CONGLOMERATES:
If the company operates in multiple industries, extract market share for the PRIMARY/LARGEST business segment only.
Include a "market_segment" field to specify which market the data represents.

Return JSON in this format:
{
    "market_segment": "Oil & Gas" or "Telecom" or "Retail" etc.,
    "competitors": [
        {
            "company": "Target Company Name",
            "market_share": 25.0,
            "is_target": true
        },
        {
            "company": "Competitor A",
            "market_share": 20.0,
            "is_target": false
        },
        {
            "company": "Competitor B",
            "market_share": 15.0,
            "is_target": false
        },
        {
            "company": "Others",
            "market_share": 40.0,
            "is_target": false
        }
    ]
}

IMPORTANT:
- The TARGET COMPANY (the one being researched) MUST be included with "is_target": true
- Mark ONLY the target company with "is_target": true, all others should be false
- Market share should be a percentage (0-100)
- Market shares should sum to approximately 100%
- If exact market shares aren't available, estimate based on context
- Include an "Others" category if needed to make shares sum to 100%
- Only include companies that are ACTUAL COMPETITORS in the SAME market/industry
- For conglomerates, focus on the PRIMARY business segment
- Specify the market_segment so users know which market this represents
""",

    SectionId.FINANCIALS: """Extract financial data for a composed chart showing revenue, profit, and margins over time.

From the text, extract yearly financial metrics.

⚠️ CRITICAL - CURRENCY DETECTION AND HANDLING:
1. FIRST, identify the currency used in the source data:
   - Look for "₹", "Rs", "INR", "Crores", "Cr", "Lakhs" → Use currency: "INR", unit: "crores"
   - Look for "$", "USD", "Millions", "M" → Use currency: "USD", unit: "millions"
2. PRESERVE the original values - DO NOT convert between currencies
3. For Indian companies, data MUST be in INR Crores

⚠️ NUMBER PARSING RULES:
- Remove commas from numbers: "9,738" → 9738
- "₹9,738 Crores" → revenue: 9738, currency: "INR", unit: "crores"
- "$115,532 M" → revenue: 115532, currency: "USD", unit: "millions"
- "Rs. 97,380 Cr" → revenue: 97380, currency: "INR", unit: "crores"
- If data shows "Mn" or "Million", use unit: "millions"

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
    "currency": "INR",
    "unit": "crores"
}

IMPORTANT:
- For Indian companies: currency MUST be "INR" and unit MUST be "crores" (or "lakhs" if data is in lakhs)
- For US companies: currency should be "USD" and unit should be "millions" or "billions"
- DO NOT convert INR to USD or vice versa - keep the original values
- Margins should be percentages (0-100)
- Include as many years as available in the data (at least 3-5 years if possible)
- If some metrics are missing for a year, include what's available
- Calculate margins if you have the raw numbers but not the percentages
- Net profit can be negative (losses) - include negative values
- If you see "CURRENCY: INR" or "UNIT: Crores" in the text, use those values
""",
}


def get_extraction_prompt(section_id: SectionId, raw_data: str, company_name: str = None, region: str = None) -> str:
    """Generate extraction prompt for a specific section."""
    section_prompt = EXTRACTION_PROMPTS.get(section_id)
    
    if not section_prompt:
        return None  # No visualization for this section
    
    company_context = ""
    if company_name:
        company_context = f"""
⚠️ TARGET COMPANY: {company_name}
- ONLY extract data that is specifically about "{company_name}"
- IGNORE any data about other companies
- If the raw data mentions competitors, only include them in competitor-specific fields
- All financial data, ownership data, and metrics must be for "{company_name}" only
"""
    
    # Add region-specific currency guidance
    region_context = ""
    if region:
        if region.upper() == "INDIA":
            region_context = """
⚠️ REGION: INDIA
- This is an INDIAN company - use INR (Indian Rupees) as currency
- Use "crores" as the unit (1 Crore = 10 Million)
- Look for: ₹, Rs, INR, Crores, Cr, Lakhs
- DO NOT convert to USD - keep all values in INR Crores
"""
        elif region.upper() == "USA":
            region_context = """
⚠️ REGION: USA
- This is a US company - use USD as currency
- Use "millions" as the unit
- Look for: $, USD, M, Millions, B, Billions
"""
        elif region.upper() == "UK":
            region_context = """
⚠️ REGION: UK
- This is a UK company - use GBP as currency
- Use "millions" as the unit
- Look for: £, GBP, Millions
"""
    
    return f"""{section_prompt}
{company_context}
{region_context}
RAW DATA TO EXTRACT FROM:
{raw_data}

Return ONLY the JSON object, no other text.
"""
