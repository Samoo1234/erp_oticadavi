# Guia de Integração - Sistema de Agendamento → ERP Ótica

Este guia explica como integrar o sistema de agendamento com o ERP da ótica para sincronização automática de clientes em tempo real.

## 📋 Visão Geral

A integração funciona através de:
1. **Webhook do Supabase** no sistema de agendamento
2. **Edge Function** que captura mudanças na tabela de clientes
3. **API de Sincronização** no ERP que recebe e processa os dados

## 🔧 Configuração

### Passo 1: Gerar API Key

1. Gere uma API Key segura para autenticação:

```bash
# Exemplo de geração (use um método seguro)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. Adicione a API Key no arquivo `.env` do **ERP**:

```env
# API Keys para integração com sistemas externos (separadas por vírgula)
INTEGRATION_API_KEYS=sua_api_key_aqui,outra_key_se_necessario
```

3. Reinicie o servidor do ERP:

```bash
cd backend
npm run dev
```

### Passo 2: Criar Edge Function no Sistema de Agendamento

No Supabase do sistema de agendamento, crie uma Edge Function chamada `sync-client-to-erp`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ERP_API_URL = "https://seu-dominio-erp.com/api/v1/clients/sync";
const ERP_API_KEY = "sua_api_key_aqui";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cpf?: string;
  birth_date?: string;
  gender?: string;
  address?: any;
  notes?: string;
}

serve(async (req) => {
  try {
    const { type, record, old_record } = await req.json();

    // Processar apenas INSERT e UPDATE
    if (type !== "INSERT" && type !== "UPDATE") {
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const client: Client = record;

    // Mapear dados do cliente para o formato do ERP
    const payload = {
      externalId: client.id, // ID do cliente no sistema de agendamento
      name: client.name,
      email: client.email || null,
      phone: client.phone,
      cpf: client.cpf || null,
      birthDate: client.birth_date || null,
      gender: client.gender || null,
      address: client.address || null,
      notes: client.notes || null,
    };

    // Enviar para o ERP
    const response = await fetch(ERP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ERP_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    console.log(`Cliente sincronizado: ${client.name}`, {
      status: response.status,
      action: result.action,
    });

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao sincronizar cliente:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
```

#### Deploy da Edge Function:

```bash
# No terminal do sistema de agendamento
supabase functions deploy sync-client-to-erp
```

### Passo 3: Configurar Database Webhook

No painel do Supabase do sistema de agendamento:

1. Vá em **Database** → **Webhooks**
2. Clique em **Create a new hook**
3. Configure:
   - **Name**: `sync-client-to-erp`
   - **Table**: `clients` (ou nome da sua tabela de clientes)
   - **Events**: Marque `INSERT` e `UPDATE`
   - **Type**: `Edge Function`
   - **Edge Function**: Selecione `sync-client-to-erp`
4. Salve a configuração

## 🔍 Como Funciona

### Fluxo de Sincronização

```
┌─────────────────────┐
│  Sistema Agendamento│
│   (Supabase)        │
└──────────┬──────────┘
           │ Cliente criado/atualizado
           ▼
┌─────────────────────┐
│  Database Webhook   │
│  (Trigger)          │
└──────────┬──────────┘
           │ Dispara evento
           ▼
┌─────────────────────┐
│  Edge Function      │
│  sync-client-to-erp │
└──────────┬──────────┘
           │ POST /api/v1/clients/sync
           ▼
┌─────────────────────┐
│    ERP Ótica        │
│  API Endpoint       │
└──────────┬──────────┘
           │ Cria/Atualiza cliente
           ▼
┌─────────────────────┐
│  Tabela clients     │
│  (Supabase ERP)     │
└─────────────────────┘
```

### Mapeamento de Campos

| Sistema Agendamento | ERP Ótica       | Observação                    |
|---------------------|-----------------|-------------------------------|
| `id`                | `external_id`   | ID único do sistema externo   |
| `name`              | `name`          | Nome completo                 |
| `email`             | `email`         | E-mail (opcional)             |
| `phone`             | `phone`         | Telefone (obrigatório)        |
| `cpf`               | `cpf`           | CPF (opcional)                |
| `birth_date`        | `birth_date`    | Data de nascimento (opcional) |
| `gender`            | `gender`        | Gênero: M, F, O (opcional)    |
| `address`           | `address`       | JSON com endereço (opcional)  |
| `notes`             | `notes`         | Observações (opcional)        |

## 📝 Endpoint da API

### POST `/api/v1/clients/sync`

Sincroniza um cliente do sistema externo com o ERP.

#### Headers

```
Content-Type: application/json
X-API-Key: sua_api_key_aqui
```

#### Request Body

```json
{
  "externalId": "uuid-do-cliente-no-agendamento",
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 98765-4321",
  "cpf": "123.456.789-00",
  "birthDate": "1990-01-15",
  "gender": "M",
  "address": {
    "street": "Rua Exemplo, 123",
    "city": "São Paulo",
    "state": "SP",
    "zip": "01234-567"
  },
  "notes": "Cliente VIP"
}
```

#### Response - Cliente Novo (201 Created)

```json
{
  "success": true,
  "message": "Cliente criado com sucesso",
  "action": "created",
  "data": {
    "id": "uuid-no-erp",
    "external_id": "uuid-do-cliente-no-agendamento",
    "external_system": "agendamento",
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 98765-4321",
    // ... outros campos
  }
}
```

#### Response - Cliente Atualizado (200 OK)

```json
{
  "success": true,
  "message": "Cliente atualizado com sucesso",
  "action": "updated",
  "data": {
    // ... dados atualizados do cliente
  }
}
```

