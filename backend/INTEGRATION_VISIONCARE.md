# 🔗 Integração VisionCare → ERP

Este guia explica como configurar a **sincronização automática em tempo real** da tabela `patients` do **VisionCare** para a tabela `clients` do **ERP**.

---

## 📋 **Visão Geral**

- **Origem**: VisionCare Supabase (`nfvrbyiocqozpkyispkb`)
- **Destino**: ERP Supabase (Tabela `clients`)
- **Método**: Webhooks do Supabase
- **Direção**: Unidirecional (VisionCare → ERP)
- **Tempo Real**: ✅ Sim

---

## 🎯 **Mapeamento de Campos**

| **VisionCare (patients)** | **ERP (clients)** | **Observações** |
|--------------------------|------------------|-----------------|
| `id` | `external_id` | UUID do VisionCare |
| `name` | `name` | Nome completo |
| `email` | `email` | Email (opcional) |
| `phone` | `phone` | Telefone |
| `cpf` | `cpf` | CPF (opcional) |
| `birth_date` | `birth_date` | Data de nascimento |
| `address` (JSONB) | `address` (JSONB) | Endereço completo |
| `nome_pai` | `notes` | Nome do pai (vai para notes) |
| `nome_mae` | `notes` | Nome da mãe (vai para notes) |
| - | `external_system` | Fixo: `'visioncare'` |

---

## 🚀 **Passo a Passo de Configuração**

### **Passo 1: Configurar Variáveis de Ambiente**

Adicione no arquivo `.env` do backend do ERP:

```env
# API Key para integração (já existe)
INTEGRATION_API_KEYS=sua-chave-api-aqui

# Chave Anon do VisionCare (para o script de migração)
VISIONCARE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL base do ERP (para produção, ajustar para o domínio público)
ERP_BASE_URL=http://localhost:3000
```

⚠️ **Importante**: Você já tem a `INTEGRATION_API_KEYS` configurada. Precisa adicionar apenas a `VISIONCARE_ANON_KEY`.

---

### **Passo 2: Executar Migração Inicial**

Antes de ativar a sincronização em tempo real, sincronize os pacientes existentes:

```bash
cd backend
node migrate-visioncare-patients.js
```

Este script irá:
- Buscar todos os pacientes do VisionCare
- Criar/atualizar cada um na tabela `clients` do ERP
- Exibir um relatório de migração

---

### **Passo 3: Expor o ERP na Internet com ngrok**

Para que o Supabase VisionCare consiga enviar webhooks para o seu ERP local, você precisa expor o servidor:

#### **3.1. Executar o ngrok**

No PowerShell:

```powershell
ngrok http 3000
```

Você verá algo como:

```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

**Copie essa URL** (`https://abc123.ngrok.io`).

#### **3.2. Deixar ngrok rodando**

⚠️ **IMPORTANTE**: Mantenha essa janela do PowerShell aberta enquanto estiver testando.

---

### **Passo 4: Configurar Webhook no Supabase VisionCare**

#### **4.1. Acessar o Dashboard do VisionCare**

1. Acesse: https://supabase.com/dashboard/project/nfvrbyiocqozpkyispkb
2. Faça login

#### **4.2. Ir para Database Webhooks**

1. No menu lateral, clique em **Database**
2. Clique em **Webhooks**
3. Clique em **Create a new webhook**

#### **4.3. Configurar o Webhook**

Preencha os campos:

```
Name: erp-sync-patients
Table: patients
Events: 
  ✅ Insert
  ✅ Update
  ✅ Delete

HTTP Request
Type: POST
URL: https://SEU-NGROK-URL.ngrok.io/api/v1/clients/sync

HTTP Headers:
  Key: x-api-key
  Value: SUA-CHAVE-API-AQUI
  
  Key: Content-Type
  Value: application/json
```

**Substitua:**
- `SEU-NGROK-URL.ngrok.io` → URL gerada pelo ngrok
- `SUA-CHAVE-API-AQUI` → Valor da `INTEGRATION_API_KEYS` do `.env`

#### **4.4. Salvar**

Clique em **Create webhook**.

---

### **Passo 5: Testar a Integração**

#### **5.1. Testar Criação**

No VisionCare, crie um novo paciente e verifique se ele aparece na tabela `clients` do ERP.

#### **5.2. Testar Atualização**

Edite um paciente no VisionCare e verifique se as alterações são refletidas no ERP.

#### **5.3. Testar Exclusão**

Exclua um paciente no VisionCare e verifique se ele é desativado (`is_active = false`) no ERP.

#### **5.4. Verificar Logs**

No terminal do backend do ERP, você verá logs como:

```
📥 Webhook recebido: {...}
✅ Cliente criado: Ana Paula Santos
```

---

## 🔧 **Troubleshooting**

### **Webhook não está funcionando**

1. **Verificar se o ngrok está rodando**
   ```powershell
   # Deve estar aberto em outra janela do PowerShell
   ngrok http 3000
   ```

2. **Verificar se a URL do webhook está correta**
   - Deve ser `https://SEU-NGROK-URL.ngrok.io/api/v1/clients/sync`
   - **NÃO** usar `http://localhost:3000`

3. **Verificar se o header `x-api-key` está correto**
   - Deve corresponder ao valor de `INTEGRATION_API_KEYS` no `.env`

4. **Verificar logs do Webhook no Supabase**
   - Dashboard → Database → Webhooks → Clique no webhook → Ver logs

### **Pacientes não estão sendo criados**

1. **Verificar logs do backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Testar o endpoint manualmente**
   ```bash
   curl -X POST http://localhost:3000/api/v1/clients/sync \
     -H "x-api-key: SUA-CHAVE-API" \
     -H "Content-Type: application/json" \
     -d '{
       "type": "INSERT",
       "table": "patients",
       "record": {
         "id": "test-123",
         "name": "Teste",
         "phone": "11999999999"
       }
     }'
   ```

---

## 🌐 **Produção (Deploy)**

Quando você fizer o deploy do ERP em produção:

1. **Não precisará mais do ngrok**
2. **Atualize a URL do Webhook** no Supabase para a URL pública do seu servidor
   - Exemplo: `https://erp.seudominio.com.br/api/v1/clients/sync`
3. **Mantenha o header `x-api-key`** configurado

---

## 📊 **Monitoramento**

### **Ver pacientes sincronizados**

```sql
-- No Supabase do ERP
SELECT 
  name, 
  email, 
  phone, 
  external_id, 
  external_system, 
  created_at
FROM clients
WHERE external_system = 'visioncare'
ORDER BY created_at DESC;
```

### **Verificar logs de webhook**

Dashboard do VisionCare → Database → Webhooks → Ver logs de execução

---

## ✅ **Checklist de Configuração**

- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] Migração inicial executada (`migrate-visioncare-patients.js`)
- [ ] ngrok rodando e URL copiada
- [ ] Webhook criado no Supabase VisionCare
- [ ] Header `x-api-key` configurado no webhook
- [ ] Teste de criação realizado com sucesso
- [ ] Teste de atualização realizado com sucesso
- [ ] Teste de exclusão (desativação) realizado com sucesso

---

## 🆘 **Suporte**

Se encontrar problemas:

1. Verifique os logs do backend do ERP
2. Verifique os logs do webhook no Supabase
3. Teste o endpoint manualmente com `curl` ou Postman
4. Verifique se a API Key está correta

---

**Pronto! A integração está configurada e funcionando em tempo real! 🎉**

