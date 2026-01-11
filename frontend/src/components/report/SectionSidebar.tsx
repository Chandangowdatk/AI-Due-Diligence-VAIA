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
    <nav className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Report Sections
        </h2>
        <ul className="space-y-1">
          {SECTIONS.map((section) => {
            const status = statusMap.get(section.id);
            const isSelected = selectedSection === section.id;
            const isClickable = status?.status !== 'pending';

            return (
              <li key={section.id}>
                <button
                  onClick={() => isClickable && onSelectSection(section.id)}
                  disabled={!isClickable}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors',
                    isSelected
                      ? 'bg-blue-100 text-blue-800'
                      : isClickable
                      ? 'hover:bg-gray-100 text-gray-700'
                      : 'text-gray-400 cursor-not-allowed'
                  )}
                >
                  <StatusIcon status={status?.status || 'pending'} size={18} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{section.name}</div>
                    {status?.status === 'researching' && (
                      <div className="text-xs text-blue-600">Researching...</div>
                    )}
                    {status?.status === 'writing' && (
                      <div className="text-xs text-blue-600">Writing...</div>
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
