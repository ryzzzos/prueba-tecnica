import React from 'react';
import { Card, CardBody, Skeleton } from '@heroui/react';
import { CalendarCheck, Clock, CheckCircle, Archive } from 'lucide-react';
import { PromotionSummary } from '../../types/promotion.types.ts';

interface SummaryKpisProps {
  summary: PromotionSummary;
  loading: boolean;
}

export const SummaryKpis: React.FC<SummaryKpisProps> = ({ summary, loading }) => {
  const kpis = [
    {
      title: 'Vigentes Hoy',
      count: summary.validToday,
      description: 'Activas dentro del rango de fecha actual',
      icon: CalendarCheck,
      badgeBg: 'bg-emerald-600',
      borderHighlight: 'border-emerald-500/40 dark:border-emerald-500/30',
      tagText: 'En POS Ahora',
      tagBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    },
    {
      title: 'Programadas',
      count: summary.programmed,
      description: 'Pendientes de inicio o activacion',
      icon: Clock,
      badgeBg: 'bg-indigo-600',
      borderHighlight: 'border-[var(--border-strong)]',
      tagText: 'Planificadas',
      tagBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    },
    {
      title: 'Activas',
      count: summary.active,
      description: 'En ejecucion comercial en caja',
      icon: CheckCircle,
      badgeBg: 'bg-blue-600',
      borderHighlight: 'border-[var(--border-strong)]',
      tagText: 'En Curso',
      tagBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    },
    {
      title: 'Finalizadas',
      count: summary.finished,
      description: 'Completadas o inactivadas (Inmutables)',
      icon: Archive,
      badgeBg: 'bg-slate-600',
      borderHighlight: 'border-[var(--border-strong)]',
      tagText: 'Cerradas',
      tagBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const IconComponent = kpi.icon;
        return (
          <Card
            key={index}
            shadow="sm"
            className={`bg-[var(--surface-2)] border ${kpi.borderHighlight} rounded-[var(--radius-xl)] transition-all hover:shadow-[var(--shadow-md)]`}
          >
            <CardBody className="p-5 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${kpi.badgeBg} flex items-center justify-center text-white shadow-sm`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${kpi.tagBg}`}>
                  {kpi.tagText}
                </span>
              </div>

              <div>
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  {loading ? (
                    <Skeleton className="h-8 w-16 rounded-lg" />
                  ) : (
                    <span className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                      {kpi.count}
                    </span>
                  )}
                  <span className="text-xs text-[var(--text-secondary)] font-normal">
                    promociones
                  </span>
                </div>
              </div>

              <p className="text-xs text-[var(--text-muted)] line-clamp-1 border-t border-[var(--border-soft)] pt-2 mt-1">
                {kpi.description}
              </p>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};
