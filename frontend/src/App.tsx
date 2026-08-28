import { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { Toaster } from 'sileo';
import {
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { usePromotions } from './hooks/usePromotions.ts';
import { useCategories } from './hooks/useCategories.ts';
import { Navbar } from './components/layout/Navbar.tsx';
import { SummaryKpis } from './components/promotions/SummaryKpis.tsx';
import { PromotionFilters } from './components/promotions/PromotionFilters.tsx';
import { PromotionTable } from './components/promotions/PromotionTable.tsx';
import { PromotionFormModal } from './components/promotions/PromotionFormModal.tsx';
import { DeleteConfirmationModal } from './components/promotions/DeleteConfirmationModal.tsx';
import { Promotion } from './types/promotion.types.ts';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [deletingPromotion, setDeletingPromotion] = useState<Promotion | null>(null);

  const {
    promotions,
    summary,
    filters,
    loading,
    summaryLoading,
    actionLoading,
    setFilters,
    createPromotion,
    updatePromotion,
    changePromotionStatus,
    deletePromotion,
    refetch,
  } = usePromotions();

  const { categories } = useCategories();

  // Dark Mode side effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Handlers
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleOpenCreateModal = () => {
    setEditingPromotion(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPromotion(null);
  };

  const handleRequestDelete = (promotion: Promotion) => {
    setDeletingPromotion(promotion);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPromotion) return;
    const success = await deletePromotion(deletingPromotion.id);
    if (success) {
      setDeletingPromotion(null);
    }
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <div className="min-h-screen bg-[var(--surface-1)] text-[var(--text-primary)] transition-colors flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Physics-based Toast Notification Provider */}
      <Toaster position="top-right" theme={isDarkMode ? 'dark' : 'light'} />

      {/* 1. Header / Navbar */}
      <Navbar
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* 2. Main Dashboard Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Top Action & Status Rail */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Gestion de Promociones
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Supervision de reglas comerciales, estados de vigencia y disponibilidad en puntos de venta.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="flat"
              startContent={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={() => refetch()}
              isDisabled={loading || summaryLoading}
              className="bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border-strong)] rounded-xl shadow-sm"
            >
              Actualizar
            </Button>
          </div>
        </div>

        {/* 4. KPI Metric Cards */}
        <SummaryKpis summary={summary} loading={summaryLoading} />

        {/* 5. Filters Rail */}
        <div className="pt-2">
          <PromotionFilters
            filters={filters}
            categories={categories}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* 6. Promotions Interactive Table */}
        <div className="pt-1">
          <PromotionTable
            promotions={promotions}
            loading={loading}
            onEdit={handleOpenEditModal}
            onChangeStatus={(id, status) => changePromotionStatus(id, status)}
            onRequestDelete={handleRequestDelete}
            actionLoading={actionLoading}
          />
        </div>
      </main>

      {/* 7. Footer */}
      <footer className="border-t border-[var(--border-strong)] bg-[var(--surface-2)]/60 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Kodigo Fuente POS Module - Arquitectura Modular & Design Tokens</span>
          </div>
          <div>
            <span>PostgreSQL + Prisma + Express (Node.js) + React 19 + HeroUI</span>
          </div>
        </div>
      </footer>

      {/* 8. Modals */}
      <PromotionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmitCreate={createPromotion}
        onSubmitUpdate={updatePromotion}
        categories={categories}
        initialData={editingPromotion}
        loading={actionLoading}
      />

      <DeleteConfirmationModal
        isOpen={Boolean(deletingPromotion)}
        onClose={() => setDeletingPromotion(null)}
        onConfirm={handleConfirmDelete}
        promotion={deletingPromotion}
        loading={actionLoading}
      />
    </div>
  );
}
