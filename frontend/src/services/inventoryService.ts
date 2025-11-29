/**
 * Serviço de Inventário/Estoque - BANCO LOCAL
 */

import { api } from './api';
import type { Inventory, InventoryMovement, CreateMovementDTO, ApiResponse } from '../types';

const BASE_URL = '/inventory';

/**
 * Listar estoque
 */
export const getInventory = async (filters: {
  productId?: string;
  location?: string;
  lowStock?: boolean;
} = {}): Promise<{
  inventory: Inventory[];
  total: number;
}> => {
  const params = new URLSearchParams();
  
  if (filters.productId) params.append('productId', filters.productId);
  if (filters.location) params.append('location', filters.location);
  if (filters.lowStock) params.append('lowStock', 'true');

  const response = await api.get<ApiResponse<{ inventory: Inventory[]; total: number }>>(
    `${BASE_URL}?${params.toString()}`
  );
  
  return response.data.data;
};

/**
 * Obter estoque por produto
 */
export const getInventoryByProduct = async (productId: string): Promise<Inventory[]> => {
  const response = await api.get<ApiResponse<Inventory[]>>(
    `${BASE_URL}/product/${productId}`
  );
  return response.data.data;
};

/**
 * Criar movimentação de estoque
 */
export const createMovement = async (data: CreateMovementDTO): Promise<InventoryMovement> => {
  const response = await api.post<ApiResponse<InventoryMovement>>(
    `${BASE_URL}/movement`,
    data
  );
  return response.data.data;
};

/**
 * Listar movimentações
 */
export const getMovements = async (filters: {
  productId?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{
  movements: InventoryMovement[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const params = new URLSearchParams();
  
  if (filters.productId) params.append('productId', filters.productId);
  if (filters.movementType) params.append('movementType', filters.movementType);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const response = await api.get<ApiResponse<{ movements: InventoryMovement[]; pagination: any }>>(
    `${BASE_URL}/movements?${params.toString()}`
  );
  
  const data = response.data.data;
  return {
    movements: data.movements || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || 1,
    totalPages: data.pagination?.totalPages || 1,
  };
};

/**
 * Ajustar estoque
 */
export const adjustInventory = async (data: {
  productId: string;
  location: string;
  newQuantity: number;
  reason?: string;
}): Promise<InventoryMovement> => {
  const response = await api.post<ApiResponse<InventoryMovement>>(
    `${BASE_URL}/adjust`,
    data
  );
  return response.data.data;
};

/**
 * Obter estatísticas de estoque
 */
export const getInventoryStats = async (): Promise<{
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}> => {
  const response = await api.get<ApiResponse<any>>(`${BASE_URL}/stats`);
  return response.data.data;
};

export default {
  getInventory,
  getInventoryByProduct,
  createMovement,
  getMovements,
  adjustInventory,
  getInventoryStats,
};
