# Guia de Instalação - ERP Ótica Davi

## Pré-requisitos

### Software Necessário
- **Node.js**: Versão 18 ou superior
- **PostgreSQL**: Versão 13 ou superior
- **npm**: Versão 8 ou superior (vem com Node.js)
- **Git**: Para clonar o repositório

### Verificar Instalações
```bash
node --version
npm --version
psql --version
git --version
```

## Instalação

### 1. Clonar o Repositório
```bash
git clone <url-do-repositorio>
cd erp-otica-davi
```

### 2. Instalar Dependências
```bash
# Instalar dependências de todos os projetos
npm run install:all

# Ou instalar individualmente:
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 3. Configurar Banco de Dados

#### 3.1 Criar Banco de Dados
```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE erp_otica_davi;

# Criar usuário (opcional)
CREATE USER erp_user WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE erp_otica_davi TO erp_user;

# Sair do psql
\q
```

#### 3.2 Executar Schema
```bash
# Executar o schema SQL
psql -U postgres -d erp_otica_davi -f backend/database/schema.sql
```

### 4. Configurar Variáveis de Ambiente

#### 4.1 Backend
```bash
# Copiar arquivo de exemplo
cd backend
cp env.example .env

# Editar arquivo .env
nano .env
```

**Conteúdo do arquivo .env:**
```env
# Configurações do Servidor
PORT=3001
NODE_ENV=development

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_otica_davi
DB_USER=postgres
DB_PASSWORD=sua_senha_do_postgres

# Configurações de Autenticação
JWT_SECRET=sua_chave_secreta_jwt_aqui
JWT_EXPIRES_IN=24h

# Configurações de Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app

# Configurações de Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Configurações da API
API_VERSION=v1
API_BASE_URL=http://localhost:3001/api/v1
```

#### 4.2 Frontend
```bash
# Criar arquivo .env no frontend
cd frontend
echo "REACT_APP_API_URL=http://localhost:3001/api/v1" > .env
```

### 5. Executar o Projeto

#### 5.1 Desenvolvimento (Recomendado)
```bash
# Na raiz do projeto
npm run dev

# Isso irá executar backend e frontend simultaneamente
```

#### 5.2 Executar Separadamente

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

### 6. Acessar o Sistema

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentação da API**: http://localhost:3001/api-docs

### 7. Usuários Padrão

O sistema vem com usuários pré-cadastrados:

| Email | Senha | Role |
|-------|-------|------|
| admin@oticadavi.com | admin123 | admin |
| gerente@oticadavi.com | admin123 | manager |
| vendedor@oticadavi.com | admin123 | seller |

**⚠️ IMPORTANTE**: Altere as senhas padrão em produção!

## Estrutura do Projeto

```
erp-otica-davi/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/    # Controladores da API
│   │   ├── models/         # Modelos do banco de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares
│   │   └── config/         # Configurações
│   ├── database/           # Scripts do banco
│   └── package.json
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── contexts/       # Contextos React
│   │   └── services/       # Serviços de API
│   └── package.json
├── docs/                   # Documentação
└── README.md
```

## Comandos Úteis

### Backend
```bash
# Desenvolvimento
npm run dev

# Produção
npm start

# Testes
npm test

# Build
npm run build
```

### Frontend
```bash
# Desenvolvimento
npm start

# Build para produção
npm run build

# Testes
npm test
```

### Banco de Dados
```bash
# Backup
pg_dump -U postgres erp_otica_davi > backup.sql

# Restaurar
psql -U postgres erp_otica_davi < backup.sql

# Resetar banco
psql -U postgres -c "DROP DATABASE erp_otica_davi;"
psql -U postgres -c "CREATE DATABASE erp_otica_davi;"
psql -U postgres -d erp_otica_davi -f backend/database/schema.sql
```

## Solução de Problemas

### Erro de Conexão com Banco
1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no arquivo .env
3. Teste a conexão: `psql -U postgres -d erp_otica_davi`

### Erro de Porta em Uso
1. Backend (3001): `lsof -ti:3001 | xargs kill -9`
2. Frontend (3000): `lsof -ti:3000 | xargs kill -9`

### Erro de Dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro de Build do Frontend
```bash
# Limpar cache do React
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend
npm install
```

## Produção

### 1. Build do Frontend
```bash
cd frontend
npm run build
```

### 2. Configurar Variáveis de Produção
```bash
# Backend
NODE_ENV=production
DB_HOST=seu_servidor_db
DB_PASSWORD=sua_senha_producao
JWT_SECRET=chave_super_secreta_producao

# Frontend
REACT_APP_API_URL=https://sua-api.com/api/v1
```

### 3. Usar PM2 para Gerenciar Processos
```bash
# Instalar PM2
npm install -g pm2

# Executar backend
cd backend
pm2 start src/server.js --name "erp-backend"

# Verificar status
pm2 status
pm2 logs erp-backend
```

## Suporte

Para dúvidas ou problemas:
1. Verifique este guia
2. Consulte a documentação da API: http://localhost:3001/api-docs
3. Abra uma issue no repositório
4. Entre em contato com a equipe de desenvolvimento

---

**Versão**: 1.0  
**Última atualização**: Janeiro 2024
