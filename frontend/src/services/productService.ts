/**
 * Serviço de Produtos - BANCO LOCAL
 */

import { api } from './api';
import type { Product, CreateProductDTO, UpdateProductDTO, ApiResponse, ProductFilters } from '../types';

const BASE_URL = '/products';

/**
 * Listar produtos
 */
export const getProducts = async (filters: ProductFilters = {}): Promise<{
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.brand) params.append('brand', filters.brand);
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters.lowStock) params.append('lowStock', 'true');

  const response = await api.get<ApiResponse<{ products: Product[]; pagination: any }>>(
    `${BASE_URL}?${params.toString()}`
  );
  
  const data = response.data.data;
  return {
    products: data.products || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || 1,
    totalPages: data.pagination?.totalPages || 1,
  };
};

/**
 * Buscar produto por ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get<ApiResponse<Product>>(`${BASE_URL}/${id}`);
  return response.data.data;
};

/**
 * Criar produto
 */
export const createProduct = async (data: CreateProductDTO): Promise<Product> => {
  const response = await api.post<ApiResponse<Product>>(BASE_URL, data);
  return response.data.data;
};

/**
 * Atualizar produto
 */
export const updateProduct = async (id: string, data: UpdateProductDTO): Promise<Product> => {
  const response = await api.put<ApiResponse<Product>>(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

/**
 * Excluir produto
 */
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};

/**
 * Obter categorias
 */
export const getCategories = async (): Promise<string[]> => {
  const response = await api.get<ApiResponse<string[]>>(`${BASE_URL}/categories`);
  return response.data.data;
};

/**
 * Obter marcas
 */
export const getBrands = async (): Promise<string[]> => {
  const response = await api.get<ApiResponse<string[]>>(`${BASE_URL}/brands`);
  return response.data.data;
};

/**
 * Obter produtos com estoque baixo
 */
export const getLowStockProducts = async (): Promise<Product[]> => {
  const response = await api.get<ApiResponse<Product[]>>(`${BASE_URL}/low-stock`);
  return response.data.data;
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
  getLowStockProducts,
};
