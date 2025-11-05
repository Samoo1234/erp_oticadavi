-- Migração para módulo fiscal
-- Criar tabelas para notas fiscais, certificados digitais e configurações fiscais

-- Tabela de empresas (dados fiscais)
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    ie VARCHAR(20),
    address JSONB,
    fiscal_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notas fiscais
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number VARCHAR(20) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('nfe', 'nfce', 'nfse')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'authorized', 'rejected', 'cancelled')),
    client_id UUID REFERENCES clients(id),
    total_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
    authorization_date TIMESTAMP WITH TIME ZONE,
    authorization_code VARCHAR(50),
    access_key VARCHAR(50),
    xml_url TEXT,
    pdf_url TEXT,
    observations TEXT,
    additional_info JSONB,
    cancellation_reason TEXT,
    cancellation_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(number, type)
);

-- Tabela de itens das notas fiscais
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    ncm VARCHAR(10),
    cfop VARCHAR(10),
    icms_base DECIMAL(10,2),
    icms_rate DECIMAL(5,2),
    icms_value DECIMAL(10,2),
    ipi_rate DECIMAL(5,2),
    ipi_value DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de certificados digitais
CREATE TABLE IF NOT EXISTS certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('a1', 'a3')),
    serial_number VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    file_path TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações fiscais
CREATE TABLE IF NOT EXISTS fiscal_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    regime VARCHAR(20) NOT NULL CHECK (regime IN ('simples', 'presumido', 'real')),
    nfe_enabled BOOLEAN DEFAULT false,
    nfce_enabled BOOLEAN DEFAULT false,
    nfse_enabled BOOLEAN DEFAULT false,
    certificate_id UUID REFERENCES certificates(id),
    api_provider VARCHAR(50),
    api_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs fiscais
CREATE TABLE IF NOT EXISTS fiscal_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id),
    action VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    message TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(number);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(type);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_access_key ON invoices(access_key);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);

CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_expiry_date ON certificates(expiry_date);

CREATE INDEX IF NOT EXISTS idx_fiscal_logs_invoice_id ON fiscal_logs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_logs_created_at ON fiscal_logs(created_at);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fiscal_settings_updated_at BEFORE UPDATE ON fiscal_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO companies (name, cnpj, ie, address, fiscal_settings) VALUES (
    'Ótica Davi',
    '14.234.567/0001-89',
    '123456789',
    '{"street": "Rua Presidente Tancredo Neves", "number": "465", "neighborhood": "Centro", "city": "Mantena", "state": "MG", "zipCode": "35290-000"}',
    '{"regime": "simples", "nfeEnabled": true, "nfceEnabled": true, "nfseEnabled": false}'
) ON CONFLICT (cnpj) DO NOTHING;

-- Inserir configurações fiscais padrão
INSERT INTO fiscal_settings (company_id, regime, nfe_enabled, nfce_enabled, nfse_enabled) 
SELECT 
    c.id,
    'simples',
    true,
    true,
    false
FROM companies c 
WHERE c.cnpj = '14.234.567/0001-89'
ON CONFLICT DO NOTHING;

-- Comentários nas tabelas
COMMENT ON TABLE companies IS 'Dados fiscais da empresa';
COMMENT ON TABLE invoices IS 'Notas fiscais emitidas';
COMMENT ON TABLE invoice_items IS 'Itens das notas fiscais';
COMMENT ON TABLE certificates IS 'Certificados digitais';
COMMENT ON TABLE fiscal_settings IS 'Configurações fiscais da empresa';
COMMENT ON TABLE fiscal_logs IS 'Logs de operações fiscais';

-- Comentários nas colunas principais
COMMENT ON COLUMN invoices.number IS 'Número sequencial da nota fiscal';
COMMENT ON COLUMN invoices.type IS 'Tipo da nota: nfe, nfce, nfse';
COMMENT ON COLUMN invoices.status IS 'Status da nota: draft, sent, authorized, rejected, cancelled';
COMMENT ON COLUMN invoices.access_key IS 'Chave de acesso da nota fiscal';
COMMENT ON COLUMN certificates.type IS 'Tipo do certificado: a1, a3';
COMMENT ON COLUMN certificates.status IS 'Status do certificado: active, expired, revoked';
