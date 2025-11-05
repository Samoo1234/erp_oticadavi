# Integração Direta com Supabase (nfvrbyiocqozpkyispkb)

## 🎯 Objetivo

Sincronizar a tabela `clients` do projeto Supabase `nfvrbyiocqozpkyispkb` com a tabela `clients` do ERP em tempo real.

---

## 📋 Solução: Database Webhook → Endpoint ERP

Como ambos os sistemas usam Supabase, a sincronização será feita através de **Database Webhooks** diretos.

---

## 🔧 Configuração

### Passo 1: Gerar API Key para Autenticação

```bash
# Execute no terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Exemplo de saída:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Passo 2: Configurar no ERP

Adicione no arquivo `.env` do backend do ERP:

```env
INTEGRATION_API_KEYS=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

Reinicie o servidor:
```bash
cd backend
npm run dev
```

### Passo 3: Configurar Webhook no Supabase (nfvrbyiocqozpkyispkb)

#### 3.1. Obter URL pública do ERP

Se estiver em desenvolvimento local, use **ngrok** ou **localtunnel**:

```bash
# Instalar ngrok (se não tiver)
npm install -g ngrok

# Criar túnel para seu servidor local
ngrok http 3000
```

Você receberá uma URL pública, exemplo:
```
https://abc123.ngrok.io
```

**OU em produção**: Use seu domínio real, exemplo:
```
https://seu-erp.com
```

#### 3.2. Criar Webhook no Supabase

1. Acesse: https://supabase.com/dashboard/project/nfvrbyiocqozpkyispkb
2. Vá em: **Database** → **Webhooks**
3. Clique em: **Create a new hook**
4. Configure:

**Configuração do Webhook:**
```
Name: sync-clients-to-erp
Table: clients
Events: ☑ INSERT  ☑ UPDATE
Type: HTTP Request
Method: POST
URL: https://abc123.ngrok.io/api/v1/clients/sync
```

**HTTP Headers:**
```json
{
  "Content-Type": "application/json",
  "X-API-Key": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
}
```

**HTTP Params (Body Template):**
```json
{
  "externalId": "{{ record.id }}",
  "name": "{{ record.name }}",
  "email": "{{ record.email }}",
  "phone": "{{ record.phone }}",
  "cpf": "{{ record.cpf }}",
  "birthDate": "{{ record.birth_date }}",
  "gender": "{{ record.gender }}",
  "address": {{ record.address }},
  "notes": "{{ record.notes }}"
}
```

5. Clique em **Save**

---

## 🧪 Testar a Integração

### Teste 1: Endpoint Direto

```bash
curl -X POST http://localhost:3000/api/v1/clients/sync \
  -H "Content-Type: application/json" \
  -H "X-API-Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2" \
  -d '{
    "externalId": "test-uuid-123",
    "name": "Cliente Teste",
    "phone": "(11) 99999-9999",
    "email": "teste@email.com"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Cliente criado com sucesso",
  "action": "created"
}
```

### Teste 2: Criar Cliente no Supabase

Execute no **SQL Editor** do Supabase `nfvrbyiocqozpkyispkb`:

```sql
INSERT INTO clients (id, name, phone, email, cpf, birth_date, gender)
VALUES (
  gen_random_uuid(),
  'João Silva Teste',
  '(11) 98765-4321',
  'joao.teste@email.com',
  '123.456.789-00',
  '1990-01-15',
  'M'
);
```

**Verificar:**
1. O webhook deve disparar automaticamente
2. Verifique os logs do servidor ERP (deve aparecer: `[API Integration] Request from external system`)
3. Consulte a tabela `clients` do ERP para confirmar que o cliente foi criado

```sql
-- No Supabase do ERP
SELECT * FROM clients WHERE external_system = 'agendamento' ORDER BY created_at DESC;
```

---

## 📊 Estrutura do Webhook

```
┌─────────────────────────────────┐
│ Supabase (nfvrbyiocqozpkyispkb) │
│   Tabela: clients                │
│   (INSERT/UPDATE)                │
└────────────┬────────────────────┘
             │
             │ Webhook HTTP POST
             │
             ▼
┌─────────────────────────────────┐
│        Seu Servidor ERP         │
│  POST /api/v1/clients/sync      │
│  + Header: X-API-Key            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│     Tabela clients (ERP)        │
│  - Busca por external_id        │
│  - Se existe: UPDATE            │
│  - Se não existe: INSERT        │
└─────────────────────────────────┘
```

---

## 🔄 Sincronização Inicial (Dados Existentes)

Se você já tem clientes no Supabase `nfvrbyiocqozpkyispkb` e quer importá-los:

### Script de Migração

