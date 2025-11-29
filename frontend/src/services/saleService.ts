/**
 * Serviço de Vendas - BANCO LOCAL
 */

import { api } from './api';
import type { Sale, CreateSaleDTO, ApiResponse, SaleFilters } from '../types';

const BASE_URL = '/sales';

/**
 * Listar vendas
 */
export const getSales = async (filters: SaleFilters = {}): Promise<{
  sales: Sale[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
  if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.clientId) params.append('clientId', filters.clientId);

  const response = await api.get<ApiResponse<{ sales: Sale[]; pagination: any }>>(
    `${BASE_URL}?${params.toString()}`
  );
  
  const data = response.data.data;
  return {
    sales: data.sales || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || 1,
    totalPages: data.pagination?.totalPages || 1,
  };
};

/**
 * Buscar venda por ID
 */
export const getSaleById = async (id: string): Promise<Sale> => {
  const response = await api.get<ApiResponse<Sale>>(`${BASE_URL}/${id}`);
  return response.data.data;
};

/**
 * Criar venda
 */
export const createSale = async (data: CreateSaleDTO): Promise<Sale> => {
  const response = await api.post<ApiResponse<Sale>>(BASE_URL, data);
  return response.data.data;
};

/**
 * Atualizar venda
 */
export const updateSale = async (id: string, data: Partial<CreateSaleDTO>): Promise<Sale> => {
  const response = await api.put<ApiResponse<Sale>>(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

/**
 * Confirmar venda
 */
export const confirmSale = async (id: string): Promise<Sale> => {
  const response = await api.post<ApiResponse<Sale>>(`${BASE_URL}/${id}/confirm`);
  return response.data.data;
};

/**
 * Cancelar venda
 */
export const cancelSale = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};

/**
 * Obter estatísticas de vendas
 */
export const getSalesStats = async (period?: string): Promise<{
  totalSales: number;
  revenue: number;
  averageTicket: number;
  pendingCount: number;
}> => {
  const params = period ? `?period=${period}` : '';
  const response = await api.get<ApiResponse<any>>(`${BASE_URL}/stats${params}`);
  return response.data.data;
};

/**
 * Obter vendas por cliente
 */
export const getSalesByClient = async (clientId: string): Promise<Sale[]> => {
  const response = await api.get<ApiResponse<Sale[]>>(`${BASE_URL}/client/${clientId}`);
  return response.data.data;
};

export default {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  confirmSale,
  cancelSale,
  getSalesStats,
  getSalesByClient,
};
