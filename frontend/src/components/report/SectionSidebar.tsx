'use client';

import { SectionStatusInfo, SectionId, SECTIONS } from '@/types';
import { StatusIcon } from '@/components/ui';
import { cn } from '@/lib/utils';

interface SectionSidebarProps {
  sections: SectionStatusInfo[];
  selectedSection: SectionId | null;
  onSelectSection: (sectionId: SectionId) => void;
}

export function SectionSidebar({
  sections,
  selectedSection,
  onSelectSection,
}: SectionSidebarProps) {
  // Create a map for quick lookup
  const statusMap = new Map(sections.map((s) => [s.section_id, s]));

  return (
    <nav className="w-72 bg-white border-r border-navy-100 h-[calc(100vh-73px)] overflow-y-auto sticky top-[73px]">
      <div className="p-6">
        <h2 className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-4">
          Report Sections
        </h2>
        <ul className="space-y-1">
          {SECTIONS.map((section) => {
            const status = statusMap.get(section.id);
            const isSelected = selectedSection === section.id;
            const isClickable = status?.status !== 'pending';
            const isProcessing = status?.status === 'researching' || status?.status === 'writing';

            return (
              <li key={section.id}>
                <button
                  onClick={() => isClickable && onSelectSection(section.id)}
                  disabled={!isClickable}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200',
                    isSelected
                      ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                      : isClickable
                      ? 'hover:bg-navy-50 text-navy-700 border border-transparent'
                      : 'text-navy-300 cursor-not-allowed border border-transparent',
                    isProcessing && !isSelected && 'bg-blue-50 border-blue-100'
                  )}
                >
                  <StatusIcon status={status?.status || 'pending'} size={20} />
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'text-sm font-medium truncate',
                      isSelected ? 'text-primary-700' : isClickable ? 'text-navy-800' : 'text-navy-400'
                    )}>
                      {section.name}
                    </div>
                    {status?.status === 'researching' && (
                      <div className="text-xs text-blue-500 font-medium mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        Researching...
                      </div>
                    )}
                    {status?.status === 'writing' && (
                      <div className="text-xs text-blue-500 font-medium mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        Writing...
                      </div>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
