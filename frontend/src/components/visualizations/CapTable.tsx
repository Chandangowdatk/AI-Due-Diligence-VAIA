'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CapTableEntry {
  name: string;
  value: number;
  type: 'founder' | 'investor' | 'public' | 'employee' | 'other';
}

interface CapTableProps {
  data: CapTableEntry[];
  title?: string;
}

const COLORS: Record<string, string> = {
  founder: '#3b82f6',    // Blue
  investor: '#10b981',   // Green
  public: '#8b5cf6',     // Purple
  employee: '#f59e0b',   // Amber
  other: '#6b7280',      // Gray
};

const TYPE_LABELS: Record<string, string> = {
  founder: 'Founders/Promoters',
  investor: 'Institutional Investors',
  public: 'Public/Retail',
  employee: 'ESOP/Employees',
  other: 'Others',
};

export function CapTable({ data, title }: CapTableProps) {
  if (!data || data.length === 0) return null;

  // Sort by value descending
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={sortedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${value.toFixed(1)}%`}
                labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                isAnimationActive={false}
              >
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.type] || COLORS.other}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Ownership']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {sortedData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[entry.type] || COLORS.other }}
                />
                <span className="text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Shareholder</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Type</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700">Holding %</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((entry, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: COLORS[entry.type] || COLORS.other }}
                      />
                      <span className="text-gray-900 font-medium">{entry.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-gray-600">
                    {TYPE_LABELS[entry.type] || 'Other'}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-gray-900">
                    {entry.value.toFixed(2)}%
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
