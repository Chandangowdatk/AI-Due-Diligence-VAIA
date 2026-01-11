'use client';

import { SectionContentResponse, SectionId, SECTIONS } from '@/types';
import { SourceCitations } from './SourceCitations';
import { SectionLoader } from './SectionLoader';
import { VisualizationRenderer } from '@/components/visualizations';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface SectionContentProps {
  content: SectionContentResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function SectionContent({ content, isLoading, error }: SectionContentProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-red-600">
        <AlertCircle size={40} />
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading || !content) {
    return <SectionLoader status="pending" sectionName="section" />;
  }

  // Show loader for in-progress sections
  if (content.status === 'researching' || content.status === 'writing') {
    return <SectionLoader status={content.status} sectionName={content.section_name} />;
  }

  // Get section config for visualization info
  const sectionConfig = SECTIONS.find((s) => s.id === content.section_id);

  return (
    <article className="max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{content.section_name}</h1>
        {content.status === 'incomplete' && (
          <div className="mt-2 flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-2 rounded-md">
            <AlertTriangle size={18} />
            <span className="text-sm">
              Some information may be incomplete due to limited data availability.
            </span>
          </div>
        )}
        {content.status === 'error' && (
          <div className="mt-2 flex items-center gap-2 text-red-700 bg-red-50 px-3 py-2 rounded-md">
            <AlertCircle size={18} />
            <span className="text-sm">
              An error occurred while generating this section.
            </span>
          </div>
        )}
      </header>

      {/* Visualization if available */}
      {sectionConfig?.hasVisualization && (
        <div className="mb-8">
          <VisualizationRenderer
            sectionId={content.section_id}
            data={content.visualization_data || {}}
          />
        </div>
      )}

      {/* Main content */}
      {content.formatted_content ? (
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: formatContent(content.formatted_content) }}
        />
      ) : (
        <p className="text-gray-500 italic">No content available yet.</p>
      )}

      {/* Data gaps warning */}
      {content.data_gaps.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Data Gaps</h3>
          <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
            {content.data_gaps.map((gap, index) => (
              <li key={index}>{gap}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      <SourceCitations sources={content.sources} />
    </article>
  );
}

// Simple markdown-like formatting
function formatContent(content: string): string {
  return content
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-2 text-gray-900">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-8 mb-3 text-gray-900">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 text-gray-800">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4 text-gray-800">')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<')) return match;
      return `<p class="mb-4 text-gray-800">${match}</p>`;
    });
}
