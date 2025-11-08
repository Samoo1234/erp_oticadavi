# 🚀 Guia de Deploy na Vercel - ERP Ótica Davi

Este guia explica como fazer o deploy completo do sistema ERP na Vercel.

---

## 📋 Pré-requisitos

1. ✅ Conta na [Vercel](https://vercel.com) (gratuita)
2. ✅ Conta no [Supabase](https://supabase.com) com projeto criado
3. ✅ Repositório no GitHub com o código
4. ✅ Variáveis de ambiente configuradas

---

## 🗂️ Estrutura do Projeto

```
erp-oticadavi/
├── backend/          # API Node.js + Express
│   ├── api/
│   │   └── index.js  # Entry point para Vercel
│   └── src/
├── frontend/         # React + TypeScript
├── vercel.json       # Configuração do monorepo
└── DEPLOY.md         # Este arquivo
```

---

## 🔧 Passo 1: Configurar o Supabase

### 1.1 Criar Tabelas no Banco de Dados

Acesse o SQL Editor do seu projeto Supabase e execute:

```bash
backend/supabase-schema.sql
```

### 1.2 Obter Credenciais

No painel do Supabase, vá em **Settings > API** e copie:
- ✅ **Project URL** → `SUPABASE_URL`
- ✅ **anon/public key** → `SUPABASE_ANON_KEY`
- ✅ **service_role key** → `SUPABASE_SERVICE_KEY`

---

## 🌐 Passo 2: Deploy na Vercel

### 2.1 Importar Repositório

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New"** → **"Project"**
3. Importe seu repositório GitHub: `erp_oticadavi`
4. A Vercel detectará automaticamente o `vercel.json`

### 2.2 Configurar Variáveis de Ambiente

Na página de configuração do projeto, adicione as seguintes variáveis:

#### **Backend (API) Environment Variables:**

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_KEY=sua-service-key-aqui

# JWT
JWT_SECRET=gere-uma-senha-segura-aqui-min-32-caracteres
JWT_EXPIRES_IN=7d

# Frontend URL (será a URL da Vercel após deploy)
FRONTEND_URL=https://seu-projeto.vercel.app

# Stone API (opcional - para pagamentos)
STONE_API_KEY=sua-stone-api-key
STONE_API_URL=https://api.stone.com.br

# Integração VisionCare (opcional)
VISIONCARE_SUPABASE_URL=https://seu-visioncare.supabase.co
VISIONCARE_ANON_KEY=sua-visioncare-anon-key
VISIONCARE_SERVICE_KEY=sua-visioncare-service-key
INTEGRATION_API_KEYS=chave-secreta-para-webhooks

# ERP URL (será a URL da Vercel após deploy)
ERP_BASE_URL=https://seu-projeto.vercel.app

# Node
NODE_ENV=production
```

#### **Frontend Environment Variables:**

```env
REACT_APP_API_URL=https://seu-projeto.vercel.app/api/v1
REACT_APP_ENVIRONMENT=production
```

### 2.3 Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (3-5 minutos)
3. ✅ Seu sistema estará no ar!

---

## 🔑 Passo 3: Criar Usuário Administrador

Após o deploy, você precisa criar o primeiro usuário via Supabase SQL Editor:

```sql
-- Gerar hash bcrypt da senha (use https://bcrypt-generator.com/ com 10 rounds)
-- Exemplo: senha "admin123" → hash: $2a$10$...

INSERT INTO users (
  name,
  email,
  password,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'Administrador',
  'admin@oticadavi.com',
  '$2a$10$SEU_HASH_BCRYPT_AQUI',  -- Hash da senha
  'admin',
  true,
  NOW(),
  NOW()
);
```

**⚠️ IMPORTANTE:** Use um gerador de hash bcrypt online ou execute localmente:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('sua-senha', 10);
console.log(hash);
```

---

## 🔗 Passo 4: Atualizar URLs

Após o primeiro deploy, você receberá uma URL da Vercel (ex: `https://erp-oticadavi.vercel.app`).

### 4.1 Atualizar Variáveis de Ambiente

Volte nas configurações do projeto na Vercel e atualize:

```env
FRONTEND_URL=https://erp-oticadavi.vercel.app
ERP_BASE_URL=https://erp-oticadavi.vercel.app/api/v1
```

### 4.2 Fazer Redeploy

Após atualizar as variáveis, clique em **"Redeploy"** no dashboard da Vercel.

---

## 🧪 Passo 5: Testar o Sistema

### 5.1 Acessar o Frontend

Abra: `https://erp-oticadavi.vercel.app`

### 5.2 Fazer Login

Use as credenciais do usuário administrador criado no Passo 3.

### 5.3 Testar API

Acesse a documentação Swagger:
```
https://erp-oticadavi.vercel.app/api-docs
```

---

## 🔐 Passo 6: Segurança (IMPORTANTE)

### 6.1 Configurar CORS

O backend já está configurado para aceitar apenas requisições do `FRONTEND_URL`.

### 6.2 RLS (Row Level Security) no Supabase

⚠️ **ATENÇÃO:** Por padrão, o sistema usa o `service_role_key` que **BYPASSA o RLS**.

Para maior segurança em produção:

1. Habilite RLS nas tabelas sensíveis
2. Crie políticas de acesso
3. Use `anon_key` + JWT do Supabase no frontend

**Exemplo de política RLS:**

```sql
-- Habilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT para usuários autenticados
CREATE POLICY "Users can view clients"
ON clients FOR SELECT
TO authenticated
USING (true);

-- Apenas admins podem INSERT/UPDATE/DELETE
CREATE POLICY "Only admins can modify clients"
ON clients FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

### 6.3 Variáveis Sensíveis

✅ **NUNCA** commite o arquivo `.env` no Git
✅ Use `.env.example` como template
✅ Rotacione as `INTEGRATION_API_KEYS` periodicamente

---

## 📊 Passo 7: Monitoramento

### 7.1 Logs da Vercel

Acesse **Deployments > [Seu Deploy] > Logs** para ver logs em tempo real.

### 7.2 Logs do Supabase

Acesse **Logs** no painel do Supabase para monitorar queries e erros.

### 7.3 Health Check

Endpoint para monitorar saúde da API:
```
GET https://erp-oticadavi.vercel.app/health
```

---

## 🔄 Passo 8: Configurar Webhook (Opcional)

Se você está usando integração com VisionCare:

### 8.1 Criar Webhook no Supabase VisionCare

1. Acesse seu projeto VisionCare no Supabase
2. Vá em **Database > Webhooks**
3. Clique em **"Create a new hook"**
4. Configure:
   - **Table:** `patients`
   - **Events:** `INSERT`, `UPDATE`, `DELETE`
   - **Webhook URL:** `https://erp-oticadavi.vercel.app/api/v1/clients/sync`
   - **Headers:**
     ```
     X-API-Key: sua-integration-api-key
     Content-Type: application/json
     ```

### 8.2 Testar Webhook

Crie/edite um paciente no VisionCare e verifique se ele aparece no ERP.

---

## 🛠️ Troubleshooting

### Erro: "Application Error"

- ✅ Verifique os logs da Vercel
- ✅ Confirme que todas as variáveis de ambiente estão configuradas
- ✅ Teste a conexão com Supabase

### Erro: "CORS blocked"

- ✅ Verifique se `FRONTEND_URL` está correto
- ✅ Limpe cache do navegador
- ✅ Tente em aba anônima

### Erro: "Invalid JWT"

- ✅ Verifique se `JWT_SECRET` tem pelo menos 32 caracteres
- ✅ Confirme que a mesma `JWT_SECRET` está sendo usada
- ✅ Faça logout e login novamente

### Build Error no Frontend

- ✅ Verifique se `REACT_APP_API_URL` está configurado
- ✅ Confirme que não há erros TypeScript
- ✅ Teste o build localmente: `cd frontend && npm run build`

---

## 📞 Suporte

- **Documentação Vercel:** https://vercel.com/docs
- **Documentação Supabase:** https://supabase.com/docs
- **Issues GitHub:** https://github.com/Samoo1234/erp_oticadavi/issues

---

## 🎉 Pronto!

Seu sistema ERP está agora em produção na Vercel! 🚀

### Próximos Passos:

- ✅ Configure um domínio customizado na Vercel
- ✅ Configure backup automático do Supabase
- ✅ Implemente monitoramento (ex: Sentry)
- ✅ Configure webhook para sincronização em tempo real
- ✅ Treine sua equipe no uso do sistema

---

**Desenvolvido para Ótica Davi** 👓

