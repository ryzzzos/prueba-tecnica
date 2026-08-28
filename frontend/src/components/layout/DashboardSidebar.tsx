import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DASHBOARD_NAV_GROUPS,
  type DashboardNavItem,
  type DashboardSectionId,
} from './dashboardNavigation.ts';
import BrandLogo from '../ui/BrandLogo.tsx';
import AppIcon from '../ui/AppIcon.tsx';
import Tooltip from '../ui/Tooltip.tsx';

interface DashboardSidebarProps {
  activeSection: DashboardSectionId;
  onSelectSection: (section: DashboardSectionId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function BadgeMark({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative z-10 h-2 w-2 rounded-full transition-all duration-300 ${
        active
          ? 'bg-[var(--app-primary)] shadow-[0_0_12px_var(--app-primary)] scale-125'
          : 'bg-[var(--surface-0)] dark:bg-[var(--surface-3)]'
      }`}
    />
  );
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeSection,
  onSelectSection,
  mobileOpen,
  onCloseMobile,
}) => {
  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5 select-none">
      {/* 1. Header / Logo */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <BrandLogo size={36} />
          {/* Mobile close button */}
          <Tooltip content="Cerrar menú lateral" side="bottom">
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label="Cerrar barra lateral"
            >
              <X className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>

        {/* 2. Navigation Groups */}
        <nav aria-label="Navegación principal" className="space-y-5">
          {DASHBOARD_NAV_GROUPS.map((group) => (
            <div key={group.id} className="space-y-1.5">
              <h2 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                {group.label}
              </h2>
              <ul className="space-y-1">
                {group.items.map((item: DashboardNavItem) => {
                  const active = activeSection === item.id;
                  const ItemIcon = item.icon;

                  return (
                    <li key={item.id}>
                      <Tooltip content={item.hint || item.label} side="right" className="w-full">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSection(item.id);
                            onCloseMobile();
                          }}
                          aria-current={active ? 'page' : undefined}
                          className={`group relative flex w-full min-h-11 items-center justify-between gap-3 rounded-[var(--radius-md)] px-3 py-2 text-left transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] cursor-pointer ${
                            active
                              ? 'text-[var(--text-primary)] font-semibold'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {/* Active Indicator Backdrop */}
                          {active && (
                            <motion.div
                              layoutId="sidebar-active-indicator"
                              className="absolute inset-0 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)]"
                              initial={false}
                              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                            />
                          )}

                          <span className="relative z-10 flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-all duration-300 ${
                                active
                                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-sm'
                                  : 'bg-[var(--surface-1)] dark:bg-[var(--surface-3)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                              }`}
                            >
                              <AppIcon
                                icon={ItemIcon}
                                size="sm"
                                className={active ? 'text-white' : ''}
                              />
                            </div>

                            <span className="min-w-0">
                              <span className="block truncate text-xs font-semibold">
                                {item.label}
                              </span>
                              {item.hint && (
                                <span className="block truncate text-[10px] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]">
                                  {item.hint}
                                </span>
                              )}
                            </span>
                          </span>

                          <div className="relative z-10 flex items-center gap-1.5">
                            {item.badge && !active && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                  item.isReady
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                            <BadgeMark active={active} />
                          </div>
                        </button>
                      </Tooltip>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* 3. System Connection Status Badge */}
      <Tooltip content="Conexión activa con base de datos y terminales POS" side="top" className="w-full">
        <div className="mt-6 w-full rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-primary)_6%,var(--surface-3)),var(--surface-3))] p-3 shadow-[var(--shadow-sm)] cursor-help">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold tracking-tight text-[var(--text-primary)]">
              Motor POS Conectado
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[var(--text-muted)] leading-relaxed">
            PostgreSQL + Prisma Sync en tiempo real con terminales de venta.
          </p>
        </div>
      </Tooltip>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside
        aria-label="Barra lateral del sistema"
        className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 border-r border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-sm)]"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/70"
            />

            {/* Slide-in Menu */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-[var(--surface-2)] shadow-2xl border-r border-[var(--border-strong)]"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardSidebar;
