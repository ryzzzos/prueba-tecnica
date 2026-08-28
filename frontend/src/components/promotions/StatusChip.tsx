import React from 'react';
import { Chip } from '@heroui/react';
import { Clock, CheckCircle2, Archive } from 'lucide-react';
import { PromotionStatus } from '../../types/promotion.types.ts';

interface StatusChipProps {
  status: PromotionStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'sm' }) => {
  switch (status) {
    case 'PROGRAMMED':
      return (
        <Chip
          size={size}
          variant="solid"
          className="bg-[var(--color-programmed)] text-white font-medium shadow-[var(--shadow-sm)]"
          startContent={<Clock className="w-3.5 h-3.5 text-white mr-1" />}
        >
          Programada
        </Chip>
      );
    case 'ACTIVE':
      return (
        <Chip
          size={size}
          variant="solid"
          className="bg-[var(--color-active)] text-white font-medium shadow-[var(--shadow-sm)]"
          startContent={<CheckCircle2 className="w-3.5 h-3.5 text-white mr-1" />}
        >
          Activa
        </Chip>
      );
    case 'FINISHED':
      return (
        <Chip
          size={size}
          variant="solid"
          className="bg-[var(--color-finished)] text-white font-medium shadow-[var(--shadow-sm)]"
          startContent={<Archive className="w-3.5 h-3.5 text-white mr-1" />}
        >
          Finalizada
        </Chip>
      );
    default:
      return null;
  }
};
