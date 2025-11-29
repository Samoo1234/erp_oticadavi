/**
 * Constantes e Enums centralizados do ERP Ótica Davi
 */

// ==================== STATUS DE VENDA ====================
export const SALE_STATUS = {
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const SALE_STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  confirmed: 'Confirmada',
  processing: 'Processando',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

export const SALE_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// ==================== STATUS DE PAGAMENTO ====================
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PARTIAL: 'partial',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  partial: 'Parcial',
  cancelled: 'Cancelado',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-100 text-red-800',
};

// ==================== MÉTODOS DE PAGAMENTO ====================
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PIX: 'pix',
  BANK_TRANSFER: 'bank_transfer',
  CHECK: 'check',
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Dinheiro',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  pix: 'PIX',
  bank_transfer: 'Transferência',
  check: 'Cheque',
};

// ==================== CATEGORIAS DE PRODUTOS ====================
export const PRODUCT_CATEGORIES = {
  OCULOS_GRAU: 'oculos_grau',
  OCULOS_SOL: 'oculos_sol',
  LENTES: 'lentes',
  ACESSORIOS: 'acessorios',
  SERVICOS: 'servicos',
} as const;

export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  oculos_grau: 'Óculos de Grau',
  oculos_sol: 'Óculos de Sol',
  lentes: 'Lentes',
  acessorios: 'Acessórios',
  servicos: 'Serviços',
};

export const PRODUCT_CATEGORY_ICONS: Record<string, string> = {
  oculos_grau: '👓',
  oculos_sol: '🕶️',
  lentes: '🔍',
  acessorios: '📦',
  servicos: '🔧',
};

// ==================== GÊNEROS ====================
export const GENDERS = {
  MALE: 'M',
  FEMALE: 'F',
  UNISEX: 'U',
  CHILD: 'C',
} as const;

export const GENDER_LABELS: Record<string, string> = {
  M: 'Masculino',
  F: 'Feminino',
  U: 'Unissex',
  C: 'Infantil',
};

// ==================== ROLES DE USUÁRIOS ====================
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SELLER: 'seller',
  OPTICIAN: 'optician',
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  seller: 'Vendedor',
  optician: 'Óptico',
};

export const USER_ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  seller: 'bg-green-100 text-green-800',
  optician: 'bg-orange-100 text-orange-800',
};

// ==================== STATUS DE PRESCRIÇÃO ====================
export const PRESCRIPTION_STATUS = {
  ACTIVE: 'active',
  USED: 'used',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

export const PRESCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: 'Ativa',
  used: 'Utilizada',
  expired: 'Expirada',
  cancelled: 'Cancelada',
};

export const PRESCRIPTION_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  used: 'bg-blue-100 text-blue-800',
  expired: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

// ==================== TIPOS DE LENTE ====================
export const LENS_TYPES = {
  SINGLE_VISION: 'single_vision',
  BIFOCAL: 'bifocal',
  PROGRESSIVE: 'progressive',
  READING: 'reading',
} as const;

export const LENS_TYPE_LABELS: Record<string, string> = {
  single_vision: 'Visão Simples',
  bifocal: 'Bifocal',
  progressive: 'Progressiva',
  reading: 'Leitura',
};

// ==================== MATERIAIS DE LENTE ====================
export const LENS_MATERIALS = {
  GLASS: 'glass',
  PLASTIC: 'plastic',
  POLYCARBONATE: 'polycarbonate',
  TRIVEX: 'trivex',
} as const;

export const LENS_MATERIAL_LABELS: Record<string, string> = {
  glass: 'Vidro',
  plastic: 'Plástico',
  polycarbonate: 'Policarbonato',
  trivex: 'Trivex',
};

// ==================== TIPOS DE MOVIMENTAÇÃO DE ESTOQUE ====================
export const MOVEMENT_TYPES = {
  IN: 'in',
  OUT: 'out',
  ADJUSTMENT: 'adjustment',
  TRANSFER: 'transfer',
  RETURN: 'return',
} as const;

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  in: 'Entrada',
  out: 'Saída',
  adjustment: 'Ajuste',
  transfer: 'Transferência',
  return: 'Devolução',
};

export const MOVEMENT_TYPE_COLORS: Record<string, string> = {
  in: 'bg-green-100 text-green-800',
  out: 'bg-red-100 text-red-800',
  adjustment: 'bg-yellow-100 text-yellow-800',
  transfer: 'bg-blue-100 text-blue-800',
  return: 'bg-purple-100 text-purple-800',
};

// ==================== STATUS TSO ====================
export const TSO_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

export const TSO_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  completed: 'Concluído',
};

export const TSO_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

// ==================== STATUS FISCAL ====================
export const FISCAL_STATUS = {
  PENDING: 'pending',
  ISSUED: 'issued',
  CANCELLED: 'cancelled',
  ERROR: 'error',
} as const;

export const FISCAL_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  issued: 'Emitida',
  cancelled: 'Cancelada',
  error: 'Erro',
};

export const FISCAL_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  issued: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  error: 'bg-red-100 text-red-800',
};

// ==================== CONFIGURAÇÕES ====================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

export const API_TIMEOUT = 10000;

// ==================== ESTADOS DO BRASIL ====================
export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
] as const;

// ==================== HELPERS ====================
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  return cpf;
};
