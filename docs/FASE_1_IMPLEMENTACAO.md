# Fase 1: Fundação - Implementação

## 🎯 Objetivos da Fase 1
- Configurar ambiente de desenvolvimento
- Implementar autenticação e autorização
- Criar modelos de dados básicos
- Desenvolver interface de login
- Configurar banco de dados

## 📋 Checklist de Implementação

### ✅ 1. Configuração do Ambiente
- [x] Script de setup automático (`setup.js`)
- [x] Script de inicialização do banco (`scripts/init-database.js`)
- [x] Arquivos de configuração (.env)
- [x] Scripts npm para facilitar desenvolvimento

### ✅ 2. Backend - Autenticação
- [x] Modelo de usuário com roles
- [x] Sistema de autenticação JWT
- [x] Middleware de autenticação e autorização
- [x] Controladores de autenticação
- [x] Rotas de autenticação
- [x] Validação de dados

### ✅ 3. Backend - Gestão de Usuários
- [x] Controlador de usuários completo
- [x] CRUD de usuários
- [x] Sistema de roles (admin, manager, seller, optician)
- [x] Validação e autorização por role
- [x] Documentação Swagger

### ✅ 4. Frontend - Interface Base
- [x] Sistema de autenticação
- [x] Layout responsivo com sidebar
- [x] Página de login
- [x] Dashboard básico
- [x] Página de gestão de usuários
- [x] Navegação entre páginas

### ✅ 5. Banco de Dados
- [x] Schema completo do banco
- [x] Tabelas principais criadas
- [x] Índices para performance
- [x] Triggers para updated_at
- [x] Dados iniciais (usuários padrão)

## 🚀 Como Executar a Fase 1

### Pré-requisitos
- Node.js 18+
- PostgreSQL 13+
- npm ou yarn

### Passo a Passo

#### 1. Configurar Ambiente
```bash
# Na raiz do projeto
npm run setup
```

#### 2. Instalar Dependências
```bash
npm run install:all
```

#### 3. Configurar Banco de Dados
```bash
# Certifique-se que o PostgreSQL está rodando
# Crie o banco de dados
createdb erp_otica_davi

# Execute o script de inicialização
npm run init-db
```

#### 4. Iniciar Desenvolvimento
```bash
# Executar backend e frontend simultaneamente
npm run dev

# Ou executar separadamente:
# Backend: npm run dev:backend
# Frontend: npm run dev:frontend
```

### 5. Acessar o Sistema
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentação API**: http://localhost:3001/api-docs

## 👤 Usuários Padrão

| Email | Senha | Role | Descrição |
|-------|-------|------|-----------|
| admin@oticadavi.com | admin123 | admin | Acesso total ao sistema |
| gerente@oticadavi.com | admin123 | manager | Gestão de usuários e relatórios |
| vendedor@oticadavi.com | admin123 | seller | Acesso básico ao sistema |

## 🔧 Funcionalidades Implementadas

### Autenticação
- ✅ Login com email e senha
- ✅ Geração de token JWT
- ✅ Middleware de autenticação
- ✅ Controle de sessão
- ✅ Logout seguro

### Gestão de Usuários
- ✅ Listagem de usuários
- ✅ Criação de novos usuários
- ✅ Edição de usuários
- ✅ Exclusão de usuários
- ✅ Filtros por role e busca
- ✅ Controle de permissões

### Interface
- ✅ Layout responsivo
- ✅ Sidebar de navegação
- ✅ Páginas principais
- ✅ Sistema de roteamento
- ✅ Componentes reutilizáveis

## 📊 Estrutura de Dados

### Tabela Users
```sql
- id (UUID, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, HASHED)
- role (ENUM: admin, manager, seller, optician)
- phone (VARCHAR)
- is_active (BOOLEAN)
- last_login (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🧪 Testes

### Testar Autenticação
```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@oticadavi.com","password":"admin123"}'

# Verificar token
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Testar Usuários
```bash
# Listar usuários
curl -X GET http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Criar usuário
curl -X POST http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"name":"Novo Usuário","email":"novo@email.com","password":"123456","role":"seller"}'
```

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
pg_ctl status

# Testar conexão
psql -U postgres -d erp_otica_davi
```

### Erro de Porta em Uso
```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

### Erro de Dependências
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📈 Próximas Fases

### Fase 2: Gestão de Clientes (Semanas 5-8)
- Módulo completo de clientes
- Sistema de busca e filtros
- Histórico de compras
- Testes e validação

### Fase 3: Produtos e Estoque (Semanas 9-12)
- Catálogo de produtos
- Sistema de estoque
- Movimentações e alertas
- Integração entre módulos

## ✅ Status da Fase 1

**Status**: ✅ **CONCLUÍDA**

**Data de Conclusão**: Janeiro 2024

**Funcionalidades**: 100% implementadas

**Testes**: Aprovados

**Documentação**: Completa

---

**Desenvolvido por**: Equipe ERP Ótica Davi  
**Versão**: 1.0  
**Última atualização**: Janeiro 2024
