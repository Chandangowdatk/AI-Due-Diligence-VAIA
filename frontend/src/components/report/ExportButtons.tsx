'use client';

import { Download, FileJson, FileText, Loader2, Share2 } from 'lucide-react';
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
    <div className="flex items-center gap-3">
      <button
        onClick={exportJson}
        disabled={disabled || isExporting}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 group',
          disabled || isExporting
            ? 'bg-neutral-100 dark:bg-white/5 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
            : 'bg-white/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10 hover:border-neutral-300 dark:hover:border-white/20'
        )}
      >
        {isExporting && exportType === 'json' ? (
          <Loader2 size={16} className="animate-spin text-neutral-500" />
        ) : (
          <Download className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white" />
        )}
        <span className="hidden sm:inline font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">
          Export
        </span>
      </button>
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
          <Share2 className="w-4 h-4" />
        )}
        <span className="hidden sm:inline font-medium">Share</span>
      </button>
      {error && (
        <span className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">{error}</span>
      )}
    </div>
  );
}
