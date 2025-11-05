# ⚡ Setup Rápido - Webhook Supabase → ERP

## 🎯 Sincronizar clientes do Supabase `nfvrbyiocqozpkyispkb` com o ERP

---

## 🚀 Passo a Passo (10 minutos)

### 1️⃣ Gerar API Key (1 min)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copie a chave gerada!** Exemplo:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

### 2️⃣ Configurar ERP (2 min)

**Adicionar no `.env` do backend:**
```env
INTEGRATION_API_KEYS=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Reiniciar servidor:**
```bash
cd backend
npm run dev
```

---

### 3️⃣ Expor Servidor para Internet (2 min)

#### Opção A: ngrok (Desenvolvimento)

```bash
# Instalar
npm install -g ngrok

# Executar
ngrok http 3000
```

**Copie a URL gerada**, exemplo:
```
https://abc123.ngrok.io
```

#### Opção B: Produção

Se já está em produção, use seu domínio:
```
https://seu-erp.com
```

---

### 4️⃣ Configurar Webhook no Supabase (5 min)

1. **Acesse:** https://supabase.com/dashboard/project/nfvrbyiocqozpkyispkb

2. **Navegue:** Database → Webhooks

3. **Clique:** "Create a new hook"

4. **Preencha:**

```
┌─────────────────────────────────────────────┐
│ Name:  sync-clients-to-erp                  │
│ Table: clients                              │
│ Events: ☑ INSERT  ☑ UPDATE                 │
│ Type:  HTTP Request                         │
│ Method: POST                                │
│ URL:   https://abc123.ngrok.io/api/v1/clients/sync  │
└─────────────────────────────────────────────┘
```

5. **HTTP Headers:**

Clique em "Add header" e adicione:

```json
{
  "Content-Type": "application/json",
  "X-API-Key": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
}
```

6. **HTTP Params (Body):**

Cole este template JSON:

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

7. **Clique em "Save"**

---

## ✅ Testar (3 min)

### Teste 1: Criar Cliente no Supabase

No **SQL Editor** do Supabase `nfvrbyiocqozpkyispkb`:

```sql
INSERT INTO clients (name, phone, email, cpf, birth_date, gender)
VALUES (
  'João Silva Teste Webhook',
  '11987654321',
  'joao.webhook@test.com',
  '12345678900',
  '1990-01-15',
  'M'
);
```

### Teste 2: Verificar no ERP

**Logs do servidor (terminal):**
```
[API Integration] Request from external system at 2025-11-02T...
```

**SQL no Supabase do ERP:**
```sql
SELECT * FROM clients 
WHERE external_system = 'agendamento' 
ORDER BY created_at DESC 
LIMIT 5;
```

**Você deve ver:**
- ✅ Cliente "João Silva Teste Webhook"
- ✅ Campo `external_id` preenchido
- ✅ Campo `external_system` = 'agendamento'

---

## 🔄 Sincronizar Clientes Existentes (Opcional)

Se você já tem clientes no Supabase `nfvrbyiocqozpkyispkb`:

### 1. Obter Anon Key do Supabase

Acesse: https://supabase.com/dashboard/project/nfvrbyiocqozpkyispkb/settings/api

Copie a **"anon public"** key.

### 2. Editar o script

Abra `backend/sync-supabase-clients.js` e configure:

```javascript
const SOURCE_SUPABASE_KEY = 'sua_anon_key_aqui'; // Cole a anon key
const ERP_API_KEY = 'sua_api_key_aqui'; // Cole a API key do passo 1
```

### 3. Instalar dependências

```bash
cd backend
npm install @supabase/supabase-js node-fetch
```

### 4. Executar

```bash
node sync-supabase-clients.js
```

**Resultado:**
```
✅ SINCRONIZAÇÃO CONCLUÍDA!

📊 Estatísticas:
   Total: 50
   ✅ Sucesso: 48
   ✨ Criados: 45
   🔄 Atualizados: 3
   ❌ Erros: 2
   ⏱️  Tempo: 5.23s
```

---

## 🔍 Monitoramento

### Ver Histórico do Webhook

1. Acesse: https://supabase.com/dashboard/project/nfvrbyiocqozpkyispkb
2. Database → Webhooks → `sync-clients-to-erp`
3. Veja a lista de execuções e status

### Logs do Servidor ERP

```bash
# No terminal onde o backend está rodando
# Você verá logs como:
[API Integration] Request from external system at 2025-11-02T10:30:00.000Z
```

### Consultar Clientes Sincronizados

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

---

## 🐛 Problemas Comuns

### ❌ Webhook retorna 401

**Problema:** API Key incorreta

**Solução:**
1. Verifique se a chave no `.env` do ERP está correta
2. Confirme que o servidor foi reiniciado após adicionar a chave
3. Verifique se o header `X-API-Key` no webhook está correto

### ❌ Webhook retorna 400

**Problema:** Dados obrigatórios faltando

**Solução:**
Verifique o Body Template do webhook. Certifique-se de que tem:
```json
{
  "externalId": "{{ record.id }}",
  "name": "{{ record.name }}",
  "phone": "{{ record.phone }}"
}
```

### ❌ Webhook não dispara

**Problema:** Webhook não está ativo ou configurado errado

**Solução:**
1. Verifique se o webhook está na lista (Database → Webhooks)
2. Confirme que a tabela é `clients`
3. Confirme que INSERT e UPDATE estão marcados
4. Teste criando um cliente manualmente via SQL

### ❌ ngrok expira

**Problema:** URLs do ngrok expiram após algumas horas

**Solução:**
1. Reinicie o ngrok: `ngrok http 3000`
2. Copie a nova URL
3. Atualize no webhook do Supabase
4. **OU** use ngrok pago (URLs fixas)
5. **OU** deploy em produção (domínio permanente)

---

## 📋 Checklist Final

- [ ] ✅ API Key gerada
- [ ] ✅ `.env` do ERP configurado
- [ ] ✅ Servidor ERP reiniciado
- [ ] ✅ ngrok rodando (ou servidor em produção acessível)
- [ ] ✅ Webhook criado no Supabase
- [ ] ✅ Headers configurados (Content-Type + X-API-Key)
- [ ] ✅ Body template configurado
- [ ] ✅ Webhook salvo
- [ ] ✅ Teste de criação de cliente executado
- [ ] ✅ Cliente aparece no ERP
- [ ] ✅ Campo `external_system` = 'agendamento'
- [ ] ✅ (Opcional) Dados existentes migrados

---

## 🎉 Pronto!

A partir de agora, **toda vez** que você:
- **Criar** um cliente no Supabase `nfvrbyiocqozpkyispkb`
- **Atualizar** um cliente no Supabase `nfvrbyiocqozpkyispkb`

Ele será **automaticamente sincronizado** com o ERP! 🚀

---

## 📚 Documentação Adicional

- [Guia Completo de Integração](./INTEGRATION_SUPABASE_DIRECT.md)
- [Script de Sincronização](./sync-supabase-clients.js)

---

**Projeto Supabase:** nfvrbyiocqozpkyispkb  
**Última atualização:** 02/11/2025