#### Response - Erro (400/500)

```json
{
  "success": false,
  "message": "Descrição do erro",
  "error": "Detalhes técnicos"
}
```

## 🧪 Testando a Integração

### Teste Manual via cURL

```bash
curl -X POST http://localhost:3000/api/v1/clients/sync \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_api_key_aqui" \
  -d '{
    "externalId": "test-123",
    "name": "Cliente Teste",
    "phone": "(11) 99999-9999",
    "email": "teste@email.com"
  }'
```

### Teste no Sistema de Agendamento

1. Crie um novo cliente no sistema de agendamento
2. Verifique os logs da Edge Function no Supabase
3. Confirme que o cliente foi criado no ERP:
   - Acesse o painel do ERP
   - Vá em **Clientes**
   - Procure pelo cliente criado
   - Verifique que o campo "Sistema Externo" está preenchido como "agendamento"

## 🔒 Segurança

### Boas Práticas

1. **API Key Segura**: Use chaves longas e aleatórias (mínimo 32 caracteres)
2. **HTTPS**: Sempre use HTTPS em produção
3. **Rate Limiting**: Configure limites de requisição no servidor
4. **Logs**: Monitore logs para detectar tentativas de acesso não autorizado
5. **Rotação de Chaves**: Troque a API Key periodicamente

### Configurando Rate Limiting (Opcional)

Instale o `express-rate-limit`:

```bash
npm install express-rate-limit
```

Configure no arquivo de rotas:

```javascript
const rateLimit = require('express-rate-limit');

const syncLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // Máximo 30 requisições por minuto
  message: 'Muitas requisições. Tente novamente em breve.'
});

router.post('/sync', syncLimiter, apiKeyAuth, syncClient);
```

## 🐛 Troubleshooting

### Cliente não está sendo sincronizado

1. **Verifique a API Key**:
   ```bash
   # No backend do ERP, verifique o .env
   echo $INTEGRATION_API_KEYS
   ```

2. **Verifique logs da Edge Function**:
   - Acesse o painel do Supabase (agendamento)
   - Vá em **Edge Functions** → **sync-client-to-erp**
   - Verifique os logs de execução

3. **Verifique logs do servidor ERP**:
   ```bash
   # Logs devem mostrar: [API Integration] Request from external system
   ```

4. **Teste o endpoint diretamente**:
   ```bash
   curl -v -X POST http://localhost:3000/api/v1/clients/sync \
     -H "Content-Type: application/json" \
     -H "X-API-Key: sua_api_key" \
     -d '{"externalId":"test","name":"Teste","phone":"11999999999"}'
   ```

### Erro 401 - Unauthorized

- A API Key está incorreta ou não foi configurada
- Verifique se a chave no `.env` corresponde à enviada no header

### Erro 400 - Bad Request

- Dados obrigatórios faltando (`externalId`, `name`, `phone`)
- Verifique o formato dos dados enviados

### Duplicação de Clientes

- Isso não deve acontecer: o sistema busca pelo `external_id` antes de criar
- Se ocorrer, verifique se o `externalId` está sendo enviado corretamente

## 📊 Monitoramento

### Logs no ERP

O sistema gera logs para cada sincronização:

```
[API Integration] Request from external system at 2025-11-02T10:30:00.000Z
Erro ao sincronizar cliente: <mensagem de erro>
Cliente sincronizado: João Silva { status: 201, action: 'created' }
```

### Verificar Clientes Sincronizados

```sql
-- No Supabase do ERP
SELECT 
  id,
  name,
  phone,
  external_id,
  external_system,
  created_at
FROM clients
WHERE external_system = 'agendamento'
ORDER BY created_at DESC;
```

## 🔄 Sincronização Inicial (Migração de Dados)

Se você já tem clientes no sistema de agendamento e quer importá-los em lote:

### Script de Migração

Crie um arquivo `migrate-clients.js` no sistema de agendamento:

```javascript
const { createClient } = require('@supabase/supabase-js');

// Configurações
const AGENDAMENTO_SUPABASE_URL = 'sua-url-aqui';
const AGENDAMENTO_SUPABASE_KEY = 'sua-key-aqui';
const ERP_API_URL = 'https://seu-erp.com/api/v1/clients/sync';
const ERP_API_KEY = 'sua-api-key-aqui';

const supabase = createClient(AGENDAMENTO_SUPABASE_URL, AGENDAMENTO_SUPABASE_KEY);

async function migrateClients() {
  console.log('Iniciando migração de clientes...');
  
  // Buscar todos os clientes
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*');
  
  if (error) {
    console.error('Erro ao buscar clientes:', error);
    return;
  }
  
  console.log(`Encontrados ${clients.length} clientes para migrar`);
  
  let success = 0;
  let errors = 0;
  
  // Processar cada cliente
  for (const client of clients) {
    try {
      const payload = {
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
      
      const response = await fetch(ERP_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': ERP_API_KEY,
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        success++;
        console.log(`✓ ${client.name}`);
      } else {
        errors++;
        const error = await response.json();
        console.error(`✗ ${client.name}:`, error.message);
      }
      
      // Aguardar um pouco para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      errors++;
      console.error(`✗ ${client.name}:`, error.message);
    }
  }
  
  console.log('\n=== Migração Concluída ===');
  console.log(`Sucessos: ${success}`);
  console.log(`Erros: ${errors}`);
  console.log(`Total: ${clients.length}`);
}

migrateClients();
```

Execute:

```bash
node migrate-clients.js
```

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Verifique este guia de troubleshooting
2. Consulte os logs do servidor
3. Entre em contato com a equipe de desenvolvimento

---

**Última atualização**: 02/11/2025

