import React from 'react';
import { Sparkles, CalendarClock, Activity, ArchiveRestore } from 'lucide-react';
import { PromotionSummary } from '../../types/promotion.types.ts';
import { KpiCard } from '../ui/KpiCard.tsx';

interface PromotionMetricGridProps {
  summary: PromotionSummary;
  loading: boolean;
}

export const PromotionMetricGrid: React.FC<PromotionMetricGridProps> = ({ summary, loading }) => {
  return (
    <section
      aria-label="Métricas y KPIs de promociones"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
    >
      {/* 1. Vigentes Hoy */}
      <KpiCard
        title="Vigentes Hoy"
        value={summary.validToday}
        icon={Sparkles}
        iconBgClass="bg-[linear-gradient(135deg,#1d4ed8,#2563eb)]"
        badgeClass="bg-[var(--app-primary)] text-white"
        loading={loading}
        showProgressBar={true}
        previousValue={summary.active > 0 ? summary.active : 1}
        barColorClass="bg-[var(--app-primary)]"
        tooltipText="Promociones activas cuyo rango de fechas [inicio, fin] incluye el día de hoy"
        tooltipTarget="title"
      />

      {/* 2. Activas en Sistema */}
      <KpiCard
        title="Activas en Sistema"
        value={summary.active}
        icon={Activity}
        iconBgClass="bg-[linear-gradient(135deg,#059669,#10b981)]"
        badgeClass="bg-[var(--color-success)] text-white"
        loading={loading}
        showProgressBar={true}
        previousValue={summary.total > 0 ? summary.total : 1}
        barColorClass="bg-[var(--color-success)]"
        tooltipText="Promociones en estado ACTIVA disponibles para el motor de precios"
        tooltipTarget="title"
      />

      {/* 3. Programadas */}
      <KpiCard
        title="Programadas"
        value={summary.programmed}
        icon={CalendarClock}
        iconBgClass="bg-[linear-gradient(135deg,#7c3aed,#9333ea)]"
        badgeClass="bg-[var(--app-accent-purple)] text-white"
        loading={loading}
        showProgressBar={true}
        previousValue={summary.total > 0 ? summary.total : 1}
        barColorClass="bg-[var(--app-accent-purple)]"
        tooltipText="Promociones creadas con fecha futura o en espera de inicio"
        tooltipTarget="title"
      />

      {/* 4. Finalizadas */}
      <KpiCard
        title="Finalizadas"
        value={summary.finished}
        icon={ArchiveRestore}
        iconBgClass="bg-[linear-gradient(135deg,#475569,#64748b)]"
        badgeClass="bg-[var(--color-finished)] text-white"
        loading={loading}
        showProgressBar={true}
        previousValue={summary.total > 0 ? summary.total : 1}
        barColorClass="bg-[var(--color-finished)]"
        tooltipText="Promociones cerradas o vencidas. Registros inmutables en auditoría"
        tooltipTarget="title"
      />
    </section>
  );
};

export default PromotionMetricGrid;
