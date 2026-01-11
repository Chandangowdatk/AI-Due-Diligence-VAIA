'use client';

import { SectionId } from '@/types';
import { OwnershipPieChart } from './OwnershipPieChart';
import { FundingLineChart } from './FundingLineChart';
import { FundingTimeline } from './FundingTimeline';
import { CapTable } from './CapTable';
import { RevenueBarChart } from './RevenueBarChart';
import { CompetitorFundingChart } from './CompetitorFundingChart';
import { MarketSharePieChart } from './MarketSharePieChart';
import { FinancialComposedChart } from './FinancialComposedChart';
import { FinancialTable } from './FinancialTable';

export { OwnershipPieChart } from './OwnershipPieChart';
export { FundingLineChart } from './FundingLineChart';
export { FundingTimeline } from './FundingTimeline';
export { CapTable } from './CapTable';
export { RevenueBarChart } from './RevenueBarChart';
export { CompetitorFundingChart } from './CompetitorFundingChart';
export { MarketSharePieChart } from './MarketSharePieChart';
export { FinancialComposedChart } from './FinancialComposedChart';
export { FinancialTable } from './FinancialTable';

interface VisualizationRendererProps {
  sectionId: SectionId;
  data: Record<string, unknown>;
}

export function VisualizationRenderer({ sectionId, data }: VisualizationRendererProps) {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[VisualizationRenderer] Section: ${sectionId}, Data keys:`, Object.keys(data));
  }

  // Helper to check if array has sufficient data
  const hasValidData = (arr: any[] | undefined, minItems: number = 1): boolean => {
    return arr !== undefined && Array.isArray(arr) && arr.length >= minItems;
  };

  // Helper to render a simple text note when data is unavailable
  const DataUnavailableNote = ({ dataType }: { dataType: string }) => (
    <p className="text-gray-500 text-sm italic mb-4">
      {dataType} data was not available from public sources at the time of research.
    </p>
  );

  switch (sectionId) {
    case 'leadership_governance':
      const hasOwnership = hasValidData(data.ownership as any[], 2);
      const hasFunding = hasValidData(data.funding_history as any[], 1);
      
      return (
        <div className="space-y-6">
          {/* Cap Table with Pie Chart */}
          {hasOwnership ? (
            <CapTable
              data={data.ownership as any}
              title="Cap Table - Ownership Structure"
            />
          ) : (
            <DataUnavailableNote dataType="Detailed ownership structure" />
          )}
          {/* Funding Timeline */}
          {hasFunding ? (
            <FundingTimeline
              data={data.funding_history as any}
              title="Funding History & Valuation"
            />
          ) : (
            <DataUnavailableNote dataType="Funding history" />
          )}
        </div>
      );

    case 'business_model':
      const hasRevenue = hasValidData(data.revenue_breakdown as any[], 2);
      
      if (!hasRevenue) {
        return <DataUnavailableNote dataType="Revenue segment breakdown" />;
      }
      
      return (
        <div className="space-y-6">
          <RevenueBarChart
            data={data.revenue_breakdown as any}
            title="Revenue Breakdown by Segment"
          />
        </div>
      );

    case 'competitive_landscape':
      const hasCompetitorFunding = hasValidData(data.competitor_funding as any[], 2);
      const hasMarketShare = hasValidData(data.market_share as any[], 2);
      
      return (
        <div className="space-y-6">
          {hasCompetitorFunding ? (
            <CompetitorFundingChart
              data={data.competitor_funding as any}
              title="Top Competitors by Funding"
              targetCompany={data.target_company as string}
            />
          ) : (
            <DataUnavailableNote dataType="Competitor funding comparison" />
          )}
          {hasMarketShare ? (
            <MarketSharePieChart
              data={data.market_share as any}
              title="Latest Market Share"
            />
          ) : (
            <DataUnavailableNote dataType="Market share distribution" />
          )}
        </div>
      );

    case 'financials':
      const hasFinancials = hasValidData(data.financial_metrics as any[], 2);
      
      if (!hasFinancials) {
        return <DataUnavailableNote dataType="Historical financial metrics" />;
      }
      
      return (
        <div className="space-y-6">
          {/* Financial Chart */}
          <FinancialComposedChart
            data={data.financial_metrics as any}
            title="Financial Summary Over Time"
          />
          {/* Financial Table */}
          <FinancialTable
            data={data.financial_metrics as any}
            title="Financial Metrics by Year"
          />
        </div>
      );

    default:
      return null;
  }
}
