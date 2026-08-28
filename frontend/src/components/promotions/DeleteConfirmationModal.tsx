import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Promotion } from '../../types/promotion.types.ts';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  promotion: Promotion | null;
  loading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  promotion,
  loading = false,
}) => {
  if (!promotion) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      backdrop="blur"
      classNames={{
        base: 'bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-[var(--radius-xl)] shadow-2xl',
        header: 'border-b border-[var(--border-soft)] py-4 px-6',
        body: 'py-5 px-6',
        footer: 'border-t border-[var(--border-soft)] py-3.5 px-6',
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-[var(--text-primary)]">
                  Confirmar Eliminacion
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  Esta accion es irreversible
                </span>
              </div>
            </ModalHeader>

            <ModalBody className="gap-3">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                ¿Estas seguro de que deseas eliminar permanentemente la promocion programada{' '}
                <strong className="text-[var(--text-primary)]">{promotion.name}</strong>?
              </p>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-medium">
                Regla de negocio: Solo las promociones en estado <strong>Programada</strong> pueden eliminarse del sistema.
              </div>
            </ModalBody>

            <ModalFooter className="gap-2">
              <Button variant="flat" onClick={onClose} isDisabled={loading} className="rounded-xl">
                Cancelar
              </Button>
              <Button
                color="danger"
                isLoading={loading}
                startContent={!loading && <Trash2 className="w-4 h-4" />}
                onClick={onConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-md"
              >
                Eliminar Promocion
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
