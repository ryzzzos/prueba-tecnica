import React, { useMemo } from 'react';
import {
  Table as HeroTable,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Pagination,
  SortDescriptor,
} from '@heroui/react';
import { Tag } from 'lucide-react';

export interface DataTableColumn<T = unknown> {
  key: string;
  label: string;
  allowsSorting?: boolean;
  align?: 'start' | 'center' | 'end';
  width?: number;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T extends { id: string | number }> {
  columns: DataTableColumn<T>[];
  data: T[];
  renderCell: (item: T, columnKey: React.Key) => React.ReactNode;
  loading?: boolean;
  loadingMessage?: string;
  emptyContent?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  sortDescriptor?: SortDescriptor;
  onSortChange?: (descriptor: SortDescriptor) => void;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  isHeaderSticky?: boolean;
  ariaLabel?: string;
  className?: string;
  topContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  renderCell,
  loading = false,
  loadingMessage = 'Cargando datos...',
  emptyContent,
  emptyTitle = 'No se encontraron resultados',
  emptyDescription = 'No hay registros para mostrar en este momento.',
  sortDescriptor,
  onSortChange,
  page,
  rowsPerPage,
  onPageChange,
  totalItems,
  isHeaderSticky = true,
  ariaLabel = 'Tabla de datos',
  className = '',
  topContent,
  bottomContent,
}: DataTableProps<T>) {
  const totalCount = totalItems !== undefined ? totalItems : data.length;
  const totalPages = rowsPerPage ? Math.ceil(totalCount / rowsPerPage) || 1 : 1;

  // Render bottom content if pagination is enabled and custom bottomContent not provided
  const resolvedBottomContent = useMemo(() => {
    if (bottomContent !== undefined) {
      return bottomContent;
    }

    if (!page || !rowsPerPage || !onPageChange || data.length === 0) {
      return null;
    }

    return (
      <div className="py-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-[var(--border-strong)] bg-[var(--surface-2)]">
        <span className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">
          Mostrando <strong className="text-[var(--text-primary)]">{data.length}</strong> de{' '}
          <strong className="text-[var(--text-primary)]">{totalCount}</strong> registros
        </span>

        {totalPages > 1 && (
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={totalPages}
            onChange={onPageChange}
            classNames={{
              cursor: 'bg-[var(--app-primary)] text-white font-bold',
            }}
          />
        )}
      </div>
    );
  }, [bottomContent, page, rowsPerPage, onPageChange, data.length, totalCount, totalPages]);

  // Default empty content
  const resolvedEmptyContent = useMemo(() => {
    if (emptyContent) {
      return emptyContent;
    }

    return (
      <div className="py-20 flex flex-col items-center justify-center text-center px-4">
        <div className="p-4 rounded-full bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)] mb-4">
          <Tag className="w-8 h-8 text-[var(--text-muted)] opacity-60" />
        </div>
        <p className="font-bold text-[var(--text-primary)] text-base">{emptyTitle}</p>
        <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-sm leading-relaxed">
          {emptyDescription}
        </p>
      </div>
    );
  }, [emptyContent, emptyTitle, emptyDescription]);

  return (
    <div
      className={`rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-md)] overflow-hidden transition-all ${className}`}
    >
      <HeroTable
        aria-label={ariaLabel}
        shadow="none"
        isHeaderSticky={isHeaderSticky}
        sortDescriptor={sortDescriptor}
        onSortChange={onSortChange}
        topContent={topContent}
        bottomContent={resolvedBottomContent}
        classNames={{
          wrapper: 'bg-transparent shadow-none p-0 overflow-x-auto',
          th: 'bg-[var(--surface-3)] text-[var(--text-muted)] font-bold text-xs tracking-wider uppercase py-4 px-6 border-b border-[var(--border-strong)]',
          td: 'py-4.5 px-6 border-b border-[var(--border-soft)] text-sm text-[var(--text-primary)]',
          tr: 'hover:bg-[var(--surface-3)]/60 transition-colors duration-150',
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              allowsSorting={column.allowsSorting}
              className={`${
                column.align === 'end'
                  ? 'text-right'
                  : column.align === 'center'
                    ? 'text-center'
                    : 'text-left'
              } ${column.className || ''}`}
              width={column.width}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          items={data}
          emptyContent={resolvedEmptyContent}
          isLoading={loading}
          loadingContent={<Spinner label={loadingMessage} size="lg" color="primary" />}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </HeroTable>
    </div>
  );
}

export default DataTable;
