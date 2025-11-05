-- Migration para implementar TSO (Talão de Serviços Ópticos)
-- Adiciona novos campos e tabelas necessárias

-- 1. Criar tabela de Company
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

-- 2. Atualizar tabela de clientes
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address VARCHAR(200);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS state VARCHAR(2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_data JSONB DEFAULT '{}';

-- 3. Atualizar tabela de prescrições
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS right_eye_longe JSONB;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS right_eye_perto JSONB;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS left_eye_longe JSONB;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS left_eye_perto JSONB;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS addition DECIMAL(4,2);

-- 4. Atualizar tabela de vendas com campos TSO
ALTER TABLE sales ADD COLUMN IF NOT EXISTS tso_number VARCHAR(50);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS emission_date TIMESTAMP;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS delivery_time TIME;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS laboratory VARCHAR(100);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS exchange_date DATE;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS exchange_number VARCHAR(50);

-- 5. Atualizar tabela de sale_items
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS item_type VARCHAR(20) DEFAULT 'frame' CHECK (item_type IN ('frame', 'lens', 'accessory', 'service'));
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS frame_specifications JSONB;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS lens_diameter DECIMAL(4,2);
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS frame_client_reference VARCHAR(100);

-- Índices adicionais
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_clients_city ON clients(city);
CREATE INDEX IF NOT EXISTS idx_clients_state ON clients(state);
CREATE INDEX IF NOT EXISTS idx_sales_tso_number ON sales(tso_number);
CREATE INDEX IF NOT EXISTS idx_sales_emission_date ON sales(emission_date);
CREATE INDEX IF NOT EXISTS idx_sale_items_item_type ON sale_items(item_type);

-- Inserir dados padrão da Company
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
) ON CONFLICT DO NOTHING;

-- Comentários nas colunas
COMMENT ON COLUMN prescriptions.right_eye_longe IS 'Dados do olho direito para visão de longe';
COMMENT ON COLUMN prescriptions.right_eye_perto IS 'Dados do olho direito para visão de perto';
COMMENT ON COLUMN prescriptions.left_eye_longe IS 'Dados do olho esquerdo para visão de longe';
COMMENT ON COLUMN prescriptions.left_eye_perto IS 'Dados do olho esquerdo para visão de perto';
COMMENT ON COLUMN prescriptions.addition IS 'Adição para visão de perto';
COMMENT ON COLUMN sales.tso_number IS 'Número do TSO (Talão de Serviços Ópticos)';
COMMENT ON COLUMN sales.emission_date IS 'Data/Hora de emissão do TSO';
COMMENT ON COLUMN sales.delivery_time IS 'Hora de entrega prevista';
COMMENT ON COLUMN sales.laboratory IS 'Laboratório onde será fabricada a lente';
COMMENT ON COLUMN sales.exchange_date IS 'Data de troca (em caso de troca)';
COMMENT ON COLUMN sales.exchange_number IS 'Número da troca';
COMMENT ON COLUMN sale_items.item_type IS 'Tipo do item (frame, lens, accessory, service)';
COMMENT ON COLUMN sale_items.frame_specifications IS 'Especificações da armação';
COMMENT ON COLUMN sale_items.lens_diameter IS 'Diâmetro da lente em mm';
COMMENT ON COLUMN sale_items.frame_client_reference IS 'Referência da armação do cliente';










