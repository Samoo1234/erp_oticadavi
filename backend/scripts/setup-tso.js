const { supabase } = require('../src/config/database');

/**
 * Script para configurar o banco de dados com suporte ao TSO
 * Executa migrations via Supabase
 */
async function setupTSO() {
  console.log('🚀 Iniciando configuração do TSO...\n');

  try {
    // 1. Criar tabela de Company
    console.log('1. Criando tabela companies...');
    const { error: createCompanyError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS companies (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(200) NOT NULL DEFAULT 'Ótica',
          document VARCHAR(20),
          email VARCHAR(100),
          phone VARCHAR(20),
          phone2 VARCHAR(20),
          address VARCHAR(200),
          neighborhood VARCHAR(100),
          city VARCHAR(100),
          state VARCHAR(2),
          zip_code VARCHAR(10),
          logo VARCHAR(500),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (createCompanyError) {
      console.log('⚠️  Tabela companies pode já existir ou erro:', createCompanyError.message);
    } else {
      console.log('✅ Tabela companies criada');
    }

    // 2. Inserir dados padrão da Company
    console.log('\n2. Inserindo dados padrão da empresa...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .single();

    if (!company) {
      const { error: insertError } = await supabase.from('companies').insert({
        name: 'Ótica Davi',
        phone: '(033) 3241-5700',
        address: 'RUA PRESIDENTE TANCREDO NEVES, 465',
        neighborhood: 'CENTRO',
        city: 'MANTENA',
        state: 'MG',
        zip_code: '35290-000',
        is_active: true
      });

      if (insertError) {
        console.log('⚠️  Erro ao inserir company:', insertError.message);
      } else {
        console.log('✅ Dados da empresa inseridos');
      }
    } else {
      console.log('✅ Empresa já existe');
    }

    // 3. Nota sobre alterações de tabela
    console.log('\n3. ⚠️  ALTER TABLE migrations...');
    console.log('   Execute manualmente no SQL Editor do Supabase:');
    console.log('   Arquivo: backend/database/migration_tso.sql\n');

    console.log('📋 Campos que precisam ser adicionados:\n');
    console.log('   - clients: address, neighborhood, city, state, zip_code');
    console.log('   - prescriptions: right_eye_longe, right_eye_perto, left_eye_longe, left_eye_perto, addition');
    console.log('   - sales: tso_number, emission_date, delivery_time, laboratory, exchange_date, exchange_number');
    console.log('   - sale_items: item_type, frame_specifications, lens_diameter, frame_client_reference');

    console.log('\n✅ Configuração do TSO concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Acesse o Supabase Dashboard');
    console.log('   2. Vá em SQL Editor');
    console.log('   3. Copie e cole o conteúdo de backend/database/migration_tso.sql');
    console.log('   4. Execute o script');

  } catch (error) {
    console.error('❌ Erro ao configurar TSO:', error.message);
  }
}

// Executar
setupTSO()
  .then(() => {
    console.log('\n✨ Setup concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });










