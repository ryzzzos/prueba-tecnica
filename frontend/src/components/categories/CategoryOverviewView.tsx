import React from 'react';
import { Button, Chip } from '@heroui/react';
import { Layers, Tag, ArrowRight, FolderCheck, Plus, Sparkles } from 'lucide-react';
import { Category, Promotion } from '../../types/promotion.types.ts';
import AppIcon from '../ui/AppIcon.tsx';
import { NumberTicker } from '../ui/NumberTicker.tsx';

interface CategoryOverviewViewProps {
  categories: Category[];
  promotions: Promotion[];
  onSelectCategoryFilter: (categoryId: string) => void;
  onOpenCreateModal: () => void;
}

export const CategoryOverviewView: React.FC<CategoryOverviewViewProps> = ({
  categories,
  promotions,
  onSelectCategoryFilter,
  onOpenCreateModal,
}) => {
  // Compute category statistics from real data
  const totalCategories = categories.length;
  const categoriesWithPromos = categories.filter((cat) =>
    promotions.some((p) => p.categoryId === cat.id)
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-primary)_8%,var(--surface-2)),var(--surface-2))] p-6 sm:p-8 shadow-[var(--shadow-md)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[linear-gradient(135deg,#1d4ed8,#9333ea)] text-white shadow-md shadow-blue-600/25">
              <AppIcon icon={Layers} size="lg" className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-3 h-3" />
                  Catálogo Oficial
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mt-1.5">
                Categorías y Familias de Productos
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
                Supervisa el alcance comercial de las promociones asignadas a cada departamento y grupo de productos del punto de venta.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={onOpenCreateModal}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-sm rounded-[var(--radius-md)]"
              startContent={<Plus className="w-3.5 h-3.5 text-white" />}
            >
              Crear Promoción
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-primary)_6%,var(--surface-2)),var(--surface-2))] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--app-primary)] text-white shadow-sm">
              <AppIcon icon={Layers} size="sm" className="text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              Registradas
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Total Categorías
            </span>
            <div className="mt-0.5 text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
              <NumberTicker value={totalCategories} />
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-success)_6%,var(--surface-2)),var(--surface-2))] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-success)] text-white shadow-sm">
              <AppIcon icon={FolderCheck} size="sm" className="text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Con Cobertura
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Con Promociones Activas
            </span>
            <div className="mt-0.5 text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
              <NumberTicker value={categoriesWithPromos} />
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-accent-purple)_6%,var(--surface-2)),var(--surface-2))] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--app-accent-purple)] text-white shadow-sm">
              <AppIcon icon={Tag} size="sm" className="text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
              En Catálogo
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Total Promociones
            </span>
            <div className="mt-0.5 text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
              <NumberTicker value={promotions.length} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((category) => {
          const categoryPromos = promotions.filter((p) => p.categoryId === category.id);
          const activePromos = categoryPromos.filter((p) => p.status === 'ACTIVE').length;
          const programmedPromos = categoryPromos.filter((p) => p.status === 'PROGRAMMED').length;

          return (
            <div
              key={category.id}
              className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:border-blue-500/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                      <AppIcon icon={Layers} size="xs" className="text-white" />
                    </div>
                    <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)] line-clamp-1">
                      {category.name}
                    </h3>
                  </div>

                  <Chip
                    size="sm"
                    variant="flat"
                    className="text-[10px] font-bold uppercase tracking-wider bg-[var(--surface-3)] text-[var(--text-secondary)]"
                  >
                    {categoryPromos.length} promos
                  </Chip>
                </div>

                <p className="mt-3 text-xs text-[var(--text-muted)] leading-relaxed min-h-[36px] line-clamp-2">
                  {category.description || 'Categoría de productos disponible para campañas y reglas de descuento.'}
                </p>

                {/* Sub-breakdown badges */}
                <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[var(--border-soft)]">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {activePromos} activas
                  </span>
                  <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                    {programmedPromos} programadas
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-[var(--border-soft)]">
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => onSelectCategoryFilter(category.id)}
                  className="w-full justify-between text-xs font-semibold text-[var(--app-primary)] hover:bg-[var(--surface-3)] rounded-[var(--radius-sm)] px-2"
                  endContent={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Filtrar promociones en tabla
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
