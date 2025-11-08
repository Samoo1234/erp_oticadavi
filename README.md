# 🏪 ERP Ótica Davi

Sistema completo de gestão para ótica, incluindo controle de vendas, estoque, clientes, prescrições, TSO (Tabela de Solicitação de Orçamento) e emissão de notas fiscais.

---

## 🚀 Tecnologias

### Backend
- **Node.js** + **Express**
- **Supabase** (PostgreSQL)
- **JWT** para autenticação
- **Swagger** para documentação da API

### Frontend
- **React** + **TypeScript**
- **Tailwind CSS**
- **React Query** para cache
- **React Hook Form** para formulários

---

## 📦 Funcionalidades

### ✅ Gestão de Vendas
- Criar, editar e consultar vendas
- Adicionar múltiplos produtos por venda
- Calcular descontos e totais automaticamente
- Integração com Stone API para pagamentos (PIX, Débito, Crédito, Dinheiro)
- Histórico completo de vendas

### ✅ Gestão de Clientes
- Cadastro completo de clientes
- Histórico de compras
- Integração com sistema VisionCare (sincronização de pacientes)

### ✅ Gestão de Produtos
- Cadastro de produtos com foto
- Controle de estoque
- Movimentações de entrada e saída
- Alertas de estoque baixo

### ✅ Gestão de Prescrições
- Cadastro de prescrições oftalmológicas
- Histórico por cliente
- Controle de validade

### ✅ TSO (Tabela de Solicitação de Orçamento)
- Criar TSO para clientes
- Definir tipos de lente (longe, perto, multifocal)
- Calcular orçamentos automaticamente

### ✅ Notas Fiscais
- Emissão de NF-e
- Controle de status (pendente, emitida, cancelada)
- Exportação em XML

### ✅ Relatórios
- Vendas por período
- Produtos mais vendidos
- Movimentação de estoque
- Desempenho por vendedor

### ✅ Usuários e Permissões
- Sistema de autenticação
- Níveis de acesso (admin, vendedor, operador)
- Controle de sessões

---

## 🛠️ Instalação Local

### Pré-requisitos
- **Node.js** 18+
- **npm** ou **yarn**
- **Conta no Supabase**

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/Samoo1234/erp_oticadavi.git
cd erp_oticadavi
```

### 2️⃣ Configure o Backend

```bash
cd backend
npm install

# Copiar arquivo de exemplo e configurar variáveis
cp .env.example .env
# Edite o .env com suas credenciais do Supabase
```

**Variáveis obrigatórias no `.env`:**

```env
SUPABASE_URL=sua-url-aqui
SUPABASE_ANON_KEY=sua-chave-aqui
SUPABASE_SERVICE_KEY=sua-service-key-aqui
JWT_SECRET=sua-senha-secreta-min-32-caracteres
```

### 3️⃣ Configure o Frontend

```bash
cd ../frontend
npm install

# Criar arquivo .env
echo "REACT_APP_API_URL=http://localhost:3001/api/v1" > .env
```

### 4️⃣ Configure o Banco de Dados

Execute o schema SQL no Supabase SQL Editor:

```bash
# Copie o conteúdo de backend/supabase-schema.sql
# Cole no SQL Editor do Supabase e execute
```

### 5️⃣ Inicie o Sistema

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

Acesse: **http://localhost:3000**

---

## 🌐 Deploy na Vercel

Veja o guia completo em **[DEPLOY.md](./DEPLOY.md)**

### Resumo rápido:

1. Push para GitHub
2. Importar projeto na Vercel
3. Configurar variáveis de ambiente
4. Deploy automático! 🚀

---

## 📚 Documentação da API

Após iniciar o backend, acesse:

```
http://localhost:3001/api-docs
```

Documentação interativa com Swagger UI.

---

## 🔐 Primeiro Acesso

Após configurar o banco, crie um usuário administrador via SQL:

```sql
INSERT INTO users (name, email, password, role, is_active)
VALUES (
  'Administrador',
  'admin@oticadavi.com',
  '$2a$10$SEU_HASH_BCRYPT_AQUI',  -- Use bcrypt para gerar o hash
  'admin',
  true
);
```

**Gerar hash bcrypt:**
- Online: https://bcrypt-generator.com/ (10 rounds)
- Ou use Node.js:
  ```javascript
  const bcrypt = require('bcryptjs');
  console.log(bcrypt.hashSync('sua-senha', 10));
  ```

---

## 🔄 Integração VisionCare

Para sincronizar clientes do sistema VisionCare:

1. Configure as variáveis no `.env`:
   ```env
   VISIONCARE_SUPABASE_URL=...
   VISIONCARE_ANON_KEY=...
   VISIONCARE_SERVICE_KEY=...
   INTEGRATION_API_KEYS=chave-secreta-webhook
   ```

2. Execute a migração inicial:
   ```bash
   cd backend
   node migrate-visioncare-patients.js
   ```

3. Configure o webhook no Supabase VisionCare (veja `DEPLOY.md`)

---

## 🗂️ Estrutura do Projeto

```
erp-oticadavi/
├── backend/
│   ├── api/                  # Vercel serverless entry point
│   ├── src/
│   │   ├── controllers/      # Lógica de negócio
│   │   ├── routes/           # Rotas da API
│   │   ├── middleware/       # Auth, validação, etc.
│   │   ├── config/           # Configurações (Supabase, etc.)
│   │   └── utils/            # Utilidades (caseConverter, etc.)
│   ├── database/             # Schemas SQL
│   └── .env.example          # Template de variáveis
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # Páginas React
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── contexts/         # Context API (Auth)
│   │   ├── services/         # API client (Axios)
│   │   └── types/            # TypeScript types
│   └── public/               # Assets estáticos
│
├── docs/                     # Documentação técnica
├── vercel.json               # Configuração do monorepo
├── DEPLOY.md                 # Guia de deploy
└── README.md                 # Este arquivo
```

---

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é proprietário e de uso exclusivo da **Ótica Davi**.

---

## 📧 Contato

**Ótica Davi**
- 🌐 Website: [em breve]
- 📧 Email: contato@oticadavi.com
- 📱 WhatsApp: [número]

---

## 🎯 Roadmap

- [ ] App mobile (React Native)
- [ ] Módulo de laboratório
- [ ] Integração com mais operadoras de cartão
- [ ] Dashboard avançado com BI
- [ ] Módulo de marketing (SMS/Email)
- [ ] Programa de fidelidade

---

**Desenvolvido com ❤️ para Ótica Davi** 👓
