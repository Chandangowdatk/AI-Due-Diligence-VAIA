'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FundingDataPoint } from '@/types/visualizations';
import { formatCurrency } from '@/lib/utils';

interface FundingLineChartProps {
  data: FundingDataPoint[];
  title?: string;
}

export function FundingLineChart({ data, title }: FundingLineChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="round" />
          <YAxis tickFormatter={(value) => formatCurrency(value)} />
          <Tooltip
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === 'amount' ? 'Funding' : 'Valuation',
            ]}
            labelFormatter={(label) => `Round: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Funding Amount"
            isAnimationActive={false}
          />
          {data.some((d) => d.valuation) && (
            <Line
              type="monotone"
              dataKey="valuation"
              stroke="#10b981"
              strokeWidth={2}
              name="Valuation"
              strokeDasharray="5 5"
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
