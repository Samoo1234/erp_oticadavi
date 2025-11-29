/**
 * Hook para gerenciamento de relatórios (BANCO LOCAL)
 */

import { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import toast from 'react-hot-toast';
import * as reportService from '../services/reportService';
import type { ReportPeriod } from '../services/reportService';

export const useDashboard = (initialPeriod: ReportPeriod = 'month') => {
  const [period, setPeriod] = useState<ReportPeriod>(initialPeriod);

  const { data, isLoading, error, refetch } = useQuery(
    ['dashboard', period],
    () => reportService.getDashboard(period),
    {
      staleTime: 60000, // 1 minuto
      refetchInterval: 300000, // 5 minutos
    }
  );

  return {
    data,
    period,
    setPeriod,
    isLoading,
    error,
    refetch,
  };
};

export const useSalesReport = (initialFilters: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
} = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const { data, isLoading, error, refetch } = useQuery(
    ['salesReport', filters],
    () => reportService.getSalesReport(filters),
    {
      staleTime: 60000,
    }
  );

  return {
    report: data,
    filters,
    setFilters,
    isLoading,
    error,
    refetch,
  };
};

export const useInventoryReport = () => {
  const { data, isLoading, error, refetch } = useQuery(
    ['inventoryReport'],
    reportService.getInventoryReport,
    { staleTime: 60000 }
  );

  return {
    report: data,
    isLoading,
    error,
    refetch,
  };
};

export const useClientsReport = () => {
  const { data, isLoading, error, refetch } = useQuery(
    ['clientsReport'],
    reportService.getClientsReport,
    { staleTime: 60000 }
  );

  return {
    report: data,
    isLoading,
    error,
    refetch,
  };
};

export const useExportReport = () => {
  const mutation = useMutation(
    ({ reportType, format, filters }: {
      reportType: 'sales' | 'inventory' | 'clients';
      format: 'pdf' | 'excel' | 'csv';
      filters?: Record<string, string>;
    }) => reportService.exportReport(reportType, format, filters),
    {
      onSuccess: (blob, variables) => {
        // Criar link de download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-${variables.reportType}.${variables.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Relatório exportado com sucesso!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao exportar relatório');
      },
    }
  );

  return {
    exportReport: mutation.mutateAsync,
    isExporting: mutation.isLoading,
    error: mutation.error,
  };
};

export default useDashboard;
