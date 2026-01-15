import {
  ResearchRequest,
  ResearchInitResponse,
  ResearchStatusResponse,
  SectionContentResponse,
  ApiError,
} from '@/types';
import { CompanyReport, SectionId } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// File upload response type
export interface FileUploadResponse {
  success: boolean;
  filename: string;
  gemini_file_name: string | null;
  error: string | null;
}

// Uploaded file reference for research request
export interface UploadedFileReference {
  filename: string;
  gemini_file_name: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.detail);
    }

    return response.json();
  }

  // Upload a single file to Gemini
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}/api/files/upload`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return {
        success: false,
        filename: file.name,
        gemini_file_name: null,
        error: `Upload failed: ${response.statusText}`,
      };
    }

    return response.json();
  }

  // Start new research (with optional uploaded files)
  async startResearch(
    companyName: string,
    uploadedFiles?: UploadedFileReference[]
  ): Promise<ResearchInitResponse> {
    const request: ResearchRequest & { uploaded_files?: UploadedFileReference[] } = {
      company_name: companyName,
    };
    
    if (uploadedFiles && uploadedFiles.length > 0) {
      request.uploaded_files = uploadedFiles;
    }

    return this.request<ResearchInitResponse>('/api/research', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Poll research status
  async getResearchStatus(researchId: string): Promise<ResearchStatusResponse> {
    return this.request<ResearchStatusResponse>(
      `/api/research/${researchId}/status`
    );
  }

  // Get section content
  async getSectionContent(
    researchId: string,
    sectionId: SectionId
  ): Promise<SectionContentResponse> {
    return this.request<SectionContentResponse>(
      `/api/research/${researchId}/section/${sectionId}`
    );
  }

  // Get full report
  async getFullReport(researchId: string): Promise<CompanyReport> {
    return this.request<CompanyReport>(`/api/research/${researchId}/report`);
  }

  // Export as JSON (returns blob)
  async exportJson(researchId: string): Promise<Blob> {
    const url = `${this.baseUrl}/api/research/${researchId}/export/json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to export JSON');
    }
    return response.blob();
  }

  // Export as PDF (returns blob)
  async exportPdf(researchId: string): Promise<Blob> {
    const url = `${this.baseUrl}/api/research/${researchId}/export/pdf`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to export PDF');
    }
    return response.blob();
  }
}

// Singleton instance
export const api = new ApiClient(API_BASE);

// Download helper
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
