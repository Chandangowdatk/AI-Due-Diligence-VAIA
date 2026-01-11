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
          'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
          disabled || isExporting
            ? 'bg-navy-100 text-navy-400 cursor-not-allowed'
            : 'bg-white border border-navy-200 text-navy-700 hover:bg-navy-50 hover:border-navy-300 shadow-sm'
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
          'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
          disabled || isExporting
            ? 'bg-navy-100 text-navy-400 cursor-not-allowed'
            : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md'
        )}
      >
        {isExporting && exportType === 'pdf' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileText size={16} />
        )}
        PDF
      </button>
      {error && (
        <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg">{error}</span>
      )}
    </div>
  );
}
