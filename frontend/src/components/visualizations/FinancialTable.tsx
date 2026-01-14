'use client';

import { formatCurrency, getCurrencyLabel } from '@/lib/utils';

interface FinancialTableData {
  period: string;
  revenue?: number;
  grossProfit?: number;
  grossMargin?: number;
  ebitda?: number;
  ebitdaMargin?: number;
  profit?: number;
  profitMargin?: number;
}

interface FinancialTableProps {
  data: FinancialTableData[];
  title?: string;
  currency?: string;
  unit?: string;
}

export function FinancialTable({ data, title, currency = 'USD', unit = 'millions' }: FinancialTableProps) {
  if (!data || data.length === 0) return null;

  // Determine which columns to show based on available data
  const hasGrossProfit = data.some(d => d.grossProfit !== undefined);
  const hasGrossMargin = data.some(d => d.grossMargin !== undefined);
  const hasEbitda = data.some(d => d.ebitda !== undefined);
  const hasEbitdaMargin = data.some(d => d.ebitdaMargin !== undefined);
  const hasProfit = data.some(d => d.profit !== undefined);
  const hasProfitMargin = data.some(d => d.profitMargin !== undefined);

  const currencyLabel = getCurrencyLabel(currency, unit);

  const formatMargin = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return `${value.toFixed(1)}%`;
  };

  const formatValue = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return formatCurrency(value, currency, unit);
  };

  // Get cell color based on value (positive = green, negative = red)
  const getValueColor = (value?: number) => {
    if (value === undefined || value === null) return 'text-gray-500';
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-900';
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-3 font-semibold text-gray-700 sticky left-0 bg-gray-50">
                Metric
              </th>
              {data.map((item, index) => (
                <th key={index} className="text-right py-3 px-3 font-semibold text-gray-700 min-w-[100px]">
                  {item.period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Revenue Row */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-3 font-medium text-gray-900 sticky left-0 bg-white">
                Revenue
              </td>
              {data.map((item, index) => (
                <td key={index} className="py-3 px-3 text-right font-semibold text-blue-600">
                  {formatValue(item.revenue)}
                </td>
              ))}
            </tr>

            {/* Gross Profit Row */}
            {hasGrossProfit && (
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3 font-medium text-gray-900 sticky left-0 bg-white">
                  Gross Profit
                </td>
                {data.map((item, index) => (
                  <td key={index} className={`py-3 px-3 text-right ${getValueColor(item.grossProfit)}`}>
                    {formatValue(item.grossProfit)}
                  </td>
                ))}
              </tr>
            )}

            {/* Gross Margin Row */}
            {hasGrossMargin && (
              <tr className="border-b border-gray-100 hover:bg-gray-50 bg-gray-50/50">
                <td className="py-3 px-3 text-gray-600 sticky left-0 bg-gray-50/50 pl-6">
                  Gross Margin %
                </td>
                {data.map((item, index) => (
                  <td key={index} className={`py-3 px-3 text-right ${getValueColor(item.grossMargin)}`}>
                    {formatMargin(item.grossMargin)}
                  </td>
                ))}
              </tr>
            )}

            {/* EBITDA Row */}
            {hasEbitda && (
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3 font-medium text-gray-900 sticky left-0 bg-white">
                  EBITDA
                </td>
                {data.map((item, index) => (
                  <td key={index} className={`py-3 px-3 text-right font-medium ${getValueColor(item.ebitda)}`}>
                    {formatValue(item.ebitda)}
                  </td>
                ))}
              </tr>
            )}

            {/* EBITDA Margin Row */}
            {hasEbitdaMargin && (
              <tr className="border-b border-gray-100 hover:bg-gray-50 bg-gray-50/50">
                <td className="py-3 px-3 text-gray-600 sticky left-0 bg-gray-50/50 pl-6">
                  EBITDA Margin %
                </td>
                {data.map((item, index) => (
                  <td key={index} className={`py-3 px-3 text-right ${getValueColor(item.ebitdaMargin)}`}>
                    {formatMargin(item.ebitdaMargin)}
                  </td>
                ))}
              </tr>
            )}

            {/* Net Profit Row */}
            {hasProfit && (
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3 font-medium text-gray-900 sticky left-0 bg-white">
                  Net Profit
                </td>
                {data.map((item, index) => (
                  <td key={index} className={`py-3 px-3 text-right font-medium ${getValueColor(item.profit)}`}>
                    {formatValue(item.profit)}
                  </td>
                ))}
              </tr>
            )}

            {/* Net Profit Margin Row */}
            {hasProfitMargin && (
              <tr className="border-b border-gray-100 hover:bg-gray-50 bg-gray-50/50">
                <td className="py-3 px-3 text-gray-600 sticky left-0 bg-gray-50/50 pl-6">
                  Net Profit Margin %
                </td>
                {data.map((item, index) => (
                  <td key={index} className={`py-3 px-3 text-right ${getValueColor(item.profitMargin)}`}>
                    {formatMargin(item.profitMargin)}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        * All monetary values in {currencyLabel}
      </div>
    </div>
  );
}
