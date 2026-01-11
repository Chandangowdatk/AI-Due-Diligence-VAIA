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
  official_filing: 'bg-emerald-100 text-emerald-700',
  press_release: 'bg-blue-100 text-blue-700',
  news_article: 'bg-purple-100 text-purple-700',
  database: 'bg-amber-100 text-amber-700',
  social_media: 'bg-pink-100 text-pink-700',
  other: 'bg-navy-100 text-navy-600',
};

export function SourceCitations({ sources }: SourceCitationsProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-navy-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center">
          <Link2 className="text-navy-500" size={16} />
        </div>
        <h3 className="text-lg font-semibold text-navy-800">
          Sources ({sources.length})
        </h3>
      </div>
      <ul className="space-y-3">
        {sources.map((source, index) => (
          <li
            key={index}
            className="p-4 bg-navy-50 rounded-xl border border-navy-100 hover:border-navy-200 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5 group"
                >
                  <span className="group-hover:underline">{truncate(source.title, 80)}</span>
                  <ExternalLink size={14} className="flex-shrink-0 opacity-70" />
                </a>
                <p className="text-sm text-navy-600 mt-1.5 leading-relaxed">
                  {truncate(source.snippet, 150)}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                    SOURCE_TYPE_COLORS[source.source_type] || SOURCE_TYPE_COLORS.other
                  }`}>
                    {SOURCE_TYPE_LABELS[source.source_type] || source.source_type}
                  </span>
                  <span className="text-xs text-navy-400">{formatDateTime(source.retrieved_at)}</span>
                </div>
              </div>
              <div className="flex-shrink-0 mt-1">
                {source.verified ? (
                  <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center" title="Verified">
                    <CheckCircle size={16} className="text-emerald-500" />
                  </div>
                ) : (
                  <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center" title="Unverified">
                    <AlertCircle size={16} className="text-amber-500" />
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
