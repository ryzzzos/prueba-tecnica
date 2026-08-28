import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  RadioGroup,
  Radio,
} from '@heroui/react';
import { Tag, AlertCircle, Calendar, Percent, DollarSign } from 'lucide-react';
import { sileo } from 'sileo';
import {
  Promotion,
  Category,
  DiscountType,
  CreatePromotionPayload,
  UpdatePromotionPayload,
} from '../../types/promotion.types.ts';

interface PromotionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCreate: (payload: CreatePromotionPayload) => Promise<boolean>;
  onSubmitUpdate: (id: string, payload: UpdatePromotionPayload) => Promise<boolean>;
  categories: Category[];
  initialData?: Promotion | null;
  loading?: boolean;
}

export const PromotionFormModal: React.FC<PromotionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  categories,
  initialData,
  loading = false,
}) => {
  const isEditMode = Boolean(initialData);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<string>('10');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

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
    if (initialData) {
      setName(initialData.name);
      setCategoryId(initialData.categoryId);
      setDiscountType(initialData.discountType);
      setDiscountValue(String(initialData.discountValue));
      setStartDate(toLocalInputFormat(initialData.startDate));
      setEndDate(toLocalInputFormat(initialData.endDate));
    } else {
      // Default new promotion: starts now, ends in 7 days
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      setName('');
      setCategoryId(categories[0]?.id || '');
      setDiscountType('PERCENTAGE');
      setDiscountValue('15');
      setStartDate(toLocalInputFormat(now.toISOString()));
      setEndDate(toLocalInputFormat(nextWeek.toISOString()));
    }
    setValidationError(null);
  }, [initialData, isOpen, categories]);

  const validateForm = (): boolean => {
    if (!name.trim() || name.trim().length < 2) {
      const msg = 'El nombre de la promocion debe tener al menos 2 caracteres.';
      setValidationError(msg);
      sileo.warning({ title: 'Campo Requerido', description: msg });
      return false;
    }

    if (!categoryId) {
      const msg = 'Debe seleccionar una categoria para la promocion.';
      setValidationError(msg);
      sileo.warning({ title: 'Campo Requerido', description: msg });
      return false;
    }

    const valueNum = Number(discountValue);
    if (isNaN(valueNum) || valueNum <= 0) {
      const msg = 'El valor del descuento debe ser un numero mayor a 0.';
      setValidationError(msg);
      sileo.warning({ title: 'Valor Invalido', description: msg });
      return false;
    }

    if (discountType === 'PERCENTAGE' && (valueNum < 1 || valueNum > 100)) {
      const msg = 'Para descuentos de tipo Porcentaje, el valor debe estar entre 1 y 100.';
      setValidationError(msg);
      sileo.warning({ title: 'Porcentaje Invalido', description: msg });
      return false;
    }

    if (!startDate || !endDate) {
      const msg = 'Debe ingresar las fechas de inicio y fin.';
      setValidationError(msg);
      sileo.warning({ title: 'Fechas Incompletas', description: msg });
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      const msg = 'La fecha de fin debe ser estrictamente posterior a la fecha de inicio.';
      setValidationError(msg);
      sileo.warning({ title: 'Rango de Fechas Invalido', description: msg });
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: name.trim(),
      categoryId,
      discountType,
      discountValue: Number(discountValue),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    };

    let success = false;
    if (isEditMode && initialData) {
      success = await onSubmitUpdate(initialData.id, payload);
    } else {
      success = await onSubmitCreate(payload);
    }

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      backdrop="blur"
      classNames={{
        base: 'bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-[var(--radius-2xl)] shadow-2xl',
        header: 'border-b border-[var(--border-soft)] py-4 px-6',
        body: 'py-6 px-6',
        footer: 'border-t border-[var(--border-soft)] py-4 px-6',
      }}
    >
      <ModalContent>
        {() => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[var(--text-primary)]">
                  {isEditMode ? 'Editar Promocion' : 'Registrar Nueva Promocion'}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-normal">
                  Configure los terminos, vigencia y porcentaje de descuento para el POS
                </span>
              </div>
            </ModalHeader>

            <ModalBody className="gap-5">
              {validationError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* 1. Nombre de la Promocion */}
              <Input
                label="Nombre de la Promocion"
                placeholder="Ej. Descuento Bebidas de Verano"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isRequired
                variant="bordered"
                classNames={{
                  inputWrapper: 'bg-[var(--surface-3)] border-[var(--border-soft)]',
                }}
              />

              {/* 2. Categoria Asociada */}
              <Select
                label="Categoria Asociada"
                placeholder="Seleccione la categoria del producto"
                selectedKeys={categoryId ? [categoryId] : []}
                onChange={(e) => setCategoryId(e.target.value)}
                isRequired
                variant="bordered"
                classNames={{
                  trigger: 'bg-[var(--surface-3)] border-[var(--border-soft)]',
                }}
              >
                {categories.map((cat) => (
                  <SelectItem key={cat.id} textValue={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </Select>

              {/* 3. Tipo y Valor de Descuento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-[var(--surface-3)] p-4 rounded-xl border border-[var(--border-soft)]">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-2">
                    Tipo de Descuento
                  </label>
                  <RadioGroup
                    value={discountType}
                    onValueChange={(val) => setDiscountType(val as DiscountType)}
                    orientation="horizontal"
                    className="gap-4"
                  >
                    <Radio value="PERCENTAGE">
                      <span className="text-xs font-medium">Porcentaje (%)</span>
                    </Radio>
                    <Radio value="FIXED_AMOUNT">
                      <span className="text-xs font-medium">Monto Fijo ($)</span>
                    </Radio>
                  </RadioGroup>
                </div>

                <div>
                  <Input
                    label={discountType === 'PERCENTAGE' ? 'Porcentaje (1 - 100%)' : 'Monto de Descuento ($)'}
                    placeholder={discountType === 'PERCENTAGE' ? '20' : '1500'}
                    type="number"
                    min={discountType === 'PERCENTAGE' ? 1 : 0.01}
                    max={discountType === 'PERCENTAGE' ? 100 : undefined}
                    step={discountType === 'PERCENTAGE' ? '1' : '0.01'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    isRequired
                    variant="bordered"
                    startContent={
                      discountType === 'PERCENTAGE' ? (
                        <Percent className="w-4 h-4 text-[var(--text-muted)]" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-[var(--text-muted)]" />
                      )
                    }
                    classNames={{
                      inputWrapper: 'bg-[var(--surface-2)] border-[var(--border-soft)]',
                    }}
                  />
                </div>
              </div>

              {/* 4. Fechas de Vigencia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Fecha y Hora de Inicio"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  isRequired
                  variant="bordered"
                  startContent={<Calendar className="w-4 h-4 text-[var(--text-muted)]" />}
                  classNames={{
                    inputWrapper: 'bg-[var(--surface-3)] border-[var(--border-soft)]',
                  }}
                />

                <Input
                  label="Fecha y Hora de Fin"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  isRequired
                  variant="bordered"
                  startContent={<Calendar className="w-4 h-4 text-[var(--text-muted)]" />}
                  classNames={{
                    inputWrapper: 'bg-[var(--surface-3)] border-[var(--border-soft)]',
                  }}
                />
              </div>
            </ModalBody>

            <ModalFooter className="gap-2">
              <Button variant="flat" onClick={onClose} isDisabled={loading} className="rounded-xl">
                Cancelar
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md"
              >
                {isEditMode ? 'Guardar Cambios' : 'Crear Promocion'}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};
