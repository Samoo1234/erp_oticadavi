/**
 * Script de Teste da Integração VisionCare → ERP
 * 
 * Este script testa o endpoint de sincronização com dados simulados.
 * 
 * Execução: node test-sync.js
 */

require('dotenv').config();
const axios = require('axios');

// Configuração
const ERP_URL = process.env.ERP_BASE_URL || 'http://localhost:3000';
const ERP_API_KEY = process.env.INTEGRATION_API_KEYS?.split(',')[0];

// Validação
if (!ERP_API_KEY) {
  console.error('❌ INTEGRATION_API_KEYS não configurada no .env');
  process.exit(1);
}

// Dados de teste simulando o payload do Webhook do Supabase
const testPayloads = {
  insert: {
    type: 'INSERT',
    table: 'patients',
    record: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Teste Paciente Insert',
      email: 'teste.insert@example.com',
      phone: '(11) 99999-0001',
      cpf: '00000000001',
      birth_date: '1990-01-01',
      address: {
        street: 'Rua Teste',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000'
      },
      nome_pai: 'Pai Teste',
      nome_mae: 'Mãe Teste',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  update: {
    type: 'UPDATE',
    table: 'patients',
    record: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Teste Paciente Update (EDITADO)',
      email: 'teste.update@example.com',
      phone: '(11) 99999-0002',
      cpf: '00000000001',
      birth_date: '1990-01-01',
      address: {
        street: 'Rua Teste Nova',
        number: '456',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000'
      },
      nome_pai: 'Pai Teste',
      nome_mae: 'Mãe Teste',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    old_record: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Teste Paciente Insert'
    }
  },
  delete: {
    type: 'DELETE',
    table: 'patients',
    record: {
      id: '00000000-0000-0000-0000-000000000001'
    },
    old_record: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Teste Paciente Update (EDITADO)'
    }
  }
};

/**
 * Testar endpoint
 */
async function testEndpoint(testName, payload) {
  try {
    console.log(`\n📤 Testando: ${testName}...`);
    
    const response = await axios.post(
      `${ERP_URL}/api/v1/clients/sync`,
      payload,
      {
        headers: {
          'x-api-key': ERP_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ ${testName} bem-sucedido!`);
    console.log(`   Ação: ${response.data.action}`);
    console.log(`   Mensagem: ${response.data.message}`);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ ${testName} falhou!`);
    console.error(`   Erro: ${error.response?.data?.message || error.message}`);
    
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Executar testes
 */
async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 TESTE DE INTEGRAÇÃO: VisionCare → ERP');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`\n🔗 ERP URL: ${ERP_URL}`);
  console.log(`🔑 API Key: ${ERP_API_KEY.substring(0, 10)}...`);

  // Verificar se o servidor está rodando
  try {
    await axios.get(`${ERP_URL}/health`, { timeout: 3000 });
  } catch (error) {
    console.error('\n❌ Erro: O servidor do ERP não está respondendo!');
    console.error('   Certifique-se de que o backend está rodando: npm run dev');
    process.exit(1);
  }

  console.log('\n✅ Servidor do ERP está online');

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Teste 1: INSERT
  console.log('\n───────────────────────────────────────────────────────');
  console.log('Teste 1/3: INSERT (Criar paciente)');
  console.log('───────────────────────────────────────────────────────');
  const insertResult = await testEndpoint('INSERT', testPayloads.insert);
  results.total++;
  if (insertResult.success) results.passed++;
  else results.failed++;

  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Teste 2: UPDATE
  console.log('\n───────────────────────────────────────────────────────');
  console.log('Teste 2/3: UPDATE (Atualizar paciente)');
  console.log('───────────────────────────────────────────────────────');
  const updateResult = await testEndpoint('UPDATE', testPayloads.update);
  results.total++;
  if (updateResult.success) results.passed++;
  else results.failed++;

  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Teste 3: DELETE
  console.log('\n───────────────────────────────────────────────────────');
  console.log('Teste 3/3: DELETE (Desativar paciente)');
  console.log('───────────────────────────────────────────────────────');
  const deleteResult = await testEndpoint('DELETE', testPayloads.delete);
  results.total++;
  if (deleteResult.success) results.passed++;
  else results.failed++;

  // Relatório final
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 RELATÓRIO DE TESTES');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`\nTotal de testes: ${results.total}`);
  console.log(`✅ Passou: ${results.passed}`);
  console.log(`❌ Falhou: ${results.failed}`);

  if (results.failed === 0) {
    console.log('\n🎉 Todos os testes passaram!');
    console.log('✅ A integração está funcionando corretamente!');
  } else {
    console.log('\n⚠️  Alguns testes falharam.');
    console.log('🔍 Verifique os logs acima para mais detalhes.');
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
}

// Executar testes
runTests();

