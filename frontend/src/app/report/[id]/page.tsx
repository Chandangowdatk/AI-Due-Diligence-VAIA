'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FileSearch, ArrowLeft } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={40} text="Loading report..." />
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{statusError}</p>
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to search
        </Link>
      </div>
    );
  }

  if (!status) return null;

  const isComplete = status.status === 'complete';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <FileSearch className="text-blue-600" size={24} />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {status.company_name}
              </h1>
              <p className="text-sm text-gray-500">Due Diligence Report</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ProgressBar
              value={status.sections_complete}
              max={status.total_sections}
              className="w-48"
            />
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
          {selectedSection ? (
            <SectionContent
              content={sectionContent}
              isLoading={contentLoading}
              error={contentError}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p>Select a section from the sidebar to view its content.</p>
              {status.current_section && (
                <p className="mt-2 text-sm">
                  Currently processing:{' '}
                  <span className="font-medium">
                    {SECTIONS.find((s) => s.id === status.current_section)?.name}
                  </span>
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
