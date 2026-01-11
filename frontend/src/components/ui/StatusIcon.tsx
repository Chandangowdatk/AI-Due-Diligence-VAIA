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
      return <CheckCircle {...iconProps} className={cn('text-emerald-500', className)} />;
    case 'incomplete':
      return <AlertCircle {...iconProps} className={cn('text-amber-500', className)} />;
    case 'researching':
    case 'writing':
      return <Loader2 {...iconProps} className={cn('text-primary-500 animate-spin', className)} />;
    case 'error':
      return <XCircle {...iconProps} className={cn('text-red-500', className)} />;
    case 'timeout':
      return <Clock {...iconProps} className={cn('text-orange-500', className)} />;
    default:
      return <Circle {...iconProps} className={cn('text-navy-300', className)} />;
  }
}
