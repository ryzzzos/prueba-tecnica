import type { ReactNode } from 'react';
import AppIcon from './AppIcon.tsx';
import type { LucideIcon } from 'lucide-react';

export interface TableColumn<T> {
  id: string;
  header: ReactNode;
  accessor: (item: T, index: number) => ReactNode;
  className?: string; // Optional class for the cell wrapper
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  gridColsClass: string; // e.g. "grid-cols-[1.5fr_1.2fr_1fr_1.8fr_1fr_160px]"
  keyExtractor: (item: T) => string | number;
  emptyStateMessage?: string;
  emptyStateIcon?: LucideIcon;
  showActions?: boolean; // If true, an Actions column header is added.
  renderActions?: (item: T) => ReactNode; // Must be provided if showActions is true
  containerClassName?: string; // Additional classes for the outermost wrapper
  innerContainerClassName?: string; // Classes for the inner surface containing the rows
  minWidthClass?: string; // e.g. "min-w-[800px]", default is "min-w-0"
}

export function Table<T>({
  data,
  columns,
  gridColsClass,
  keyExtractor,
  emptyStateMessage = 'No hay datos para mostrar.',
  emptyStateIcon,
  showActions = false,
  renderActions,
  containerClassName = 'flex-1 min-h-0 flex flex-col',
  innerContainerClassName = 'overflow-hidden',
  minWidthClass = 'min-w-[800px]',
}: TableProps<T>) {
  return (
    <div className={containerClassName}>
      {/* First Surface (Base card container: bg-[var(--surface-3)] subtle contrast, like macOS outer window) */}
      <div className="flex-1 min-h-0 rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-1.5 shadow-[var(--shadow-sm)] flex flex-col">
        {/* Scrollable wrapper inside the card */}
        <div className="flex-1 min-h-0 overflow-x-auto hide-scrollbar flex flex-col">
          {/* Inner content wrapper that enforces min-width */}
          <div className={`flex-1 min-h-0 ${minWidthClass} flex flex-col`}>
            {/* Header Row */}
            <div
              className={`grid ${gridColsClass} items-center text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-5 pb-3 pt-3 select-none shrink-0`}
            >
              {columns.map((col, idx) => {
                const isLast = idx === columns.length - 1;
                const alignmentClass = isLast && !showActions ? 'pr-4 text-right' : 'pl-1';
                return (
                  <div key={col.id} className={col.className || alignmentClass}>
                    {col.header}
                  </div>
                );
              })}
              {showActions && <div className="text-right pr-6">Acciones</div>}
            </div>

            {/* Second Surface (Inner surface: bg-[var(--surface-2)] pure white, like macOS list contents) */}
            <div
              className={`flex-1 min-h-0 rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-2)] divide-y divide-[var(--border-soft)] shadow-[var(--shadow-sm)] flex flex-col ${innerContainerClassName}`}
            >
              {data.length === 0 ? (
                <div className="py-16 text-center text-[var(--text-muted)] font-medium bg-[var(--surface-2)]">
                  {emptyStateIcon && (
                    <AppIcon
                      icon={emptyStateIcon}
                      className="mx-auto mb-3 text-[var(--text-muted)] opacity-40"
                      size="lg"
                    />
                  )}
                  <p className="text-sm font-semibold">{emptyStateMessage}</p>
                </div>
              ) : (
                data.map((item, index) => (
                  <div
                    key={keyExtractor(item)}
                    className={`grid ${gridColsClass} items-center px-5 py-3.5 hover:bg-[var(--surface-3)]/60 transition-colors bg-[var(--surface-2)]`}
                  >
                    {columns.map((col, idx) => {
                      const isLast = idx === columns.length - 1;
                      const alignmentClass = isLast && !showActions ? 'pr-4 text-right' : 'pl-1';
                      return (
                        <div key={col.id} className={col.className || alignmentClass}>
                          {col.accessor(item, index)}
                        </div>
                      );
                    })}
                    {showActions && renderActions && (
                      <div className="pr-4 flex items-center justify-end">
                        {renderActions(item)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Table;
