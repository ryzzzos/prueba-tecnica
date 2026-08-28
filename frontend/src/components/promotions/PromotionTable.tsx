import React, { useMemo, useState } from 'react';
import { Pagination } from '@heroui/react';
import {
  Play,
  Archive,
  Trash2,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { Promotion, PromotionStatus } from '../../types/promotion.types.ts';
import Table, { type TableColumn } from '../ui/Table.tsx';
import Tooltip from '../ui/Tooltip.tsx';

interface PromotionTableProps {
  promotions: Promotion[];
  loading: boolean;
  onEdit: (promotion: Promotion) => void;
  onChangeStatus: (id: string, newStatus: PromotionStatus) => void;
  onRequestDelete: (promotion: Promotion) => void;
  actionLoading?: boolean;
}

const ITEMS_PER_PAGE = 8;

export const PromotionTable: React.FC<PromotionTableProps> = ({
  promotions,
  loading,
  onEdit,
  onChangeStatus,
  onRequestDelete,
  actionLoading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculation
  const totalPages = Math.ceil(promotions.length / ITEMS_PER_PAGE) || 1;
  const paginatedPromotions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return promotions.slice(start, start + ITEMS_PER_PAGE);
  }, [promotions, currentPage]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const isCurrentlyEffective = (startStr: string, endStr: string) => {
    const now = new Date().getTime();
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    return now >= start && now <= end;
  };

  const columns: TableColumn<Promotion>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Promoción',
        className: 'pl-1 min-w-[200px]',
        accessor: (promo) => {
          const effectiveToday =
            promo.status === 'ACTIVE' &&
            isCurrentlyEffective(promo.startDate, promo.endDate);

          return (
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-sm font-bold text-[var(--text-primary)] truncate">
                {promo.name}
              </span>
              {effectiveToday && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Vigente Hoy
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: 'category',
        header: 'Categoría o Producto Asociado',
        className: 'pl-1 min-w-[160px]',
        accessor: (promo) => {
          const isProductScope = promo.scopeType === 'PRODUCT' || (promo.products && promo.products.length > 0) || Boolean(promo.productId);
          
          if (isProductScope) {
            const productsList = promo.products && promo.products.length > 0
              ? promo.products
              : promo.product ? [promo.product] : [];

            if (productsList.length > 1) {
              return (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-[var(--app-primary)] font-bold truncate">
                    {productsList.length} Productos
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] truncate" title={productsList.map((p) => p.name).join(', ')}>
                    {productsList.map((p) => p.name).join(', ')}
                  </span>
                </div>
              );
            }

            return (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[var(--app-primary)] font-semibold truncate">
                  {productsList[0]?.name || promo.product?.name || '1 Producto'}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  Producto puntual
                </span>
              </div>
            );
          }

          // Category scope
          const categoriesList = promo.categories && promo.categories.length > 0
            ? promo.categories
            : promo.category ? [promo.category] : [];

          if (categoriesList.length > 1) {
            return (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[var(--text-secondary)] font-bold truncate">
                  {categoriesList.length} Categorías
                </span>
                <span className="text-[11px] text-[var(--text-muted)] truncate" title={categoriesList.map((c) => c.name).join(', ')}>
                  {categoriesList.map((c) => c.name).join(', ')}
                </span>
              </div>
            );
          }

          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[var(--text-secondary)] font-semibold truncate">
                {categoriesList[0]?.name || promo.category?.name || 'General'}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                Toda la categoría
              </span>
            </div>
          );
        },
      },
      {
        id: 'discount',
        header: 'Descuento',
        className: 'pl-1',
        accessor: (promo) => (
          <span className="text-sm font-bold text-[var(--app-primary)]">
            {promo.discountType === 'PERCENTAGE'
              ? `${promo.discountValue}% OFF`
              : `$${Number(promo.discountValue).toLocaleString('es-CO')}`}
          </span>
        ),
      },
      {
        id: 'validity',
        header: 'Vigencia',
        className: 'pl-1 min-w-[190px]',
        accessor: (promo) => (
          <div className="flex flex-col gap-0.5 text-xs text-[var(--text-secondary)] font-medium">
            <span className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Inicio:</span>{' '}
              {formatDate(promo.startDate)}
            </span>
            <span className="flex items-center gap-1 text-[var(--text-muted)]">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Fin:</span>{' '}
              {formatDate(promo.endDate)}
            </span>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Estado',
        className: 'pl-1',
        accessor: (promo) => {
          if (promo.status === 'PROGRAMMED') {
            return (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-programmed)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-programmed)]" />
                Programada
              </span>
            );
          }
          if (promo.status === 'ACTIVE') {
            return (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-active)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-active)]" />
                Activa
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
              Finalizada
            </span>
          );
        },
      },
    ],
    []
  );

  const renderActions = (promo: Promotion) => {
    const isProgrammed = promo.status === 'PROGRAMMED';
    const isActive = promo.status === 'ACTIVE';
    const isFinished = promo.status === 'FINISHED';

    return (
      <div className="flex items-center justify-end gap-1.5 py-0.5">
        {/* Activar (Solo si es Programada) */}
        {isProgrammed && (
          <Tooltip content="Activar promoción para el POS" side="top">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onChangeStatus(promo.id, 'ACTIVE')}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Activar promoción"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          </Tooltip>
        )}

        {/* Finalizar (Solo si es Activa) */}
        {isActive && (
          <Tooltip content="Finalizar promoción (Inmutable)" side="top">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onChangeStatus(promo.id, 'FINISHED')}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Finalizar promoción"
            >
              <Archive className="w-4 h-4" />
            </button>
          </Tooltip>
        )}

        {/* Editar */}
        <Tooltip
          content={
            isFinished
              ? 'Una promoción finalizada es inmutable'
              : 'Editar datos de la promoción'
          }
          side="top"
        >
          <button
            type="button"
            disabled={isFinished || actionLoading}
            onClick={() => onEdit(promo)}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
            aria-label="Editar promoción"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Eliminar (Solo si es Programada) */}
        <Tooltip
          content={
            isProgrammed
              ? 'Eliminar promoción programada'
              : 'Solo se pueden eliminar promociones en estado Programada'
          }
          side="top"
        >
          <button
            type="button"
            disabled={!isProgrammed || actionLoading}
            onClick={() => onRequestDelete(promo)}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
            aria-label="Eliminar promoción"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-1.5 shadow-[var(--shadow-sm)]">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)]/60 bg-[var(--surface-3)] p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--app-primary)] border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            Cargando promociones del POS...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Table<Promotion>
        columns={columns}
        data={paginatedPromotions}
        keyExtractor={(item) => item.id}
        gridColsClass="grid-cols-[2fr_1.1fr_1.1fr_1.6fr_1.1fr_150px]"
        minWidthClass="min-w-[880px]"
        showActions={true}
        renderActions={renderActions}
        emptyStateMessage="No se encontraron promociones registradas con los filtros actuales."
        emptyStateIcon={Sparkles}
      />

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1">
          <span className="text-xs text-[var(--text-muted)] font-medium">
            Mostrando <strong className="text-[var(--text-primary)]">{paginatedPromotions.length}</strong> de{' '}
            <strong className="text-[var(--text-primary)]">{promotions.length}</strong> promociones
          </span>
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            size="sm"
            color="primary"
            variant="flat"
            showControls
            classNames={{
              wrapper: 'gap-1',
              item: 'rounded-lg text-xs font-semibold bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-strong)]',
              cursor: 'rounded-lg text-xs font-bold bg-[var(--app-primary)] text-white shadow-sm',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PromotionTable;
