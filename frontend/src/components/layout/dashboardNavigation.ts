import type { LucideIcon } from 'lucide-react';
import {
  Tag,
  Package,
  Store,
  Receipt,
  TrendingUp,
  Settings,
} from 'lucide-react';

export type DashboardSectionId =
  | 'promotions'
  | 'categories'
  | 'pos'
  | 'sales'
  | 'analytics'
  | 'settings';

export interface DashboardNavItem {
  id: DashboardSectionId;
  label: string;
  badge?: string;
  icon: LucideIcon;
  hint?: string;
  isReady: boolean;
}

export interface DashboardNavGroup {
  id: string;
  label: string;
  items: DashboardNavItem[];
}

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    id: 'core',
    label: 'Gestión Comercial',
    items: [
      {
        id: 'promotions',
        label: 'Descuentos',
        icon: Tag,
        hint: 'Reglas de precio y vigencias',
        isReady: true,
      },
      {
        id: 'categories',
        label: 'Catálogo',
        icon: Package,
        hint: 'Productos y categorías',
        isReady: true,
      },
    ],
  },
  {
    id: 'operations',
    label: 'Puntos de Venta (POS)',
    items: [
      {
        id: 'pos',
        label: 'Terminales de Caja',
        badge: 'v2.0',
        icon: Store,
        hint: 'Sincronización en tiempo real',
        isReady: false,
      },
      {
        id: 'sales',
        label: 'Transacciones & Canjes',
        icon: Receipt,
        hint: 'Histórico de ventas con descuento',
        isReady: false,
      },
    ],
  },
  {
    id: 'intelligence',
    label: 'Analítica & Sistema',
    items: [
      {
        id: 'analytics',
        label: 'Impacto Comercial',
        icon: TrendingUp,
        hint: 'Margen y conversión de ofertas',
        isReady: false,
      },
      {
        id: 'settings',
        label: 'Configuración POS',
        icon: Settings,
        hint: 'Parámetros y límites de descuento',
        isReady: false,
      },
    ],
  },
];
