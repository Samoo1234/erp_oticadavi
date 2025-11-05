/**
 * Script de Sincronização de Clientes
 * Supabase (nfvrbyiocqozpkyispkb) → ERP
 * 
 * Este script sincroniza todos os clientes do projeto Supabase
 * especificado com o ERP em uma única execução.
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// ========== CONFIGURAÇÃO ==========
const SOURCE_SUPABASE_URL = process.env.SOURCE_SUPABASE_URL || 'https://nfvrbyiocqozpkyispkb.supabase.co';
const SOURCE_SUPABASE_KEY = process.env.SOURCE_SUPABASE_KEY || 'cole_sua_anon_key_aqui';
const ERP_API_URL = process.env.ERP_API_URL || 'http://localhost:3000/api/v1/clients/sync';
const ERP_API_KEY = process.env.ERP_API_KEY || 'cole_sua_api_key_aqui';

// Configurações
const DELAY_MS = 100; // Delay entre requisições
const DRY_RUN = false; // true = apenas simula

// ========== VALIDAÇÃO ==========
if (SOURCE_SUPABASE_KEY === 'cole_sua_anon_key_aqui') {
  console.error('❌ Configure SOURCE_SUPABASE_KEY antes de executar!');
  console.log('\n💡 Obtenha a chave em:');
  console.log('   https://supabase.com/dashboard/project/nfvrbyiocqozpkyispkb/settings/api');
  console.log('   Copie a "anon public" key\n');
  process.exit(1);
}

if (ERP_API_KEY === 'cole_sua_api_key_aqui') {
  console.error('❌ Configure ERP_API_KEY antes de executar!');
  console.log('\n💡 Gere uma chave com:');
  console.log('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n');
  process.exit(1);
}

// ========== INICIALIZAÇÃO ==========
const supabase = createClient(SOURCE_SUPABASE_URL, SOURCE_SUPABASE_KEY);

const stats = {
  total: 0,
  success: 0,
  errors: 0,
  created: 0,
  updated: 0,
};

// ========== FUNÇÕES ==========

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatPhone(phone) {
  if (!phone) return 'N/A';
  return phone;
}

async function syncClient(client) {
  try {
    // Validar dados obrigatórios
    if (!client.id || !client.name || !client.phone) {
      console.warn(`⚠️  Cliente ignorado (dados incompletos): ${client.name || 'sem nome'}`);
      return { success: false, skipped: true };
    }

    const payload = {
      externalId: client.id,
      name: client.name,
      email: client.email || null,
      phone: client.phone,
      cpf: client.cpf || null,
      birthDate: client.birth_date || null,
      gender: client.gender || null,
      address: client.address || null,
      notes: client.notes || null,
    };

    if (DRY_RUN) {
      console.log(`🔍 [DRY RUN] ${client.name} (${formatPhone(client.phone)})`);
      stats.success++;
      return { success: true, dryRun: true };
    }

    const response = await fetch(ERP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ERP_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`❌ ${client.name}: ${result.message || result.error}`);
      stats.errors++;
      return { success: false, error: result.message };
    }

    const icon = result.action === 'created' ? '✨' : '🔄';
    console.log(`${icon} ${client.name} (${formatPhone(client.phone)})`);
    
    stats.success++;
    if (result.action === 'created') stats.created++;
    if (result.action === 'updated') stats.updated++;

    return { success: true, action: result.action };

  } catch (error) {
    console.error(`💥 ${client.name}: ${error.message}`);
    stats.errors++;
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   SINCRONIZAÇÃO DE CLIENTES - Supabase → ERP          ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  if (DRY_RUN) {
    console.log('🔍 MODO DRY RUN - Nenhum dado será enviado\n');
  }

  console.log('📊 Configuração:');
  console.log(`   Supabase: ${SOURCE_SUPABASE_URL}`);
  console.log(`   ERP: ${ERP_API_URL}`);
  console.log(`   Delay: ${DELAY_MS}ms\n`);

  console.log('🔍 Buscando clientes...\n');

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Erro ao buscar clientes:', error.message);
    console.log('\n💡 Verifique:');
    console.log('   1. A SOURCE_SUPABASE_KEY está correta');
    console.log('   2. A tabela "clients" existe no Supabase');
    console.log('   3. A RLS (Row Level Security) está desabilitada ou configurada\n');
    process.exit(1);
  }

  if (!clients || clients.length === 0) {
    console.log('ℹ️  Nenhum cliente encontrado para sincronizar.');
    process.exit(0);
  }

  stats.total = clients.length;
  console.log(`📋 Encontrados ${stats.total} clientes\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const startTime = Date.now();

  for (let i = 0; i < clients.length; i++) {
    await syncClient(clients[i]);
    
    if (i < clients.length - 1) {
      await sleep(DELAY_MS);
    }

    // Mostrar progresso a cada 10 clientes
    if ((i + 1) % 10 === 0) {
      console.log(`\n📊 Progresso: ${i + 1}/${stats.total} (${Math.round((i + 1) / stats.total * 100)}%)\n`);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅ SINCRONIZAÇÃO CONCLUÍDA!\n');
  console.log('📊 Estatísticas:');
  console.log(`   Total: ${stats.total}`);
  console.log(`   ✅ Sucesso: ${stats.success}`);
  console.log(`   ✨ Criados: ${stats.created}`);
  console.log(`   🔄 Atualizados: ${stats.updated}`);
  console.log(`   ❌ Erros: ${stats.errors}`);
  console.log(`   ⏱️  Tempo: ${duration}s`);
  console.log(`   ⚡ Velocidade: ${(stats.total / parseFloat(duration)).toFixed(2)} clientes/s\n`);

  if (stats.errors > 0) {
    console.log('⚠️  Alguns clientes não foram sincronizados.');
    console.log('   Revise os erros acima e execute novamente se necessário.\n');
  }

  if (DRY_RUN) {
    console.log('🔍 Este foi um DRY RUN - Nenhum dado foi enviado.');
    console.log('   Altere DRY_RUN = false no código para sincronizar.\n');
  }
}

// ========== EXECUÇÃO ==========
process.on('unhandledRejection', (error) => {
  console.error('\n💥 Erro não tratado:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\n⚠️  Sincronização interrompida');
  console.log(`📊 Progresso: ${stats.success + stats.errors}/${stats.total}`);
  process.exit(0);
});

main().catch((error) => {
  console.error('\n💥 Erro fatal:', error);
  process.exit(1);
});

/**
 * ========== COMO USAR ==========
 * 
 * 1. Instalar dependências:
 *    npm install @supabase/supabase-js node-fetch
 * 
 * 2. Obter a anon key do Supabase:
 *    https://supabase.com/dashboard/project/nfvrbyiocqozpkyispkb/settings/api
 * 
 * 3. Gerar API Key para o ERP:
 *    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 * 
 * 4. Configurar as variáveis no código ou via env:
 *    export SOURCE_SUPABASE_KEY="sua_anon_key"
 *    export ERP_API_KEY="sua_api_key"
 * 
 * 5. Executar:
 *    node sync-supabase-clients.js
 */

