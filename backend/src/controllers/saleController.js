const { supabase } = require('../config/supabase');
const { convertKeysToCamel } = require('../utils/caseConverter');

/**
 * @swagger
 * components:
 *   schemas:
 *     Sale:
 *       type: object
 *       required:
 *         - clientId
 *         - items
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         clientId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         saleDate:
 *           type: string
 *           format: date-time
 *         totalAmount:
 *           type: number
 *         discountAmount:
 *           type: number
 *         taxAmount:
 *           type: number
 *         finalAmount:
 *           type: number
 *         paymentMethod:
 *           type: string
 *           enum: [cash, credit_card, debit_card, pix, bank_transfer, check]
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, partial, cancelled]
 *         status:
 *           type: string
 *           enum: [draft, confirmed, processing, completed, cancelled]
 *         notes:
 *           type: string
 *         prescriptionId:
 *           type: string
 *           format: uuid
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *               unitPrice:
 *                 type: number
 *               totalPrice:
 *                 type: number
 *               discount:
 *                 type: number
 *               prescriptionData:
 *                 type: object
 */

/**
 * @swagger
 * /api/v1/sales:
 *   get:
 *     summary: Listar vendas
 *     tags: [Vendas]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, confirmed, processing, completed, cancelled]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, partial, cancelled]
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
 *         description: Lista de vendas
 */
