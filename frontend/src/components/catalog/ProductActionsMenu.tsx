import React from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { MoreVertical, Edit3, Power, Trash2 } from 'lucide-react';
import { Product } from '../../types/product.types.ts';
import AppIcon from '../ui/AppIcon.tsx';

interface ProductActionsMenuProps {
  product: Product;
  disabled?: boolean;
  onEdit: (product: Product) => void;
  onToggleActive: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductActionsMenu: React.FC<ProductActionsMenuProps> = ({
  product,
  disabled = false,
  onEdit,
  onToggleActive,
  onDelete,
}) => {
  return (
    <Dropdown
      classNames={{
        content:
          'bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] p-1.5 min-w-[170px]',
      }}
    >
      <DropdownTrigger>
        <button
          type="button"
          disabled={disabled}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] focus:outline-none cursor-pointer disabled:opacity-50"
          aria-label="Acciones de producto"
        >
          <AppIcon icon={MoreVertical} size="sm" />
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Opciones de producto"
        onAction={(key) => {
          if (key === 'edit') onEdit(product);
          if (key === 'toggle') onToggleActive(product);
          if (key === 'delete') onDelete(product);
        }}
      >
        <DropdownItem
          key="edit"
          startContent={<AppIcon icon={Edit3} size="xs" className="text-[var(--app-primary)]" />}
          className="rounded-[var(--radius-md)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
        >
          Editar producto
        </DropdownItem>
        <DropdownItem
          key="toggle"
          startContent={
            <AppIcon
              icon={Power}
              size="xs"
              className={product.isActive ? 'text-[var(--color-warnm)]' : 'text-[var(--color-success)]'}
            />
          }
          className="rounded-[var(--radius-md)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
        >
          {product.isActive ? 'Desactivar' : 'Activar'}
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger rounded-[var(--radius-md)] text-xs font-semibold hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
          color="danger"
          startContent={<AppIcon icon={Trash2} size="xs" className="text-rose-600 dark:text-rose-400" />}
        >
          Eliminar
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProductActionsMenu;
