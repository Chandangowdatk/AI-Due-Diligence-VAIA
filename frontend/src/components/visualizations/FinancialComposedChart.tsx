'use client';

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { FinancialDataPoint } from '@/types/visualizations';
import { formatCurrency } from '@/lib/utils';

interface FinancialComposedChartProps {
  data: FinancialDataPoint[];
  title?: string;
}

export function FinancialComposedChart({ data, title }: FinancialComposedChartProps) {
  if (!data || data.length === 0) return null;

  const hasProfit = data.some((d) => d.profit !== undefined && d.profit !== null);
  const hasEbitda = data.some((d) => (d as any).ebitda !== undefined && (d as any).ebitda !== null);
  const hasMargin = data.some((d) => d.margin !== undefined && d.margin !== null);
  const hasEbitdaMargin = data.some((d) => (d as any).ebitdaMargin !== undefined);
  const hasProfitMargin = data.some((d) => (d as any).profitMargin !== undefined);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      {title && <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>}
      
      {/* Legend indicators */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-700">Revenue</span>
        </div>
        {hasEbitda && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <span className="text-gray-700">EBITDA</span>
          </div>
        )}
        {hasProfit && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span className="text-gray-700">Net Profit</span>
          </div>
        )}
        {(hasMargin || hasEbitdaMargin) && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-amber-500 rounded"></div>
            <span className="text-gray-700">EBITDA Margin</span>
          </div>
        )}
        {hasProfitMargin && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-600 rounded"></div>
            <span className="text-gray-700">Net Profit Margin</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart data={data} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="period" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
            label={{ 
              value: 'Amount (USD)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 }
            }}
          />
          {(hasMargin || hasEbitdaMargin || hasProfitMargin) && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#d1d5db' }}
              domain={[-30, 100]}
              label={{ 
                value: 'Margin (%)', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 }
              }}
            />
          )}
          <ReferenceLine yAxisId="left" y={0} stroke="#9ca3af" strokeDasharray="3 3" />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number, name: string) => {
              if (name.includes('Margin') || name.includes('margin')) {
                return [`${value?.toFixed(1)}%`, name];
              }
              return [formatCurrency(value), name];
            }}
            labelStyle={{ fontWeight: 'bold', color: '#374151' }}
          />
          
          {/* Bars for financial metrics */}
          <Bar 
            yAxisId="left" 
            dataKey="revenue" 
            fill="#3b82f6" 
            name="Revenue" 
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
          {hasEbitda && (
            <Bar 
              yAxisId="left" 
              dataKey="ebitda" 
              fill="#fb923c" 
              name="EBITDA" 
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          )}
          {hasProfit && (
            <Bar 
              yAxisId="left" 
              dataKey="profit" 
              fill="#10b981" 
              name="Net Profit" 
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          )}
          
          {/* Lines for margins */}
          {hasMargin && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="margin"
              stroke="#f59e0b"
              strokeWidth={2}
              name="EBITDA Margin"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
          {hasEbitdaMargin && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ebitdaMargin"
              stroke="#f59e0b"
              strokeWidth={2}
              name="EBITDA Margin"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
          {hasProfitMargin && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="profitMargin"
              stroke="#16a34a"
              strokeWidth={2}
              name="Net Profit Margin"
              dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
