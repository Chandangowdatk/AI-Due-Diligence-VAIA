'use client';

import { useState, useCallback } from 'react';
import { api, downloadBlob } from '@/lib/api';

interface UseExportResult {
  exportJson: () => Promise<void>;
  exportPdf: () => Promise<void>;
  isExporting: boolean;
  exportType: 'json' | 'pdf' | null;
  error: string | null;
}

export function useExport(researchId: string, companyName: string): UseExportResult {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'json' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sanitizedName = companyName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

  const exportJson = useCallback(async () => {
    try {
      setIsExporting(true);
      setExportType('json');
      setError(null);
      const blob = await api.exportJson(researchId);
      downloadBlob(blob, `${sanitizedName}_due_diligence.json`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  }, [researchId, sanitizedName]);

  const exportPdf = useCallback(async () => {
    try {
      setIsExporting(true);
      setExportType('pdf');
      setError(null);
      const blob = await api.exportPdf(researchId);
      downloadBlob(blob, `${sanitizedName}_due_diligence.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  }, [researchId, sanitizedName]);

  return { exportJson, exportPdf, isExporting, exportType, error };
}
