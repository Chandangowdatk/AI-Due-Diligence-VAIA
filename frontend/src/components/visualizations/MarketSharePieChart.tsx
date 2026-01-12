'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MarketShareDataPoint } from '@/types/visualizations';

interface MarketSharePieChartProps {
  data: MarketShareDataPoint[];
  title?: string;
}

const COLORS = [
  '#3b82f6', // Blue (target)
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#6b7280', // Gray
];

export function MarketSharePieChart({ data, title }: MarketSharePieChartProps) {
  if (!data || data.length === 0) return null;

  // Sort by share descending
  const sortedData = [...data].sort((a, b) => (b.share || 0) - (a.share || 0));
  
  // Find target company
  const targetIndex = sortedData.findIndex(d => d.isTarget);

  const renderCustomLabel = ({ company, share, cx, cy, midAngle, innerRadius, outerRadius }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (share < 5) return null; // Don't show labels for small slices

    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
      >
        {`${company} - ${share}%`}
      </text>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sortedData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={2}
                dataKey="share"
                nameKey="company"
                label={renderCustomLabel}
                labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                isAnimationActive={false}
              >
                {sortedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isTarget ? '#3b82f6' : COLORS[(index + 1) % COLORS.length]}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Market Share']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Company</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Share</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((entry, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-gray-100 hover:bg-gray-50 ${entry.isTarget ? 'bg-blue-50' : ''}`}
                >
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ 
                          backgroundColor: entry.isTarget ? '#3b82f6' : COLORS[(index + 1) % COLORS.length] 
                        }}
                      />
                      <span className={`${entry.isTarget ? 'font-semibold text-blue-900' : 'text-gray-900'}`}>
                        {entry.company}
                        {entry.isTarget && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            Target
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className={`py-2 px-2 text-right font-semibold ${entry.isTarget ? 'text-blue-900' : 'text-gray-900'}`}>
                    {entry.share.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
