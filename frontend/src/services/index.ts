/**
 * Exportação centralizada de serviços
 */

// API base
export { api } from './api';

// Supabase Central (para clientes)
export {
  supabaseCentral,
  buscarClientesCentral,
  buscarClienteCentralPorId,
  buscarClienteCentralPorTelefone,
  listarClientesCentral,
  contarClientesCentral,
} from './supabaseCentral';
export type { ClienteCentral, ClienteERP } from './supabaseCentral';

// Serviços por entidade
export * as clientService from './clientService';
export * as productService from './productService';
export * as saleService from './saleService';
export * as inventoryService from './inventoryService';
export * as prescriptionService from './prescriptionService';
export * as userService from './userService';
export * as reportService from './reportService';
export * as tsoService from './tsoService';
