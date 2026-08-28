import React from 'react';
import { Menu, Plus, Sparkles } from 'lucide-react';
import { Button } from '@heroui/react';
import { AnimatedThemeToggler } from '../ui/AnimatedThemeToggler.tsx';
import { type DashboardSectionId, DASHBOARD_NAV_GROUPS } from './dashboardNavigation.ts';
import AppIcon from '../ui/AppIcon.tsx';
import Tooltip from '../ui/Tooltip.tsx';

interface DashboardHeaderProps {
  activeSection: DashboardSectionId;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenMobileMenu: () => void;
  onOpenCreateModal: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeSection,
  isDarkMode,
  onToggleTheme,
  onOpenMobileMenu,
  onOpenCreateModal,
}) => {
  // Find active nav item details
  let activeTitle = 'Promociones';
  let activeSubtitle = 'Supervisión de reglas comerciales y vigencias';

  for (const group of DASHBOARD_NAV_GROUPS) {
    const item = group.items.find((i) => i.id === activeSection);
    if (item) {
      activeTitle = item.label;
      activeSubtitle = item.hint || activeSubtitle;
      break;
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border-strong)] bg-[var(--surface-2)]/80 backdrop-blur-glass shadow-[var(--shadow-sm)]">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile trigger & breadcrumb */}
        <div className="flex items-center gap-3">
          <Tooltip content="Abrir menú de navegación" side="bottom">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="h-5 w-5" />
            </button>
          </Tooltip>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider hidden sm:inline">
                Kódigo POS
              </span>
              <span className="text-xs text-[var(--text-muted)] hidden sm:inline">/</span>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-[var(--text-primary)]">
                {activeTitle}
              </h1>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] hidden md:block mt-0.5">
              {activeSubtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions (Theme toggler & Create button) */}
        <div className="flex items-center gap-3">
          {/* Live POS Status Pill */}
          <Tooltip content="Motor de reglas activo y sincronizado en tiempo real" side="bottom">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] text-[11px] font-medium text-[var(--text-secondary)] cursor-help">
              <AppIcon icon={Sparkles} size="xs" className="text-blue-500" />
              <span>Motor Reglas v1.0</span>
            </div>
          </Tooltip>

          {/* Theme toggler */}
          <Tooltip content={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} side="bottom">
            <AnimatedThemeToggler isDarkMode={isDarkMode} onToggle={onToggleTheme} />
          </Tooltip>

          {/* Primary Action Button */}
          <Button
            size="sm"
            onClick={onOpenCreateModal}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md shadow-blue-500/20 rounded-[var(--radius-md)] px-3.5 h-9"
            startContent={<Plus className="w-4 h-4 text-white" />}
          >
            Nueva Promoción
          </Button>
        </div>
      </div>
    </header>
  );
};
