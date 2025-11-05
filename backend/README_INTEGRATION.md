# 🔗 Integração VisionCare → ERP

Sistema de sincronização automática em tempo real da tabela `patients` do VisionCare para a tabela `clients` do ERP.

---

## 📚 **Documentação**

| Arquivo | Descrição |
|---------|-----------|
| **[QUICK_START_INTEGRATION.md](./QUICK_START_INTEGRATION.md)** | 🚀 Guia rápido de 5 minutos |
| **[INTEGRATION_VISIONCARE.md](./INTEGRATION_VISIONCARE.md)** | 📖 Guia completo e detalhado |
| **[CONFIG_ENV.md](./CONFIG_ENV.md)** | ⚙️ Configuração de variáveis de ambiente |

---

## 🛠️ **Scripts Disponíveis**

### **1. Migração Inicial**

Sincroniza todos os pacientes existentes do VisionCare para o ERP.

```bash
node migrate-visioncare-patients.js
```

**Quando usar:**
- Primeira vez configurando a integração
- Após limpar/resetar a tabela `clients`

---

### **2. Teste de Sincronização**

Testa o endpoint de sincronização com dados simulados.

```bash
node test-sync.js
```

**O que testa:**
- ✅ INSERT (criar paciente)
- ✅ UPDATE (atualizar paciente)
- ✅ DELETE (desativar paciente)

**Quando usar:**
- Após configurar a integração
- Para verificar se tudo está funcionando

---

## 🎯 **Como Funciona**

```
┌─────────────────┐         Webhook          ┌─────────────────┐
│                 │    (INSERT/UPDATE/DELETE) │                 │
│   VisionCare    │ ─────────────────────────>│   ERP Backend   │
│   (patients)    │                           │   (clients)     │
│                 │                           │                 │
└─────────────────┘                           └─────────────────┘
```

1. **Usuário cria/edita/exclui paciente no VisionCare**
2. **Supabase dispara Webhook** para o ERP
3. **ERP recebe o webhook** no endpoint `/api/v1/clients/sync`
4. **ERP processa e sincroniza** na tabela `clients`
5. **Cliente aparece automaticamente** no ERP

---

## 📋 **Mapeamento de Campos**

| VisionCare | ERP | Observação |
|-----------|-----|------------|
| `id` | `external_id` | UUID original |
| `name` | `name` | Nome completo |
| `email` | `email` | Email |
| `phone` | `phone` | Telefone |
| `cpf` | `cpf` | CPF |
| `birth_date` | `birth_date` | Data de nascimento |
| `address` | `address` | Endereço (JSONB) |
| `nome_pai` + `nome_mae` | `notes` | Informações dos pais |
| - | `external_system` | Fixo: `'visioncare'` |

---

## 🔐 **Segurança**

### **Autenticação**

O endpoint `/api/v1/clients/sync` é protegido por **API Key**.

```http
POST /api/v1/clients/sync
Headers:
  x-api-key: sua-chave-api-aqui
  Content-Type: application/json
```

A chave é configurada no `.env`:

```env
INTEGRATION_API_KEYS=chave1,chave2,chave3
```

### **Validação**

O endpoint valida:
- ✅ Presença da API Key
- ✅ Formato do payload do webhook
- ✅ Campos obrigatórios (`id`, `name`, `phone`)

---

## 🧪 **Fluxo de Teste**

### **1. Teste Local (sem webhook)**

```bash
# 1. Testar endpoint diretamente
node test-sync.js

# 2. Ver logs no backend
# Deve aparecer:
# 📥 Webhook recebido: {...}
# ✅ Cliente criado: ...
```

### **2. Teste com ngrok + Webhook**

```bash
# 1. Expor o servidor
ngrok http 3000

# 2. Configurar webhook no VisionCare
# URL: https://abc123.ngrok.io/api/v1/clients/sync

# 3. Criar/editar paciente no VisionCare

# 4. Ver logs no backend
# Deve aparecer:
# 📥 Webhook recebido: {...}
# ✅ Cliente criado/atualizado: ...
```

---

## 🚀 **Deploy em Produção**

Quando fizer o deploy:

1. **Não precisará mais do ngrok**
2. **Atualize a URL do Webhook** no Supabase:
   ```
   https://seudominio.com.br/api/v1/clients/sync
   ```
3. **Mantenha o header `x-api-key`**

---

## 📊 **Monitoramento**

### **Verificar sincronização**

```sql
-- No Supabase do ERP
SELECT 
  name, 
  email, 
  phone, 
  external_id, 
  external_system,
  is_active,
  created_at
FROM clients
WHERE external_system = 'visioncare'
ORDER BY created_at DESC;
```

### **Logs do Webhook**

Dashboard VisionCare → Database → Webhooks → Clique no webhook → Ver logs

---

## 🆘 **Troubleshooting**

### **Webhook não está funcionando**

```bash
# 1. Verificar se ngrok está rodando
ngrok http 3000

# 2. Verificar logs do backend
# Deve aparecer mensagens quando receber webhook

# 3. Verificar logs do webhook no Supabase
# Dashboard → Database → Webhooks → Ver logs
```

### **Pacientes não sincronizam**

```bash
# 1. Testar localmente
node test-sync.js

# 2. Verificar variáveis de ambiente
# .env deve ter:
# - INTEGRATION_API_KEYS
# - VISIONCARE_ANON_KEY

# 3. Verificar se o header x-api-key está correto no webhook
```

---

## ✅ **Checklist de Configuração**

- [ ] Variáveis de ambiente configuradas
- [ ] Migração inicial executada
- [ ] Teste local passou (`node test-sync.js`)
- [ ] ngrok rodando (para testes)
- [ ] Webhook configurado no Supabase
- [ ] Teste real com criação de paciente realizado
- [ ] Logs do backend confirmam recebimento

---

## 📞 **Endpoints**

### **POST `/api/v1/clients/sync`**

Recebe webhooks do Supabase VisionCare.

**Headers:**
```
x-api-key: sua-chave-api
Content-Type: application/json
```

**Body (Webhook Supabase):**
```json
{
  "type": "INSERT|UPDATE|DELETE",
  "table": "patients",
  "record": { ... },
  "old_record": { ... }
}
```

**Responses:**
- `201`: Cliente criado
- `200`: Cliente atualizado ou desativado
- `400`: Dados inválidos
- `401`: API Key inválida
- `500`: Erro interno

---

## 🎉 **Pronto!**

Siga o **[QUICK_START_INTEGRATION.md](./QUICK_START_INTEGRATION.md)** para começar!

---

**Criado para:** ERP Ótica Davi  
**Integrado com:** VisionCare (`nfvrbyiocqozpkyispkb`)  
**Versão:** 1.0.0

