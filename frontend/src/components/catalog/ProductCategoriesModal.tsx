import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Pencil, Trash2, Layers, Check, X } from 'lucide-react';
import { sileo } from 'sileo';
import { Category } from '../../types/promotion.types.ts';
import AppIcon from '../ui/AppIcon.tsx';

interface ProductCategoriesModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  loading: boolean;
  onCreateCategory: (data: { name: string; description?: string }) => Promise<Category>;
  onUpdateCategory: (id: string, data: { name?: string; description?: string | null }) => Promise<Category>;
  onDeleteCategory: (id: string) => Promise<boolean>;
}

export const ProductCategoriesModal: React.FC<ProductCategoriesModalProps> = ({
  open,
  onClose,
  categories,
  loading,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [savingAction, setSavingAction] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSavingAction(true);
    try {
      await onCreateCategory({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
      });
      sileo.success({
        title: 'Categoría Creada',
        description: `La categoría "${newName.trim()}" se guardó correctamente.`,
      });
      setNewName('');
      setNewDesc('');
    } catch (err) {
      sileo.error({
        title: 'Error al crear categoría',
        description: err instanceof Error ? err.message : 'Inténtalo de nuevo.',
      });
    } finally {
      setSavingAction(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent, cat: Category) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setSavingAction(true);
    try {
      await onUpdateCategory(cat.id, { name: editName.trim() });
      sileo.success({
        title: 'Categoría Actualizada',
        description: `Se renombró a "${editName.trim()}".`,
      });
      setEditingId(null);
      setEditName('');
    } catch (err) {
      sileo.error({
        title: 'Error al actualizar categoría',
        description: err instanceof Error ? err.message : 'Inténtalo de nuevo.',
      });
    } finally {
      setSavingAction(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const confirmed = window.confirm(
      `¿Deseas eliminar la categoría "${cat.name}"? Los productos asociados pasarán a "Sin categoría".`
    );
    if (!confirmed) return;

    setSavingAction(true);
    try {
      await onDeleteCategory(cat.id);
      sileo.success({
        title: 'Categoría Eliminada',
        description: `La categoría "${cat.name}" fue eliminada.`,
      });
    } catch (err) {
      sileo.error({
        title: 'Error al eliminar categoría',
        description: err instanceof Error ? err.message : 'Inténtalo de nuevo.',
      });
    } finally {
      setSavingAction(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="categories-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            role="presentation"
            className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm dark:bg-black/60"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="categories-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="pointer-events-auto fixed right-0 top-0 bottom-0 z-[100] flex w-[92vw] max-w-[460px] h-full flex-col overflow-hidden rounded-l-[var(--radius-2xl)] border-l border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-lg)]"
            aria-hidden={!open}
          >
            {/* Header */}
            <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-2)] px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-3)] active:scale-95 cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
                </button>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-primary)]">
                    Catálogo
                  </p>
                  <h2 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
                    Categorías de Productos
                  </h2>
                </div>
              </div>
            </header>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Add Category Form Card */}
              <section className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--app-primary)] text-white">
                    <AppIcon icon={Layers} size="xs" className="text-white" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Añadir Nueva Categoría
                  </h3>
                </div>

                <form onSubmit={handleCreate} className="space-y-3 pt-1">
                  <input
                    id="new-category-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej. Cuidado Personal, Panadería..."
                    className="w-full rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--app-primary)] focus:outline-none"
                  />
                  <input
                    id="new-category-description"
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Descripción opcional..."
                    className="w-full rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2.5 text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--app-primary)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newName.trim() || savingAction}
                    className="w-full h-10 rounded-[var(--radius-lg)] bg-[linear-gradient(135deg,#1d4ed8,#2563eb)] hover:brightness-110 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {savingAction ? 'Guardando...' : 'Crear Categoría'}
                  </button>
                </form>
              </section>

              {/* Category List */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Categorías Existentes ({categories.length})
                  </h3>
                </div>

                <div className="flex flex-col gap-2.5">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-3)]">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Sin categorías</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Crea tu primera categoría arriba.</p>
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="group flex flex-col rounded-[var(--radius-lg)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)] border border-[var(--border-strong)] p-3.5 transition-colors hover:bg-[var(--surface-1)]"
                      >
                        {editingId === cat.id ? (
                          <form onSubmit={(e) => handleUpdate(e, cat)} className="flex items-center gap-2">
                            <input
                              autoFocus
                              id={`edit-cat-${cat.id}`}
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 h-9 px-3 rounded-[var(--radius-md)] border border-[var(--app-primary)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              type="submit"
                              disabled={!editName.trim() || savingAction}
                              className="p-1.5 rounded-lg bg-[var(--app-primary)] text-white hover:brightness-110 cursor-pointer disabled:opacity-50"
                              title="Guardar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="text-sm font-bold tracking-tight text-[var(--text-primary)] truncate">
                                {cat.name}
                              </span>
                              {cat.description && (
                                <span className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
                                  {cat.description}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEdit(cat)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--app-primary)] transition-colors cursor-pointer"
                                title="Editar"
                              >
                                <AppIcon icon={Pencil} size="xs" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(cat)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--color-error)] transition-colors cursor-pointer"
                                title="Eliminar"
                              >
                                <AppIcon icon={Trash2} size="xs" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductCategoriesModal;
