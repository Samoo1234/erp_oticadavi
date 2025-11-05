# Setup do TSO no Supabase

## Instruções para Implementar o TSO

### Método 1: SQL Editor do Supabase (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Copie o conteúdo completo do arquivo `backend/database/migration_tso.sql`
6. Cole no editor e clique em **Run**

### Método 2: Via Script Node.js

```bash
cd backend
node scripts/setup-tso.js
```

### Método 3: Via Supabase CLI (se tiver instalado)

```bash
supabase db push
```

## Verificação

Após executar a migration, verifique se as tabelas foram criadas:

```sql
-- Verificar tabela companies
SELECT * FROM companies;

-- Verificar colunas novas em prescriptions
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'prescriptions';

-- Verificar colunas novas em sales
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'sales';
```

## Campos Adicionados

### Tabela `companies` (Nova)
- Dados da ótica (nome, endereço, telefones)

### Tabela `prescriptions`
- `right_eye_longe` - OD para visão de longe
- `right_eye_perto` - OD para visão de perto
- `left_eye_longe` - OE para visão de longe
- `left_eye_perto` - OE para visão de perto
- `addition` - Adição para perto

### Tabela `sales`
- `tso_number` - Número do TSO
- `emission_date` - Data de emissão
- `delivery_time` - Hora de entrega
- `laboratory` - Laboratório escolhido
- `exchange_date` - Data de troca
- `exchange_number` - Número da troca

### Tabela `sale_items`
- `item_type` - Tipo (frame/lens/accessory/service)
- `frame_specifications` - Especificações da armação
- `lens_diameter` - Diâmetro da lente
- `frame_client_reference` - Referência da armação do cliente

### Tabela `clients`
- `address` - Endereço (rua, número)
- `neighborhood` - Bairro
- `city` - Cidade
- `state` - Estado (UF)
- `zip_code` - CEP

## Inserir Dados da Empresa

Após criar a tabela, insira os dados da sua empresa:

```sql
INSERT INTO companies (name, phone, address, neighborhood, city, state, zip_code, is_active)
VALUES (
  'Ótica Davi',
  '(033) 3241-5700',
  'RUA PRESIDENTE TANCREDO NEVES, 465',
  'CENTRO',
  'MANTENA',
  'MG',
  '35290-000',
  true
);
```

## Próximos Passos

1. Execute a migration no Supabase
2. Inicie o backend: `npm run dev:backend`
3. Inicie o frontend: `npm run dev:frontend`
4. Acesse a página TSO em: `http://localhost:3000/tso`

## Estrutura do TSO

O TSO (Talão de Serviços Ópticos) inclui:

- **Informações da Ótica**: Nome, endereço, telefones
- **Dados do Cliente**: Nome completo, CPF, endereço completo
- **Prescrição**: Dados de longe e perto para OD e OE
- **Armação**: Tipo, cor, valor
- **Lentes**: Tipo, material, tratamento
- **Datas**: Emissão, entrega, troca
- **Valores**: Total, entrada, saldo
- **Laboratório**: Onde será fabricada a lente
- **Vendedor**: Quem atendeu o cliente










