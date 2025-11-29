/**
 * Hook para gerenciamento de prescrições (BANCO LOCAL)
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import * as prescriptionService from '../services/prescriptionService';
import type { CreatePrescriptionDTO } from '../types';

export interface UsePrescriptionsOptions {
  clientId?: string;
  status?: string;
  pageSize?: number;
  autoFetch?: boolean;
}

export const usePrescriptions = (options: UsePrescriptionsOptions = {}) => {
  const {
    clientId,
    status,
    pageSize = 50,
    autoFetch = true,
  } = options;

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(status);

  // Query para listar prescrições
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery(
    ['prescriptions', { clientId, status: statusFilter, page, pageSize }],
    () => prescriptionService.getPrescriptions({ clientId, status: statusFilter, page, limit: pageSize }),
    {
      enabled: autoFetch,
      keepPreviousData: true,
      staleTime: 30000,
    }
  );

  // Mutation para criar prescrição
  const createMutation = useMutation(prescriptionService.createPrescription, {
    onSuccess: () => {
      toast.success('Prescrição criada com sucesso!');
      queryClient.invalidateQueries(['prescriptions']);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar prescrição');
    },
  });

  // Mutation para atualizar prescrição
  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<CreatePrescriptionDTO> }) =>
      prescriptionService.updatePrescription(id, data),
    {
      onSuccess: () => {
        toast.success('Prescrição atualizada com sucesso!');
        queryClient.invalidateQueries(['prescriptions']);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar prescrição');
      },
    }
  );

  // Mutation para cancelar prescrição
  const cancelMutation = useMutation(prescriptionService.cancelPrescription, {
    onSuccess: () => {
      toast.success('Prescrição cancelada com sucesso!');
      queryClient.invalidateQueries(['prescriptions']);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar prescrição');
    },
  });

  return {
    // Dados
    prescriptions: data?.prescriptions || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 1,
    
    // Estado
    isLoading,
    isFetching,
    error,
    
    // Filtros
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    
    // Mutations
    create: createMutation.mutateAsync,
    update: (id: string, data: Partial<CreatePrescriptionDTO>) => updateMutation.mutateAsync({ id, data }),
    cancel: cancelMutation.mutateAsync,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isCanceling: cancelMutation.isLoading,
    
    // Ações
    refetch,
  };
};

/**
 * Hook para prescrições de um cliente
 */
export const usePrescriptionsByClient = (clientId: string | undefined) => {
  const { data, isLoading, error, refetch } = useQuery(
    ['prescriptionsByClient', clientId],
    () => prescriptionService.getPrescriptionsByClient(clientId!),
    {
      enabled: !!clientId,
      staleTime: 60000,
    }
  );

  return {
    prescriptions: data || [],
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para prescrições expiradas
 */
export const useExpiredPrescriptions = () => {
  const { data, isLoading, error, refetch } = useQuery(
    ['expiredPrescriptions'],
    prescriptionService.getExpiredPrescriptions,
    { staleTime: 60000 }
  );

  return {
    prescriptions: data || [],
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para calcular lente
 */
export const useLensCalculation = () => {
  const mutation = useMutation(prescriptionService.calculateLens);

  return {
    calculate: mutation.mutateAsync,
    result: mutation.data,
    isCalculating: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
};

export default usePrescriptions;
