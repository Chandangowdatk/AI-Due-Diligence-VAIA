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

// Format currency with support for different currencies and units
export function formatCurrency(
  amount: number | undefined | null, 
  currency = 'USD',
  unit = 'millions'
): string {
  if (amount === undefined || amount === null) return '-';
  
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  // Currency symbols
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'INR': '₹',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
  };
  
  const symbol = currencySymbols[currency] || currency + ' ';
  
  // Handle different units
  if (unit === 'crores') {
    // Indian crores - display as Cr
    if (absAmount >= 100) {
      return `${sign}${symbol}${absAmount.toLocaleString()} Cr`;
    } else {
      return `${sign}${symbol}${absAmount.toFixed(1)} Cr`;
    }
  } else if (unit === 'lakhs') {
    // Indian lakhs - display as L
    if (absAmount >= 100) {
      return `${sign}${symbol}${absAmount.toLocaleString()} L`;
    } else {
      return `${sign}${symbol}${absAmount.toFixed(1)} L`;
    }
  } else if (unit === 'billions') {
    // Already in billions
    return `${sign}${symbol}${absAmount.toFixed(1)}B`;
  } else if (unit === 'thousands') {
    // Already in thousands
    if (absAmount >= 1000) {
      return `${sign}${symbol}${(absAmount / 1000).toFixed(1)}M`;
    }
    return `${sign}${symbol}${absAmount.toFixed(0)}K`;
  } else {
    // Default: millions
    if (absAmount >= 1000) {
      // Billions (1000M = 1B)
      return `${sign}${symbol}${(absAmount / 1000).toFixed(1)}B`;
    } else if (absAmount >= 1) {
      // Millions
      return `${sign}${symbol}${absAmount.toFixed(1)}M`;
    } else if (absAmount >= 0.001) {
      // Thousands (0.001M = 1K)
      return `${sign}${symbol}${(absAmount * 1000).toFixed(0)}K`;
    } else if (absAmount === 0) {
      return `${symbol}0`;
    } else {
      return `${sign}${symbol}${absAmount.toFixed(2)}M`;
    }
  }
}

// Format currency label for chart axes
export function getCurrencyLabel(currency = 'USD', unit = 'millions'): string {
  const currencyNames: Record<string, string> = {
    'USD': 'USD',
    'INR': 'INR',
    'EUR': 'EUR',
    'GBP': 'GBP',
  };
  
  const unitNames: Record<string, string> = {
    'millions': 'M',
    'billions': 'B',
    'crores': 'Cr',
    'lakhs': 'L',
    'thousands': 'K',
  };
  
  const currencyName = currencyNames[currency] || currency;
  const unitName = unitNames[unit] || unit;
  
  return `${currencyName} ${unitName}`;
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
