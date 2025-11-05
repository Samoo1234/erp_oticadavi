/**
 * Script de Migração de Clientes
 * Sistema de Agendamento → ERP Ótica
 * 
 * Este script faz a sincronização inicial (em lote) de todos os clientes
 * do sistema de agendamento para o ERP.
 * 
 * USO:
 * 1. Configure as variáveis abaixo
 * 2. Instale dependências: npm install @supabase/supabase-js node-fetch
 * 3. Execute: node migrate-clients.js
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// ========== CONFIGURAÇÃO ==========
const AGENDAMENTO_SUPABASE_URL = process.env.AGENDAMENTO_SUPABASE_URL || 'https://seu-projeto.supabase.co';
const AGENDAMENTO_SUPABASE_KEY = process.env.AGENDAMENTO_SUPABASE_KEY || 'sua-key-aqui';
const ERP_API_URL = process.env.ERP_API_URL || 'http://localhost:3000/api/v1/clients/sync';
const ERP_API_KEY = process.env.ERP_API_KEY || 'sua-api-key-aqui';

// Configurações de performance
const BATCH_SIZE = 10; // Quantos clientes processar por vez
const DELAY_MS = 100; // Delay entre requisições (ms)
const DRY_RUN = false; // true = apenas simula, não envia dados

// ========== INICIALIZAÇÃO ==========
const supabase = createClient(AGENDAMENTO_SUPABASE_URL, AGENDAMENTO_SUPABASE_KEY);

// Estatísticas
const stats = {
  total: 0,
  success: 0,
  errors: 0,
  skipped: 0,
  created: 0,
  updated: 0,
};

// ========== FUNÇÕES ==========

/**
 * Aguardar um tempo (ms)
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formatar telefone para exibição
 */
function formatPhone(phone) {
  if (!phone) return 'N/A';
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

/**
 * Sincronizar um cliente com o ERP
 */
async function syncClient(client) {
  try {
    // Validar dados obrigatórios
    if (!client.id || !client.name || !client.phone) {
      console.warn(`⚠️  Cliente inválido (faltam dados obrigatórios):`, {
        id: client.id,
        name: client.name || 'sem nome',
        phone: client.phone || 'sem telefone',
      });
      stats.skipped++;
      return { success: false, reason: 'dados_invalidos' };
    }

    // Preparar payload
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

    // Modo dry-run: apenas simula
    if (DRY_RUN) {
      console.log(`🔍 [DRY RUN] Cliente: ${client.name} (${formatPhone(client.phone)})`);
      stats.success++;
      return { success: true, dryRun: true };
    }

    // Enviar para o ERP
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
      console.error(`❌ Erro ao sincronizar "${client.name}":`, result.message || result.error);
      stats.errors++;
      return { success: false, error: result.message || result.error };
    }

    // Sucesso
    const action = result.action === 'created' ? '✨ Criado' : '🔄 Atualizado';
    console.log(`${action}: ${client.name} (${formatPhone(client.phone)})`);
    
    stats.success++;
    if (result.action === 'created') stats.created++;
    if (result.action === 'updated') stats.updated++;

    return { success: true, action: result.action };

  } catch (error) {
    console.error(`💥 Erro ao processar "${client.name}":`, error.message);
    stats.errors++;
    return { success: false, error: error.message };
  }
}

/**
 * Processar clientes em lote
 */
async function processBatch(clients) {
  const promises = clients.map(client => syncClient(client));
  await Promise.all(promises);
}

