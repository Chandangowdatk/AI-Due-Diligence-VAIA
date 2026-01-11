// Visualization data types for Recharts

// Ownership pie chart (Leadership & Governance)
export interface OwnershipDataPoint {
  name: string;
  value: number;
  type: 'founder' | 'investor' | 'public' | 'employee' | 'other';
}

// Funding history line chart (Leadership & Governance)
export interface FundingDataPoint {
  date: string;
  round: string;
  amount: number;
  valuation?: number;
  investors?: string[];
}

// Revenue breakdown bar chart (Business Model)
export interface RevenueDataPoint {
  segment: string;
  revenue: number;
  percentage: number;
}

// Competitor funding comparison (Competitive Landscape)
export interface CompetitorFundingDataPoint {
  name: string;
  funding: number;
  valuation?: number;
}

// Market share pie chart (Competitive Landscape)
export interface MarketShareDataPoint {
  company: string;
  share: number;
  isTarget?: boolean;
}

// Financial metrics composed chart (Financials)
export interface FinancialDataPoint {
  period: string;
  revenue: number;
  profit?: number;
  margin?: number;
  growth?: number;
}

// Generic chart data wrapper
export interface ChartData<T> {
  data: T[];
  title?: string;
  subtitle?: string;
}
