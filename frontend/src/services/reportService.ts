/**
 * Serviço de Relatórios - BANCO LOCAL
 */

import { api } from './api';
import type { ApiResponse, DashboardStats, SalesReport } from '../types';

const BASE_URL = '/reports';

export type ReportPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Obter dados do dashboard
 */
export const getDashboard = async (period: ReportPeriod = 'month'): Promise<{
  sales: {
    total: number;
    revenue: number;
    averageTicket: number;
    dailySales: { date: string; count: number; revenue: number }[];
  };
  products: {
    topProducts: { product: any; totalQuantity: number; totalRevenue: number }[];
    salesByCategory: { category: string; totalQuantity: number; totalRevenue: number }[];
  };
  clients: {
    topClients: { client: any; totalPurchases: number; purchasesCount: number }[];
  };
  inventory: {
    stats: { totalProducts: number; totalValue: number; lowStockCount: number };
    lowStockProducts: any[];
  };
  prescriptions: {
    active: number;
    expired: number;
  };
}> => {
  const response = await api.get<ApiResponse<any>>(`${BASE_URL}/dashboard?period=${period}`);
  return response.data.data;
};

/**
 * Relatório de vendas
 */
export const getSalesReport = async (filters: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}): Promise<SalesReport> => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.groupBy) params.append('groupBy', filters.groupBy);

  const response = await api.get<ApiResponse<SalesReport>>(
    `${BASE_URL}/sales?${params.toString()}`
  );
  return response.data.data;
};

/**
 * Relatório de estoque
 */
export const getInventoryReport = async (): Promise<{
  totalProducts: number;
  totalValue: number;
  lowStockProducts: any[];
  outOfStockProducts: any[];
  byCategory: { category: string; count: number; value: number }[];
}> => {
  const response = await api.get<ApiResponse<any>>(`${BASE_URL}/inventory`);
  return response.data.data;
};

/**
 * Relatório de clientes
 */
export const getClientsReport = async (): Promise<{
  totalClients: number;
  newClientsThisMonth: number;
  topClients: any[];
  clientsByCity: { city: string; count: number }[];
}> => {
  const response = await api.get<ApiResponse<any>>(`${BASE_URL}/clients`);
  return response.data.data;
};

/**
 * Exportar relatório
 */
export const exportReport = async (
  reportType: 'sales' | 'inventory' | 'clients',
  format: 'pdf' | 'excel' | 'csv',
  filters?: Record<string, string>
): Promise<Blob> => {
  const params = new URLSearchParams({ format });
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      params.append(key, value);
    });
  }

  const response = await api.get(`${BASE_URL}/${reportType}?${params.toString()}`, {
    responseType: 'blob',
  });
  
  return response.data;
};

export default {
  getDashboard,
  getSalesReport,
  getInventoryReport,
  getClientsReport,
  exportReport,
};
