-- Schema completo para migração Supabase
-- Execute este script no SQL Editor do Supabase

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'seller',
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  birth_date DATE,
  gender VARCHAR(1),
  address JSONB,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  loyalty_points INTEGER DEFAULT 0,
  total_purchases DECIMAL(10, 2) DEFAULT 0.00,
  last_purchase TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  color VARCHAR(50),
  material VARCHAR(100),
  gender VARCHAR(1),
  price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2),
  profit_margin DECIMAL(5, 2),
  weight DECIMAL(8, 3),
  dimensions JSONB,
  specifications JSONB,
  images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_prescription_required BOOLEAN DEFAULT false,
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER,
  supplier_id UUID,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de prescrições
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  prescription_date DATE NOT NULL,
  doctor_name VARCHAR(100),
  doctor_crm VARCHAR(20),
  right_eye JSONB,
  left_eye JSONB,
  pd DECIMAL(4, 2),
  additional_info TEXT,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  user_id UUID NOT NULL REFERENCES users(id),
  prescription_id UUID REFERENCES prescriptions(id),
  sale_number VARCHAR(20),
  sale_date TIMESTAMP NOT NULL DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'draft',
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(20),
  installments INTEGER DEFAULT 1,
  payment_status VARCHAR(20) DEFAULT 'pending',
  delivery_date DATE,
  delivery_address JSONB,
  notes TEXT,
  internal_notes TEXT,
  warranty_period INTEGER DEFAULT 12,
  warranty_expiry DATE,
  is_gift BOOLEAN DEFAULT false,
  gift_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de itens de venda
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
  subtotal DECIMAL(10, 2) NOT NULL,
  lens_specifications JSONB,
  prescription_data JSONB,
  notes TEXT,
  production_status VARCHAR(20) DEFAULT 'pending',
  estimated_delivery DATE,
  actual_delivery DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de inventário
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  location VARCHAR(100) NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER,
  last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
  last_count_date DATE,
  cost_price DECIMAL(10, 2),
  average_cost DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, location)
);

-- Tabela de movimentações de inventário
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  inventory_id UUID NOT NULL REFERENCES inventory(id),
  movement_type VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  unit_cost DECIMAL(10, 2),
  total_cost DECIMAL(10, 2),
  reason VARCHAR(200),
  reference VARCHAR(100),
  reference_id UUID,
  user_id UUID REFERENCES users(id),
  notes TEXT,
  movement_date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_movement_date ON inventory_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_cpf ON clients(cpf);

-- Desabilitar RLS temporariamente para testes (ATENÇÃO: reativar em produção)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements DISABLE ROW LEVEL SECURITY;

-- Criar um usuário de teste (senha: 123456)
INSERT INTO users (name, email, password, role) 
VALUES ('Admin', 'admin@oticadavi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.Hvzm8u', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Criar produtos de exemplo
INSERT INTO products (name, sku, category, price, cost_price, min_stock, is_active)
VALUES 
  ('Armação Acetato Preta', 'ARM-001', 'oculos_grau', 150.00, 80.00, 5, true),
  ('Lente CR39', 'LENT-001', 'lentes', 120.00, 60.00, 10, true)
ON CONFLICT (sku) DO NOTHING;

-- Criar inventário inicial para os produtos
INSERT INTO inventory (product_id, location, current_stock, min_stock)
SELECT id, 'Loja Principal', 10, 5
FROM products
WHERE sku IN ('ARM-001', 'LENT-001')
ON CONFLICT (product_id, location) DO NOTHING;

COMMIT;

