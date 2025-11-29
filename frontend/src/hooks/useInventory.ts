/**
 * Hook para gerenciamento de estoque (BANCO LOCAL)
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import * as inventoryService from '../services/inventoryService';
import type { CreateMovementDTO } from '../types';

export interface UseInventoryOptions {
  productId?: string;
  location?: string;
  autoFetch?: boolean;
}

export const useInventory = (options: UseInventoryOptions = {}) => {
  const {
    productId,
    location,
    autoFetch = true,
  } = options;

  const queryClient = useQueryClient();
  const [showLowStock, setShowLowStock] = useState(false);

  // Query para listar estoque
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery(
    ['inventory', { productId, location, lowStock: showLowStock }],
    () => inventoryService.getInventory({ productId, location, lowStock: showLowStock }),
    {
      enabled: autoFetch,
      staleTime: 30000,
    }
  );

  // Query para estatísticas
  const { data: stats } = useQuery(
    ['inventoryStats'],
    inventoryService.getInventoryStats,
    { staleTime: 60000 }
  );

  // Mutation para criar movimentação
  const movementMutation = useMutation(inventoryService.createMovement, {
    onSuccess: () => {
      toast.success('Movimentação registrada com sucesso!');
      queryClient.invalidateQueries(['inventory']);
      queryClient.invalidateQueries(['inventoryStats']);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar movimentação');
    },
  });

  // Mutation para ajustar estoque
  const adjustMutation = useMutation(inventoryService.adjustInventory, {
    onSuccess: () => {
      toast.success('Estoque ajustado com sucesso!');
      queryClient.invalidateQueries(['inventory']);
      queryClient.invalidateQueries(['inventoryStats']);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao ajustar estoque');
    },
  });

  return {
    // Dados
    inventory: data?.inventory || [],
    total: data?.total || 0,
    stats,
    
    // Estado
    isLoading,
    isFetching,
    error,
    showLowStock,
    setShowLowStock,
    
    // Mutations
    createMovement: movementMutation.mutateAsync,
    adjustStock: adjustMutation.mutateAsync,
    isCreatingMovement: movementMutation.isLoading,
    isAdjusting: adjustMutation.isLoading,
    
    // Ações
    refetch,
  };
};

/**
 * Hook para movimentações de estoque
 */
export const useInventoryMovements = (filters: {
  productId?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const [page, setPage] = useState(filters.page || 1);

  const { data, isLoading, error, refetch } = useQuery(
    ['inventoryMovements', { ...filters, page }],
    () => inventoryService.getMovements({ ...filters, page }),
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );

  return {
    movements: data?.movements || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 1,
    page,
    setPage,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para estoque de um produto específico
 */
export const useProductInventory = (productId: string | undefined) => {
  const { data, isLoading, error, refetch } = useQuery(
    ['productInventory', productId],
    () => inventoryService.getInventoryByProduct(productId!),
    {
      enabled: !!productId,
      staleTime: 60000,
    }
  );

  return {
    inventory: data || [],
    isLoading,
    error,
    refetch,
  };
};

export default useInventory;
