'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FileSearch, 
  FileText, 
  Activity, 
  BarChart2, 
  PieChart, 
  Users,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useResearchStatus, useSectionContent } from '@/hooks';
import { SectionContent, ExportButtons } from '@/components/report';
import { BackgroundOrbs } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { Navbar } from '@/components/layout';
import { SectionId, SECTIONS, SectionStatus, SectionStatusInfo } from '@/types';

const sectionIcons: Record<string, React.ReactNode> = {
  executive_summary: <FileText className="w-4 h-4" />,
  company_overview: <Activity className="w-4 h-4" />,
  leadership_governance: <Users className="w-4 h-4" />,
  business_model: <BarChart2 className="w-4 h-4" />,
  financials: <BarChart2 className="w-4 h-4" />,
  competitive_landscape: <PieChart className="w-4 h-4" />,
  market_analysis: <PieChart className="w-4 h-4" />,
  risk_assessment: <Activity className="w-4 h-4" />,
  recent_developments: <FileText className="w-4 h-4" />,
  investment_thesis: <FileText className="w-4 h-4" />,
};

function SectionStatusIndicator({ status }: { status: SectionStatus }) {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="w-4 h-4 text-brand-secondary" />;
    case 'incomplete':
      return <CheckCircle2 className="w-4 h-4 text-yellow-500" />;
    case 'researching':
    case 'writing':
      return <Loader2 className="w-4 h-4 text-brand-orange animate-spin" />;
    default:
      return <div className="w-4 h-4 rounded-full border-2 border-neutral-300 dark:border-neutral-600" />;
  }
}

