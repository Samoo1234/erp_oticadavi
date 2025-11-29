import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase para o banco de dados CENTRAL de clientes
 * Este banco é compartilhado entre os 3 sistemas:
 * - Agendamento (gestão ótica) - cria cliente com dados mínimos (nome, telefone)
 * - VisionCare - completa cadastro do cliente
 * - ERP - consome dados dos clientes
 */

const supabaseCentralUrl = process.env.REACT_APP_SUPABASE_CENTRAL_URL
const supabaseCentralAnonKey = process.env.REACT_APP_SUPABASE_CENTRAL_ANON_KEY

if (!supabaseCentralUrl || !supabaseCentralAnonKey) {
  console.warn(
    'Variáveis de ambiente do Supabase Central não encontradas. ' +
    'Verifique se REACT_APP_SUPABASE_CENTRAL_URL e REACT_APP_SUPABASE_CENTRAL_ANON_KEY estão definidas no arquivo .env'
  )
}

export const supabaseCentral = createClient(
  supabaseCentralUrl || '', 
  supabaseCentralAnonKey || '', 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
)

// Interface do cliente central
export interface ClienteCentral {
  id: string;
  codigo?: string;
  nome: string;
  telefone: string;
  cpf?: string;
  rg?: string;
  email?: string;
  data_nascimento?: string;
  sexo?: string;
  endereco?: {
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    complemento?: string;
  };
  cidade?: string;
  nome_pai?: string;
  nome_mae?: string;
  foto_url?: string;
  observacoes?: string;
  erp_cliente_id?: string;
  total_compras?: number;
  ultima_compra?: string;
  cadastro_completo: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Interface mapeada para o formato do ERP (camelCase)
export interface ClienteERP {
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

/**
 * Converte cliente do banco central para formato do ERP
 */
const mapClienteCentralToERP = (cliente: ClienteCentral): ClienteERP => {
  return {
    id: cliente.id,
    name: cliente.nome,
    phone: cliente.telefone,
    cpf: cliente.cpf,
    email: cliente.email,
    birthDate: cliente.data_nascimento,
    gender: cliente.sexo,
    address: cliente.endereco ? {
      street: cliente.endereco.rua,
      number: cliente.endereco.numero,
      neighborhood: cliente.endereco.bairro,
      city: cliente.endereco.cidade || cliente.cidade,
      state: cliente.endereco.estado,
      zipCode: cliente.endereco.cep
    } : undefined,
    notes: cliente.observacoes,
    isActive: cliente.active,
    totalPurchases: cliente.total_compras || 0,
    lastPurchase: cliente.ultima_compra,
    loyaltyPoints: 0
  };
};

/**
 * Buscar clientes por termo (nome, telefone, CPF ou email)
 * Retorna clientes no formato do ERP
 */
export const buscarClientesCentral = async (termo: string = '', limite: number = 50): Promise<ClienteERP[]> => {
  try {
    let query = supabaseCentral
      .from('clientes')
      .select('*')
      .eq('active', true)
      .order('nome', { ascending: true })
      .limit(limite);

    if (termo && termo.trim().length >= 2) {
      const termoLimpo = termo.trim();
      const termoNumerico = termoLimpo.replace(/\D/g, '');
      
      // Se o termo é numérico, buscar por telefone ou CPF
      if (termoNumerico.length > 0 && termoNumerico.length === termoLimpo.length) {
        query = supabaseCentral
          .from('clientes')
          .select('*')
          .or(`telefone.ilike.%${termoNumerico}%,cpf.ilike.%${termoNumerico}%`)
          .eq('active', true)
          .order('nome', { ascending: true })
          .limit(limite);
      } else {
        // Buscar por nome ou email
        query = supabaseCentral
          .from('clientes')
          .select('*')
          .or(`nome.ilike.%${termoLimpo}%,email.ilike.%${termoLimpo}%`)
          .eq('active', true)
          .order('nome', { ascending: true })
          .limit(limite);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar clientes no banco central:', error);
      throw error;
    }

    // Mapear para formato do ERP
    return (data || []).map(mapClienteCentralToERP);
  } catch (error) {
    console.error('Erro ao buscar clientes centrais:', error);
    return [];
  }
};

/**
 * Buscar cliente por ID
 */
export const buscarClienteCentralPorId = async (id: string): Promise<ClienteERP | null> => {
  try {
    const { data, error } = await supabaseCentral
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      console.error('Erro ao buscar cliente por ID:', error);
      throw error;
    }

    return data ? mapClienteCentralToERP(data) : null;
  } catch (error) {
    console.error('Erro ao buscar cliente central por ID:', error);
    return null;
  }
};

/**
 * Buscar cliente por telefone
 */
export const buscarClienteCentralPorTelefone = async (telefone: string): Promise<ClienteERP | null> => {
  try {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    
    const { data, error } = await supabaseCentral
      .from('clientes')
      .select('*')
      .eq('telefone', telefoneLimpo)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar cliente por telefone:', error);
      throw error;
    }

    return data ? mapClienteCentralToERP(data) : null;
  } catch (error) {
    console.error('Erro ao buscar cliente central por telefone:', error);
    return null;
  }
};

/**
 * Listar todos os clientes ativos
 */
export const listarClientesCentral = async (page: number = 1, limite: number = 50): Promise<{
  clients: ClienteERP[];
  total: number;
}> => {
  try {
    const from = (page - 1) * limite;
    const to = from + limite - 1;

    const { data, error, count } = await supabaseCentral
      .from('clientes')
      .select('*', { count: 'exact' })
      .eq('active', true)
      .order('nome', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Erro ao listar clientes centrais:', error);
      throw error;
    }

    return {
      clients: (data || []).map(mapClienteCentralToERP),
      total: count || 0
    };
  } catch (error) {
    console.error('Erro ao listar clientes centrais:', error);
    return { clients: [], total: 0 };
  }
};

/**
 * Contar total de clientes
 */
export const contarClientesCentral = async (): Promise<number> => {
  try {
    const { count, error } = await supabaseCentral
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    if (error) {
      console.error('Erro ao contar clientes:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Erro ao contar clientes centrais:', error);
    return 0;
  }
};

export default supabaseCentral;
