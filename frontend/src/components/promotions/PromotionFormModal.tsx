import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Tag,
  Calendar,
  Percent,
  DollarSign,
  Layers,
  Package,
  X,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { RadioGroup, Radio } from '@heroui/react';
import Input from '../ui/Input.tsx';
import MultiSelect, { MultiSelectOption } from '../ui/MultiSelect.tsx';
import AppIcon from '../ui/AppIcon.tsx';
import {
  Promotion,
  Category,
  DiscountType,
  PromotionScopeType,
  CreatePromotionPayload,
  UpdatePromotionPayload,
} from '../../types/promotion.types.ts';
import { Product } from '../../types/product.types.ts';

interface PromotionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCreate: (payload: CreatePromotionPayload) => Promise<boolean>;
  onSubmitUpdate: (id: string, payload: UpdatePromotionPayload) => Promise<boolean>;
  categories: Category[];
  products?: Product[];
  promotions?: Promotion[];
  initialData?: Promotion | null;
  loading?: boolean;
}

interface FormErrors {
  name?: string;
  scope?: string;
  discountValue?: string;
  startDate?: string;
  endDate?: string;
}

export const PromotionFormModal: React.FC<PromotionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  categories,
  products = [],
  promotions = [],
  initialData,
  loading = false,
}) => {
  const isEditMode = Boolean(initialData);

  const [name, setName] = useState('');
  const [scopeType, setScopeType] = useState<PromotionScopeType>('CATEGORY');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<string>('15');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Format ISO date to local input datetime format (YYYY-MM-DDTHH:MM)
  const toLocalInputFormat = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        const scope = initialData.scopeType || (initialData.productId ? 'PRODUCT' : 'CATEGORY');
        setScopeType(scope);

        if (initialData.categories && initialData.categories.length > 0) {
          setSelectedCategoryIds(initialData.categories.map((c) => c.id));
        } else if (initialData.categoryId) {
          setSelectedCategoryIds([initialData.categoryId]);
        } else {
          setSelectedCategoryIds([]);
        }

        if (initialData.products && initialData.products.length > 0) {
          setSelectedProductIds(initialData.products.map((p) => p.id));
        } else if (initialData.productId) {
          setSelectedProductIds([initialData.productId]);
        } else {
          setSelectedProductIds([]);
        }

        setDiscountType(initialData.discountType);
        setDiscountValue(String(initialData.discountValue));
        setStartDate(toLocalInputFormat(initialData.startDate));
        setEndDate(toLocalInputFormat(initialData.endDate));
      } else {
        // Default new promotion: starts now, ends in 7 days
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        setName('');
        setScopeType('CATEGORY');
        setSelectedCategoryIds(categories[0]?.id ? [categories[0].id] : []);
        setSelectedProductIds([]);
        setDiscountType('PERCENTAGE');
        setDiscountValue('15');
        setStartDate(toLocalInputFormat(now.toISOString()));
        setEndDate(toLocalInputFormat(nextWeek.toISOString()));
      }
      setErrors({});
    }
  }, [initialData, isOpen, categories]);

  const categoryOptions: MultiSelectOption[] = useMemo(() => {
    return categories.map((cat) => {
      const count = products.filter((p) => p.categoryId === cat.id).length;
      return {
        value: cat.id,
        label: cat.name,
        badge: `${count} producto${count !== 1 ? 's' : ''}`,
      };
    });
  }, [categories, products]);

  const productOptions: MultiSelectOption[] = useMemo(() => {
    return products.map((prod) => {
      const categoryName = prod.category?.name || categories.find((c) => c.id === prod.categoryId)?.name || 'Sin categoría';
      return {
        value: prod.id,
        label: prod.name,
        sublabel: categoryName,
        badge: `$${Number(prod.price).toLocaleString('es-CO')}`,
      };
    });
  }, [products, categories]);

  // Conflict detection for selected targets with other active/programmed promotions
  const conflictWarnings = useMemo(() => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return [];

    const targetProductIds = new Set<string>();
    if (scopeType === 'PRODUCT') {
      selectedProductIds.forEach((id) => targetProductIds.add(id));
    } else {
      products.forEach((p) => {
        if (p.categoryId && selectedCategoryIds.includes(p.categoryId)) {
          targetProductIds.add(p.id);
        }
      });
    }

    if (targetProductIds.size === 0) return [];

    const warnings: string[] = [];

    for (const promo of promotions) {
      if (initialData && promo.id === initialData.id) continue;
      if (promo.status === 'FINISHED') continue;

      const pStart = new Date(promo.startDate);
      const pEnd = new Date(promo.endDate);

      // Check date overlap
      if (pStart <= end && pEnd >= start) {
        const promoCoveredProducts = new Set<string>();
        if (promo.products && promo.products.length > 0) {
          promo.products.forEach((p) => promoCoveredProducts.add(p.id));
        } else if (promo.productId) {
          promoCoveredProducts.add(promo.productId);
        }

        if (promo.categories && promo.categories.length > 0) {
          const promoCatIds = promo.categories.map((c) => c.id);
          products.forEach((p) => {
            if (p.categoryId && promoCatIds.includes(p.categoryId)) {
              promoCoveredProducts.add(p.id);
            }
          });
        } else if (promo.categoryId) {
          products.forEach((p) => {
            if (p.categoryId === promo.categoryId) {
              promoCoveredProducts.add(p.id);
            }
          });
        }

        // Find intersection
        for (const tId of targetProductIds) {
          if (promoCoveredProducts.has(tId)) {
            const product = products.find((p) => p.id === tId);
            const name = product ? product.name : 'Un producto seleccionado';
            warnings.push(
              `"${name}" ya tiene el descuento "${promo.name}" en este horario.`
            );
            break;
          }
        }
      }
    }

    return warnings;
  }, [startDate, endDate, scopeType, selectedCategoryIds, selectedProductIds, products, promotions, initialData]);

  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres.';
    }

    if (scopeType === 'CATEGORY' && selectedCategoryIds.length === 0) {
      newErrors.scope = 'Debes seleccionar al menos una categoría.';
    } else if (scopeType === 'PRODUCT' && selectedProductIds.length === 0) {
      newErrors.scope = 'Debes seleccionar al menos un producto del catálogo.';
    }

    const valueNum = Number(discountValue);
    if (isNaN(valueNum) || valueNum <= 0) {
      newErrors.discountValue = 'El valor del descuento debe ser mayor a 0.';
    } else if (discountType === 'PERCENTAGE' && (valueNum < 1 || valueNum > 100)) {
      newErrors.discountValue = 'El porcentaje debe estar entre 1% y 100%.';
    }

    if (!startDate) {
      newErrors.startDate = 'Ingrese la fecha de inicio.';
    }

    if (!endDate) {
      newErrors.endDate = 'Ingrese la fecha de fin.';
    } else if (startDate && new Date(endDate) <= new Date(startDate)) {
      newErrors.endDate = 'La fecha de fin debe ser posterior al inicio.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload: CreatePromotionPayload = {
      name: name.trim(),
      scopeType,
      categoryIds: scopeType === 'CATEGORY' ? selectedCategoryIds : [],
      categoryId: scopeType === 'CATEGORY' ? selectedCategoryIds[0] || null : null,
      productIds: scopeType === 'PRODUCT' ? selectedProductIds : [],
      productId: scopeType === 'PRODUCT' ? selectedProductIds[0] || null : null,
      discountType,
      discountValue: Number(discountValue),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    };

    let success = false;
    if (isEditMode && initialData) {
      success = await onSubmitUpdate(initialData.id, payload as UpdatePromotionPayload);
    } else {
      success = await onSubmitCreate(payload);
    }

    if (success) {
      onClose();
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="promo-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            role="presentation"
            className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm dark:bg-black/60"
            onClick={onClose}
          />

          {/* Right Slide Drawer */}
          <motion.aside
            key="promo-drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="pointer-events-auto fixed inset-y-0 right-0 top-0 bottom-0 z-[85] flex w-[92vw] max-w-[540px] h-screen max-h-screen h-[100dvh] flex-col overflow-hidden rounded-l-[var(--radius-2xl)] border-l border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-lg)]"
            aria-hidden={!isOpen}
          >
            {/* Header */}
            <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-2)] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-[linear-gradient(135deg,#1d4ed8,#2563eb)] text-white shadow-md">
                  <AppIcon icon={Tag} size="sm" className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
                    {isEditMode ? 'Editar Promoción' : 'Registrar Nueva Promoción'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Configura los términos de descuento, alcance y vigencia para el POS
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label="Cerrar drawer"
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

                  <Input
                    id="drawer-promo-name"
                    label="Nombre de la Promoción"
                    placeholder="Ej. Descuento Bebidas de Verano"
                    value={name}
                    error={errors.name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError('name');
                    }}
                    isRequired
                  />
                </div>

                {/* Group 2: Scope Selection (Categoría o Producto Asociado) */}
                <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Categoría o Producto Asociado
                    </h4>
                    <span className="text-[11px] font-bold text-[var(--app-primary)] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Alcance Comercial
                    </span>
                  </div>

                  {/* Scope Mode Switcher Pill */}
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border-strong)]">
                    <button
                      type="button"
                      onClick={() => {
                        setScopeType('CATEGORY');
                        clearFieldError('scope');
                      }}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        scopeType === 'CATEGORY'
                          ? 'bg-[var(--app-primary)] text-white shadow-sm'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]'
                      }`}
                    >
                      <AppIcon icon={Layers} size="xs" />
                      Por Categorías
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScopeType('PRODUCT');
                        clearFieldError('scope');
                      }}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        scopeType === 'PRODUCT'
                          ? 'bg-[var(--app-primary)] text-white shadow-sm'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]'
                      }`}
                    >
                      <AppIcon icon={Package} size="xs" />
                      Por Productos
                    </button>
                  </div>

                  {/* MultiSelect for Categories or Products */}
                  {scopeType === 'CATEGORY' ? (
                    <div className="space-y-2">
                      <MultiSelect
                        id="promo-categories-select"
                        label="Categorías Asociadas"
                        placeholder="Selecciona una o más categorías..."
                        options={categoryOptions}
                        selectedValues={selectedCategoryIds}
                        onChange={(vals) => {
                          setSelectedCategoryIds(vals);
                          clearFieldError('scope');
                        }}
                        icon={Layers}
                        error={errors.scope}
                        isRequired
                      />
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        El descuento se aplicará de forma automática a todos los productos actuales y futuros de las categorías elegidas.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <MultiSelect
                        id="promo-products-select"
                        label="Productos del Catálogo"
                        placeholder="Buscar y seleccionar productos..."
                        options={productOptions}
                        selectedValues={selectedProductIds}
                        onChange={(vals) => {
                          setSelectedProductIds(vals);
                          clearFieldError('scope');
                        }}
                        icon={Package}
                        error={errors.scope}
                        isRequired
                      />
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        El descuento se aplicará única y exclusivamente a los productos individuales seleccionados.
                      </p>
                    </div>
                  )}

                  {/* Overlap Conflict Warning Notice */}
                  {conflictWarnings.length > 0 && (
                    <div className="flex items-start gap-2.5 p-3 rounded-[var(--radius-lg)] border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold">Advertencia de conflicto:</span>
                        {conflictWarnings.map((w, idx) => (
                          <p key={idx} className="text-[11px] leading-tight opacity-90">
                            {w}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Group 3: Discount Rules Card */}
                <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)] space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Reglas de Descuento
                  </h4>

                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-[var(--text-secondary)] block select-none uppercase tracking-wide">
                        Tipo de Descuento
                      </label>
                      <RadioGroup
                        value={discountType}
                        onValueChange={(val) => setDiscountType(val as DiscountType)}
                        orientation="horizontal"
                        className="gap-8"
                      >
                        <Radio value="PERCENTAGE">
                          <span className="text-[13px] font-bold text-[var(--text-primary)]">
                            Porcentaje (%)
                          </span>
                        </Radio>
                        <Radio value="FIXED_AMOUNT">
                          <span className="text-[13px] font-bold text-[var(--text-primary)]">
                            Monto Fijo ($)
                          </span>
                        </Radio>
                      </RadioGroup>
                    </div>

                    <div>
                      <Input
                        id="drawer-discount-value"
                        label={
                          discountType === 'PERCENTAGE'
                            ? 'Porcentaje a descontar (1 - 100%)'
                            : 'Monto a descontar ($ COP)'
                        }
                        placeholder={discountType === 'PERCENTAGE' ? 'Ej. 20' : 'Ej. 1500'}
                        type="number"
                        min={discountType === 'PERCENTAGE' ? 1 : 0.01}
                        max={discountType === 'PERCENTAGE' ? 100 : undefined}
                        step={discountType === 'PERCENTAGE' ? '1' : '50'}
                        value={discountValue}
                        error={errors.discountValue}
                        onChange={(e) => {
                          setDiscountValue(e.target.value);
                          clearFieldError('discountValue');
                        }}
                        isRequired
                        startContent={
                          discountType === 'PERCENTAGE' ? (
                            <Percent className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Group 4: Validity Period Card */}
                <div className="rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)] space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Vigencia Temporal
                  </h4>

                  <div className="flex flex-col gap-5">
                    <Input
                      id="drawer-start-date"
                      label="Fecha y Hora de Inicio"
                      type="datetime-local"
                      value={startDate}
                      error={errors.startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        clearFieldError('startDate');
                      }}
                      isRequired
                      startContent={<Calendar className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
                    />

                    <Input
                      id="drawer-end-date"
                      label="Fecha y Hora de Fin"
                      type="datetime-local"
                      value={endDate}
                      error={errors.endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        clearFieldError('endDate');
                      }}
                      isRequired
                      startContent={<Calendar className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <footer className="sticky bottom-0 z-10 flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border-strong)] bg-[var(--surface-2)] px-6 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-[var(--radius-lg)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-3)] border border-[var(--border-strong)] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-[var(--radius-lg)] bg-[linear-gradient(135deg,#1d4ed8,#2563eb)] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Promoción'}
                </button>
              </footer>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PromotionFormModal;
