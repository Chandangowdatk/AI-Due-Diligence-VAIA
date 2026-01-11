// Section IDs matching backend
export type SectionId =
  | 'executive_summary'
  | 'company_overview'
  | 'leadership_governance'
  | 'business_model'
  | 'market_industry'
  | 'competitive_landscape'
  | 'financials'
  | 'operations'
  | 'risks_mitigants'
  | 'esg';

// Section status
export type SectionStatus =
  | 'pending'
  | 'researching'
  | 'writing'
  | 'complete'
  | 'incomplete'
  | 'timeout'
  | 'error';

// Report status
export type ReportStatus = 'pending' | 'in_progress' | 'complete' | 'failed';

// Source type
export type SourceType =
  | 'official_filing'
  | 'press_release'
  | 'news_article'
  | 'database'
  | 'social_media'
  | 'other';

// Source citation
export interface SourceCitation {
  url: string;
  title: string;
  snippet: string;
  source_type: SourceType;
  retrieved_at: string;
  verified: boolean;
}

// Section data
export interface SectionData {
  section_id: SectionId;
  section_name: string;
  status: SectionStatus;
  raw_data?: string;
  formatted_content?: string;
  structured_data?: Record<string, unknown>;
  sources: SourceCitation[];
  search_iterations: number;
  data_gaps: string[];
  visualization_data?: Record<string, unknown>;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
}

// Company metadata
export interface CompanyMetadata {
  name: string;
  legal_name?: string;
  description?: string;
  founded_year?: number;
  headquarters?: string;
  industry?: string;
  sub_industry?: string;
  employee_count?: number;
  website?: string;
  logo_url?: string;
  is_public: boolean;
  stock_ticker?: string;
  stock_exchange?: string;
}

// Full report
export interface CompanyReport {
  id: string;
  company_name: string;
  company_metadata?: CompanyMetadata;
  status: ReportStatus;
  sections: Record<SectionId, SectionData>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  total_tokens_used: number;
  total_search_queries: number;
  total_duration_seconds?: number;
}

// Section configuration
export interface SectionConfig {
  id: SectionId;
  name: string;
  description: string;
  hasVisualization: boolean;
}

// All sections in order
export const SECTIONS: SectionConfig[] = [
  { id: 'executive_summary', name: 'Executive Summary', description: 'High-level overview', hasVisualization: false },
  { id: 'company_overview', name: 'Company Overview', description: 'Background and history', hasVisualization: false },
  { id: 'leadership_governance', name: 'Leadership & Governance', description: 'Management and ownership', hasVisualization: true },
  { id: 'business_model', name: 'Business Model', description: 'Revenue and costs', hasVisualization: true },
  { id: 'market_industry', name: 'Market & Industry', description: 'Market analysis', hasVisualization: false },
  { id: 'competitive_landscape', name: 'Competitive Landscape', description: 'Competitors', hasVisualization: true },
  { id: 'financials', name: 'Financial Analysis', description: 'Financial performance', hasVisualization: true },
  { id: 'operations', name: 'Operations', description: 'Supply chain and tech', hasVisualization: false },
  { id: 'risks_mitigants', name: 'Risks & Mitigants', description: 'Risk assessment', hasVisualization: false },
  { id: 'esg', name: 'ESG Analysis', description: 'ESG factors', hasVisualization: false },
];
