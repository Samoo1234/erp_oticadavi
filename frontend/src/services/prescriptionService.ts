/**
 * Serviço de Prescrições - BANCO LOCAL
 */

import { api } from './api';
import type { Prescription, CreatePrescriptionDTO, ApiResponse } from '../types';

const BASE_URL = '/prescriptions';

/**
 * Listar prescrições
 */
export const getPrescriptions = async (filters: {
  clientId?: string;
  status?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{
  prescriptions: Prescription[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const params = new URLSearchParams();
  
  if (filters.clientId) params.append('clientId', filters.clientId);
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const response = await api.get<ApiResponse<{ prescriptions: Prescription[]; pagination: any }>>(
    `${BASE_URL}?${params.toString()}`
  );
  
  const data = response.data.data;
  return {
    prescriptions: data.prescriptions || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || 1,
    totalPages: data.pagination?.totalPages || 1,
  };
};

/**
 * Buscar prescrição por ID
 */
export const getPrescriptionById = async (id: string): Promise<Prescription> => {
  const response = await api.get<ApiResponse<Prescription>>(`${BASE_URL}/${id}`);
  return response.data.data;
};

/**
 * Criar prescrição
 */
export const createPrescription = async (data: CreatePrescriptionDTO): Promise<Prescription> => {
  const response = await api.post<ApiResponse<Prescription>>(BASE_URL, data);
  return response.data.data;
};

/**
 * Atualizar prescrição
 */
export const updatePrescription = async (
  id: string,
  data: Partial<CreatePrescriptionDTO>
): Promise<Prescription> => {
  const response = await api.put<ApiResponse<Prescription>>(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

/**
 * Cancelar prescrição
 */
export const cancelPrescription = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};

/**
 * Obter prescrições por cliente
 */
export const getPrescriptionsByClient = async (clientId: string): Promise<Prescription[]> => {
  const response = await api.get<ApiResponse<Prescription[]>>(
    `${BASE_URL}/client/${clientId}`
  );
  return response.data.data;
};

/**
 * Obter prescrições expiradas
 */
export const getExpiredPrescriptions = async (): Promise<Prescription[]> => {
  const response = await api.get<ApiResponse<Prescription[]>>(`${BASE_URL}/expired`);
  return response.data.data;
};

/**
 * Calcular lente
 */
export const calculateLens = async (data: {
  prescriptionData: any;
  material: string;
  coating: string[];
  diameter?: number;
}): Promise<{
  rightEye: any;
  leftEye: any;
  totalPrice: number;
  breakdown: any;
}> => {
  const response = await api.post<ApiResponse<any>>(`${BASE_URL}/calculate-lens`, data);
  return response.data.data;
};

export default {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  cancelPrescription,
  getPrescriptionsByClient,
  getExpiredPrescriptions,
  calculateLens,
};
