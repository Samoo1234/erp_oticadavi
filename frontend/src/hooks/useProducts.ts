/**
 * Hook para gerenciamento de produtos (BANCO LOCAL)
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import * as productService from '../services/productService';
import type { Product, CreateProductDTO, UpdateProductDTO, ProductFilters } from '../types';

export interface UseProductsOptions {
  initialFilters?: ProductFilters;
  pageSize?: number;
  autoFetch?: boolean;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const {
    initialFilters = {},
    pageSize = 50,
    autoFetch = true,
  } = options;

  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [page, setPage] = useState(1);

  // Query para listar produtos
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery(
    ['products', { ...filters, page, pageSize }],
    () => productService.getProducts(filters),
    {
      enabled: autoFetch,
      keepPreviousData: true,
      staleTime: 30000,
    }
  );

  // Query para categorias
  const { data: categories = [] } = useQuery(
    ['productCategories'],
    productService.getCategories,
    { staleTime: 300000 }
  );

  // Query para marcas
  const { data: brands = [] } = useQuery(
    ['productBrands'],
    productService.getBrands,
    { staleTime: 300000 }
  );

  // Mutation para criar produto
  const createMutation = useMutation(productService.createProduct, {
    onSuccess: () => {
      toast.success('Produto criado com sucesso!');
      queryClient.invalidateQueries(['products']);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar produto');
    },
  });

  // Mutation para atualizar produto
  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateProductDTO }) =>
      productService.updateProduct(id, data),
    {
      onSuccess: () => {
        toast.success('Produto atualizado com sucesso!');
        queryClient.invalidateQueries(['products']);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar produto');
      },
    }
  );

  // Mutation para excluir produto
  const deleteMutation = useMutation(productService.deleteProduct, {
    onSuccess: () => {
      toast.success('Produto excluído com sucesso!');
      queryClient.invalidateQueries(['products']);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir produto');
    },
  });

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
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
    products: data?.products || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 1,
    categories,
    brands,
    
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
    update: (id: string, data: UpdateProductDTO) => updateMutation.mutateAsync({ id, data }),
    remove: deleteMutation.mutateAsync,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    
    // Ações
    refetch,
  };
};

/**
 * Hook para buscar um produto específico
 */
export const useProduct = (productId: string | undefined) => {
  const { data, isLoading, error, refetch } = useQuery(
    ['product', productId],
    () => productService.getProductById(productId!),
    {
      enabled: !!productId,
      staleTime: 60000,
    }
  );

  return {
    product: data,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para produtos com estoque baixo
 */
export const useLowStockProducts = () => {
  const { data, isLoading, error, refetch } = useQuery(
    ['lowStockProducts'],
    productService.getLowStockProducts,
    { staleTime: 60000 }
  );

  return {
    products: data || [],
    isLoading,
    error,
    refetch,
  };
};

export default useProducts;
