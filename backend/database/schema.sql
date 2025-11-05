-- Schema do banco de dados para ERP Ótica Davi
-- PostgreSQL

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'seller' CHECK (role IN ('admin', 'manager', 'seller', 'optician')),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    birth_date DATE,
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'O')),
    address JSONB,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    loyalty_points INTEGER DEFAULT 0,
    total_purchases DECIMAL(10,2) DEFAULT 0.00,
    last_purchase TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('oculos_grau', 'oculos_sol', 'lentes', 'acessorios', 'servicos')),
    subcategory VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    color VARCHAR(50),
    material VARCHAR(100),
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'U', 'C')),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
    profit_margin DECIMAL(5,2),
    weight DECIMAL(8,3),
    dimensions JSONB,
    specifications JSONB,
    images JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    is_prescription_required BOOLEAN DEFAULT false,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER,
    supplier_id UUID,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de prescrições
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    doctor_name VARCHAR(100) NOT NULL,
    doctor_crm VARCHAR(20),
    doctor_phone VARCHAR(20),
    prescription_date DATE NOT NULL,
    expiration_date DATE,
    right_eye JSONB NOT NULL,
    left_eye JSONB NOT NULL,
    pupillary_distance DECIMAL(4,1),
    lens_type VARCHAR(20) CHECK (lens_type IN ('monofocal', 'bifocal', 'progressiva', 'multifocal')),
    treatments JSONB DEFAULT '[]',
    medical_notes TEXT,
    optician_notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
    prescription_file VARCHAR(500),
    used_date TIMESTAMP,
    sale_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de vendas
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    user_id UUID NOT NULL REFERENCES users(id),
    prescription_id UUID REFERENCES prescriptions(id),
    sale_number VARCHAR(20) UNIQUE NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'installments')),
    installments INTEGER DEFAULT 1 CHECK (installments >= 1 AND installments <= 24),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'overdue', 'cancelled')),
    delivery_date TIMESTAMP,
    delivery_address JSONB,
    notes TEXT,
    internal_notes TEXT,
    warranty_period INTEGER DEFAULT 12,
    warranty_expiry TIMESTAMP,
    is_gift BOOLEAN DEFAULT false,
    gift_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens da venda
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL,
    lens_specifications JSONB,
    prescription_data JSONB,
    notes TEXT,
    production_status VARCHAR(20) DEFAULT 'pending' CHECK (production_status IN ('pending', 'in_production', 'ready', 'delivered')),
    estimated_delivery TIMESTAMP,
    actual_delivery TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de estoque
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id),
    location VARCHAR(100) NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    reserved_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_count_date TIMESTAMP,
    cost_price DECIMAL(10,2),
    average_cost DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de movimentações de estoque
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id),
    inventory_id UUID NOT NULL REFERENCES inventory(id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer', 'return')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reason VARCHAR(200),
    reference VARCHAR(100),
    reference_id UUID,
    user_id UUID REFERENCES users(id),
    notes TEXT,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_cpf ON clients(cpf);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_prescriptions_client_id ON prescriptions(client_id);
CREATE INDEX idx_prescriptions_prescription_date ON prescriptions(prescription_date);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_sales_client_id ON sales(client_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_sale_number ON sales(sale_number);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_payment_status ON sales(payment_status);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location);
CREATE INDEX idx_inventory_current_stock ON inventory(current_stock);
CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_inventory_id ON inventory_movements(inventory_id);
CREATE INDEX idx_inventory_movements_movement_type ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_movement_date ON inventory_movements(movement_date);
CREATE INDEX idx_inventory_movements_reference_id ON inventory_movements(reference_id);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sale_items_updated_at BEFORE UPDATE ON sale_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dados iniciais
INSERT INTO users (name, email, password, role, phone) VALUES
('Administrador', 'admin@oticadavi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', 'admin', '(11) 99999-9999'),
('Gerente', 'gerente@oticadavi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', 'manager', '(11) 88888-8888'),
('Vendedor', 'vendedor@oticadavi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', 'seller', '(11) 77777-7777');

-- Comentários nas tabelas
COMMENT ON TABLE users IS 'Usuários do sistema com diferentes níveis de acesso';
COMMENT ON TABLE clients IS 'Clientes da ótica com histórico de compras';
COMMENT ON TABLE products IS 'Catálogo de produtos (óculos, lentes, acessórios)';
COMMENT ON TABLE prescriptions IS 'Prescrições médicas dos clientes';
COMMENT ON TABLE sales IS 'Vendas realizadas';
COMMENT ON TABLE sale_items IS 'Itens individuais de cada venda';
COMMENT ON TABLE inventory IS 'Controle de estoque por localização';
COMMENT ON TABLE inventory_movements IS 'Histórico de movimentações de estoque';
