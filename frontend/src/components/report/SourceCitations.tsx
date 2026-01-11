'use client';

import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
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

export function SourceCitations({ sources }: SourceCitationsProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Sources ({sources.length})
      </h3>
      <ul className="space-y-3">
        {sources.map((source, index) => (
          <li
            key={index}
            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                >
                  {truncate(source.title, 80)}
                  <ExternalLink size={14} />
                </a>
                <p className="text-sm text-gray-600 mt-1">
                  {truncate(source.snippet, 150)}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="px-2 py-0.5 bg-gray-200 rounded">
                    {SOURCE_TYPE_LABELS[source.source_type] || source.source_type}
                  </span>
                  <span>{formatDateTime(source.retrieved_at)}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {source.verified ? (
                  <CheckCircle size={16} className="text-green-600" title="Verified" />
                ) : (
                  <AlertCircle size={16} className="text-yellow-600" title="Unverified" />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
