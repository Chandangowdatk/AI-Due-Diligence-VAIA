'use client';

import { SectionContentResponse, SectionId, SECTIONS } from '@/types';
import { SourceCitations } from './SourceCitations';
import { SectionLoader } from './SectionLoader';
import { VisualizationRenderer } from '@/components/visualizations';
import { AlertCircle, AlertTriangle, FileText } from 'lucide-react';

interface SectionContentProps {
  content: SectionContentResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function SectionContent({ content, isLoading, error }: SectionContentProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white dark:bg-neutral-900/50 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm p-8">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
          <AlertCircle className="text-red-500" size={32} />
        </div>
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  if (isLoading || !content) {
    return <SectionLoader status="pending" sectionName="section" />;
  }

  if (content.status === 'researching' || content.status === 'writing') {
    return <SectionLoader status={content.status} sectionName={content.section_name} />;
  }

  const sectionConfig = SECTIONS.find((s) => s.id === content.section_id);

  return (
    <article className="bg-white dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-white/10 shadow-sm dark:shadow-none overflow-hidden">
      {/* Section Header */}
      <header className="px-8 py-6 border-b border-neutral-200 dark:border-white/10 bg-gradient-to-r from-neutral-50 dark:from-neutral-900/50 to-white dark:to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
            <FileText className="text-brand-primary" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{content.section_name}</h1>
        </div>
        
        {content.status === 'incomplete' && (
          <div className="mt-4 flex items-center gap-2 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-800/30">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              Some information may be incomplete due to limited data availability.
            </span>
          </div>
        )}
        {content.status === 'error' && (
          <div className="mt-4 flex items-center gap-2 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800/30">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">
              An error occurred while generating this section.
            </span>
          </div>
        )}
      </header>

      <div className="p-8">
        {/* Visualization if available */}
        {sectionConfig?.hasVisualization && (
          <div className="mb-8 p-6 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/5">
            <VisualizationRenderer
              sectionId={content.section_id}
              data={content.visualization_data || {}}
            />
          </div>
        )}

        {/* Main content */}
        {content.formatted_content ? (
          <div
            className="prose prose-navy max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(content.formatted_content) }}
          />
        ) : (
          <p className="text-neutral-400 dark:text-neutral-500 italic">No content available yet.</p>
        )}

        {/* Data gaps warning */}
        {content.data_gaps.length > 0 && (
          <div className="mt-8 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl">
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} />
              Data Gaps
            </h3>
            <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc pl-5 space-y-1">
              {content.data_gaps.map((gap, index) => (
                <li key={index}>{gap}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources */}
        <SourceCitations sources={content.sources} />
      </div>
    </article>
  );
}

function formatContent(content: string): string {
  return content
    .replace(/^#### (.*$)/gim, '<h4 class="text-base font-semibold mt-5 mb-2 text-neutral-800 dark:text-white">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3 text-neutral-800 dark:text-white">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-neutral-900 dark:text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-neutral-600 dark:text-neutral-300">$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 text-neutral-600 dark:text-neutral-300 mb-1">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4 text-neutral-600 dark:text-neutral-300 leading-relaxed">')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<')) return match;
      return `<p class="mb-4 text-neutral-600 dark:text-neutral-300 leading-relaxed">${match}</p>`;
    });
}
