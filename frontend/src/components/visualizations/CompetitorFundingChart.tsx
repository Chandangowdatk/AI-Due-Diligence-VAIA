'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { CompetitorFundingDataPoint } from '@/types/visualizations';
import { formatCurrency } from '@/lib/utils';

interface CompetitorFundingChartProps {
  data: CompetitorFundingDataPoint[];
  title?: string;
  targetCompany?: string;
}

export function CompetitorFundingChart({
  data,
  title,
  targetCompany,
}: CompetitorFundingChartProps) {
  if (!data || data.length === 0) return null;

  // Sort by funding descending and take top 8
  const sortedData = [...data]
    .sort((a, b) => (b.funding || 0) - (a.funding || 0))
    .slice(0, 8);

  // Find max funding for scale
  const maxFunding = Math.max(...sortedData.map(d => d.funding || 0));

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
      
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600 font-medium">Companies</div>
          <div className="text-xl font-bold text-gray-900">{data.length}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-sm text-blue-600 font-medium">Top Funded</div>
          <div className="text-xl font-bold text-blue-900">
            {formatCurrency(sortedData[0]?.funding)}
          </div>
        </div>
        {targetCompany && (
          <div className="bg-green-50 rounded-lg p-3 col-span-2">
            <div className="text-sm text-green-600 font-medium">Target Company</div>
            <div className="text-xl font-bold text-green-900">{targetCompany}</div>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={Math.max(300, sortedData.length * 45)}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 80, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#d1d5db' }}
            domain={[0, maxFunding * 1.1]}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={100}
            tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Total Funding']}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelStyle={{ fontWeight: 'bold', color: '#374151' }}
          />
          <Bar 
            dataKey="funding" 
            name="Total Funding"
            radius={[0, 4, 4, 0]}
            maxBarSize={35}
          >
            {sortedData.map((entry, index) => {
              const isTarget = targetCompany && 
                entry.name.toLowerCase() === targetCompany.toLowerCase();
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={isTarget ? '#3b82f6' : index === 0 ? '#1e40af' : '#60a5fa'}
                />
              );
            })}
            <LabelList 
              dataKey="funding" 
              position="right" 
              formatter={(value: number) => formatCurrency(value)}
              style={{ fill: '#374151', fontSize: 11, fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-600"></div>
          <span>Target Company</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-400"></div>
          <span>Competitors</span>
        </div>
      </div>
    </div>
  );
}
