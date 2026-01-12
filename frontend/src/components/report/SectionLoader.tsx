'use client';

import { Loader2, Search, PenTool, Clock } from 'lucide-react';
import { SectionStatus } from '@/types';

interface SectionLoaderProps {
  status: SectionStatus;
  sectionName: string;
}

export function SectionLoader({ status, sectionName }: SectionLoaderProps) {
  const getConfig = () => {
    switch (status) {
      case 'researching':
        return {
          icon: Search,
          title: `Researching ${sectionName}`,
          subtitle: 'Searching multiple sources and analyzing data...',
          color: 'primary',
        };
      case 'writing':
        return {
          icon: PenTool,
          title: `Writing ${sectionName}`,
          subtitle: 'Formatting and structuring the content...',
          color: 'primary',
        };
      case 'pending':
        return {
          icon: Clock,
          title: `Waiting to process ${sectionName}`,
          subtitle: 'This section will be processed soon...',
          color: 'neutral',
        };
      default:
        return {
          icon: Loader2,
          title: 'Loading...',
          subtitle: 'Please wait...',
          color: 'neutral',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const isAnimated = status === 'researching' || status === 'writing';

  return (
    <div className="bg-white dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-white/10 shadow-sm dark:shadow-none overflow-hidden">
      <div className="flex flex-col items-center justify-center py-20 px-8">
        {/* Animated icon container */}
        <div className="relative mb-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
            config.color === 'primary' 
              ? 'bg-brand-primary/10' 
              : 'bg-neutral-100 dark:bg-white/5'
          }`}>
            <Icon 
              size={36} 
              className={`${
                config.color === 'primary' 
                  ? 'text-brand-primary' 
                  : 'text-neutral-400 dark:text-neutral-500'
              } ${isAnimated ? 'animate-pulse' : ''}`} 
            />
          </div>
          {isAnimated && (
            <>
              <div className="absolute inset-0 rounded-2xl bg-brand-primary/20 animate-ping" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
                <Loader2 size={14} className="text-white animate-spin" />
              </div>
            </>
          )}
        </div>

        {/* Text content */}
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{config.title}</h3>
        <p className="text-neutral-600 dark:text-neutral-200 text-center max-w-md">{config.subtitle}</p>

        {/* Progress dots */}
        {isAnimated && (
          <div className="flex items-center gap-2 mt-6">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-brand-primary/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-brand-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  );
}
