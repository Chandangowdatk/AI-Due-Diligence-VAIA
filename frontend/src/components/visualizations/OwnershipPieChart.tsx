'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { OwnershipDataPoint } from '@/types/visualizations';

interface OwnershipPieChartProps {
  data: OwnershipDataPoint[];
  title?: string;
}

const COLORS = {
  founder: '#3b82f6',
  investor: '#10b981',
  public: '#8b5cf6',
  employee: '#f59e0b',
  other: '#6b7280',
};

export function OwnershipPieChart({ data, title }: OwnershipPieChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.type] || COLORS.other} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
