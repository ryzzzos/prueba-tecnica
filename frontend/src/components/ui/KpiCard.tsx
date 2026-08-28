import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@heroui/react';
import AppIcon from './AppIcon.tsx';
import Tooltip from './Tooltip.tsx';
import { NumberTicker } from './NumberTicker.tsx';

export interface KpiCardProps {
  title: string;
  value: string | number;
  previousValue?: number; // Optional: used to calculate progress bar automatically
  icon: LucideIcon;
  iconBgClass: string;
  loading?: boolean;

  // Dynamic Trend options
  trendDelta?: number;
  trendInvert?: boolean;
  trendPct?: number;
  trendColorClass?: string;

  // Progress Bar options
  showProgressBar?: boolean;
  barColorClass?: string;
  period?: string; // "week" | "month" | "year"

  // Tooltip options
  tooltipText?: string;
  tooltipTarget?: 'title' | 'bar';

  // Context & Custom options
  badgeText?: string;
  badgeClass?: string;
  animateNumber?: boolean;
}

const formatCurrency = (val: number) => {
  return '$' + Number(val).toLocaleString('es-CO');
};

export function KpiCard({
  title,
  value,
  previousValue,
  icon,
  iconBgClass,
  loading = false,
  trendDelta,
  trendInvert = false,
  trendPct,
  trendColorClass,
  showProgressBar = false,
  barColorClass = 'bg-[var(--app-primary)]',
  period,
  tooltipText,
  tooltipTarget,
  badgeText,
  badgeClass,
  animateNumber = true,
}: KpiCardProps) {
  // Determine standard trend icon dynamically based on percentage/delta value
  const trendValue = trendDelta !== undefined ? trendDelta : trendPct !== undefined ? trendPct : 0;
  const isPositive = trendValue > 0;
  const isNegative = trendValue < 0;
  const isNeutral = trendValue === 0;

  const calculatedTrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  // Determine trend color dynamically
  const calculatedTrendColorClass = (() => {
    if (trendColorClass) return trendColorClass;
    if (isNeutral) return 'text-[var(--text-muted)]';
    const isGood = trendInvert ? !isPositive : isPositive;
    return isGood ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]';
  })();

  // Automatically calculate barValue internally
  const barValue = (() => {
    if (!showProgressBar) return 0;

    if (previousValue !== undefined) {
      const currentValueNum =
        typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      if (isNaN(currentValueNum)) return 0;
      return previousValue > 0
        ? Math.min(100, Math.round((currentValueNum / previousValue) * 100))
        : currentValueNum > 0
          ? 100
          : 0;
    }

    if (trendDelta !== undefined) {
      return Math.min(100, Math.max(0, 100 + trendDelta));
    }

    if (trendPct !== undefined) {
      return Math.min(100, Math.max(0, trendPct));
    }

    return 0;
  })();

  // Automatically generate dynamic tooltip text for the bottom progress bar
  const generatedBarTooltipText = (() => {
    if (!showProgressBar) return undefined;

    const periodLabel =
      period === 'week'
        ? 'esta semana'
        : period === 'month'
          ? 'este mes'
          : period === 'year'
            ? 'este año'
            : 'este periodo';
    const prevPeriodLabel =
      period === 'week'
        ? 'la semana anterior'
        : period === 'month'
          ? 'el mes anterior'
          : period === 'year'
            ? 'el año anterior'
            : 'el total del catálogo';

    if (previousValue !== undefined) {
      return `${title}: ${value} respecto a ${previousValue} (${prevPeriodLabel}).`;
    }

    if (trendDelta !== undefined) {
      const currentValueNum =
        typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      if (!isNaN(currentValueNum)) {
        const prevVal =
          trendDelta === -100 ? 0 : Math.round(currentValueNum / (1 + trendDelta / 100));
        const isQty = title.toLowerCase().includes('promociones');
        const prevStr = isQty ? String(prevVal) : formatCurrency(prevVal);
        return `${title} de ${periodLabel} vs. ${prevPeriodLabel} (${value} vs. ${prevStr}).`;
      }
    }

    return undefined;
  })();

  const renderAnimatedValue = () => {
    if (!animateNumber) return value;

    if (typeof value === 'number') {
      return <NumberTicker value={value} />;
    }

    const stringValue = String(value);
    const match = stringValue.match(/\d[\d,]*(?:\.\d+)?/);

    if (!match || match.index === undefined) {
      return value;
    }

    const numericToken = match[0];
    const numericValue = Number(numericToken.replace(/,/g, ''));

    if (Number.isNaN(numericValue)) {
      return value;
    }

    const decimalPlaces = numericToken.includes('.') ? numericToken.split('.')[1].length : 0;

    const prefix = stringValue.slice(0, match.index);
    const suffix = stringValue.slice(match.index + numericToken.length);

    return (
      <>
        {prefix}
        <NumberTicker value={numericValue} decimalPlaces={decimalPlaces} />
        {suffix}
      </>
    );
  };

  return (
    <article className="group relative flex flex-col justify-between rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-5 sm:p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-1">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Left Side: Icon & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div
            className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-[var(--radius-xl)] ${iconBgClass} text-white shadow-sm shrink-0`}
          >
            <AppIcon icon={icon} size="md" className="h-5 w-5 text-white" />
          </div>

          {tooltipTarget === 'title' && tooltipText ? (
            <Tooltip content={tooltipText} side="top">
              <p className="cursor-help border-b border-dashed border-[var(--border-strong)] pb-0.5 text-xs sm:text-sm font-bold text-[var(--text-secondary)] truncate">
                {title}
              </p>
            </Tooltip>
          ) : (
            <p className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] line-clamp-2 leading-tight sm:truncate flex-1 min-w-0">
              {title}
            </p>
          )}
        </div>

        {/* Right Side: Badge / Pill or Trend Percentage */}
        {badgeText ? (
          <span
            className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 shadow-sm ${
              badgeClass || 'bg-[var(--surface-3)] text-[var(--text-secondary)]'
            }`}
          >
            {badgeText}
          </span>
        ) : (
          (trendDelta !== undefined || trendPct !== undefined) && (
            <div
              className={`flex items-center gap-1 text-xs sm:text-sm font-bold shrink-0 ${calculatedTrendColorClass}`}
            >
              <AppIcon icon={calculatedTrendIcon} size="sm" className="h-3.5 w-3.5" />
              <span>
                {animateNumber ? (
                  <NumberTicker value={Math.abs(trendValue)} />
                ) : (
                  `${trendValue > 0 ? '+' : ''}${trendValue}`
                )}
                %
              </span>
            </div>
          )
        )}
      </div>

      {/* Card Content & Progress Bar */}
      <div className="mt-3 sm:mt-4">
        {loading ? (
          <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
        ) : (
          <p className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--text-primary)]">
            {renderAnimatedValue()}
          </p>
        )}

        {showProgressBar && (
          <div className="mt-3">
            {generatedBarTooltipText ? (
              <Tooltip content={generatedBarTooltipText} side="bottom" className="w-full">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--surface-3)] cursor-help">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${barColorClass}`}
                    style={{ width: `${barValue}%` }}
                  />
                </div>
              </Tooltip>
            ) : (
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${barColorClass}`}
                  style={{ width: `${barValue}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default KpiCard;
