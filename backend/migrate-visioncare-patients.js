/**
 * Script de Migração Inicial: VisionCare Patients → ERP Clients
 * 
 * Este script sincroniza todos os pacientes da tabela 'patients' do VisionCare
 * para a tabela 'clients' do ERP.
 * 
 * Execução: node migrate-visioncare-patients.js
 */

require('dotenv').config();
const axios = require('axios');

// Configuração do Supabase VisionCare
const VISIONCARE_URL = 'https://nfvrbyiocqozpkyispkb.supabase.co';
const VISIONCARE_KEY = process.env.VISIONCARE_SERVICE_KEY || process.env.VISIONCARE_ANON_KEY;

// Configuração do ERP
const ERP_URL = process.env.ERP_BASE_URL || 'http://localhost:3000';
const ERP_API_KEY = process.env.INTEGRATION_API_KEYS?.split(',')[0];

// Validação das variáveis de ambiente
if (!VISIONCARE_KEY) {
  console.error('❌ VISIONCARE_SERVICE_KEY ou VISIONCARE_ANON_KEY não configurada no .env');
  process.exit(1);
}

if (!ERP_API_KEY) {
  console.error('❌ INTEGRATION_API_KEYS não configurada no .env');
  process.exit(1);
}

/**
 * Buscar todos os pacientes do VisionCare
 */
async function fetchAllPatients() {
  try {
    console.log('📥 Buscando pacientes do VisionCare...');
    
    const response = await axios.get(
      `${VISIONCARE_URL}/rest/v1/patients`,
      {
        headers: {
          'apikey': VISIONCARE_KEY,
          'Authorization': `Bearer ${VISIONCARE_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          select: '*',
          order: 'created_at.desc'
        }
      }
    );

    console.log(`✅ ${response.data.length} pacientes encontrados`);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar pacientes:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Sincronizar um paciente com o ERP
 */
async function syncPatient(patient) {
  try {
    const response = await axios.post(
      `${ERP_URL}/api/v1/clients/sync`,
      {
        type: 'INSERT',
        table: 'patients',
        record: patient
      },
      {
        headers: {
          'x-api-key': ERP_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      action: response.data.action,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Executar migração
 */
async function migrate() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔄 MIGRAÇÃO: VisionCare Patients → ERP Clients');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  try {
    // 1. Buscar todos os pacientes
    const patients = await fetchAllPatients();

    if (patients.length === 0) {
      console.log('ℹ️  Nenhum paciente encontrado para migrar');
      return;
    }

    // 2. Sincronizar cada paciente
    console.log('');
    console.log('📤 Sincronizando pacientes com o ERP...');
    console.log('');

    const results = {
      created: 0,
      updated: 0,
      errors: 0,
      errorDetails: []
    };

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const progress = `[${i + 1}/${patients.length}]`;

      process.stdout.write(`${progress} ${patient.name}...`);

      const result = await syncPatient(patient);

      if (result.success) {
        if (result.action === 'created') {
          results.created++;
          console.log(' ✅ criado');
        } else if (result.action === 'updated') {
          results.updated++;
          console.log(' ✅ atualizado');
        }
      } else {
        results.errors++;
        results.errorDetails.push({
          patient: patient.name,
          error: result.error
        });
        console.log(` ❌ erro: ${result.error}`);
      }

      // Pequeno delay para não sobrecarregar o servidor
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 3. Relatório final
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 RELATÓRIO DE MIGRAÇÃO');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log(`Total de pacientes processados: ${patients.length}`);
    console.log(`✅ Criados: ${results.created}`);
    console.log(`🔄 Atualizados: ${results.updated}`);
    console.log(`❌ Erros: ${results.errors}`);
    console.log('');

    if (results.errorDetails.length > 0) {
      console.log('═══════════════════════════════════════════════════════');
      console.log('❌ DETALHES DOS ERROS');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      results.errorDetails.forEach(({ patient, error }) => {
        console.log(`• ${patient}: ${error}`);
      });
      console.log('');
    }

    console.log('✅ Migração concluída!');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Erro durante a migração:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Executar migração
migrate();