/**
 * Função principal
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║     MIGRAÇÃO DE CLIENTES - Agendamento → ERP          ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  // Validar configuração
  if (AGENDAMENTO_SUPABASE_URL.includes('seu-projeto')) {
    console.error('❌ Configure AGENDAMENTO_SUPABASE_URL antes de executar!');
    process.exit(1);
  }

  if (ERP_API_KEY === 'sua-api-key-aqui') {
    console.error('❌ Configure ERP_API_KEY antes de executar!');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('🔍 MODO DRY RUN ATIVADO - Nenhum dado será enviado\n');
  }

  console.log('📊 Configuração:');
  console.log(`   - Supabase: ${AGENDAMENTO_SUPABASE_URL}`);
  console.log(`   - ERP URL: ${ERP_API_URL}`);
  console.log(`   - Batch Size: ${BATCH_SIZE}`);
  console.log(`   - Delay: ${DELAY_MS}ms\n`);

  // Buscar todos os clientes
  console.log('🔍 Buscando clientes do sistema de agendamento...\n');

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Erro ao buscar clientes:', error.message);
    process.exit(1);
  }

  if (!clients || clients.length === 0) {
    console.log('ℹ️  Nenhum cliente encontrado para migrar.');
    process.exit(0);
  }

  stats.total = clients.length;
  console.log(`📋 Encontrados ${stats.total} clientes para migrar\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Processar em lotes
  const startTime = Date.now();

  for (let i = 0; i < clients.length; i += BATCH_SIZE) {
    const batch = clients.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(clients.length / BATCH_SIZE);

    console.log(`📦 Processando lote ${batchNum}/${totalBatches} (${batch.length} clientes)...`);
    
    await processBatch(batch);
    
    // Aguardar entre lotes (exceto no último)
    if (i + BATCH_SIZE < clients.length) {
      await sleep(DELAY_MS);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Resultado final
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅ MIGRAÇÃO CONCLUÍDA!\n');
  console.log('📊 Estatísticas:');
  console.log(`   Total de clientes: ${stats.total}`);
  console.log(`   ✅ Sucesso: ${stats.success}`);
  console.log(`   ✨ Criados: ${stats.created}`);
  console.log(`   🔄 Atualizados: ${stats.updated}`);
  console.log(`   ❌ Erros: ${stats.errors}`);
  console.log(`   ⏭️  Ignorados: ${stats.skipped}`);
  console.log(`   ⏱️  Tempo: ${duration}s`);
  console.log(`   ⚡ Velocidade: ${(stats.total / parseFloat(duration)).toFixed(2)} clientes/s\n`);

  if (stats.errors > 0) {
    console.log('⚠️  Alguns clientes não foram sincronizados.');
    console.log('   Revise os erros acima e execute novamente se necessário.\n');
  }

  if (DRY_RUN) {
    console.log('🔍 Este foi um DRY RUN - Nenhum dado foi realmente enviado.');
    console.log('   Defina DRY_RUN = false para fazer a migração real.\n');
  }
}

// ========== EXECUÇÃO ==========

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('\n💥 Erro não tratado:', error);
  process.exit(1);
});

// Tratamento de interrupção (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Migração interrompida pelo usuário');
  console.log(`📊 Progresso: ${stats.success + stats.errors + stats.skipped}/${stats.total} clientes processados`);
  process.exit(0);
});

// Executar
main().catch((error) => {
  console.error('\n💥 Erro fatal:', error);
  process.exit(1);
});

/**
 * ========== EXEMPLOS DE USO ==========
 * 
 * 1. Configurar variáveis de ambiente:
 *    export AGENDAMENTO_SUPABASE_URL="https://seu-projeto.supabase.co"
 *    export AGENDAMENTO_SUPABASE_KEY="sua-key"
 *    export ERP_API_URL="http://localhost:3000/api/v1/clients/sync"
 *    export ERP_API_KEY="sua-api-key"
 * 
 * 2. Executar em modo dry-run (teste):
 *    - Edite: DRY_RUN = true
 *    - Execute: node migrate-clients.js
 * 
 * 3. Executar migração real:
 *    - Edite: DRY_RUN = false
 *    - Execute: node migrate-clients.js
 * 
 * 4. Ajustar performance:
 *    - BATCH_SIZE: Aumentar para mais velocidade (cuidado com rate limits)
 *    - DELAY_MS: Reduzir para mais velocidade (cuidado com sobrecarga)
 * 
 * 5. Re-executar após falha:
 *    - O script pode ser executado múltiplas vezes
 *    - Clientes já sincronizados serão atualizados (não duplicados)
 */

