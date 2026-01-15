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
  // Normalize line endings and clean up extra whitespace
  let formatted = content.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  
  // Convert * bullets to - bullets for consistency
  // Handle both "* text" and "* **bold**" patterns
  formatted = formatted.replace(/^\* /gm, '- ');
  formatted = formatted.replace(/^\*\s+/gm, '- ');
  
  // Process inline formatting first (before splitting into lines)
  // Bold - must come before italic to handle **text** vs *text*
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic - single asterisks not adjacent to other asterisks (be careful not to match bullet remnants)
  formatted = formatted.replace(/(?<![*\-])\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  // Inline code
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Handle numbered lists (1. 2. 3. etc)
  formatted = formatted.replace(/^(\d+)\. /gm, '{{NUM_LIST}}$1. ');
  
  // Split into lines for block-level processing
  const lines = formatted.split('\n');
  const processedLines: string[] = [];
  let inBulletList = false;
  let inNumberedList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines but close any open lists
    if (!line) {
      if (inBulletList) {
        processedLines.push('</ul>');
        inBulletList = false;
      }
      if (inNumberedList) {
        processedLines.push('</ol>');
        inNumberedList = false;
      }
      continue;
    }
    
    // Headers
    if (line.startsWith('#### ')) {
      if (inBulletList) { processedLines.push('</ul>'); inBulletList = false; }
      if (inNumberedList) { processedLines.push('</ol>'); inNumberedList = false; }
      processedLines.push(`<h4>${line.substring(5)}</h4>`);
      continue;
    }
    if (line.startsWith('### ')) {
      if (inBulletList) { processedLines.push('</ul>'); inBulletList = false; }
      if (inNumberedList) { processedLines.push('</ol>'); inNumberedList = false; }
      processedLines.push(`<h3>${line.substring(4)}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inBulletList) { processedLines.push('</ul>'); inBulletList = false; }
      if (inNumberedList) { processedLines.push('</ol>'); inNumberedList = false; }
      processedLines.push(`<h2>${line.substring(3)}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      if (inBulletList) { processedLines.push('</ul>'); inBulletList = false; }
      if (inNumberedList) { processedLines.push('</ol>'); inNumberedList = false; }
      processedLines.push(`<h1>${line.substring(2)}</h1>`);
      continue;
    }
    
    // Bullet points (- at start of line)
    if (line.startsWith('- ')) {
      if (inNumberedList) { processedLines.push('</ol>'); inNumberedList = false; }
      if (!inBulletList) {
        processedLines.push('<ul>');
        inBulletList = true;
      }
      processedLines.push(`<li>${line.substring(2)}</li>`);
      continue;
    }
    
    // Numbered lists
    if (line.startsWith('{{NUM_LIST}}')) {
      if (inBulletList) { processedLines.push('</ul>'); inBulletList = false; }
      if (!inNumberedList) {
        processedLines.push('<ol>');
        inNumberedList = true;
      }
      const listContent = line.replace(/^\{\{NUM_LIST\}\}\d+\.\s*/, '');
      processedLines.push(`<li>${listContent}</li>`);
      continue;
    }
    
    // Regular paragraphs - close any open lists first
    if (inBulletList) { processedLines.push('</ul>'); inBulletList = false; }
    if (inNumberedList) { processedLines.push('</ol>'); inNumberedList = false; }
    
    // Check if it's already an HTML tag
    if (line.startsWith('<')) {
      processedLines.push(line);
    } else {
      processedLines.push(`<p>${line}</p>`);
    }
  }
  
  // Close any remaining open lists
  if (inBulletList) processedLines.push('</ul>');
  if (inNumberedList) processedLines.push('</ol>');
  
  return processedLines.join('\n');
}
