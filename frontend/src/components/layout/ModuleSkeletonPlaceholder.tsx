import React from 'react';
import { Skeleton, Button } from '@heroui/react';
import { Sparkles, ArrowRight, ShieldCheck, LucideIcon } from 'lucide-react';
import AppIcon from '../ui/AppIcon.tsx';

export type ModuleSkeletonVariant = 'terminals' | 'transactions' | 'analytics' | 'settings' | 'table';

interface ModuleSkeletonPlaceholderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  variant?: ModuleSkeletonVariant;
  estimatedRelease?: string;
  onGoToPromotions: () => void;
}

export const ModuleSkeletonPlaceholder: React.FC<ModuleSkeletonPlaceholderProps> = ({
  title,
  subtitle,
  icon: Icon,
  variant = 'table',
  estimatedRelease = 'Kódigo POS v2.0 Enterprise',
  onGoToPromotions,
}) => {
  return (
    <div className="flex flex-col h-full justify-between gap-3.5 sm:gap-4 max-w-full overflow-hidden">
      {/* 1. Header Banner (Compact & Responsive) */}
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-primary)_10%,var(--surface-2)),var(--surface-2))] p-4 sm:p-5 shadow-[var(--shadow-sm)] shrink-0">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[linear-gradient(135deg,#1d4ed8,#9333ea)] text-white shadow-sm">
              <AppIcon icon={Icon} size="md" className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Sparkles className="w-2.5 h-2.5" />
                  Módulo en Sincronización
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-medium truncate">
                  {estimatedRelease}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-[var(--text-primary)] truncate mt-0.5">
                {title}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] truncate hidden md:block mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <Button
              size="sm"
              onClick={onGoToPromotions}
              className="bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] font-semibold border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-sm h-8 px-3 text-xs"
              endContent={<ArrowRight className="w-3 h-3" />}
            >
              Ver Promociones Activas
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Sub-navigation / View Switcher (Compact) */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-strong)] pb-2 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <Skeleton className="h-7 w-24 rounded-[var(--radius-md)]" />
          <Skeleton className="h-7 w-28 rounded-[var(--radius-md)]" />
          <Skeleton className="h-7 w-20 rounded-[var(--radius-md)]" />
          <Skeleton className="h-7 w-32 rounded-[var(--radius-md)]" />
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Skeleton className="h-7 w-24 rounded-[var(--radius-md)]" />
          <Skeleton className="h-7 w-7 rounded-[var(--radius-md)]" />
        </div>
      </div>

      {/* 3. Simulated KPI Metric Cards (4 Compact Columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-3.5 shadow-[var(--shadow-sm)] space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-7 rounded-[var(--radius-sm)]" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-5 w-24 rounded-md" />
            </div>
            <div className="pt-1.5 border-t border-[var(--border-soft)] flex items-center justify-between">
              <Skeleton className="h-2.5 w-20 rounded" />
              <Skeleton className="h-2.5 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Search and Filter Bar (Compact Toolbar) */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-2.5 sm:p-3 shadow-[var(--shadow-sm)] shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex flex-1 items-center gap-2.5">
            <Skeleton className="h-8 w-full sm:w-64 rounded-[var(--radius-md)]" />
            <Skeleton className="h-8 w-32 rounded-[var(--radius-md)] hidden sm:block" />
            <Skeleton className="h-8 w-28 rounded-[var(--radius-md)] hidden md:block" />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Skeleton className="h-8 w-24 rounded-[var(--radius-md)]" />
            <Skeleton className="h-8 w-28 rounded-[var(--radius-md)]" />
          </div>
        </div>
      </div>

      {/* 5. Main Adaptable Content Area (Optimized & Non-Overflowing) */}
      <div className="flex-1 min-h-0">
        {/* Preset A: POS Terminals Grid (Compact 3x2) */}
        {variant === 'terminals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-3.5 shadow-[var(--shadow-sm)] space-y-2.5 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-8 w-8 rounded-[var(--radius-sm)]" />
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-24 rounded" />
                      <Skeleton className="h-2.5 w-16 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>

                <div className="space-y-1.5 py-1.5 border-y border-[var(--border-soft)] text-xs">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-2.5 w-16 rounded" />
                    <Skeleton className="h-2.5 w-24 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-2.5 w-20 rounded" />
                    <Skeleton className="h-2.5 w-14 rounded" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <Skeleton className="h-7 w-20 rounded-[var(--radius-md)]" />
                  <Skeleton className="h-7 w-24 rounded-[var(--radius-md)]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preset B: Transactions & Sales Table (Compact 5 Rows) */}
        {variant === 'transactions' && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-sm)] overflow-hidden flex flex-col justify-between">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-[var(--border-strong)] bg-[var(--surface-3)]">
              <div className="col-span-2">
                <Skeleton className="h-3.5 w-16 rounded" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-3.5 w-20 rounded" />
              </div>
              <div className="col-span-3">
                <Skeleton className="h-3.5 w-28 rounded" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-3.5 w-20 rounded" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-3.5 w-16 rounded" />
              </div>
              <div className="col-span-1 flex justify-end">
                <Skeleton className="h-3.5 w-8 rounded" />
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[var(--border-soft)]">
              {[1, 2, 3, 4, 5].map((row) => (
                <div key={row} className="grid grid-cols-12 gap-3 px-5 py-2.5 items-center relative overflow-hidden">
                  <div className="col-span-2 flex items-center gap-2">
                    <Skeleton className="h-6 w-6 shrink-0 rounded-md" />
                    <div className="space-y-0.5">
                      <Skeleton className="h-3 w-16 rounded" />
                      <Skeleton className="h-2 w-10 rounded" />
                    </div>
                  </div>
                  <div className="col-span-2 space-y-0.5">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-2 w-14 rounded" />
                  </div>
                  <div className="col-span-3 space-y-0.5">
                    <Skeleton className="h-3 w-28 rounded" />
                    <Skeleton className="h-2 w-18 rounded" />
                  </div>
                  <div className="col-span-2 space-y-0.5">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-2 w-12 rounded" />
                  </div>
                  <div className="col-span-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <Skeleton className="h-6 w-6 rounded-md" />
                  </div>
                </div>
              ))}
            </div>

            {/* Compact Pagination Footer */}
            <div className="flex items-center justify-between px-5 py-2 border-t border-[var(--border-strong)] bg-[var(--surface-3)]">
              <Skeleton className="h-3 w-32 rounded" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-6 w-14 rounded-[var(--radius-sm)]" />
                <Skeleton className="h-6 w-6 rounded-[var(--radius-sm)]" />
                <Skeleton className="h-6 w-6 rounded-[var(--radius-sm)]" />
                <Skeleton className="h-6 w-14 rounded-[var(--radius-sm)]" />
              </div>
            </div>
          </div>
        )}

        {/* Preset C: Analytics & Commercial Impact (Compact Split Layout) */}
        {variant === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            {/* Chart Area */}
            <div className="lg:col-span-2 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-4 shadow-[var(--shadow-sm)] space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36 rounded-md" />
                  <Skeleton className="h-2.5 w-48 rounded" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-16 rounded-md" />
                </div>
              </div>

              {/* Responsive Chart Bars */}
              <div className="pt-2 flex items-end justify-between gap-2.5 h-36 sm:h-44 px-2 border-b border-[var(--border-soft)] pb-2">
                {[35, 65, 45, 85, 55, 90, 75, 50, 80, 65, 88, 80].map((height, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <Skeleton
                      className="w-full rounded-t-sm opacity-85"
                      style={{ height: `${height}%` }}
                    />
                    <Skeleton className="h-2 w-full rounded" />
                  </div>
                ))}
              </div>

              {/* Chart Legend */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="space-y-0.5">
                    <Skeleton className="h-2.5 w-16 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Ranking Feed */}
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-4 shadow-[var(--shadow-sm)] space-y-2.5 relative overflow-hidden">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-2.5 w-20 rounded" />
              </div>

              <div className="space-y-2 pt-1">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-2 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-3)]"
                  >
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-24 rounded" />
                        <Skeleton className="h-2 w-16 rounded" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-10 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preset D: POS Settings & Configuration */}
        {variant === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {[1, 2].map((card) => (
              <div
                key={card}
                className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-4 shadow-[var(--shadow-sm)] space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-2.5">
                  <div className="space-y-0.5">
                    <Skeleton className="h-4 w-36 rounded-md" />
                    <Skeleton className="h-2.5 w-48 rounded" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded-md" />
                </div>

                <div className="space-y-2.5">
                  {[1, 2].map((field) => (
                    <div key={field} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-28 rounded" />
                        <Skeleton className="h-4 w-8 rounded-full" />
                      </div>
                      <Skeleton className="h-8 w-full rounded-[var(--radius-md)]" />
                    </div>
                  ))}
                </div>

                <div className="pt-1 flex justify-end">
                  <Skeleton className="h-7 w-24 rounded-[var(--radius-md)]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preset E: Generic Data Table */}
        {variant === 'table' && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="p-3 border-b border-[var(--border-strong)] flex items-center justify-between">
              <div className="space-y-0.5">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-2.5 w-40 rounded" />
              </div>
              <Skeleton className="h-7 w-20 rounded-[var(--radius-md)]" />
            </div>

            <div className="divide-y divide-[var(--border-soft)]">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="flex items-center justify-between px-4 py-2.5 relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-7 w-7 rounded-md" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-36 rounded" />
                      <Skeleton className="h-2 w-20 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. Security and Compliance Footer Note (Compact Single Line) */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)] shrink-0 py-0.5">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
        <span>Garantía de integridad transaccional Kódigo Fuente POS Enterprise</span>
      </div>
    </div>
  );
};
