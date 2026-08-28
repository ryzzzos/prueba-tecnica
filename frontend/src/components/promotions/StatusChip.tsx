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
          className="bg-indigo-600 text-white font-medium shadow-sm"
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
          className="bg-emerald-600 text-white font-medium shadow-sm"
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
          className="bg-slate-600 text-white font-medium shadow-sm"
          startContent={<Archive className="w-3.5 h-3.5 text-white mr-1" />}
        >
          Finalizada
        </Chip>
      );
    default:
      return null;
  }
};
