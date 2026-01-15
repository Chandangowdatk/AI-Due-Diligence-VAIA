'use client';

import { Download, Loader2 } from 'lucide-react';
import { useExport } from '@/hooks';
import { cn } from '@/lib/utils';

interface ExportButtonsProps {
  researchId: string;
  companyName: string;
  disabled?: boolean;
}

export function ExportButtons({ researchId, companyName, disabled }: ExportButtonsProps) {
  const { exportPdf, isExporting, exportType, error } = useExport(
    researchId,
    companyName
  );

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={exportPdf}
        disabled={disabled || isExporting}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300',
          disabled || isExporting
            ? 'bg-neutral-100 dark:bg-white/5 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
            : 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 hover:shadow-brand-primary/40'
        )}
      >
        {isExporting && exportType === 'pdf' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="font-medium">Export PDF</span>
      </button>
      {error && (
        <span className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">{error}</span>
      )}
    </div>
  );
}
