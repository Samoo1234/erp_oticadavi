/**
 * Serviço de Clientes - BANCO CENTRAL
 * Os clientes são gerenciados no banco central compartilhado entre sistemas
 */

import {
  supabaseCentral,
  buscarClientesCentral,
  buscarClienteCentralPorId,
  buscarClienteCentralPorTelefone,
  listarClientesCentral,
  contarClientesCentral,
  ClienteERP,
} from './supabaseCentral';

export interface ClientFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ClientListResponse {
  clients: ClienteERP[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Listar clientes com paginação
 */
export const getClients = async (
  filters: ClientFilters = {}
): Promise<ClientListResponse> => {
  const { page = 1, limit = 50, search } = filters;

  if (search && search.trim().length >= 2) {
    const clients = await buscarClientesCentral(search, limit);
    return {
      clients,
      total: clients.length,
      page: 1,
      totalPages: 1,
    };
  }

  const result = await listarClientesCentral(page, limit);
  return {
    clients: result.clients,
    total: result.total,
    page,
    totalPages: Math.ceil(result.total / limit),
  };
};

/**
 * Buscar cliente por ID
 */
export const getClientById = async (id: string): Promise<ClienteERP | null> => {
  return buscarClienteCentralPorId(id);
};

/**
 * Buscar cliente por telefone
 */
export const getClientByPhone = async (phone: string): Promise<ClienteERP | null> => {
  return buscarClienteCentralPorTelefone(phone);
};

/**
 * Buscar clientes por termo
 */
export const searchClients = async (
  term: string,
  limit: number = 50
): Promise<ClienteERP[]> => {
  return buscarClientesCentral(term, limit);
};

/**
 * Contar total de clientes
 */
export const getClientsCount = async (): Promise<number> => {
  return contarClientesCentral();
};

/**
 * Obter estatísticas de clientes
 */
export const getClientStats = async (): Promise<{
  total: number;
  active: number;
}> => {
  const total = await contarClientesCentral();
  return {
    total,
    active: total, // Todos os clientes listados são ativos
  };
};

// Re-exportar tipos
export type { ClienteERP as Client };

export default {
  getClients,
  getClientById,
  getClientByPhone,
  searchClients,
  getClientsCount,
  getClientStats,
};
