import React from 'react';
import { LayoutGrid, Package } from 'lucide-react';
import AppIcon from '../ui/AppIcon.tsx';
import { Product } from '../../types/product.types.ts';
import { Category } from '../../types/promotion.types.ts';
import ProductActionsMenu from './ProductActionsMenu.tsx';

interface CatalogListProps {
  products: Product[];
  disabled?: boolean;
  viewMode: 'grid' | 'list';
  onEdit: (product: Product) => void;
  onToggleActive: (product: Product) => void;
  onDelete: (product: Product) => void;
  categories: Category[];
}

function formatPrice(value: number | string): string {
  const num = Number(value);
  return `$${num.toLocaleString('es-CO')}`;
}

function ProductThumbnail({ product }: { product: Product }) {
  if (!product.imageUrl) {
    return (
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-1)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] border border-[var(--border-strong)]"
        aria-label="Sin imagen"
      >
        <AppIcon icon={Package} size="sm" className="text-[var(--text-muted)] opacity-50" />
      </div>
    );
  }

  return (
    <img
      src={product.imageUrl}
      alt={`Imagen ${product.name}`}
      className="h-12 w-12 shrink-0 rounded-xl object-cover border border-[var(--border-strong)]"
      loading="lazy"
    />
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-[var(--shadow-sm)] ${
        active
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : 'border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text-muted)]'
      }`}
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
  );
}

export const CatalogList: React.FC<CatalogListProps> = ({
  products,
  disabled = false,
  viewMode,
  onEdit,
  onToggleActive,
  onDelete,
  categories,
}) => {
  return (
    <section className="flex flex-col gap-4">
      {viewMode === 'list' ? (
        /* List View */
        <div className="flex flex-col gap-2.5">
          {products.map((product) => {
            const category = categories.find((c) => c.id === product.categoryId) || product.category;
            return (
              <article
                key={product.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-3.5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <ProductThumbnail product={product} />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)] truncate">
                        {product.name}
                      </h3>
                      <StatusBadge active={product.isActive} />
                      {category && (
                        <span className="inline-flex items-center rounded-md border border-[var(--border-strong)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]">
                          {category.name}
                        </span>
                      )}
                      {product.sku && (
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">
                          SKU: {product.sku}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-1">
                      {product.description || 'Sin descripción disponible.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pl-16 sm:pl-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Precio Base
                    </span>
                    <span className="text-sm font-black text-[var(--app-primary)]">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <div className="h-8 w-[1px] bg-[var(--border-strong)] hidden sm:block" />

                  <ProductActionsMenu
                    product={product}
                    disabled={disabled}
                    onEdit={onEdit}
                    onToggleActive={onToggleActive}
                    onDelete={onDelete}
                  />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const category = categories.find((c) => c.id === product.categoryId) || product.category;
            return (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] hover:border-blue-500/30"
              >
                {/* Image header */}
                <div className="relative aspect-[16/10] w-full bg-[var(--surface-1)] overflow-hidden border-b border-[var(--border-strong)]">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-1)]">
                      <AppIcon icon={LayoutGrid} className="text-[var(--border-strong)]" size="lg" />
                    </div>
                  )}

                  <div className="absolute left-3 top-3 z-10">
                    <StatusBadge active={product.isActive} />
                  </div>

                  <div className="absolute right-3 top-3 z-10 rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)]/80 p-0.5 shadow-sm backdrop-blur-md">
                    <ProductActionsMenu
                      product={product}
                      disabled={disabled}
                      onEdit={onEdit}
                      onToggleActive={onToggleActive}
                      onDelete={onDelete}
                    />
                  </div>
                </div>

                {/* Content body */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)] line-clamp-1">
                      {product.name}
                    </h3>
                  </div>

                  {category && (
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-md border border-[var(--border-strong)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]">
                        {category.name}
                      </span>
                    </div>
                  )}

                  <p className="mt-2 flex-1 text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {product.description || 'Sin descripción disponible.'}
                  </p>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border-soft)]">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        {product.sku ? `SKU: ${product.sku}` : 'Retail'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-[var(--app-primary)]">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CatalogList;
