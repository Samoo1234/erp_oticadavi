/**
 * Serviço de Usuários - BANCO LOCAL
 */

import { api } from './api';
import type { User, CreateUserDTO, UpdateUserDTO, ApiResponse } from '../types';

const BASE_URL = '/users';

/**
 * Listar usuários
 */
export const getUsers = async (filters: {
  role?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const params = new URLSearchParams();
  
  if (filters.role) params.append('role', filters.role);
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const response = await api.get<ApiResponse<{ users: User[]; pagination: any }>>(
    `${BASE_URL}?${params.toString()}`
  );
  
  const data = response.data.data;
  return {
    users: data.users || [],
    total: data.pagination?.total || 0,
    page: data.pagination?.page || 1,
    totalPages: data.pagination?.totalPages || 1,
  };
};

/**
 * Buscar usuário por ID
 */
export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get<ApiResponse<User>>(`${BASE_URL}/${id}`);
  return response.data.data;
};

/**
 * Criar usuário
 */
export const createUser = async (data: CreateUserDTO): Promise<User> => {
  const response = await api.post<ApiResponse<User>>(BASE_URL, data);
  return response.data.data;
};

/**
 * Atualizar usuário
 */
export const updateUser = async (id: string, data: UpdateUserDTO): Promise<User> => {
  const response = await api.put<ApiResponse<User>>(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

/**
 * Excluir usuário
 */
export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};

/**
 * Alterar senha
 */
export const changePassword = async (
  id: string,
  data: { currentPassword: string; newPassword: string }
): Promise<void> => {
  await api.put(`${BASE_URL}/${id}/password`, data);
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
