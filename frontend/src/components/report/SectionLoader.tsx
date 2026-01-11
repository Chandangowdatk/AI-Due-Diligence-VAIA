'use client';

import { Loader2 } from 'lucide-react';
import { SectionStatus } from '@/types';

interface SectionLoaderProps {
  status: SectionStatus;
  sectionName: string;
}

export function SectionLoader({ status, sectionName }: SectionLoaderProps) {
  const getMessage = () => {
    switch (status) {
      case 'researching':
        return `Researching ${sectionName}...`;
      case 'writing':
        return `Writing ${sectionName}...`;
      case 'pending':
        return `Waiting to process ${sectionName}...`;
      default:
        return 'Loading...';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 size={40} className="animate-spin text-blue-600" />
      <p className="text-gray-600">{getMessage()}</p>
      {status === 'researching' && (
        <p className="text-sm text-gray-500">
          Searching multiple sources and analyzing data...
        </p>
      )}
      {status === 'writing' && (
        <p className="text-sm text-gray-500">
          Formatting and structuring the content...
        </p>
      )}
    </div>
  );
}
