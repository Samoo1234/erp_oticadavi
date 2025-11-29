/**
 * Hook para gerenciamento de clientes (BANCO CENTRAL)
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import * as clientService from '../services/clientService';
import type { ClienteERP } from '../services/supabaseCentral';

export interface UseClientsOptions {
  initialSearch?: string;
  initialPage?: number;
  pageSize?: number;
  autoFetch?: boolean;
}

export const useClients = (options: UseClientsOptions = {}) => {
  const {
    initialSearch = '',
    initialPage = 1,
    pageSize = 50,
    autoFetch = true,
  } = options;

  const queryClient = useQueryClient();
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);

  // Query para listar clientes
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery(
    ['clients', { search, page, pageSize }],
    () => clientService.getClients({ search, page, limit: pageSize }),
    {
      enabled: autoFetch,
      keepPreviousData: true,
      staleTime: 30000, // 30 segundos
    }
  );

  // Buscar cliente por ID
  const getById = useCallback(async (id: string): Promise<ClienteERP | null> => {
    return clientService.getClientById(id);
  }, []);

  // Buscar cliente por telefone
  const getByPhone = useCallback(async (phone: string): Promise<ClienteERP | null> => {
    return clientService.getClientByPhone(phone);
  }, []);

  // Buscar clientes
  const searchClients = useCallback(async (term: string, limit?: number): Promise<ClienteERP[]> => {
    return clientService.searchClients(term, limit);
  }, []);

  // Invalidar cache
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries(['clients']);
  }, [queryClient]);

  return {
    // Dados
    clients: data?.clients || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 1,
    
    // Estado
    isLoading,
    isFetching,
    error,
    
    // Filtros
    search,
    setSearch,
    page,
    setPage,
    
    // Ações
    refetch,
    getById,
    getByPhone,
    searchClients,
    invalidate,
  };
};

/**
 * Hook para buscar um cliente específico
 */
export const useClient = (clientId: string | undefined) => {
  const { data, isLoading, error, refetch } = useQuery(
    ['client', clientId],
    () => clientService.getClientById(clientId!),
    {
      enabled: !!clientId,
      staleTime: 60000, // 1 minuto
    }
  );

  return {
    client: data,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para estatísticas de clientes
 */
export const useClientStats = () => {
  const { data, isLoading, error, refetch } = useQuery(
    ['clientStats'],
    () => clientService.getClientStats(),
    {
      staleTime: 60000, // 1 minuto
    }
  );

  return {
    stats: data || { total: 0, active: 0 },
    isLoading,
    error,
    refetch,
  };
};

export default useClients;
