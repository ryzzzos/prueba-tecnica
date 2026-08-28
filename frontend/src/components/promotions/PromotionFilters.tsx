import React from 'react';
import { Button } from '@heroui/react';
import { Search, FilterX, Layers, Activity } from 'lucide-react';
import { Category, PromotionFilterParams, PromotionStatus } from '../../types/promotion.types.ts';
import Input from '../ui/Input.tsx';
import CustomSelect from '../ui/CustomSelect.tsx';

interface PromotionFiltersProps {
  filters: PromotionFilterParams;
  categories: Category[];
  onFilterChange: (newFilters: PromotionFilterParams) => void;
  onReset: () => void;
}

const STATUS_OPTIONS: Array<{ value: PromotionStatus | ''; label: string }> = [
  { value: '', label: 'Todos los estados' },
  { value: 'PROGRAMMED', label: 'Programadas' },
  { value: 'ACTIVE', label: 'Activas' },
  { value: 'FINISHED', label: 'Finalizadas' },
];

export const PromotionFilters: React.FC<PromotionFiltersProps> = ({
  filters,
  categories,
  onFilterChange,
  onReset,
}) => {
  const hasActiveFilters = Boolean(filters.search || filters.status || filters.categoryId);

  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  return (
    <div className="bg-[var(--surface-2)] p-5 sm:p-6 rounded-[var(--radius-2xl)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)] flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between transition-all">
      {/* Search Input */}
      <div className="w-full lg:max-w-md">
        <Input
          id="promotions-search-input"
          placeholder="Buscar por nombre de promoción..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          startContent={<Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
          className="w-full"
        />
      </div>

      {/* Select Filters & Clear Button */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
        {/* Status Select with Glass variant */}
        <div className="w-full sm:w-52">
          <CustomSelect<PromotionStatus | ''>
            id="promotions-status-filter"
            value={filters.status || ''}
            options={STATUS_OPTIONS}
            onChange={(val) =>
              onFilterChange({
                ...filters,
                status: (val as PromotionStatus) || undefined,
              })
            }
            icon={Activity}
            variant="glass"
            size="md"
            placeholder="Todos los estados"
            className="w-full"
          />
        </div>

        {/* Category Select with Glass variant */}
        <div className="w-full sm:w-60">
          <CustomSelect<string>
            id="promotions-category-filter"
            value={filters.categoryId || ''}
            options={categoryOptions}
            onChange={(val) =>
              onFilterChange({
                ...filters,
                categoryId: val || undefined,
              })
            }
            icon={Layers}
            variant="glass"
            size="md"
            placeholder="Todas las categorías"
            className="w-full"
          />
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            size="md"
            variant="flat"
            color="danger"
            startContent={<FilterX className="w-4 h-4" />}
            onClick={onReset}
            className="h-11 px-4 rounded-[var(--radius-lg)] font-semibold shadow-sm shrink-0"
          >
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
};
