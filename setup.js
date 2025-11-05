const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando ERP Ótica Davi - Fase 1');

// Criar arquivo .env para o backend
const backendEnv = `# Configurações do Servidor
PORT=3001
NODE_ENV=development

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_otica_davi
DB_USER=postgres
DB_PASSWORD=postgres

# Configurações de Autenticação
JWT_SECRET=erp_otica_davi_super_secret_key_2024
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
API_BASE_URL=http://localhost:3001/api/v1`;

// Criar arquivo .env para o frontend
const frontendEnv = `REACT_APP_API_URL=http://localhost:3001/api/v1`;

try {
  // Criar .env do backend
  fs.writeFileSync(path.join(__dirname, 'backend', '.env'), backendEnv);
  console.log('✅ Arquivo .env do backend criado');

  // Criar .env do frontend
  fs.writeFileSync(path.join(__dirname, 'frontend', '.env'), frontendEnv);
  console.log('✅ Arquivo .env do frontend criado');

  // Criar diretório de uploads
  const uploadsDir = path.join(__dirname, 'backend', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Diretório de uploads criado');
  }

  console.log('\n🎉 Configuração inicial concluída!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Instalar dependências: npm run install:all');
  console.log('2. Configurar banco PostgreSQL');
  console.log('3. Executar schema: psql -U postgres -d erp_otica_davi -f backend/database/schema.sql');
  console.log('4. Iniciar desenvolvimento: npm run dev');

} catch (error) {
  console.error('❌ Erro na configuração:', error.message);
}
