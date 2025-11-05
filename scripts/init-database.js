const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres' // Conecta no banco padrão primeiro
};

async function initDatabase() {
  const client = new Client(config);
  
  try {
    console.log('🔌 Conectando ao PostgreSQL...');
    await client.connect();
    
    // Verificar se o banco existe
    const dbExists = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      ['erp_otica_davi']
    );
    
    if (dbExists.rows.length === 0) {
      console.log('📦 Criando banco de dados erp_otica_davi...');
      await client.query('CREATE DATABASE erp_otica_davi');
      console.log('✅ Banco de dados criado com sucesso!');
    } else {
      console.log('ℹ️  Banco de dados já existe');
    }
    
    // Fechar conexão com postgres
    await client.end();
    
    // Conectar no banco criado
    const dbClient = new Client({
      ...config,
      database: 'erp_otica_davi'
    });
    
    await dbClient.connect();
    console.log('🔌 Conectado ao banco erp_otica_davi');
    
    // Executar schema
    const schemaPath = path.join(__dirname, '..', 'backend', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Executando schema do banco...');
    await dbClient.query(schema);
    console.log('✅ Schema executado com sucesso!');
    
    // Verificar tabelas criadas
    const tables = await dbClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\n📊 Tabelas criadas:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    await dbClient.end();
    
    console.log('\n🎉 Banco de dados inicializado com sucesso!');
    console.log('\n👤 Usuários padrão criados:');
    console.log('  - admin@oticadavi.com / admin123 (Admin)');
    console.log('  - gerente@oticadavi.com / admin123 (Gerente)');
    console.log('  - vendedor@oticadavi.com / admin123 (Vendedor)');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    process.exit(1);
  }
}

// Carregar variáveis de ambiente
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

initDatabase();
