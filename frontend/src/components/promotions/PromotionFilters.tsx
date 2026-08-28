import React from 'react';
import { Input, Select, SelectItem, Button } from '@heroui/react';
import { Search, FilterX, Layers, Activity } from 'lucide-react';
import { Category, PromotionFilterParams, PromotionStatus } from '../../types/promotion.types.ts';

interface PromotionFiltersProps {
  filters: PromotionFilterParams;
  categories: Category[];
  onFilterChange: (newFilters: PromotionFilterParams) => void;
  onReset: () => void;
}

export const PromotionFilters: React.FC<PromotionFiltersProps> = ({
  filters,
  categories,
  onFilterChange,
  onReset,
}) => {
  const hasActiveFilters = Boolean(filters.search || filters.status || filters.categoryId);

  return (
    <div className="bg-[var(--surface-2)] p-4 rounded-[var(--radius-xl)] border border-[var(--border-strong)] shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
      <div className="w-full md:w-80">
        <Input
          placeholder="Buscar por nombre o categoria..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          startContent={<Search className="w-4 h-4 text-[var(--text-muted)]" />}
          size="sm"
          variant="bordered"
          className="w-full"
          classNames={{
            inputWrapper: 'bg-[var(--surface-3)] border-[var(--border-soft)] hover:border-[var(--border-strong)]',
          }}
        />
      </div>

      <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
        <div className="w-44">
          <Select
            placeholder="Todos los estados"
            selectedKeys={filters.status ? [filters.status] : []}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: (e.target.value as PromotionStatus) || undefined,
              })
            }
            size="sm"
            variant="bordered"
            startContent={<Activity className="w-3.5 h-3.5 text-[var(--text-muted)] mr-1" />}
            classNames={{
              trigger: 'bg-[var(--surface-3)] border-[var(--border-soft)]',
            }}
          >
            <SelectItem key="PROGRAMMED" textValue="Programadas">
              Programadas
            </SelectItem>
            <SelectItem key="ACTIVE" textValue="Activas">
              Activas
            </SelectItem>
            <SelectItem key="FINISHED" textValue="Finalizadas">
              Finalizadas
            </SelectItem>
          </Select>
        </div>

        <div className="w-52">
          <Select
            placeholder="Todas las categorias"
            selectedKeys={filters.categoryId ? [filters.categoryId] : []}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                categoryId: e.target.value || undefined,
              })
            }
            size="sm"
            variant="bordered"
            startContent={<Layers className="w-3.5 h-3.5 text-[var(--text-muted)] mr-1" />}
            classNames={{
              trigger: 'bg-[var(--surface-3)] border-[var(--border-soft)]',
            }}
          >
            {categories.map((cat) => (
              <SelectItem key={cat.id} textValue={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            size="sm"
            variant="flat"
            color="danger"
            startContent={<FilterX className="w-3.5 h-3.5" />}
            onClick={onReset}
            className="rounded-lg"
          >
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
};
