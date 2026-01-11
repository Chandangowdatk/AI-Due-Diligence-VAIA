// API request/response types

import { SectionId, SectionStatus, ReportStatus, SourceCitation, CompanyReport } from './report';

// Request to start research
export interface ResearchRequest {
  company_name: string;
  sections?: SectionId[];
}

// Response from POST /api/research
export interface ResearchInitResponse {
  research_id: string;
  company_name: string;
  status: ReportStatus;
  created_at: string;
}

// Section status info (from polling)
export interface SectionStatusInfo {
  section_id: SectionId;
  section_name: string;
  status: SectionStatus;
  started_at?: string;
  completed_at?: string;
}

// Response from GET /api/research/{id}/status
export interface ResearchStatusResponse {
  research_id: string;
  company_name: string;
  status: ReportStatus;
  sections: SectionStatusInfo[];
  sections_complete: number;
  total_sections: number;
  current_section?: SectionId;
  created_at: string;
  updated_at: string;
}

// Response from GET /api/research/{id}/section/{section_id}
export interface SectionContentResponse {
  section_id: SectionId;
  section_name: string;
  status: SectionStatus;
  formatted_content?: string;
  structured_data?: Record<string, unknown>;
  visualization_data?: Record<string, unknown>;
  sources: SourceCitation[];
  data_gaps: string[];
}

// API error response
export interface ApiError {
  detail: string;
}
