'use client';

import { CheckCircle, Circle, Loader2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { SectionStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusIconProps {
  status: SectionStatus;
  size?: number;
  className?: string;
}

export function StatusIcon({ status, size = 16, className }: StatusIconProps) {
  const iconProps = { size, className: cn(className) };

  switch (status) {
    case 'complete':
      return <CheckCircle {...iconProps} className={cn('text-green-600', className)} />;
    case 'incomplete':
      return <AlertCircle {...iconProps} className={cn('text-yellow-600', className)} />;
    case 'researching':
    case 'writing':
      return <Loader2 {...iconProps} className={cn('text-blue-600 animate-spin', className)} />;
    case 'error':
      return <XCircle {...iconProps} className={cn('text-red-600', className)} />;
    case 'timeout':
      return <Clock {...iconProps} className={cn('text-orange-600', className)} />;
    default:
      return <Circle {...iconProps} className={cn('text-gray-400', className)} />;
  }
}
