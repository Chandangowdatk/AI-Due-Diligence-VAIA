'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CompanyReport, SECTIONS, SectionId } from '@/types';
import { VisualizationRenderer } from '@/components/visualizations';
import { formatDate } from '@/lib/utils';
import { FileSearch, CheckCircle, AlertTriangle, Calendar, Building2 } from 'lucide-react';

export default function PrintReportPage() {
  const params = useParams();
  const researchId = params.id as string;
  const [report, setReport] = useState<CompanyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await api.getFullReport(researchId);
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [researchId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error Loading Report</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white loading">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading report for PDF generation...</p>
        </div>
      </div>
    );
  }

  const completedSections = Object.values(report.sections).filter(
    s => s.status === 'complete' || s.status === 'incomplete'
  ).length;

  return (
    <div className="print-report bg-white min-h-screen">
      {/* Cover Page */}
      <div className="cover-page min-h-screen flex flex-col justify-center items-center p-12 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white print:p-8">
        <div className="text-center max-w-3xl">
          {/* Logo */}
          <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <FileSearch className="text-white" size={40} />
          </div>
          
          {/* Title */}
          <h1 className="text-5xl font-bold mb-4">{report.company_name}</h1>
          <div className="w-24 h-1 bg-primary-500 mx-auto mb-6" />
          <h2 className="text-2xl font-light text-navy-200 mb-12">Due Diligence Report</h2>
          
          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-8 max-w-md mx-auto text-left">
            <div className="flex items-center gap-3">
              <Calendar className="text-primary-400" size={20} />
              <div>
                <p className="text-xs text-navy-400 uppercase tracking-wider">Generated</p>
                <p className="text-sm font-medium">{formatDate(report.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-emerald-400" size={20} />
              <div>
                <p className="text-xs text-navy-400 uppercase tracking-wider">Sections</p>
                <p className="text-sm font-medium">{completedSections} of {SECTIONS.length} Complete</p>
              </div>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="mt-16 p-4 bg-navy-800/50 rounded-lg border border-navy-700">
            <p className="text-xs text-navy-300 leading-relaxed text-left">
              <strong className="text-navy-200">Confidential:</strong> This report is generated using AI-powered research 
              and should be used for informational purposes only. All data should be independently verified 
              before making investment decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="toc-page p-12 print:p-0 print:pt-4" style={{ pageBreakBefore: 'always' }}>
        <h2 className="text-3xl font-bold text-navy-900 mb-8 pb-4 border-b-2 border-primary-500">
          Table of Contents
        </h2>
        <nav className="space-y-3">
          {SECTIONS.map((section, index) => {
            const sectionData = report.sections[section.id];
            const isComplete = sectionData?.status === 'complete';
            const isIncomplete = sectionData?.status === 'incomplete';
            
            return (
              <div 
                key={section.id}
                className="flex items-center justify-between py-3 border-b border-navy-100 group"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center text-sm font-semibold text-navy-600">
                    {index + 1}
                  </span>
                  <span className="text-lg text-navy-800 font-medium">{section.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isComplete && <CheckCircle className="text-emerald-500" size={18} />}
                  {isIncomplete && <AlertTriangle className="text-amber-500" size={18} />}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Report Sections */}
      {SECTIONS.map((sectionConfig, index) => {
        const section = report.sections[sectionConfig.id];
        if (!section) return null;

        return (
          <section
            key={sectionConfig.id}
            id={`section-${sectionConfig.id}`}
            className="section-page p-12 print:p-0 print:pt-4"
            style={{ pageBreakBefore: 'always' }}
          >
            {/* Section Header */}
            <div className="section-header mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-xl font-bold text-primary-600 print:w-10 print:h-10">
                  {index + 1}
                </span>
                <div>
                  <h2 className="text-3xl font-bold text-navy-900 print:text-2xl">{section.section_name}</h2>
                  {section.status === 'incomplete' && (
                    <div className="flex items-center gap-2 mt-1 text-amber-600">
                      <AlertTriangle size={14} />
                      <span className="text-sm">Some data may be incomplete</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full h-1 bg-gradient-to-r from-primary-500 to-primary-300 rounded-full" />
            </div>

            {/* Visualization */}
            {sectionConfig.hasVisualization && section.visualization_data && (
              <div className="chart-container mb-8 p-6 bg-navy-50 rounded-xl border border-navy-100">
                <VisualizationRenderer
                  sectionId={sectionConfig.id}
                  data={section.visualization_data}
                />
              </div>
            )}

            {/* Content */}
            {section.formatted_content ? (
              <div
                className="prose-print text-left"
                style={{ textAlign: 'left' }}
                dangerouslySetInnerHTML={{ __html: formatContent(section.formatted_content) }}
              />
            ) : (
              <p className="text-navy-400 italic py-8 text-center">Content not available for this section.</p>
            )}

            {/* Data Gaps */}
            {section.data_gaps && section.data_gaps.length > 0 && (
              <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Data Gaps
                </h4>
                <ul className="text-sm text-amber-700 list-disc pl-5 space-y-1">
                  {section.data_gaps.map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sources */}
            {section.sources && section.sources.length > 0 && (
              <div className="sources-section mt-8 pt-6 border-t border-navy-200">
                <h4 className="text-sm font-semibold text-navy-600 mb-3 uppercase tracking-wider">
                  Sources ({section.sources.length})
                </h4>
                <div className="grid gap-2">
                  {section.sources.map((source, i) => (
                    <div key={i} className="text-xs text-navy-500 flex gap-2 text-left">
                      <span className="text-navy-400 font-mono flex-shrink-0">[{i + 1}]</span>
                      <span className="break-all">
                        {source.title !== 'Source' ? `${source.title} - ` : ''}{source.url}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}

      {/* Back Cover / Disclaimer */}
      <div className="back-cover p-12 print:p-0 print:pt-4 bg-navy-50 min-h-screen flex flex-col justify-center" style={{ pageBreakBefore: 'always' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-navy-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileSearch className="text-white" size={28} />
          </div>
          <h3 className="text-2xl font-bold text-navy-900 mb-4">DueDiligence</h3>
          <p className="text-navy-600 mb-8">AI-Powered Company Research Platform</p>
          
          <div className="bg-white p-6 rounded-xl border border-navy-200 text-left">
            <h4 className="font-semibold text-navy-800 mb-3">Important Disclaimer</h4>
            <p className="text-sm text-navy-600 leading-relaxed mb-4">
              This due diligence report has been generated using artificial intelligence and automated 
              data collection from publicly available sources. While we strive for accuracy, the 
              information contained herein should not be considered as financial, legal, or investment advice.
            </p>
            <p className="text-sm text-navy-600 leading-relaxed mb-4">
              Users are strongly encouraged to independently verify all information before making 
              any business or investment decisions. The accuracy, completeness, and timeliness of 
              the data cannot be guaranteed.
            </p>
            <p className="text-sm text-navy-600 leading-relaxed">
              This report is confidential and intended solely for the use of the individual or 
              entity to whom it is addressed.
            </p>
          </div>
          
          <p className="mt-8 text-xs text-navy-400">
            Report ID: {researchId}<br />
            Generated: {formatDate(report.created_at)}
          </p>
        </div>
      </div>
    </div>
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
