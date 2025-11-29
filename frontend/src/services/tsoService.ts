/**
 * Serviço de TSO (Tabela de Solicitação de Orçamento) - BANCO LOCAL
 */

import { api } from './api';
import type { TSO, ApiResponse } from '../types';

const BASE_URL = '/tso';

export interface CreateTSODTO {
  clientId: string;
  prescriptionId?: string;
  lensType?: string;
  lensDetails?: Record<string, any>;
  frameDetails?: Record<string, any>;
  observations?: string;
  estimatedValue?: number;
}

/**
 * Listar TSOs
 */
export const getTSOs = async (filters: {
  status?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{
  tsos: TSO[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.clientId) params.append('clientId', filters.clientId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const response = await api.get<ApiResponse<{ tsos: TSO[]; pagination: any }>>(
    `${BASE_URL}?${params.toString()}`
  );
  
  const data = response.data.data;
  return {
    tsos: data.tsos || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || 1,
    totalPages: data.pagination?.totalPages || 1,
  };
};

/**
 * Buscar TSO por ID
 */
export const getTSOById = async (id: string): Promise<TSO> => {
  const response = await api.get<ApiResponse<TSO>>(`${BASE_URL}/${id}`);
  return response.data.data;
};

/**
 * Criar TSO
 */
export const createTSO = async (data: CreateTSODTO): Promise<TSO> => {
  const response = await api.post<ApiResponse<TSO>>(BASE_URL, data);
  return response.data.data;
};

/**
 * Atualizar TSO
 */
export const updateTSO = async (id: string, data: Partial<CreateTSODTO>): Promise<TSO> => {
  const response = await api.put<ApiResponse<TSO>>(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

/**
 * Aprovar TSO
 */
export const approveTSO = async (id: string, approvedValue: number): Promise<TSO> => {
  const response = await api.post<ApiResponse<TSO>>(`${BASE_URL}/${id}/approve`, {
    approvedValue,
  });
  return response.data.data;
};

/**
 * Rejeitar TSO
 */
export const rejectTSO = async (id: string, reason?: string): Promise<TSO> => {
  const response = await api.post<ApiResponse<TSO>>(`${BASE_URL}/${id}/reject`, {
    reason,
  });
  return response.data.data;
};

/**
 * Cancelar TSO
 */
export const cancelTSO = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};

/**
 * Converter TSO em venda
 */
export const convertTSOToSale = async (id: string): Promise<any> => {
  const response = await api.post<ApiResponse<any>>(`${BASE_URL}/${id}/convert-to-sale`);
  return response.data.data;
};

export default {
  getTSOs,
  getTSOById,
  createTSO,
  updateTSO,
  approveTSO,
  rejectTSO,
  cancelTSO,
  convertTSOToSale,
};
