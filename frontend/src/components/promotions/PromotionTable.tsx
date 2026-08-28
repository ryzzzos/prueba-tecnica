import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Tooltip,
  Chip,
  Spinner,
} from '@heroui/react';
import {
  Play,
  Archive,
  Trash2,
  Edit,
  Tag,
  Percent,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { Promotion, PromotionStatus } from '../../types/promotion.types.ts';
import { StatusChip } from './StatusChip.tsx';

interface PromotionTableProps {
  promotions: Promotion[];
  loading: boolean;
  onEdit: (promotion: Promotion) => void;
  onChangeStatus: (id: string, newStatus: PromotionStatus) => void;
  onRequestDelete: (promotion: Promotion) => void;
  actionLoading?: boolean;
}

export const PromotionTable: React.FC<PromotionTableProps> = ({
  promotions,
  loading,
  onEdit,
  onChangeStatus,
  onRequestDelete,
  actionLoading,
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatDiscount = (type: string, value: number | string) => {
    const num = Number(value);
    if (type === 'PERCENTAGE') {
      return (
        <div className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
          <Percent className="w-4 h-4" />
          <span>{num}%</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
        <DollarSign className="w-4 h-4" />
        <span>${num.toLocaleString('es-CO')}</span>
      </div>
    );
  };

  return (
    <div className="bg-[var(--surface-2)] rounded-[var(--radius-xl)] border border-[var(--border-strong)] shadow-sm overflow-hidden">
      <Table
        aria-label="Tabla de gestion de promociones"
        shadow="none"
        classNames={{
          wrapper: 'bg-transparent shadow-none p-0',
          th: 'bg-[var(--surface-3)] text-[var(--text-secondary)] font-semibold text-xs py-3.5 border-b border-[var(--border-soft)]',
          td: 'py-4 border-b border-[var(--border-soft)] text-sm',
        }}
      >
        <TableHeader>
          <TableColumn>PROMOCION</TableColumn>
          <TableColumn>CATEGORIA</TableColumn>
          <TableColumn>DESCUENTO</TableColumn>
          <TableColumn>VIGENCIA</TableColumn>
          <TableColumn>ESTADO</TableColumn>
          <TableColumn className="text-right">ACCIONES</TableColumn>
        </TableHeader>

        <TableBody
          emptyContent={
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Tag className="w-12 h-12 text-[var(--text-muted)] mb-3 opacity-40" />
              <p className="font-semibold text-[var(--text-primary)] text-base">
                No se encontraron promociones
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
                No hay promociones que coincidan con los filtros aplicados o aun no has registrado ninguna.
              </p>
            </div>
          }
          isLoading={loading}
          loadingContent={<Spinner label="Cargando promociones..." size="lg" color="primary" />}
        >
          {promotions.map((promo) => {
            const isProgrammed = promo.status === 'PROGRAMMED';
            const isActive = promo.status === 'ACTIVE';
            const isFinished = promo.status === 'FINISHED';

            return (
              <TableRow key={promo.id} className="hover:bg-[var(--surface-3)]/50 transition-colors">
                {/* 1. Nombre */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-[var(--text-primary)] leading-snug">
                      {promo.name}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      ID: {promo.id.slice(0, 8)}...
                    </span>
                  </div>
                </TableCell>

                {/* 2. Categoria */}
                <TableCell>
                  <Chip size="sm" variant="flat" className="bg-[var(--surface-3)] text-[var(--text-secondary)] font-medium">
                    {promo.category?.name || 'General'}
                  </Chip>
                </TableCell>

                {/* 3. Descuento */}
                <TableCell>{formatDiscount(promo.discountType, promo.discountValue)}</TableCell>

                {/* 4. Vigencia */}
                <TableCell>
                  <div className="flex flex-col text-xs text-[var(--text-secondary)] gap-0.5">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-[var(--text-muted)]">Inicio:</span>
                      <span>{formatDate(promo.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-[var(--text-muted)]">Fin:</span>
                      <span>{formatDate(promo.endDate)}</span>
                    </div>
                  </div>
                </TableCell>

                {/* 5. Estado + Indicador Vigente Hoy */}
                <TableCell>
                  <div className="flex flex-col items-start gap-1.5">
                    <StatusChip status={promo.status} size="sm" />
                    {promo.isValidToday && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Vigente Hoy
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 6. Acciones */}
                <TableCell>
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Boton Activar (Si es Programada) */}
                    {isProgrammed && (
                      <Tooltip content="Activar promocion para el POS" color="success">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          color="success"
                          isDisabled={actionLoading}
                          onClick={() => onChangeStatus(promo.id, 'ACTIVE')}
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-lg"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                      </Tooltip>
                    )}

                    {/* Boton Finalizar (Si es Activa) */}
                    {isActive && (
                      <Tooltip content="Finalizar promocion (Sera inmutable)" color="warning">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          color="warning"
                          isDisabled={actionLoading}
                          onClick={() => onChangeStatus(promo.id, 'FINISHED')}
                          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-lg"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </Button>
                      </Tooltip>
                    )}

                    {/* Boton Editar */}
                    <Tooltip
                      content={
                        isFinished
                          ? 'Una promocion finalizada no puede modificarse'
                          : 'Editar datos de la promocion'
                      }
                    >
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        isDisabled={isFinished || actionLoading}
                        onClick={() => onEdit(promo)}
                        className="bg-[var(--surface-3)] text-[var(--text-secondary)] hover:bg-[var(--surface-0)] rounded-lg disabled:opacity-40"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </Tooltip>

                    {/* Boton Eliminar (Solo Programada) */}
                    <Tooltip
                      content={
                        isProgrammed
                          ? 'Eliminar promocion programada'
                          : 'Solo se pueden eliminar promociones en estado Programada'
                      }
                      color={isProgrammed ? 'danger' : 'default'}
                    >
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="danger"
                        isDisabled={!isProgrammed || actionLoading}
                        onClick={() => onRequestDelete(promo)}
                        className="bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