const getSales = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      paymentMethod,
      dateFrom,
      dateTo,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('sales')
      .select(`
        *,
        client:clients(id, name, email, phone),
        user:users(id, name, email),
        items:sale_items(
          *,
          product:products(id, name, sku, category)
        )
      `, { count: 'exact' })
      .order('sale_date', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    if (paymentMethod) {
      query = query.eq('payment_method', paymentMethod);
    }

    if (dateFrom) {
      query = query.gte('sale_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('sale_date', dateTo);
    }

    if (search) {
      // Buscar por ID da venda ou nome do cliente via join
      query = query.or(`id.ilike.%${search}%,client.name.ilike.%${search}%`);
    }

    const { data: sales, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar vendas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar vendas',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: {
        sales: convertKeysToCamel(sales || []),
        pagination: {
          total: count || 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/sales/{id}:
 *   get:
 *     summary: Obter venda por ID
 *     tags: [Vendas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dados da venda
 *       404:
 *         description: Venda não encontrada
 */
const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: sale, error } = await supabase
      .from('sales')
      .select(`
        *,
        client:clients(*),
        user:users(id, name, email),
        items:sale_items(
          *,
          product:products(*)
        ),
        prescription:prescriptions(*)
      `)
      .eq('id', id)
      .single();

    if (error || !sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    res.json({
      success: true,
      data: convertKeysToCamel(sale)
    });
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/sales:
 *   post:
 *     summary: Criar nova venda
 *     tags: [Vendas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sale'
 *     responses:
 *       201:
 *         description: Venda criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
const createSale = async (req, res) => {
  try {
    const {
      clientId,
      items,
      discountAmount = 0,
      taxAmount = 0,
      paymentMethod = 'cash',
      notes,
      prescriptionId
    } = req.body;

    // Validar se cliente existe
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return res.status(400).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Calcular totais e validar produtos
    let totalAmount = 0;
    const saleItems = [];

    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, price')
        .eq('id', item.productId)
        .single();

      if (productError || !product) {
        return res.status(400).json({
          success: false,
          message: `Produto ${item.productId} não encontrado`
        });
      }

      const unitPrice = item.unitPrice || product.price;
      const itemTotal = unitPrice * item.quantity;
      const itemDiscount = item.discount || 0;
      const finalItemTotal = itemTotal - itemDiscount;

      totalAmount += finalItemTotal;

      saleItems.push({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: unitPrice,
        discount_amount: itemDiscount,
        discount_percentage: itemDiscount > 0 ? (itemDiscount / itemTotal * 100) : 0,
        subtotal: finalItemTotal,
        prescription_data: item.prescriptionData || null,
        notes: item.notes || null
      });
    }

    const finalAmount = totalAmount - discountAmount + taxAmount;

    // Gerar número da venda (formato: V + timestamp + random)
    const saleNumber = `V${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Criar venda
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        client_id: clientId,
        user_id: req.user.id,
        sale_number: saleNumber,
        sale_date: new Date().toISOString(),
        subtotal: totalAmount,
        discount_amount: discountAmount,
        discount_percentage: discountAmount > 0 ? (discountAmount / totalAmount * 100) : 0,
        tax_amount: taxAmount,
        total: finalAmount,
        payment_method: paymentMethod,
        payment_status: 'pending',
        status: 'draft',
        notes,
        prescription_id: prescriptionId || null
      })
      .select()
      .single();

    if (saleError) {
      console.error('Erro ao criar venda:', saleError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar venda',
        error: saleError.message
      });
    }

    // Criar itens da venda
    const itemsWithSaleId = saleItems.map(item => ({
      ...item,
      sale_id: sale.id
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(itemsWithSaleId);

    if (itemsError) {
      console.error('Erro ao criar itens da venda:', itemsError);
      // Reverter criação da venda
      await supabase.from('sales').delete().eq('id', sale.id);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar itens da venda',
        error: itemsError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Venda criada com sucesso',
      data: convertKeysToCamel(sale)
    });
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/sales/{id}:
 *   put:
 *     summary: Atualizar venda
 *     tags: [Vendas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sale'
 *     responses:
 *       200:
 *         description: Venda atualizada com sucesso
 *       404:
 *         description: Venda não encontrada
 */
const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientId,
      items,
      discountAmount = 0,
      taxAmount = 0,
      paymentMethod,
      notes
    } = req.body;

    // Verificar se venda existe
    const { data: sale, error: findError } = await supabase
      .from('sales')
      .select('status')
      .eq('id', id)
      .single();

    if (findError || !sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    // Verificar se venda pode ser editada
    if (sale.status === 'completed' || sale.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Venda não pode ser editada neste status'
      });
    }

    // Se items foi fornecido, recalcular totais
    let totalAmount = 0;
    const saleItems = [];

    if (items && items.length > 0) {
      for (const item of items) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, price')
          .eq('id', item.productId)
          .single();

        if (productError || !product) {
          return res.status(400).json({
            success: false,
            message: `Produto ${item.productId} não encontrado`
          });
        }

        const unitPrice = item.unitPrice || product.price;
        const itemTotal = unitPrice * item.quantity;
        const itemDiscount = item.discount || 0;
        const finalItemTotal = itemTotal - itemDiscount;

        totalAmount += finalItemTotal;

        saleItems.push({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: unitPrice,
          discount_amount: itemDiscount,
          discount_percentage: itemDiscount > 0 ? (itemDiscount / itemTotal * 100) : 0,
          subtotal: finalItemTotal,
          prescription_data: item.prescriptionData || null,
          notes: item.notes || null
        });
      }

      const finalAmount = totalAmount - discountAmount + taxAmount;

      // Atualizar venda
      const { data: updatedSale, error: updateError } = await supabase
        .from('sales')
        .update({
          client_id: clientId,
          subtotal: totalAmount,
          discount_amount: discountAmount,
          discount_percentage: discountAmount > 0 ? (discountAmount / totalAmount * 100) : 0,
          tax_amount: taxAmount,
          total: finalAmount,
          payment_method: paymentMethod,
          notes
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({
          success: false,
          message: 'Erro ao atualizar venda',
          error: updateError.message
        });
      }

      // Deletar itens antigos
      await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', id);

      // Inserir novos itens
      const itemsWithSaleId = saleItems.map(item => ({
        ...item,
        sale_id: id
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(itemsWithSaleId);

      if (itemsError) {
        console.error('Erro ao atualizar itens da venda:', itemsError);
        return res.status(500).json({
          success: false,
          message: 'Erro ao atualizar itens da venda',
          error: itemsError.message
        });
      }

      res.json({
        success: true,
        message: 'Venda atualizada com sucesso',
        data: convertKeysToCamel(updatedSale)
      });
    } else {
      // Apenas atualizar campos simples da venda
      const { data: updatedSale, error: updateError } = await supabase
        .from('sales')
        .update({
          payment_method: paymentMethod,
          notes
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({
          success: false,
          message: 'Erro ao atualizar venda',
          error: updateError.message
        });
      }

      res.json({
        success: true,
        message: 'Venda atualizada com sucesso',
        data: convertKeysToCamel(updatedSale)
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/sales/{id}/confirm:
 *   post:
 *     summary: Confirmar venda
 *     tags: [Vendas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Venda confirmada com sucesso
 */
const confirmSale = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar venda com itens
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select(`
        *,
        items:sale_items(
          *,
          product:products(id, name)
        )
      `)
      .eq('id', id)
      .single();

    if (saleError || !sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    if (sale.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Apenas vendas em rascunho podem ser confirmadas'
      });
    }

    // Verificar estoque para cada item
    for (const item of sale.items) {
      const { data: inventory, error: invError } = await supabase
        .from('inventory')
        .select('id, current_stock')
        .eq('product_id', item.product_id)
        .single();

      if (invError || !inventory || inventory.current_stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Estoque insuficiente para o produto ${item.product?.name || item.product_id}`
        });
      }
    }

    // Atualizar estoque e criar movimentações
    for (const item of sale.items) {
      // Buscar inventário atual
      const { data: inventory } = await supabase
        .from('inventory')
        .select('*')
        .eq('product_id', item.product_id)
        .single();

      const newStock = inventory.current_stock - item.quantity;

      // Atualizar estoque
      await supabase
        .from('inventory')
        .update({
          current_stock: newStock,
          last_updated: new Date().toISOString()
        })
        .eq('id', inventory.id);

      // Registrar movimentação
      await supabase
        .from('inventory_movements')
        .insert({
          product_id: item.product_id,
          inventory_id: inventory.id,
          movement_type: 'out',
          quantity: -item.quantity,
          previous_stock: inventory.current_stock,
          new_stock: newStock,
          reason: `Venda #${sale.id}`,
          reference: 'sale',
          reference_id: sale.id,
          user_id: req.user.id,
          movement_date: new Date().toISOString()
        });
    }

    // Confirmar venda
    const { data: updatedSale, error: updateError } = await supabase
      .from('sales')
      .update({
        status: 'confirmed',
        payment_status: 'paid'
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao confirmar venda',
        error: updateError.message
      });
    }

    res.json({
      success: true,
      message: 'Venda confirmada com sucesso',
      data: convertKeysToCamel(updatedSale)
    });
  } catch (error) {
    console.error('Erro ao confirmar venda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/sales/{id}:
 *   delete:
 *     summary: Cancelar venda
 *     tags: [Vendas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Venda cancelada com sucesso
 */
const cancelSale = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: sale, error: findError } = await supabase
      .from('sales')
      .select('status')
      .eq('id', id)
      .single();

    if (findError || !sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    if (sale.status === 'completed' || sale.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Venda não pode ser cancelada neste status'
      });
    }

    const { error: updateError } = await supabase
      .from('sales')
      .update({
        status: 'cancelled',
        payment_status: 'cancelled'
      })
      .eq('id', id);

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao cancelar venda',
        error: updateError.message
      });
    }

    res.json({
      success: true,
      message: 'Venda cancelada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar venda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/sales/stats:
 *   get:
 *     summary: Obter estatísticas de vendas
 *     tags: [Vendas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas de vendas
 */
const getSalesStats = async (req, res) => {
  try {
    // Vendas do mês atual
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const { data: completedSales } = await supabase
      .from('sales')
      .select('total')
      .eq('status', 'completed')
      .gte('sale_date', currentMonth.toISOString());

    const monthlySales = completedSales?.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0) || 0;

    // Total de vendas
    const { count: totalSales } = await supabase
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Vendas pendentes
    const { count: pendingSales } = await supabase
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft');

    // Ticket médio
    const averageTicket = completedSales && completedSales.length > 0
      ? monthlySales / completedSales.length
      : 0;

    // Top produtos (simplificado)
    const { data: topProducts } = await supabase
      .from('sale_items')
      .select(`
        product_id,
        quantity,
        subtotal,
        product:products(name, sku)
      `)
      .limit(5);

    res.json({
      success: true,
      data: convertKeysToCamel({
        monthlySales,
        totalSales: totalSales || 0,
        pendingSales: pendingSales || 0,
        averageTicket,
        topProducts: topProducts || []
      })
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
  getSales,
  getSaleById,
  createSale,
  updateSale,
  confirmSale,
  cancelSale,
  getSalesStats
};
