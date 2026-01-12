import { SectionStatus } from '@/types';

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format datetime for display
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format duration in seconds to human readable
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

// Format large numbers with K/M/B suffixes
export function formatNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString();
}

// Format currency (values are in millions)
export function formatCurrency(amount: number | undefined | null, currency = 'USD'): string {
  if (amount === undefined || amount === null) return '-';
  
  // Values are already in millions, so we need to display them appropriately
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 1000) {
    // Billions (1000M = 1B)
    return `${sign}$${(absAmount / 1000).toFixed(1)}B`;
  } else if (absAmount >= 1) {
    // Millions
    return `${sign}$${absAmount.toFixed(1)}M`;
  } else if (absAmount >= 0.001) {
    // Thousands (0.001M = 1K)
    return `${sign}$${(absAmount * 1000).toFixed(0)}K`;
  } else if (absAmount === 0) {
    return '$0';
  } else {
    return `${sign}$${absAmount.toFixed(2)}M`;
  }
}

// Get status color class
export function getStatusColor(status: SectionStatus): string {
  switch (status) {
    case 'complete': return 'text-green-600';
    case 'incomplete': return 'text-yellow-600';
    case 'researching':
    case 'writing': return 'text-blue-600';
    case 'error':
    case 'timeout': return 'text-red-600';
    default: return 'text-gray-400';
  }
}

// Get status background color class
export function getStatusBgColor(status: SectionStatus): string {
  switch (status) {
    case 'complete': return 'bg-green-100';
    case 'incomplete': return 'bg-yellow-100';
    case 'researching':
    case 'writing': return 'bg-blue-100';
    case 'error':
    case 'timeout': return 'bg-red-100';
    default: return 'bg-gray-100';
  }
}

// Classnames utility (simple version)
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Simple markdown to HTML (basic conversion)
export function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/\n/g, '<br>');
}
