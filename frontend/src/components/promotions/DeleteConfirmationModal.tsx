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
import AppIcon from '../ui/AppIcon.tsx';

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
        base: 'bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-[var(--radius-2xl)] shadow-2xl overflow-hidden my-auto',
        header: 'border-b border-[var(--border-soft)] py-5 px-6 bg-[var(--surface-2)]',
        body: 'py-6 px-6 space-y-4',
        footer: 'border-t border-[var(--border-soft)] py-4 px-6 bg-[var(--surface-2)]',
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[var(--radius-xl)] bg-[var(--color-error)] flex items-center justify-center text-white shadow-md shrink-0">
                <AppIcon icon={AlertTriangle} size="md" className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-[var(--text-primary)] tracking-tight">
                  Confirmar Eliminación
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  Esta acción es permanente e irreversible
                </span>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                ¿Estás seguro de que deseas eliminar la promoción programada{' '}
                <strong className="text-[var(--text-primary)] font-bold">{promotion.name}</strong>?
              </p>

              <div className="p-4 bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                <strong className="text-[var(--text-primary)] font-semibold">Regla de POS:</strong> Solo las promociones en estado <strong>Programada</strong> pueden eliminarse. Las promociones activas o finalizadas quedan protegidas.
              </div>
            </ModalBody>

            <ModalFooter className="gap-3">
              <Button
                variant="flat"
                size="md"
                onClick={onClose}
                isDisabled={loading}
                className="h-11 px-5 rounded-[var(--radius-lg)] font-semibold bg-[var(--surface-3)] text-[var(--text-secondary)] hover:bg-[var(--surface-0)] border border-[var(--border-strong)]"
              >
                Cancelar
              </Button>
              <Button
                size="md"
                isLoading={loading}
                startContent={!loading && <Trash2 className="w-4 h-4 text-white" />}
                onClick={onConfirm}
                className="h-11 px-6 rounded-[var(--radius-lg)] bg-[var(--color-error)] hover:brightness-110 text-white font-bold shadow-md shadow-rose-500/25"
              >
                Eliminar Promoción
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeleteConfirmationModal;
