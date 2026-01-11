'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FileSearch, ArrowLeft, Sparkles } from 'lucide-react';
import { useResearchStatus, useSectionContent } from '@/hooks';
import { SectionSidebar, SectionContent, ExportButtons } from '@/components/report';
import { ProgressBar, LoadingSpinner } from '@/components/ui';
import { SectionId, SECTIONS } from '@/types';

export default function ReportPage() {
  const params = useParams();
  const researchId = params.id as string;

  const { status, isLoading: statusLoading, error: statusError } = useResearchStatus(researchId);
  const [selectedSection, setSelectedSection] = useState<SectionId | null>(null);

  const {
    content: sectionContent,
    isLoading: contentLoading,
    error: contentError,
    refetch: refetchContent,
  } = useSectionContent(researchId, selectedSection);

  // Auto-select first completed section
  useEffect(() => {
    if (status && !selectedSection) {
      const firstComplete = status.sections.find(
        (s) => s.status === 'complete' || s.status === 'incomplete'
      );
      if (firstComplete) {
        setSelectedSection(firstComplete.section_id);
      }
    }
  }, [status, selectedSection]);

  // Refetch content when section status changes to complete
  useEffect(() => {
    if (status && selectedSection) {
      const section = status.sections.find((s) => s.section_id === selectedSection);
      if (section?.status === 'complete' || section?.status === 'incomplete') {
        refetchContent();
      }
    }
  }, [status, selectedSection, refetchContent]);

  if (statusLoading && !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-primary-500 animate-pulse" size={32} />
          </div>
          <LoadingSpinner size={40} text="Loading report..." />
        </div>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-navy-50">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-100 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileSearch className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-navy-900 mb-2">Error Loading Report</h2>
          <p className="text-red-600 mb-6">{statusError}</p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  if (!status) return null;

  const isComplete = status.status === 'complete';
  const progressPercentage = Math.round((status.sections_complete / status.total_sections) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-navy-50">
      {/* Header */}
      <header className="bg-white border-b border-navy-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 text-navy-500 hover:text-navy-900 transition-colors group"
            >
              <div className="w-10 h-10 bg-navy-100 rounded-xl flex items-center justify-center group-hover:bg-navy-200 transition-colors">
                <ArrowLeft size={20} />
              </div>
            </Link>
            <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center">
              <FileSearch className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">
                {status.company_name}
              </h1>
              <p className="text-sm text-navy-500">Due Diligence Report</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-sm font-medium text-navy-900">
                  {status.sections_complete} of {status.total_sections} sections
                </span>
                <span className="text-primary-500 font-semibold ml-2">{progressPercentage}%</span>
              </div>
              <div className="w-32 h-2 bg-navy-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            
            <ExportButtons
              researchId={researchId}
              companyName={status.company_name}
              disabled={!isComplete}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <SectionSidebar
          sections={status.sections}
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
        />

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {selectedSection ? (
              <SectionContent
                content={sectionContent}
                isLoading={contentLoading}
                error={contentError}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-navy-500 bg-white rounded-2xl border border-navy-100 shadow-sm">
                <div className="w-16 h-16 bg-navy-100 rounded-2xl flex items-center justify-center mb-4">
                  <FileSearch className="text-navy-400" size={32} />
                </div>
                <p className="font-medium">Select a section from the sidebar to view its content.</p>
                {status.current_section && (
                  <p className="mt-2 text-sm text-navy-400">
                    Currently processing:{' '}
                    <span className="font-medium text-primary-500">
                      {SECTIONS.find((s) => s.id === status.current_section)?.name}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
