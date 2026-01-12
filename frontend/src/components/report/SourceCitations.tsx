'use client';

import { ExternalLink, CheckCircle, AlertCircle, Link2 } from 'lucide-react';
import { SourceCitation } from '@/types';
import { formatDateTime, truncate } from '@/lib/utils';

interface SourceCitationsProps {
  sources: SourceCitation[];
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  official_filing: 'Official Filing',
  press_release: 'Press Release',
  news_article: 'News Article',
  database: 'Database',
  social_media: 'Social Media',
  other: 'Other',
};

const SOURCE_TYPE_COLORS: Record<string, string> = {
  official_filing: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  press_release: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  news_article: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  database: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  social_media: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
  other: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
};

export function SourceCitations({ sources }: SourceCitationsProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-neutral-100 dark:bg-white/5 rounded-lg flex items-center justify-center">
          <Link2 className="text-neutral-500 dark:text-neutral-400" size={16} />
        </div>
        <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">
          Sources ({sources.length})
        </h3>
      </div>
      <ul className="space-y-3">
        {sources.map((source, index) => (
          <li
            key={index}
            className="p-4 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/5 hover:border-neutral-200 dark:hover:border-white/10 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:text-brand-primary/80 font-medium flex items-center gap-1.5 group"
                >
                  <span className="group-hover:underline">{truncate(source.title, 80)}</span>
                  <ExternalLink size={14} className="flex-shrink-0 opacity-70" />
                </a>
                <p className="text-sm text-neutral-600 dark:text-neutral-200 mt-1.5 leading-relaxed">
                  {truncate(source.snippet, 150)}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                    SOURCE_TYPE_COLORS[source.source_type] || SOURCE_TYPE_COLORS.other
                  }`}>
                    {SOURCE_TYPE_LABELS[source.source_type] || source.source_type}
                  </span>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">{formatDateTime(source.retrieved_at)}</span>
                </div>
              </div>
              <div className="flex-shrink-0 mt-1">
                {source.verified ? (
                  <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center" title="Verified">
                    <CheckCircle size={16} className="text-emerald-500 dark:text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center" title="Unverified">
                    <AlertCircle size={16} className="text-amber-500 dark:text-amber-400" />
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
