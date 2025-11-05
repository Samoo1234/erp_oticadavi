const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗄️  Configurando Banco de Dados - ERP Ótica Davi\n');

// Verificar se o PostgreSQL está instalado
function checkPostgreSQL() {
  try {
    execSync('psql --version', { stdio: 'pipe' });
    console.log('✅ PostgreSQL encontrado');
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL não encontrado');
    console.log('📥 Por favor, instale o PostgreSQL primeiro:');
    console.log('   https://www.postgresql.org/download/windows/');
    return false;
  }
}

// Criar arquivo .env se não existir
function createEnvFile() {
  const envPath = path.join(__dirname, '..', 'backend', '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ Arquivo .env já existe');
    return;
  }

  const envContent = `# Configurações do Servidor
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
API_BASE_URL=http://localhost:3001/api/v1`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env criado com sucesso');
  } catch (error) {
    console.log('❌ Erro ao criar arquivo .env:', error.message);
  }
}

// Criar banco de dados
function createDatabase() {
  try {
    console.log('🔄 Criando banco de dados...');
    execSync('createdb -U postgres erp_otica_davi', { stdio: 'pipe' });
    console.log('✅ Banco de dados criado com sucesso');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Banco de dados já existe');
    } else {
      console.log('❌ Erro ao criar banco de dados:', error.message);
      console.log('💡 Tente criar manualmente:');
      console.log('   createdb -U postgres erp_otica_davi');
    }
  }
}

// Verificar conexão com o banco
function testConnection() {
  try {
    console.log('🔄 Testando conexão com o banco...');
    execSync('psql -U postgres -d erp_otica_davi -c "SELECT version();"', { stdio: 'pipe' });
    console.log('✅ Conexão com o banco estabelecida');
    return true;
  } catch (error) {
    console.log('❌ Erro ao conectar com o banco:', error.message);
    console.log('💡 Verifique se:');
    console.log('   - PostgreSQL está rodando');
    console.log('   - Usuário "postgres" existe');
    console.log('   - Senha está correta');
    return false;
  }
}

// Função principal
async function setupDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados...\n');

  // 1. Verificar PostgreSQL
  if (!checkPostgreSQL()) {
    process.exit(1);
  }

  // 2. Criar arquivo .env
  createEnvFile();

  // 3. Criar banco de dados
  createDatabase();

  // 4. Testar conexão
  if (testConnection()) {
    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Execute: npm run install:all');
    console.log('   2. Execute: npm run init-db');
    console.log('   3. Execute: npm run dev');
  } else {
    console.log('\n❌ Configuração não concluída');
    console.log('💡 Verifique os erros acima e tente novamente');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };

