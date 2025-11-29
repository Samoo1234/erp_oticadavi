/**
 * Exportação centralizada de hooks
 */

// Clientes (banco central)
export { useClients, useClient, useClientStats } from './useClients';

// Produtos (banco local)
export { useProducts, useProduct, useLowStockProducts } from './useProducts';

// Vendas (banco local)
export { useSales, useSale, useSalesByClient } from './useSales';

// Estoque (banco local)
export { useInventory, useInventoryMovements, useProductInventory } from './useInventory';

// Prescrições (banco local)
export { 
  usePrescriptions, 
  usePrescriptionsByClient, 
  useExpiredPrescriptions,
  useLensCalculation 
} from './usePrescriptions';

// Relatórios (banco local)
export { 
  useDashboard, 
  useSalesReport, 
  useInventoryReport, 
  useClientsReport,
  useExportReport 
} from './useReports';
