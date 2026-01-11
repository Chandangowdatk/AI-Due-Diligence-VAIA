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
  PieChart,
  Pie,
} from 'recharts';
import { RevenueDataPoint } from '@/types/visualizations';
import { formatCurrency } from '@/lib/utils';

interface RevenueBarChartProps {
  data: RevenueDataPoint[];
  title?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export function RevenueBarChart({ data, title }: RevenueBarChartProps) {
  if (!data || data.length === 0) return null;

  // Sort by revenue descending
  const sortedData = [...data].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
  
  // Calculate total
  const totalRevenue = sortedData.reduce((sum, item) => sum + (item.revenue || 0), 0);

  // Add percentage if not present
  const dataWithPercentage = sortedData.map(item => ({
    ...item,
    percentage: item.percentage || (totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0),
  }));

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
      
      {/* Summary */}
      <div className="mb-6 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-600 font-medium">Total Revenue</div>
        <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalRevenue)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div>
          <ResponsiveContainer width="100%" height={Math.max(250, dataWithPercentage.length * 50)}>
            <BarChart
              data={dataWithPercentage}
              layout="vertical"
              margin={{ top: 5, right: 80, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis
                type="category"
                dataKey="segment"
                width={100}
                tick={{ fill: '#374151', fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'percentage') return [`${value.toFixed(1)}%`, 'Share'];
                  return [formatCurrency(value), 'Revenue'];
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]} maxBarSize={35}>
                {dataWithPercentage.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList
                  dataKey="revenue"
                  position="right"
                  formatter={(value: number) => formatCurrency(value)}
                  style={{ fill: '#374151', fontSize: 11, fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart for percentage breakdown */}
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dataWithPercentage}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="percentage"
                nameKey="segment"
                label={({ segment, percentage }) => `${percentage.toFixed(0)}%`}
                labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
              >
                {dataWithPercentage.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Share']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {dataWithPercentage.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-600">{item.segment}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
