/**
 * Hook para gerenciamento de vendas (BANCO LOCAL)
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import * as saleService from '../services/saleService';
import type { Sale, CreateSaleDTO, SaleFilters } from '../types';

export interface UseSalesOptions {
  initialFilters?: SaleFilters;
  pageSize?: number;
  autoFetch?: boolean;
}

export const useSales = (options: UseSalesOptions = {}) => {
  const {
    initialFilters = {},
    pageSize = 50,
    autoFetch = true,
  } = options;

  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SaleFilters>(initialFilters);
  const [page, setPage] = useState(1);

  // Query para listar vendas
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery(
    ['sales', { ...filters, page, pageSize }],
    () => saleService.getSales(filters),
    {
      enabled: autoFetch,
      keepPreviousData: true,
      staleTime: 30000,
    }
  );

  // Query para estatísticas
  const { data: stats } = useQuery(
    ['salesStats'],
    () => saleService.getSalesStats(),
    { staleTime: 60000 }
  );

  // Mutation para criar venda
  const createMutation = useMutation(saleService.createSale, {
    onSuccess: () => {
      toast.success('Venda criada com sucesso!');
      queryClient.invalidateQueries(['sales']);
      queryClient.invalidateQueries(['salesStats']);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar venda');
    },
  });

  // Mutation para atualizar venda
  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<CreateSaleDTO> }) =>
      saleService.updateSale(id, data),
    {
      onSuccess: () => {
        toast.success('Venda atualizada com sucesso!');
        queryClient.invalidateQueries(['sales']);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar venda');
      },
    }
  );

  // Mutation para confirmar venda
  const confirmMutation = useMutation(saleService.confirmSale, {
    onSuccess: () => {
      toast.success('Venda confirmada com sucesso!');
      queryClient.invalidateQueries(['sales']);
      queryClient.invalidateQueries(['salesStats']);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao confirmar venda');
    },
  });

  // Mutation para cancelar venda
  const cancelMutation = useMutation(saleService.cancelSale, {
    onSuccess: () => {
      toast.success('Venda cancelada com sucesso!');
      queryClient.invalidateQueries(['sales']);
      queryClient.invalidateQueries(['salesStats']);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar venda');
    },
  });

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<SaleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  return {
    // Dados
    sales: data?.sales || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 1,
    stats,
    
    // Estado
    isLoading,
    isFetching,
    error,
    
    // Filtros
    filters,
    updateFilters,
    clearFilters,
    page,
    setPage,
    
    // Mutations
    create: createMutation.mutateAsync,
    update: (id: string, data: Partial<CreateSaleDTO>) => updateMutation.mutateAsync({ id, data }),
    confirm: confirmMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isConfirming: confirmMutation.isLoading,
    isCanceling: cancelMutation.isLoading,
    
    // Ações
    refetch,
  };
};

/**
 * Hook para buscar uma venda específica
 */
export const useSale = (saleId: string | undefined) => {
  const { data, isLoading, error, refetch } = useQuery(
    ['sale', saleId],
    () => saleService.getSaleById(saleId!),
    {
      enabled: !!saleId,
      staleTime: 60000,
    }
  );

  return {
    sale: data,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para vendas por cliente
 */
export const useSalesByClient = (clientId: string | undefined) => {
  const { data, isLoading, error, refetch } = useQuery(
    ['salesByClient', clientId],
    () => saleService.getSalesByClient(clientId!),
    {
      enabled: !!clientId,
      staleTime: 60000,
    }
  );

  return {
    sales: data || [],
    isLoading,
    error,
    refetch,
  };
};

export default useSales;
