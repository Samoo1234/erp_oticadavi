-- ============================================
-- POLÍTICAS DE SEGURANÇA RLS (Row Level Security)
-- ERP Ótica Davi
-- ============================================
-- IMPORTANTE: Execute este script APÓS a migração inicial
-- Estas políticas garantem segurança em nível de linha no banco de dados
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABELA: users
-- ============================================

-- Política: Usuários autenticados podem ver todos os usuários
CREATE POLICY "Users: Select for authenticated" ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Apenas admins podem inserir usuários
CREATE POLICY "Users: Insert for admins" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Política: Admins podem atualizar qualquer usuário, outros apenas a si mesmos
CREATE POLICY "Users: Update for admins or self" ON users
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Política: Apenas admins podem deletar usuários
CREATE POLICY "Users: Delete for admins" ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- TABELA: products
-- ============================================

-- Política: Todos os usuários autenticados podem ver produtos
CREATE POLICY "Products: Select for authenticated" ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Admins e managers podem inserir produtos
CREATE POLICY "Products: Insert for admins and managers" ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Política: Admins e managers podem atualizar produtos
CREATE POLICY "Products: Update for admins and managers" ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Política: Apenas admins podem deletar produtos
CREATE POLICY "Products: Delete for admins" ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- TABELA: prescriptions
-- ============================================

-- Política: Todos os usuários autenticados podem ver prescrições
CREATE POLICY "Prescriptions: Select for authenticated" ON prescriptions
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Todos os usuários autenticados podem criar prescrições
CREATE POLICY "Prescriptions: Insert for authenticated" ON prescriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Admins, managers e opticians podem atualizar prescrições
CREATE POLICY "Prescriptions: Update for authorized" ON prescriptions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager', 'optician')
    )
  );

-- Política: Apenas admins podem deletar prescrições
CREATE POLICY "Prescriptions: Delete for admins" ON prescriptions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- TABELA: sales
-- ============================================

-- Política: Todos os usuários autenticados podem ver vendas
CREATE POLICY "Sales: Select for authenticated" ON sales
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Todos os usuários autenticados podem criar vendas
CREATE POLICY "Sales: Insert for authenticated" ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Usuário pode atualizar suas próprias vendas ou admins/managers qualquer venda
CREATE POLICY "Sales: Update for owner or admins" ON sales
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Política: Apenas admins podem deletar vendas
CREATE POLICY "Sales: Delete for admins" ON sales
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- TABELA: sale_items
-- ============================================

-- Política: Todos os usuários autenticados podem ver itens de venda
CREATE POLICY "SaleItems: Select for authenticated" ON sale_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Todos os usuários autenticados podem criar itens de venda
CREATE POLICY "SaleItems: Insert for authenticated" ON sale_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Usuário pode atualizar itens de suas próprias vendas ou admins qualquer item
CREATE POLICY "SaleItems: Update for owner or admins" ON sale_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND (
        sales.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'manager')
        )
      )
    )
  );

-- Política: Apenas admins podem deletar itens de venda
CREATE POLICY "SaleItems: Delete for admins" ON sale_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- TABELA: inventory
-- ============================================

-- Política: Todos os usuários autenticados podem ver inventário
CREATE POLICY "Inventory: Select for authenticated" ON inventory
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Admins e managers podem inserir inventário
CREATE POLICY "Inventory: Insert for admins and managers" ON inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Política: Admins e managers podem atualizar inventário
CREATE POLICY "Inventory: Update for admins and managers" ON inventory
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Política: Apenas admins podem deletar inventário
CREATE POLICY "Inventory: Delete for admins" ON inventory
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- TABELA: inventory_movements
-- ============================================

-- Política: Todos os usuários autenticados podem ver movimentações
CREATE POLICY "InventoryMovements: Select for authenticated" ON inventory_movements
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Usuários autenticados podem criar movimentações
CREATE POLICY "InventoryMovements: Insert for authenticated" ON inventory_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Movimentações não podem ser atualizadas (imutáveis)
-- Nenhuma política de UPDATE - movimentações são logs imutáveis

-- Política: Apenas admins podem deletar movimentações (para correções)
CREATE POLICY "InventoryMovements: Delete for admins" ON inventory_movements
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- TABELA: clients (se existir no banco local)
-- ============================================
-- NOTA: Clientes são gerenciados no banco CENTRAL
-- Se houver uma tabela local de clientes, aplique estas políticas:

-- CREATE POLICY "Clients: Select for authenticated" ON clients
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Clients: Insert for authenticated" ON clients
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

-- CREATE POLICY "Clients: Update for authenticated" ON clients
--   FOR UPDATE
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Clients: Delete for admins" ON clients
--   FOR DELETE
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE id = auth.uid() 
--       AND role = 'admin'
--     )
--   );

-- ============================================
-- FUNÇÃO AUXILIAR: Verificar role do usuário
-- ============================================

CREATE OR REPLACE FUNCTION check_user_role(required_roles text[])
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT para service_role (backend)
-- ============================================
-- O backend usa service_role que bypassa RLS
-- Isso permite que a API faça operações administrativas

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON POLICY "Users: Select for authenticated" ON users IS 
  'Permite que usuários autenticados vejam todos os usuários';

COMMENT ON POLICY "Products: Select for authenticated" ON products IS 
  'Permite que usuários autenticados vejam todos os produtos';

COMMENT ON POLICY "Sales: Select for authenticated" ON sales IS 
  'Permite que usuários autenticados vejam todas as vendas';

-- ============================================
-- FIM DO SCRIPT DE POLÍTICAS RLS
-- ============================================
