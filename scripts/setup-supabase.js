const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Supabase - ERP Ótica Davi\n');

// Criar arquivo .env com template do Supabase
function createSupabaseEnvFile() {
  const envPath = path.join(__dirname, '..', 'backend', '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ Arquivo .env já existe');
    console.log('💡 Verifique se as credenciais do Supabase estão corretas');
    return;
  }

  const envContent = `# Configurações do Servidor
PORT=3001
NODE_ENV=development

# Configurações do Supabase
# Substitua pelas suas credenciais do Supabase
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
API_BASE_URL=http://localhost:3001/api/v1`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env criado com template do Supabase');
    console.log('📝 IMPORTANTE: Edite o arquivo backend/.env com suas credenciais do Supabase');
  } catch (error) {
    console.log('❌ Erro ao criar arquivo .env:', error.message);
  }
}

// Mostrar instruções
function showInstructions() {
  console.log('\n📋 INSTRUÇÕES PARA CONFIGURAR O SUPABASE:\n');
  
  console.log('1. 🌐 Acesse: https://supabase.com');
  console.log('2. 🔐 Faça login ou crie uma conta gratuita');
  console.log('3. ➕ Clique em "New Project"');
  console.log('4. 📝 Configure:');
  console.log('   - Nome: erp-otica-davi');
  console.log('   - Senha: erp_otica_davi_2024');
  console.log('   - Região: South America (São Paulo)');
  console.log('5. ⏳ Aguarde a criação do projeto');
  console.log('6. 🔑 Vá em Settings > Database e copie as credenciais');
  console.log('7. ✏️  Edite o arquivo backend/.env com suas credenciais');
  console.log('8. 🚀 Execute: npm run install:all && npm run init-db && npm run dev');
  
  console.log('\n📊 CREDENCIAIS NECESSÁRIAS:');
  console.log('   - DB_HOST: db.xxxxxxxxxxxx.supabase.co');
  console.log('   - DB_PORT: 5432');
  console.log('   - DB_NAME: postgres');
  console.log('   - DB_USER: postgres');
  console.log('   - DB_PASSWORD: sua_senha_do_supabase');
  
  console.log('\n🎯 VANTAGENS DO SUPABASE:');
  console.log('   ✅ Sem instalação local do PostgreSQL');
  console.log('   ✅ Interface web para gerenciar dados');
  console.log('   ✅ Backup automático');
  console.log('   ✅ Escalabilidade fácil');
  console.log('   ✅ API REST automática');
}

// Função principal
async function setupSupabase() {
  console.log('🚀 Iniciando configuração do Supabase...\n');

  // 1. Criar arquivo .env
  createSupabaseEnvFile();

  // 2. Mostrar instruções
  showInstructions();

  console.log('\n🎉 Configuração do template concluída!');
  console.log('📖 Leia o arquivo docs/CONFIGURACAO_SUPABASE.md para mais detalhes');
}

// Executar se chamado diretamente
if (require.main === module) {
  setupSupabase().catch(console.error);
}

module.exports = { setupSupabase };

