const { supabase } = require('../config/supabase');

/**
 * @swagger
 * /api/v1/inventory:
 *   get:
 *     summary: Listar estoque
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtrar por localização
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Apenas produtos com estoque baixo
 *     responses:
 *       200:
 *         description: Lista de estoque
 */
const getInventory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      location,
      lowStock
    } = req.query;

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('inventory')
      .select(`
        *,
        product:products(name, sku, category, brand, min_stock)
      `, { count: 'exact' })
      .order('last_updated', { ascending: false })
      .range(from, to);

    if (location) {
      query = query.eq('location', location);
    }

    if (lowStock === 'true') {
      // Filtrar produtos com estoque atual menor ou igual ao mínimo
      query = query.lte('current_stock', 'min_stock');
    }

    const { data: inventory, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar inventário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar inventário',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: {
        inventory: inventory || [],
        pagination: {
          total: count || 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((count || 0) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar inventário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/inventory/product/{productId}:
 *   get:
 *     summary: Obter estoque por produto
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Estoque do produto
 */
const getInventoryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const { data: inventory, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(*)
      `)
      .eq('product_id', productId)
      .order('location', { ascending: true });

    if (error) {
      console.error('Erro ao buscar inventário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar inventário',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: inventory || []
    });
  } catch (error) {
    console.error('Erro ao buscar inventário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/inventory/movement:
 *   post:
 *     summary: Criar movimentação de estoque
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - movementType
 *               - quantity
 *               - location
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               movementType:
 *                 type: string
 *                 enum: [in, out, adjustment, transfer, return]
 *               quantity:
 *                 type: integer
 *               location:
 *                 type: string
 *               unitCost:
 *                 type: number
 *               reason:
 *                 type: string
 *               reference:
 *                 type: string
 *               referenceId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Movimentação criada com sucesso
 */
const createMovement = async (req, res) => {
  try {
    const {
      productId,
      movementType,
      quantity,
      location,
      unitCost,
      reason,
      reference,
      referenceId
    } = req.body;

    // Encontrar ou criar registro de estoque
    const { data: existingInventory } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .eq('location', location)
      .single();

    let inventory = existingInventory;

    if (!inventory) {
      const { data: newInventory, error: createError } = await supabase
        .from('inventory')
        .insert({
          product_id: productId,
          location,
          current_stock: 0,
          min_stock: 0
        })
        .select()
        .single();

      if (createError) {
        return res.status(500).json({
          success: false,
          message: 'Erro ao criar inventário',
          error: createError.message
        });
      }

      inventory = newInventory;
    }

    const previousStock = inventory.current_stock;
    let newStock = previousStock;

    // Calcular novo estoque baseado no tipo de movimentação
    switch (movementType) {
      case 'in':
      case 'return':
        newStock += quantity;
        break;
      case 'out':
        newStock = Math.max(0, newStock - quantity);
        break;
      case 'adjustment':
        newStock = quantity;
        break;
      case 'transfer':
        // Para transferência, primeiro reduzir do estoque atual
        newStock = Math.max(0, newStock - quantity);
        break;
    }

    // Atualizar estoque
    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        current_stock: newStock,
        last_updated: new Date().toISOString()
      })
      .eq('id', inventory.id);

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar estoque',
        error: updateError.message
      });
    }

    // Criar movimentação
    const { data: movement, error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: productId,
        inventory_id: inventory.id,
        movement_type: movementType,
        quantity: movementType === 'out' ? -quantity : quantity,
        previous_stock: previousStock,
        new_stock: newStock,
        unit_cost: unitCost,
        total_cost: unitCost ? unitCost * Math.abs(quantity) : null,
        reason,
        reference,
        reference_id: referenceId,
        user_id: req.user.id,
        movement_date: new Date().toISOString()
      })
      .select()
      .single();

    if (movementError) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar movimentação',
        error: movementError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Movimentação criada com sucesso',
      data: movement
    });
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/inventory/movements:
 *   get:
 *     summary: Listar movimentações de estoque
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: movementType
 *         schema:
 *           type: string
 *           enum: [in, out, adjustment, transfer, return]
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de movimentações
 */
const getMovements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      productId,
      movementType,
      dateFrom,
      dateTo
    } = req.query;

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('inventory_movements')
      .select(`
        *,
        product:products(name, sku),
        user:users(name, email)
      `, { count: 'exact' })
      .order('movement_date', { ascending: false })
      .range(from, to);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (movementType) {
      query = query.eq('movement_type', movementType);
    }

    if (dateFrom) {
      query = query.gte('movement_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('movement_date', dateTo);
    }

    const { data: movements, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar movimentações:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar movimentações',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: {
        movements: movements || [],
        pagination: {
          total: count || 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((count || 0) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/inventory/adjust:
 *   post:
 *     summary: Ajustar estoque
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - location
 *               - newQuantity
 *               - reason
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               location:
 *                 type: string
 *               newQuantity:
 *                 type: integer
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estoque ajustado com sucesso
 */
const adjustStock = async (req, res) => {
  try {
    const { productId, location, newQuantity, reason } = req.body;

    // Encontrar ou criar registro de estoque
    const { data: existingInventory } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .eq('location', location)
      .single();

    let inventory = existingInventory;

    if (!inventory) {
      const { data: newInventory, error: createError } = await supabase
        .from('inventory')
        .insert({
          product_id: productId,
          location,
          current_stock: 0,
          min_stock: 0
        })
        .select()
        .single();

      if (createError) {
        return res.status(500).json({
          success: false,
          message: 'Erro ao criar inventário',
          error: createError.message
        });
      }

      inventory = newInventory;
    }

    const previousStock = inventory.current_stock;
    const quantityDifference = newQuantity - previousStock;

    // Atualizar estoque
    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        current_stock: newQuantity,
        last_updated: new Date().toISOString()
      })
      .eq('id', inventory.id);

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar estoque',
        error: updateError.message
      });
    }

    // Criar movimentação de ajuste
    const { data: movement, error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: productId,
        inventory_id: inventory.id,
        movement_type: 'adjustment',
        quantity: quantityDifference,
        previous_stock: previousStock,
        new_stock: newQuantity,
        reason: `Ajuste de estoque: ${reason}`,
        user_id: req.user.id,
        movement_date: new Date().toISOString()
      })
      .select()
      .single();

    if (movementError) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar movimentação',
        error: movementError.message
      });
    }

    res.json({
      success: true,
      message: 'Estoque ajustado com sucesso',
      data: {
        movement,
        previousStock,
        newStock: newQuantity,
        difference: quantityDifference
      }
    });
  } catch (error) {
    console.error('Erro ao ajustar estoque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/inventory/stats:
 *   get:
 *     summary: Obter estatísticas de estoque
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas de estoque
 */
const getInventoryStats = async (req, res) => {
  try {
    // Total de produtos em estoque
    const { count: totalProducts } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .gt('current_stock', 0);

    // Produtos com estoque baixo (current_stock <= min_stock)
    const { data: lowStockItems } = await supabase
      .from('inventory')
      .select('current_stock, min_stock')
      .lte('current_stock', 'min_stock');

    const lowStockProducts = lowStockItems ? lowStockItems.length : 0;

    // Valor total do estoque (simplificado)
    const { data: inventoryItems } = await supabase
      .from('inventory')
      .select('current_stock, cost_price');

    const totalValue = inventoryItems
      ? inventoryItems.reduce((sum, item) => {
          const stock = item.current_stock || 0;
          const cost = item.cost_price || 0;
          return sum + (stock * cost);
        }, 0)
      : 0;

    // Movimentações do mês
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const { count: monthlyMovements } = await supabase
      .from('inventory_movements')
      .select('*', { count: 'exact', head: true })
      .gte('movement_date', currentMonth.toISOString());

    // Top produtos por movimentação (simplificado)
    const { data: topProducts } = await supabase
      .from('inventory_movements')
      .select(`
        product_id,
        product:products(name, sku)
      `)
      .gte('movement_date', currentMonth.toISOString())
      .limit(5);

    res.json({
      success: true,
      data: {
        totalProducts: totalProducts || 0,
        lowStockProducts,
        totalValue,
        monthlyMovements: monthlyMovements || 0,
        topProducts: topProducts || []
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  getInventory,
  getInventoryByProduct,
  createMovement,
  getMovements,
  adjustStock,
  getInventoryStats
};
