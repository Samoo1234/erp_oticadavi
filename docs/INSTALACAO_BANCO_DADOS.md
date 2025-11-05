# Guia de Instalação do Banco de Dados - ERP Ótica Davi

## 🗄️ Instalação do PostgreSQL

### 1. Download e Instalação

1. **Acesse o site oficial do PostgreSQL:**
   - URL: https://www.postgresql.org/download/windows/
   - Baixe a versão mais recente (recomendado: PostgreSQL 15 ou 16)

2. **Execute o instalador:**
   - Execute o arquivo `.exe` baixado
   - Siga o assistente de instalação
   - **IMPORTANTE**: Anote a senha do usuário `postgres` que você definir

3. **Configurações recomendadas:**
   - Porta: `5432` (padrão)
   - Usuário: `postgres`
   - Senha: `postgres` (ou sua escolha)
   - Locale: `Portuguese_Brazil.1252`

### 2. Verificação da Instalação

Abra o **Command Prompt** ou **PowerShell** como administrador e execute:

```bash
# Verificar se o PostgreSQL está instalado
psql --version

# Verificar se o serviço está rodando
sc query postgresql-x64-15
```

### 3. Configuração do Banco de Dados

1. **Abra o pgAdmin 4** (instalado junto com o PostgreSQL)

2. **Conecte ao servidor:**
   - Host: `localhost`
   - Port: `5432`
   - Username: `postgres`
   - Password: `postgres` (ou a senha que você definiu)

3. **Crie o banco de dados:**
   ```sql
   CREATE DATABASE erp_otica_davi;
   ```

4. **Ou use o comando SQL:**
   ```bash
   # No Command Prompt
   createdb -U postgres erp_otica_davi
   ```

## 🔧 Configuração do Projeto

### 1. Criar arquivo .env

Crie o arquivo `backend/.env` com o seguinte conteúdo:

```env
# Configurações do Servidor
PORT=3001
NODE_ENV=development

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_otica_davi
DB_USER=postgres
DB_PASSWORD=postgres

# Configurações de Autenticação
JWT_SECRET=erp_otica_davi_jwt_secret_key_2024
JWT_EXPIRES_IN=24h

# Configurações de Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Configurações de Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Configurações da API
API_VERSION=v1
API_BASE_URL=http://localhost:3001/api/v1
```

### 2. Instalar dependências

```bash
# No diretório raiz do projeto
npm run install:all
```

### 3. Inicializar o banco de dados

```bash
# Executar o script de inicialização
npm run init-db
```

## 🚀 Iniciar o Sistema

### 1. Iniciar o backend e frontend

```bash
# No diretório raiz do projeto
npm run dev
```

### 2. Verificar se está funcionando

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:3001/api-docs

## 🔍 Solução de Problemas

### Erro: "autenticação do tipo senha falhou"

**Causa**: Senha incorreta ou usuário não existe

**Solução**:
1. Verifique a senha do PostgreSQL
2. Confirme se o usuário `postgres` existe
3. Verifique se o arquivo `.env` está correto

### Erro: "database does not exist"

**Causa**: Banco de dados não foi criado

**Solução**:
```sql
-- Conecte no PostgreSQL e execute:
CREATE DATABASE erp_otica_davi;
```

### Erro: "connection refused"

**Causa**: PostgreSQL não está rodando

**Solução**:
1. Abra o **Services** (services.msc)
2. Procure por "PostgreSQL"
3. Inicie o serviço se estiver parado

## 📋 Checklist de Instalação

- [ ] PostgreSQL instalado
- [ ] Serviço PostgreSQL rodando
- [ ] Banco `erp_otica_davi` criado
- [ ] Arquivo `backend/.env` criado
- [ ] Dependências instaladas (`npm run install:all`)
- [ ] Banco inicializado (`npm run init-db`)
- [ ] Sistema rodando (`npm run dev`)

## 🎯 Próximos Passos

Após a instalação do PostgreSQL:

1. **Criar o arquivo .env** no backend
2. **Executar** `npm run install:all`
3. **Inicializar** o banco com `npm run init-db`
4. **Iniciar** o sistema com `npm run dev`

## 📞 Suporte

Se encontrar problemas:

1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no arquivo `.env`
3. Execute `npm run init-db` para criar as tabelas
4. Verifique os logs do console para erros específicos

---

**Desenvolvido por**: Equipe ERP Ótica Davi  
**Versão**: 1.0  
**Última atualização**: Janeiro 2024

