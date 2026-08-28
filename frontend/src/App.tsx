import { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { Toaster } from 'sileo';
import {
  RefreshCw,
  Store,
  Receipt,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { usePromotions } from './hooks/usePromotions.ts';
import { useCategories } from './hooks/useCategories.ts';
import { useProducts } from './hooks/useProducts.ts';
import { DashboardSidebar } from './components/layout/DashboardSidebar.tsx';
import { DashboardHeader } from './components/layout/DashboardHeader.tsx';
import { DashboardSectionId } from './components/layout/dashboardNavigation.ts';
import { ModuleSkeletonPlaceholder } from './components/layout/ModuleSkeletonPlaceholder.tsx';
import { CatalogPage } from './components/catalog/CatalogPage.tsx';
import { PromotionMetricGrid } from './components/promotions/PromotionMetricGrid.tsx';
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

  const [activeSection, setActiveSection] = useState<DashboardSectionId>('promotions');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const { products } = useProducts();

  // Dark Mode synchronization
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

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
    <div className="min-h-screen bg-[var(--surface-1)] text-[var(--text-primary)] transition-colors flex">
      {/* Sileo Toast Notifications */}
      <Toaster position="top-right" theme={isDarkMode ? 'dark' : 'light'} />

      {/* 1. Left Fixed Sidebar Navigation */}
      <DashboardSidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Application Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header */}
        <DashboardHeader
          activeSection={activeSection}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCreateModal={handleOpenCreateModal}
        />

        {/* Content Container */}
        <main
          className={`flex-1 max-w-[1400px] w-full mx-auto ${
            activeSection === 'promotions' || activeSection === 'categories'
              ? 'p-6 sm:p-8 lg:p-10 space-y-8'
              : 'p-4 sm:p-6 lg:p-7 flex flex-col justify-between min-h-0'
          }`}
        >
          {/* Section A: Promotions Management (Active Module) */}
          {activeSection === 'promotions' && (
            <div className="space-y-8">
              {/* Title and Refresh Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                    Gestión de Promociones
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
                    Supervisión de reglas comerciales, estados de vigencia y disponibilidad en puntos de venta.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="md"
                    variant="flat"
                    startContent={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
                    onClick={() => refetch()}
                    isDisabled={loading || summaryLoading}
                    className="bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] font-semibold h-11 px-4 hover:bg-[var(--surface-3)] transition-all cursor-pointer"
                  >
                    Actualizar
                  </Button>
                </div>
              </div>

              {/* KPI Cards */}
              <PromotionMetricGrid summary={summary} loading={summaryLoading} />

              {/* Filter Bar */}
              <PromotionFilters
                filters={filters}
                categories={categories}
                onFilterChange={setFilters}
                onReset={handleResetFilters}
              />

              {/* Interactive Promotions Table */}
              <PromotionTable
                promotions={promotions}
                loading={loading}
                onEdit={handleOpenEditModal}
                onChangeStatus={(id, status) => changePromotionStatus(id, status)}
                onRequestDelete={handleRequestDelete}
                actionLoading={actionLoading}
              />
            </div>
          )}

          {/* Section B: Catalog & Products Module (1:1 with Citas Services) */}
          {activeSection === 'categories' && <CatalogPage />}

          {/* Section C: POS Terminals (Skeleton Placeholder Module) */}
          {activeSection === 'pos' && (
            <ModuleSkeletonPlaceholder
              title="Terminales y Cajas de Venta POS"
              subtitle="Monitorea las cajas registradoras activas, el estado de sincronización del motor de promociones y la aplicación offline de descuentos en tienda física."
              icon={Store}
              variant="terminals"
              estimatedRelease="Kódigo POS v2.0 - Retail Hardware Sync"
              onGoToPromotions={() => setActiveSection('promotions')}
            />
          )}

          {/* Section D: Sales & Redemptions (Skeleton Placeholder Module) */}
          {activeSection === 'sales' && (
            <ModuleSkeletonPlaceholder
              title="Transacciones y Canjes de Descuento"
              subtitle="Auditoría fiscal en tiempo real de cada ticket emitido con descuentos porcentuales y montos fijos aplicados por cajero."
              icon={Receipt}
              variant="transactions"
              estimatedRelease="Kódigo POS v2.0 - Fiscal Audit Ledger"
              onGoToPromotions={() => setActiveSection('promotions')}
            />
          )}

          {/* Section E: Analytics & Impact (Skeleton Placeholder Module) */}
          {activeSection === 'analytics' && (
            <ModuleSkeletonPlaceholder
              title="Impacto Comercial y Conversión"
              subtitle="Métricas de elasticidad de precios, productos más vendidos bajo descuento y rentabilidad por departamento."
              icon={TrendingUp}
              variant="analytics"
              estimatedRelease="Kódigo POS v2.0 - Business Analytics Suite"
              onGoToPromotions={() => setActiveSection('promotions')}
            />
          )}

          {/* Section F: POS Settings (Skeleton Placeholder Module) */}
          {activeSection === 'settings' && (
            <ModuleSkeletonPlaceholder
              title="Configuración y Reglas Globales"
              subtitle="Límites de descuento por cajero supervisor, políticas de acumulación de ofertas y claves de API de integración."
              icon={Settings}
              variant="settings"
              estimatedRelease="Kódigo POS v2.0 - Enterprise Admin"
              onGoToPromotions={() => setActiveSection('promotions')}
            />
          )}
        </main>
      </div>

      {/* 3. Global Modals */}
      <PromotionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmitCreate={createPromotion}
        onSubmitUpdate={updatePromotion}
        categories={categories}
        products={products}
        promotions={promotions}
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