Crie um arquivo `sync-existing-clients.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Configuração
const SOURCE_SUPABASE_URL = 'https://nfvrbyiocqozpkyispkb.supabase.co';
const SOURCE_SUPABASE_KEY = 'sua-anon-key-aqui';
const ERP_API_URL = 'http://localhost:3000/api/v1/clients/sync';
const ERP_API_KEY = 'sua-api-key-aqui';

const supabase = createClient(SOURCE_SUPABASE_URL, SOURCE_SUPABASE_KEY);

async function syncClients() {
  console.log('🔄 Sincronizando clientes existentes...\n');

  // Buscar todos os clientes
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*');

  if (error) {
    console.error('❌ Erro ao buscar clientes:', error);
    return;
  }

  console.log(`📋 Encontrados ${clients.length} clientes\n`);

  let success = 0;
  let errors = 0;

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
        const result = await response.json();
        console.log(`✅ ${client.name} - ${result.action}`);
        success++;
      } else {
        const error = await response.json();
        console.error(`❌ ${client.name}: ${error.message}`);
        errors++;
      }

      // Delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ ${client.name}: ${error.message}`);
      errors++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Sucesso: ${success}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📊 Total: ${clients.length}`);
}

syncClients();
```

**Executar:**
```bash
npm install @supabase/supabase-js node-fetch
node sync-existing-clients.js
```

---

## 🔍 Monitoramento

### Logs do Webhook (Supabase)

1. Acesse: https://supabase.com/dashboard/project/nfvrbyiocqozpkyispkb
2. Vá em: **Database** → **Webhooks** → `sync-clients-to-erp`
3. Veja o histórico de execuções e erros

### Logs do Servidor ERP

```bash
# Os logs mostrarão cada sincronização
[API Integration] Request from external system at 2025-11-02T10:30:00.000Z
```

### Consultar Clientes Sincronizados

```sql
-- No Supabase do ERP
SELECT 
  id,
  name,
  phone,
  email,
  external_id,
  external_system,
  created_at,
  updated_at
FROM clients
WHERE external_system = 'agendamento'
ORDER BY created_at DESC;
```

---

## 🐛 Troubleshooting

### Webhook não dispara

**Verificar:**
1. Webhook está ativo no painel do Supabase?
2. A tabela está correta (`clients`)?
3. Os eventos (INSERT/UPDATE) estão marcados?

**Teste manual:**
```bash
# Criar cliente via SQL no Supabase
INSERT INTO clients (id, name, phone) 
VALUES (gen_random_uuid(), 'Teste Webhook', '11999999999');
```

### Erro 401 (Unauthorized)

**Causa:** API Key incorreta

**Solução:**
1. Verifique se a chave no `.env` do ERP está correta
2. Confirme que a chave no header do webhook é a mesma

### Webhook retorna erro 400

**Causa:** Dados obrigatórios faltando (name, phone, externalId)

**Solução:**
Verifique o **Body Template** do webhook. Certifique-se de que está mapeando corretamente:
```json
{
  "externalId": "{{ record.id }}",
  "name": "{{ record.name }}",
  "phone": "{{ record.phone }}"
}
```

### Cliente não aparece no ERP

**Verificar:**
1. Logs do servidor ERP - houve erro?
2. Logs do webhook no Supabase - foi disparado?
3. Campos obrigatórios preenchidos (name, phone)?

---

## 🔒 Segurança em Produção

### 1. Use HTTPS
```
❌ http://seu-erp.com
✅ https://seu-erp.com
```

### 2. Configure IP Whitelist (Opcional)

No middleware `apiKeyAuth.js`, adicione:
```javascript
const ALLOWED_IPS = [
  '54.158.0.0/16', // IPs do Supabase (exemplo)
];
```

### 3. Rotacione API Keys

Altere periodicamente a chave:
1. Gere nova chave
2. Atualize no `.env` do ERP
3. Atualize no webhook do Supabase

---

## ✅ Checklist de Implementação

- [ ] API Key gerada
- [ ] `.env` do ERP configurado
- [ ] Servidor ERP reiniciado
- [ ] Endpoint testado com cURL (sucesso)
- [ ] Webhook configurado no Supabase (nfvrbyiocqozpkyispkb)
- [ ] Headers do webhook configurados (X-API-Key)
- [ ] Body template do webhook configurado
- [ ] Teste de criação de cliente (sucesso)
- [ ] Cliente aparece no ERP com `external_system = 'agendamento'`
- [ ] (Opcional) Migração de dados existentes executada

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs do servidor ERP
2. Verifique o histórico do webhook no Supabase
3. Execute os comandos de teste fornecidos

---

**Última atualização**: 02/11/2025
**Projeto Supabase**: nfvrbyiocqozpkyispkb

