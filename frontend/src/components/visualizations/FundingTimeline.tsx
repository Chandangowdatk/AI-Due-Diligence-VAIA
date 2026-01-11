'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface FundingRound {
  date: string;
  round: string;
  amount: number;
  valuation?: number;
  investors?: string[];
}

interface FundingTimelineProps {
  data: FundingRound[];
  title?: string;
}

export function FundingTimeline({ data, title }: FundingTimelineProps) {
  if (!data || data.length === 0) return null;

  // Sort by date
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date || '1970-01-01');
    const dateB = new Date(b.date || '1970-01-01');
    return dateA.getTime() - dateB.getTime();
  });

  const hasValuation = sortedData.some(d => d.valuation !== undefined && d.valuation !== null);
  const totalFunding = sortedData.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-sm text-blue-600 font-medium">Total Funding</div>
          <div className="text-xl font-bold text-blue-900">{formatCurrency(totalFunding)}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-sm text-green-600 font-medium">Funding Rounds</div>
          <div className="text-xl font-bold text-green-900">{sortedData.length}</div>
        </div>
        {hasValuation && sortedData[sortedData.length - 1]?.valuation && (
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-sm text-purple-600 font-medium">Latest Valuation</div>
            <div className="text-xl font-bold text-purple-900">
              {formatCurrency(sortedData[sortedData.length - 1].valuation!)}
            </div>
          </div>
        )}
        <div className="bg-amber-50 rounded-lg p-3">
          <div className="text-sm text-amber-600 font-medium">Latest Round</div>
          <div className="text-xl font-bold text-amber-900">
            {sortedData[sortedData.length - 1]?.round || 'N/A'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valuation Chart */}
        {hasValuation && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Post-Money Valuation</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sortedData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="round" 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string) => [formatCurrency(value), 'Valuation']}
                  labelFormatter={(label) => `Round: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="valuation"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#7c3aed' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Funding Rounds Table */}
        <div className={hasValuation ? '' : 'lg:col-span-2'}>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">All Funding Rounds</h4>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Round</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Amount</th>
                  {hasValuation && (
                    <th className="text-right py-2 px-2 font-semibold text-gray-700">Valuation</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {[...sortedData].reverse().map((round, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 text-gray-600">{round.date || 'N/A'}</td>
                    <td className="py-2 px-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {round.round}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-gray-900">
                      {formatCurrency(round.amount)}
                    </td>
                    {hasValuation && (
                      <td className="py-2 px-2 text-right text-gray-600">
                        {round.valuation ? formatCurrency(round.valuation) : '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
