/**
 * Types centralizados do ERP Ótica Davi
 */

// ==================== USER ====================
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'seller' | 'optician';
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  phone?: string;
  isActive?: boolean;
}

// ==================== CLIENT (do banco CENTRAL) ====================
export interface Client {
  id: string;
  name: string;
  phone: string;
  cpf?: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  address?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  notes?: string;
  isActive: boolean;
  totalPurchases?: number;
  lastPurchase?: string;
  loyaltyPoints?: number;
}

// ==================== PRODUCT ====================
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  color?: string;
  material?: string;
  gender?: string;
  price: number;
  costPrice?: number;
  profitMargin?: number;
  weight?: number;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  specifications?: Record<string, any>;
  images?: string[];
  isActive: boolean;
  isPrescriptionRequired?: boolean;
  minStock?: number;
  maxStock?: number;
  tags?: string[];
  currentStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDTO {
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice?: number;
  description?: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  color?: string;
  material?: string;
  gender?: string;
  minStock?: number;
  maxStock?: number;
  isPrescriptionRequired?: boolean;
  tags?: string[];
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  isActive?: boolean;
}

// ==================== INVENTORY ====================
export interface Inventory {
  id: string;
  productId: string;
  product?: Product;
  location: string;
  currentStock: number;
  reservedStock: number;
  minStock: number;
  maxStock?: number;
  lastUpdated: string;
  lastCountDate?: string;
  costPrice?: number;
  averageCost?: number;
  isActive: boolean;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  product?: Product;
  inventoryId: string;
  movementType: 'in' | 'out' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  totalCost?: number;
  reason?: string;
  reference?: string;
  referenceId?: string;
  userId: string;
  user?: User;
  notes?: string;
  movementDate: string;
  createdAt: string;
}

export interface CreateMovementDTO {
  productId: string;
  movementType: string;
  quantity: number;
  location: string;
  unitCost?: number;
  reason?: string;
  reference?: string;
  notes?: string;
}

// ==================== PRESCRIPTION ====================
export interface EyeData {
  sphere?: number;
  cylinder?: number;
  axis?: number;
  add?: number;
  pd?: number;
}

export interface Prescription {
  id: string;
  clientId: string;
  client?: Client;
  prescriptionDate: string;
  doctorName?: string;
  doctorCrm?: string;
  doctorPhone?: string;
  rightEye?: EyeData;
  leftEye?: EyeData;
  pd?: number;
  additionalInfo?: string;
  expiryDate?: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePrescriptionDTO {
  clientId: string;
  prescriptionDate: string;
  doctorName?: string;
  doctorCrm?: string;
  rightEye?: EyeData;
  leftEye?: EyeData;
  pd?: number;
  additionalInfo?: string;
  expiryDate?: string;
}

// ==================== SALE ====================
export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  discountPercentage?: number;
  subtotal: number;
  lensSpecifications?: Record<string, any>;
  prescriptionData?: Record<string, any>;
  notes?: string;
  productionStatus?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

export interface Sale {
  id: string;
  clientId: string;
  client?: Client;
  userId: string;
  user?: User;
  prescriptionId?: string;
  prescription?: Prescription;
  saleNumber?: string;
  saleDate: string;
  status: 'draft' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  subtotal: number;
  discountAmount?: number;
  discountPercentage?: number;
  taxAmount?: number;
  total: number;
  paymentMethod?: string;
  installments?: number;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'cancelled';
  deliveryDate?: string;
  deliveryAddress?: Record<string, any>;
  notes?: string;
  internalNotes?: string;
  warrantyPeriod?: number;
  warrantyExpiry?: string;
  isGift?: boolean;
  giftMessage?: string;
  items?: SaleItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSaleDTO {
  clientId: string;
  prescriptionId?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountAmount?: number;
  }[];
  paymentMethod?: string;
  installments?: number;
  discountAmount?: number;
  discountPercentage?: number;
  notes?: string;
  deliveryDate?: string;
}

// ==================== TSO ====================
export interface TSO {
  id: string;
  clientId: string;
  client?: Client;
  userId: string;
  user?: User;
  prescriptionId?: string;
  prescription?: Prescription;
  tsoNumber?: string;
  tsoDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  lensType?: string;
  lensDetails?: Record<string, any>;
  frameDetails?: Record<string, any>;
  observations?: string;
  estimatedValue?: number;
  approvedValue?: number;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== FISCAL ====================
export interface FiscalDocument {
  id: string;
  saleId: string;
  sale?: Sale;
  documentType: 'nfe' | 'nfce' | 'nfse';
  documentNumber?: string;
  series?: string;
  accessKey?: string;
  status: 'pending' | 'issued' | 'cancelled' | 'error';
  issueDate?: string;
  xmlContent?: string;
  pdfUrl?: string;
  errorMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== REPORTS ====================
export interface DashboardStats {
  totalSales: number;
  revenue: number;
  averageTicket: number;
  totalClients: number;
  totalProducts: number;
  lowStockProducts: number;
  activePrescriptions: number;
  expiredPrescriptions: number;
}

export interface SalesReport {
  period: string;
  totalSales: number;
  revenue: number;
  averageTicket: number;
  topProducts: {
    product: Product;
    quantity: number;
    revenue: number;
  }[];
  salesByCategory: {
    category: string;
    quantity: number;
    revenue: number;
  }[];
  salesByPaymentMethod: {
    method: string;
    count: number;
    total: number;
  }[];
}

// ==================== API RESPONSE ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== FILTERS ====================
export interface SaleFilters {
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  search?: string;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  isActive?: boolean;
  lowStock?: boolean;
  search?: string;
}

export interface ClientFilters {
  isActive?: boolean;
  minLoyaltyPoints?: number;
  minTotalPurchases?: number;
  search?: string;
}
