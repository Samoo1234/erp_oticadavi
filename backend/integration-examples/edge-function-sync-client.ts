/**
 * Edge Function para Supabase - Sistema de Agendamento
 * 
 * Esta função é acionada automaticamente quando um cliente é criado ou atualizado
 * no sistema de agendamento e sincroniza os dados com o ERP da ótica.
 * 
 * Deploy:
 * supabase functions deploy sync-client-to-erp
 * 
 * Configuração do Webhook:
 * - Tabela: clients
 * - Eventos: INSERT, UPDATE
 * - Tipo: Edge Function
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ========== CONFIGURAÇÃO ==========
// IMPORTANTE: Configure essas variáveis no Supabase (Settings > Edge Functions > Secrets)
const ERP_API_URL = Deno.env.get("ERP_API_URL") || "https://seu-erp.com/api/v1/clients/sync";
const ERP_API_KEY = Deno.env.get("ERP_API_KEY") || "sua_api_key_aqui";

// ========== INTERFACES ==========
interface DatabaseWebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: Client | null;
  old_record: Client | null;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cpf?: string;
  birth_date?: string;
  gender?: "M" | "F" | "O";
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface ERPSyncPayload {
  externalId: string;
  name: string;
  email?: string | null;
  phone: string;
  cpf?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  address?: object | null;
  notes?: string | null;
}

interface ERPResponse {
  success: boolean;
  message: string;
  action?: "created" | "updated";
  data?: any;
  error?: string;
}

// ========== FUNÇÃO PRINCIPAL ==========
serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse webhook payload
    const payload: DatabaseWebhookPayload = await req.json();
    
    console.log("📥 Webhook recebido:", {
      type: payload.type,
      table: payload.table,
      clientId: payload.record?.id,
    });

    // Processar apenas INSERT e UPDATE
    if (payload.type !== "INSERT" && payload.type !== "UPDATE") {
      console.log("⏭️  Evento ignorado:", payload.type);
      return new Response(
        JSON.stringify({ 
          success: true, 
          skipped: true,
          reason: `Evento ${payload.type} não processado`
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    const client = payload.record;
    
    if (!client) {
      console.error("❌ Nenhum registro encontrado no payload");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Registro não encontrado no payload" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }

    // Validar dados obrigatórios
    if (!client.id || !client.name || !client.phone) {
      console.error("❌ Dados obrigatórios faltando:", {
        hasId: !!client.id,
        hasName: !!client.name,
        hasPhone: !!client.phone,
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Dados obrigatórios faltando (id, name, phone)" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }

    // Mapear dados para o formato do ERP
    const erpPayload: ERPSyncPayload = {
      externalId: client.id,
      name: client.name,
      email: client.email || null,
      phone: client.phone,
      cpf: client.cpf || null,
      birthDate: client.birth_date || null,
      gender: client.gender || null,
      address: client.address || null,
      notes: client.notes || null,
    };

    console.log("📤 Enviando para ERP:", {
      url: ERP_API_URL,
      clientName: erpPayload.name,
      externalId: erpPayload.externalId,
    });

    // Enviar para o ERP
    const response = await fetch(ERP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ERP_API_KEY,
      },
      body: JSON.stringify(erpPayload),
    });

    const result: ERPResponse = await response.json();

    if (!response.ok) {
      console.error("❌ Erro ao sincronizar com ERP:", {
        status: response.status,
        statusText: response.statusText,
        error: result.error || result.message,
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `ERP retornou erro: ${result.message || result.error}`,
          details: result
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status
        }
      );
    }

    console.log("✅ Cliente sincronizado com sucesso:", {
      clientName: client.name,
      action: result.action,
      status: response.status,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cliente ${result.action === 'created' ? 'criado' : 'atualizado'} no ERP`,
        action: result.action,
        erpClientId: result.data?.id,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("💥 Erro inesperado:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Erro interno ao processar webhook",
        stack: error.stack,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});

/**
 * ========== NOTAS DE IMPLEMENTAÇÃO ==========
 * 
 * 1. Configuração de Secrets no Supabase:
 *    - Acesse: Settings > Edge Functions > Secrets
 *    - Adicione:
 *      - ERP_API_URL: https://seu-erp.com/api/v1/clients/sync
 *      - ERP_API_KEY: sua_api_key_gerada
 * 
 * 2. Deploy da função:
 *    supabase functions deploy sync-client-to-erp
 * 
 * 3. Configurar Database Webhook:
 *    - Acesse: Database > Webhooks > Create a new hook
 *    - Nome: sync-client-to-erp
 *    - Tabela: clients
 *    - Eventos: INSERT, UPDATE
 *    - Tipo: Edge Function
 *    - Função: sync-client-to-erp
 * 
 * 4. Testar:
 *    - Crie ou atualize um cliente no sistema de agendamento
 *    - Verifique logs: supabase functions logs sync-client-to-erp
 *    - Confirme no ERP que o cliente foi sincronizado
 * 
 * 5. Monitoramento:
 *    - Logs em tempo real: supabase functions logs sync-client-to-erp --tail
 *    - Dashboard do Supabase: Functions > sync-client-to-erp > Invocations
 * 
 * 6. Retry em caso de falha:
 *    - O Supabase automaticamente tenta reenviar webhooks que falharam
 *    - Você pode configurar o número de tentativas no painel
 * 
 * 7. Performance:
 *    - Edge Functions rodam na borda (Deno Deploy)
 *    - Latência típica: < 100ms
 *    - Timeout padrão: 30 segundos
 */

