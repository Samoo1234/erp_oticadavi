# ⚙️ Configuração de Variáveis de Ambiente

Este arquivo explica quais variáveis de ambiente você precisa adicionar no `.env` do backend.

---

## 📝 **Variáveis Necessárias para a Integração VisionCare**

Adicione estas linhas no arquivo `backend/.env`:

```env
# =============================================================================
# INTEGRAÇÃO COM VISIONCARE
# =============================================================================

# Chaves de API válidas para o endpoint /api/v1/clients/sync
# (você já deve ter esta configurada)
INTEGRATION_API_KEYS=sua-chave-api-aqui

# Chave Anon do Supabase VisionCare (necessária para o script de migração)
VISIONCARE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL base do ERP (para testes locais, manter como está)
ERP_BASE_URL=http://localhost:3000
```

---

## 🔑 **Como Obter a `VISIONCARE_ANON_KEY`**

1. Acesse o dashboard do VisionCare: https://supabase.com/dashboard/project/nfvrbyiocqozpkyispkb
2. No menu lateral, clique em **Settings** → **API**
3. Copie o valor de **Project API keys** → **anon** → **public**
4. Cole no `.env` como valor de `VISIONCARE_ANON_KEY`

---

## ✅ **Exemplo Completo**

Seu `.env` deve ficar assim (com os valores reais):

```env
# ... outras variáveis existentes ...

# INTEGRAÇÃO COM VISIONCARE
INTEGRATION_API_KEYS=erp-2024-secure-key-abc123xyz
VISIONCARE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdnJieWlvY3FvenBreWlzcGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODU0NjEyMDAsImV4cCI6MjAwMTAzNzIwMH0.exemplo-token-aqui
ERP_BASE_URL=http://localhost:3000
```

---

## 🚀 **Próximos Passos**

Após configurar o `.env`, execute:

```bash
# 1. Reiniciar o backend para carregar as variáveis
npm run dev

# 2. Executar a migração inicial
node migrate-visioncare-patients.js
```

---

**Pronto! Configuração completa!** ✅

