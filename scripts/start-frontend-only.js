const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Frontend - ERP Ótica Davi\n');

// Verificar se estamos no diretório correto
const frontendPath = path.join(__dirname, '..', 'frontend');

try {
  console.log('📁 Navegando para o diretório frontend...');
  process.chdir(frontendPath);
  
  console.log('📦 Verificando dependências...');
  execSync('npm list --depth=0', { stdio: 'pipe' });
  
  console.log('🎨 Iniciando servidor de desenvolvimento...');
  console.log('🌐 Frontend estará disponível em: http://localhost:3000');
  console.log('⚠️  Nota: O backend não está rodando, então algumas funcionalidades podem não funcionar');
  console.log('💡 Para iniciar com backend, use: npm run dev');
  console.log('\n🔄 Iniciando...\n');
  
  // Iniciar o servidor de desenvolvimento
  execSync('npm start', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Erro ao iniciar o frontend:', error.message);
  console.log('\n💡 Soluções possíveis:');
  console.log('   1. Execute: npm run install:all');
  console.log('   2. Verifique se está no diretório correto');
  console.log('   3. Execute: cd frontend && npm install');
}















