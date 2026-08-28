import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Package, Layers, DollarSign, Barcode, Image as ImageIcon } from 'lucide-react';
import { Category } from '../../types/promotion.types.ts';
import { Product, CreateProductPayload, UpdateProductPayload } from '../../types/product.types.ts';
import CustomSelect from '../ui/CustomSelect.tsx';
import Input from '../ui/Input.tsx';
import AppIcon from '../ui/AppIcon.tsx';

interface ProductFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  product?: Product | null;
  categories: Category[];
  categoriesLoading?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductPayload | UpdateProductPayload) => Promise<boolean>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  mode,
  product,
  categories,
  categoriesLoading = false,
  saving = false,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (product) {
        setName(product.name);
        setDescription(product.description || '');
        setPrice(String(product.price));
        setSku(product.sku || '');
        setImageUrl(product.imageUrl || '');
        setCategoryId(product.categoryId || '');
        setIsActive(product.isActive);
      } else {
        setName('');
        setDescription('');
        setPrice('5000');
        setSku('');
        setImageUrl('');
        setCategoryId(categories[0]?.id || '');
        setIsActive(true);
      }
      setErrors({});
    }
  }, [open, product, categories]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'El nombre del producto debe tener al menos 2 caracteres.';
    }
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'El precio debe ser un valor positivo mayor a 0.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateProductPayload = {
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      sku: sku.trim() || null,
      imageUrl: imageUrl.trim() || null,
      categoryId: categoryId || null,
      isActive,
    };

    const success = await onSubmit(payload);
    if (success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="product-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            role="presentation"
            className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm dark:bg-black/60"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="product-modal-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="pointer-events-auto fixed right-0 top-0 bottom-0 z-[85] flex w-[92vw] max-w-[500px] h-full flex-col overflow-hidden rounded-l-[var(--radius-2xl)] border-l border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-lg)]"
            aria-hidden={!open}
          >
            {/* Header */}
            <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-2)] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-[linear-gradient(135deg,#1d4ed8,#2563eb)] text-white shadow-md">
                  <AppIcon icon={Package} size="sm" className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
                    {mode === 'create' ? 'Registrar Nuevo Producto' : 'Editar Producto'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Configura los detalles comerciales para el punto de venta
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            {/* Scrollable Form Body */}
            <form noValidate onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Group 1: General Info Card */}
                <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)] space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Información Principal
                  </h4>

                  <div className="space-y-4">
                    <Input
                      id="product-name"
                      label="Nombre del Producto"
                      placeholder="Ej. Coca Cola Sin Azúcar 1.5L"
                      value={name}
                      error={errors.name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      isRequired
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <CustomSelect<string>
                        id="product-category"
                        label="Categoría"
                        value={categoryId}
                        onChange={(val) => setCategoryId(val)}
                        options={[
                          { value: '', label: 'Sin categoría' },
                          ...categories.map((c) => ({ value: c.id, label: c.name })),
                        ]}
                        placeholder={categoriesLoading ? 'Cargando categorías...' : 'Seleccionar...'}
                        icon={Layers}
                        variant="glass"
                        className="w-full"
                      />

                      <Input
                        id="product-sku"
                        label="Código SKU / Barra"
                        placeholder="Ej. BEB-001"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        startContent={<Barcode className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="product-desc" className="text-xs font-semibold text-[var(--text-secondary)]">
                        Descripción (Opcional)
                      </label>
                      <textarea
                        id="product-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="w-full rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-3 text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--app-primary)] focus:outline-none resize-none"
                        placeholder="Detalles sobre presentación, sabor o especificaciones..."
                      />
                    </div>
                  </div>
                </div>

                {/* Group 2: Pricing Card */}
                <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)] space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Precio y Comercialización
                  </h4>

                  <Input
                    id="product-price"
                    label="Precio Base ($ COP)"
                    type="number"
                    min={0.01}
                    step="50"
                    value={price}
                    error={errors.price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                    }}
                    isRequired
                    startContent={<DollarSign className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
                  />
                </div>

                {/* Group 3: Image URL */}
                <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)] space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Imagen del Producto
                  </h4>

                  <Input
                    id="product-image"
                    label="URL de Imagen (Opcional)"
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    startContent={<ImageIcon className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
                  />
                </div>

                {/* Group 4: Active Status Switch */}
                <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Disponibilidad en Catálogo</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Controla si este producto está activo para aplicar promociones y ventas.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        isActive
                          ? 'bg-[var(--app-primary)]'
                          : 'bg-[var(--surface-2)] border border-[var(--border-strong)]'
                      }`}
                    >
                      <div
                        className={`absolute top-[2px] left-[2px] h-5 w-5 bg-white rounded-full transition-transform ${
                          isActive ? 'translate-x-5' : 'translate-x-0'
                        } shadow-sm`}
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* Sticky Footer */}
              <footer className="sticky bottom-0 z-10 flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border-strong)] bg-[var(--surface-2)] px-6 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-[var(--radius-lg)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-3)] border border-[var(--border-strong)] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-[var(--radius-lg)] bg-[linear-gradient(135deg,#1d4ed8,#2563eb)] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
                </button>
              </footer>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductFormModal;
