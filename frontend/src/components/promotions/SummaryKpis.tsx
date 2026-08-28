import React from 'react';
import { PromotionMetricGrid } from './PromotionMetricGrid.tsx';
import { PromotionSummary } from '../../types/promotion.types.ts';

interface SummaryKpisProps {
  summary: PromotionSummary;
  loading: boolean;
}

export const SummaryKpis: React.FC<SummaryKpisProps> = ({ summary, loading }) => {
  return <PromotionMetricGrid summary={summary} loading={loading} />;
};
