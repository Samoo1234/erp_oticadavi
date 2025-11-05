# Configuração do Supabase - ERP Ótica Davi

## 🚀 Configuração do Supabase

### 1. Criar Projeto no Supabase

1. **Acesse o Supabase:**
   - URL: https://supabase.com
   - Faça login ou crie uma conta gratuita

2. **Criar novo projeto:**
   - Clique em "New Project"
   - Nome: `erp-otica-davi`
   - Senha do banco: `erp_otica_davi_2024` (anote esta senha!)
   - Região: `South America (São Paulo)` (mais próxima do Brasil)

3. **Aguardar criação:**
   - O projeto leva alguns minutos para ser criado
   - Anote as credenciais que aparecerão

### 2. Obter Credenciais

No painel do Supabase, vá em **Settings > Database** e anote:

- **Host**: `db.xxxxxxxxxxxx.supabase.co`
- **Database Name**: `postgres`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: `erp_otica_davi_2024` (ou a que você definiu)

### 3. Configurar Variáveis de Ambiente

Crie o arquivo `backend/.env` com as credenciais do Supabase:

```env
# Configurações do Servidor
PORT=3001
NODE_ENV=development

# Configurações do Supabase
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=erp_otica_davi_2024

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

### 4. Executar Scripts de Configuração

```bash
# Instalar dependências
npm run install:all

# Inicializar banco de dados
npm run init-db

# Iniciar sistema
npm run dev
```

## 📊 Estrutura do Banco no Supabase

O script `init-database.js` criará automaticamente:

- **Tabelas principais**: users, clients, products, sales, prescriptions
- **Relacionamentos**: foreign keys entre tabelas
- **Índices**: para performance
- **Dados iniciais**: usuário admin padrão

## 🔧 Vantagens do Supabase

- ✅ **Sem instalação local** do PostgreSQL
- ✅ **Interface web** para gerenciar dados
- ✅ **Backup automático**
- ✅ **Escalabilidade** fácil
- ✅ **API REST** automática
- ✅ **Autenticação** integrada
- ✅ **Tempo real** (se necessário)

## 🎯 Próximos Passos

1. **Criar projeto** no Supabase
2. **Configurar** arquivo `.env`
3. **Executar** `npm run install:all`
4. **Inicializar** banco com `npm run init-db`
5. **Iniciar** sistema com `npm run dev`

## 📞 Suporte

Se encontrar problemas:

1. Verifique se o projeto Supabase está ativo
2. Confirme as credenciais no arquivo `.env`
3. Teste a conexão no painel do Supabase
4. Verifique os logs do console

---

**Desenvolvido por**: Equipe ERP Ótica Davi  
**Versão**: 1.0  
**Última atualização**: Janeiro 2024

