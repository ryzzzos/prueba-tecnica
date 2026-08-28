import React from 'react';
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Chip,
} from '@heroui/react';
import { Tag, Plus, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  onToggleTheme,
  onOpenCreateModal,
}) => {
  return (
    <HeroNavbar
      maxWidth="full"
      isBordered
      className="bg-[var(--surface-2)]/90 backdrop-blur-md border-b border-[var(--border-strong)] sticky top-0 z-40 transition-colors"
    >
      <NavbarBrand className="gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md text-white">
          <Tag className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-[var(--text-primary)] tracking-tight">
              Kodigo Fuente
            </span>
            <Chip size="sm" variant="flat" color="primary" className="text-xs font-semibold">
              POS Promotions
            </Chip>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-medium">
            Modulo de Gestion y Control de Vigencia
          </span>
        </div>
      </NavbarBrand>

      <NavbarContent justify="end" className="gap-3">
        <NavbarItem>
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            aria-label="Alternar tema claro y oscuro"
            onClick={onToggleTheme}
            className="bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-soft)] hover:bg-[var(--surface-0)]"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </Button>
        </NavbarItem>

        <NavbarItem>
          <Button
            color="primary"
            size="md"
            startContent={<Plus className="w-4 h-4 text-white" />}
            onClick={onOpenCreateModal}
            className="font-semibold shadow-md bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
          >
            <span className="hidden sm:inline">Nueva Promocion</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </NavbarItem>
      </NavbarContent>
    </HeroNavbar>
  );
};
