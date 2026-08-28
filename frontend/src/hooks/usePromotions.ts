import { useState, useEffect, useCallback } from 'react';
import { sileo } from 'sileo';
import {
  Promotion,
  PromotionSummary,
  PromotionFilterParams,
  CreatePromotionPayload,
  UpdatePromotionPayload,
  PromotionStatus,
} from '../types/promotion.types.ts';
import { promotionService } from '../services/promotion.service.ts';

const initialSummary: PromotionSummary = {
  total: 0,
  programmed: 0,
  active: 0,
  finished: 0,
  validToday: 0,
};

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [summary, setSummary] = useState<PromotionSummary>(initialSummary);
  const [filters, setFilters] = useState<PromotionFilterParams>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const data = await promotionService.getSummaryMetrics();
      setSummary(data);
    } catch (err) {
      console.error('[ERROR] Error fetching summary metrics:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await promotionService.getPromotions(filters);
      setPromotions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar promociones';
      sileo.error({
        title: 'Error de Carga',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const refetchAll = async () => {
    await Promise.all([fetchPromotions(), fetchSummary()]);
  };

  const createPromotion = async (payload: CreatePromotionPayload): Promise<boolean> => {
    try {
      setActionLoading(true);
      await promotionService.createPromotion(payload);
      sileo.success({
        title: 'Promocion Creada',
        description: `Se registro la promocion "${payload.name}" exitosamente.`,
      });
      await refetchAll();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear la promocion';
      sileo.error({
        title: 'Error al Crear',
        description: message,
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updatePromotion = async (id: string, payload: UpdatePromotionPayload): Promise<boolean> => {
    try {
      setActionLoading(true);
      await promotionService.updatePromotion(id, payload);
      sileo.success({
        title: 'Promocion Actualizada',
        description: 'Los cambios fueron guardados exitosamente.',
      });
      await refetchAll();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la promocion';
      sileo.error({
        title: 'Error al Actualizar',
        description: message,
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const changePromotionStatus = async (id: string, status: PromotionStatus): Promise<boolean> => {
    try {
      setActionLoading(true);
      await promotionService.changePromotionStatus(id, status);
      const statusNames: Record<PromotionStatus, string> = {
        PROGRAMMED: 'Programada',
        ACTIVE: 'Activa',
        FINISHED: 'Finalizada',
      };
      sileo.success({
        title: 'Estado Actualizado',
        description: `La promocion ahora se encuentra en estado ${statusNames[status] || status}.`,
      });
      await refetchAll();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar el estado de la promocion';
      sileo.error({
        title: 'Error de Transicion',
        description: message,
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const deletePromotion = async (id: string): Promise<boolean> => {
    try {
      setActionLoading(true);
      await promotionService.deletePromotion(id);
      sileo.success({
        title: 'Promocion Eliminada',
        description: 'El registro se elimino del sistema exitosamente.',
      });
      await refetchAll();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar la promocion';
      sileo.error({
        title: 'Error al Eliminar',
        description: message,
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
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
    refetch: refetchAll,
  };
}