export default function ReportPage() {
  const params = useParams();
  const researchId = params.id as string;
  const { isDark, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { status, isLoading: statusLoading, error: statusError } = useResearchStatus(researchId);
  const [selectedSection, setSelectedSection] = useState<SectionId | null>(null);

  const {
    content: sectionContent,
    isLoading: contentLoading,
    error: contentError,
    refetch: refetchContent,
  } = useSectionContent(researchId, selectedSection);

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
      <div className="min-h-screen relative font-sans text-neutral-900 dark:text-white">
        <BackgroundOrbs isDark={isDark} />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 className="text-brand-primary animate-spin" size={32} />
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="min-h-screen relative font-sans text-neutral-900 dark:text-white">
        <BackgroundOrbs isDark={isDark} />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-6">
          <div className="glass-panel rounded-2xl p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileSearch className="text-red-500" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Error Loading Report</h2>
            <p className="text-red-500 mb-6">{statusError}</p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!status) return null;

  const isComplete = status.status === 'complete';
  const progressPercentage = Math.round((status.sections_complete / status.total_sections) * 100);

  return (
    <div className="min-h-screen relative font-sans text-neutral-900 dark:text-white">
      <BackgroundOrbs isDark={isDark} />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar isDark={isDark} toggleTheme={toggleTheme} showNav={false} />

        <div className="flex-1 pt-4 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-8 w-full">
          <Sidebar 
            status={status}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            isComplete={isComplete}
            progressPercentage={progressPercentage}
          />

          <main className="flex-grow space-y-6 min-w-0">
            <Header status={status} researchId={researchId} isComplete={isComplete} />

            <div className="glass-panel rounded-3xl p-8 md:p-12 min-h-[600px] border border-neutral-200 dark:border-white/10 relative">
              {selectedSection ? (
                <SectionContent
                  content={sectionContent}
                  isLoading={contentLoading}
                  error={contentError}
                />
              ) : (
                <EmptyState currentSection={status.current_section} />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


interface SidebarProps {
  status: any;
  selectedSection: SectionId | null;
  setSelectedSection: (id: SectionId) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isComplete: boolean;
  progressPercentage: number;
}

function Sidebar({ status, selectedSection, setSelectedSection, isSidebarOpen, setIsSidebarOpen, isComplete, progressPercentage }: SidebarProps) {
  return (
    <aside className={`w-full flex-shrink-0 transition-all duration-500 ease-in-out ${
      isSidebarOpen ? 'md:w-80' : 'md:w-24'
    }`}>
      <div className={`glass-panel rounded-3xl sticky top-28 min-h-[calc(100vh-10rem)] flex flex-col border border-neutral-200 dark:border-white/10 transition-all duration-500 ${
        isSidebarOpen ? 'p-6' : 'p-4 items-center'
      }`}>
        <div className={`flex items-center w-full mb-8 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {isSidebarOpen && (
            <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
              Report Sections
            </h3>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-2 w-full">
          {status.sections.map((section: SectionStatusInfo) => {
            const isSelected = selectedSection === section.section_id;
            const isClickable = section.status === 'complete' || section.status === 'incomplete';
            const sectionInfo = SECTIONS.find(s => s.id === section.section_id);
            
            return (
              <button
                key={section.section_id}
                onClick={() => isClickable && setSelectedSection(section.section_id)}
                disabled={!isClickable}
                className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                  isSidebarOpen ? 'px-4 py-3' : 'p-3 justify-center aspect-square'
                } ${
                  isSelected 
                    ? 'text-brand-primary bg-brand-primary/10 border border-brand-primary/20 dark:text-white dark:bg-white/10 dark:border-white/20 shadow-sm scale-[1.02]' 
                    : isClickable
                      ? 'text-neutral-600 dark:text-neutral-300 border border-transparent hover:text-neutral-900 dark:hover:text-white hover:scale-[1.02] hover:bg-neutral-100 dark:hover:bg-white/10'
                      : 'text-neutral-600 dark:text-neutral-300 border border-transparent cursor-not-allowed'
                }`}
              >
                {isSelected && (
                  <div className={`absolute left-0 top-0 bottom-0 bg-brand-primary rounded-l-xl transition-all duration-300 ${
                    isSidebarOpen ? 'w-1' : 'w-full opacity-10'
                  }`} />
                )}
                
                <span className={`relative z-10 ${isSelected ? 'text-brand-primary' : 'group-hover:text-brand-primary dark:group-hover:text-white transition-colors duration-300'}`}>
                  {sectionIcons[section.section_id] || <FileText className="w-4 h-4" />}
                </span>
                
                {isSidebarOpen && (
                  <>
                    <span className="whitespace-nowrap relative z-10 flex-1 text-left">
                      {sectionInfo?.name || section.section_id}
                    </span>
                    <SectionStatusIndicator status={section.status} />
                  </>
                )}
                
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-neutral-900 text-white dark:bg-neutral-800 border border-white/10 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {sectionInfo?.name || section.section_id}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto w-full pt-4">
          {isSidebarOpen ? (
            <div className="bg-white dark:bg-neutral-900/50 rounded-2xl p-5 border border-neutral-200 dark:border-white/10 relative overflow-hidden shadow-sm dark:shadow-none">
              <div className="absolute inset-0 bg-brand-primary/5" />
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isComplete ? 'bg-brand-secondary/20 text-brand-secondary' : 'bg-brand-orange/20 text-brand-orange'
                }`}>
                  {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                </div>
                <div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Analysis Status</div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">
                    {isComplete ? 'Complete' : 'In Progress'}
                  </div>
                </div>
              </div>
              <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full mt-2 overflow-hidden relative z-10">
                <div 
                  className="h-full bg-gradient-to-r from-brand-secondary to-brand-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-xs text-right text-brand-secondary mt-1 relative z-10">{progressPercentage}%</div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border relative group cursor-help ${
                isComplete ? 'bg-brand-secondary/20 text-brand-secondary border-brand-secondary/20' : 'bg-brand-orange/20 text-brand-orange border-brand-orange/20'
              }`}>
                {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                <div className="absolute left-full ml-4 px-2 py-1 bg-neutral-900 text-white text-xs rounded border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                  {isComplete ? 'Analysis Complete' : `${progressPercentage}% Complete`}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function Header({ status, researchId, isComplete }: { status: any; researchId: string; isComplete: boolean }) {
  return (
    <header className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-neutral-200 dark:border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-2">
          <Link href="/" className="hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-brand-secondary font-medium">{status.company_name}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
          {status.company_name}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isComplete ? 'bg-green-500' : 'bg-brand-orange animate-pulse'}`} />
          {isComplete ? 'Report Complete' : 'Generating Report...'}
        </p>
      </div>
      <div className="flex gap-3 relative z-10">
        <ExportButtons
          researchId={researchId}
          companyName={status.company_name}
          disabled={!isComplete}
        />
      </div>
    </header>
  );
}

function EmptyState({ currentSection }: { currentSection?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-neutral-500 dark:text-neutral-400">
      <div className="w-16 h-16 bg-neutral-100 dark:bg-white/10 rounded-2xl flex items-center justify-center mb-4">
        <FileSearch className="text-neutral-400 dark:text-neutral-500" size={32} />
      </div>
      <p className="font-medium">Select a section from the sidebar to view its content.</p>
      {currentSection && (
        <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-500">
          Currently processing:{' '}
          <span className="font-medium text-brand-primary">
            {SECTIONS.find((s) => s.id === currentSection)?.name}
          </span>
        </p>
      )}
    </div>
  );
}
