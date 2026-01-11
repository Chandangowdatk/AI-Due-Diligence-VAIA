'use client';

import { Download, FileJson, FileText, Loader2 } from 'lucide-react';
import { useExport } from '@/hooks';
import { cn } from '@/lib/utils';

interface ExportButtonsProps {
  researchId: string;
  companyName: string;
  disabled?: boolean;
}

export function ExportButtons({ researchId, companyName, disabled }: ExportButtonsProps) {
  const { exportJson, exportPdf, isExporting, exportType, error } = useExport(
    researchId,
    companyName
  );

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportJson}
        disabled={disabled || isExporting}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md transition-colors',
          disabled || isExporting
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white hover:bg-gray-50 text-gray-700'
        )}
      >
        {isExporting && exportType === 'json' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileJson size={16} />
        )}
        JSON
      </button>
      <button
        onClick={exportPdf}
        disabled={disabled || isExporting}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md transition-colors',
          disabled || isExporting
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white hover:bg-gray-50 text-gray-700'
        )}
      >
        {isExporting && exportType === 'pdf' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileText size={16} />
        )}
        PDF
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
