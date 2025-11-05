const { Sale, SaleItem, Product, Client, User, Prescription, Inventory } = require('../models');
const { Op, fn, col, literal, Sequelize } = require('sequelize');

/**
 * @swagger
 * /api/v1/reports/dashboard:
 *   get:
 *     summary: Obter dados do dashboard
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter, year]
 *         description: Período do relatório
 *     responses:
 *       200:
 *         description: Dados do dashboard
 */
const getDashboardData = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calcular datas baseadas no período
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
    }

    // Vendas do período
    const salesData = await Sale.findAll({
      where: {
        saleDate: {
          [Op.between]: [startDate, endDate]
        },
        status: 'completed'
      },
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });

    // Calcular métricas de vendas
    const totalSales = salesData.length;
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.finalAmount, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Vendas por dia (últimos 30 dias)
    const dailySales = await Sale.findAll({
      attributes: [
        [fn('DATE', col('saleDate')), 'date'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('finalAmount')), 'revenue']
      ],
      where: {
        saleDate: {
          [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        },
        status: 'completed'
      },
      group: [fn('DATE', col('saleDate'))],
      order: [[fn('DATE', col('saleDate')), 'ASC']]
    });

    // Top produtos
    const topProducts = await SaleItem.findAll({
      attributes: [
        'productId',
        [fn('SUM', col('quantity')), 'totalQuantity'],
        [fn('SUM', col('totalPrice')), 'totalRevenue'],
        [fn('COUNT', col('id')), 'salesCount']
      ],
      where: {
        '$Sale.saleDate$': {
          [Op.between]: [startDate, endDate]
        },
        '$Sale.status$': 'completed'
      },
      include: [
        {
          model: Sale,
          as: 'sale',
          attributes: []
        },
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'sku', 'category']
        }
      ],
      group: ['productId'],
      order: [[fn('SUM', col('totalPrice')), 'DESC']],
      limit: 10
    });

    // Vendas por categoria
    const salesByCategory = await SaleItem.findAll({
      attributes: [
        [col('Product.category'), 'category'],
        [fn('SUM', col('quantity')), 'totalQuantity'],
        [fn('SUM', col('totalPrice')), 'totalRevenue']
      ],
      where: {
        '$Sale.saleDate$': {
          [Op.between]: [startDate, endDate]
        },
        '$Sale.status$': 'completed'
      },
      include: [
        {
          model: Sale,
          as: 'sale',
          attributes: []
        },
        {
          model: Product,
          as: 'product',
          attributes: ['category']
        }
      ],
      group: [col('Product.category')],
      order: [[fn('SUM', col('totalPrice')), 'DESC']]
    });

    // Clientes mais ativos
    const topClients = await Sale.findAll({
      attributes: [
        'clientId',
        [fn('COUNT', col('id')), 'totalSales'],
        [fn('SUM', col('finalAmount')), 'totalSpent']
      ],
      where: {
        saleDate: {
          [Op.between]: [startDate, endDate]
        },
        status: 'completed'
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['name', 'email']
        }
      ],
      group: ['clientId'],
      order: [[fn('SUM', col('finalAmount')), 'DESC']],
      limit: 10
    });

    // Métricas de estoque
    const inventoryStats = await Inventory.findAll({
      attributes: [
        [fn('COUNT', col('id')), 'totalProducts'],
        [fn('SUM', col('currentStock')), 'totalStock'],
        [fn('SUM', literal('currentStock * costPrice')), 'totalValue']
      ],
      where: {
        currentStock: {
          [Op.gt]: 0
        }
      }
    });

    // Produtos com estoque baixo
    const lowStockProducts = await Inventory.findAll({
      where: {
        currentStock: {
          [Op.lte]: col('minStock')
        }
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'sku', 'minStock']
        }
      ],
      limit: 10
    });

    // Prescrições ativas
    const activePrescriptions = await Prescription.count({
      where: {
        status: 'active',
        expirationDate: {
          [Op.gt]: new Date()
        }
      }
    });

    // Prescrições expiradas
    const expiredPrescriptions = await Prescription.count({
      where: {
        status: 'active',
        expirationDate: {
          [Op.lt]: new Date()
        }
      }
    });

    res.json({
      success: true,
      data: {
        period,
        sales: {
          total: totalSales,
          revenue: totalRevenue,
          averageTicket: averageTicket,
          dailySales
        },
        products: {
          topProducts,
          salesByCategory
        },
        clients: {
          topClients
        },
        inventory: {
          stats: inventoryStats[0] || { totalProducts: 0, totalStock: 0, totalValue: 0 },
          lowStockProducts
        },
        prescriptions: {
          active: activePrescriptions,
          expired: expiredPrescriptions
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/reports/sales:
 *   get:
 *     summary: Relatório de vendas
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf, excel]
 *     responses:
 *       200:
 *         description: Relatório de vendas
 */
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const where = {
      status: 'completed'
    };

    if (startDate && endDate) {
      where.saleDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const sales = await Sale.findAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['name', 'email', 'phone']
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        },
        {
          model: SaleItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'sku', 'category']
            }
          ]
        }
      ],
      order: [['saleDate', 'DESC']]
    });

    // Calcular totais
    const totals = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.finalAmount, 0),
      totalDiscount: sales.reduce((sum, sale) => sum + (sale.discountAmount || 0), 0),
      averageTicket: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.finalAmount, 0) / sales.length : 0
    };

    // Vendas por forma de pagamento
    const salesByPaymentMethod = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod;
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 };
      }
      acc[method].count++;
      acc[method].total += sale.finalAmount;
      return acc;
    }, {});

    // Vendas por vendedor
    const salesByUser = sales.reduce((acc, sale) => {
      const userId = sale.userId;
      const userName = sale.user?.name || 'Desconhecido';
      if (!acc[userId]) {
        acc[userId] = { name: userName, count: 0, total: 0 };
      }
      acc[userId].count++;
      acc[userId].total += sale.finalAmount;
      return acc;
    }, {});

    const reportData = {
      period: {
        startDate: startDate || 'Início',
        endDate: endDate || 'Atual'
      },
      totals,
      salesByPaymentMethod,
      salesByUser,
      sales: sales.map(sale => ({
        id: sale.id,
        clientName: sale.client?.name,
        clientEmail: sale.client?.email,
        saleDate: sale.saleDate,
        totalAmount: sale.totalAmount,
        discountAmount: sale.discountAmount,
        finalAmount: sale.finalAmount,
        paymentMethod: sale.paymentMethod,
        paymentStatus: sale.paymentStatus,
        sellerName: sale.user?.name,
        items: sale.items.map(item => ({
          productName: item.product?.name,
          productSku: item.product?.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      }))
    };

    if (format === 'pdf') {
      // Implementar geração de PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio-vendas.pdf"');
      // Aqui seria implementada a geração de PDF
      res.json({ message: 'PDF generation not implemented yet' });
    } else if (format === 'excel') {
      // Implementar geração de Excel
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio-vendas.xlsx"');
      // Aqui seria implementada a geração de Excel
      res.json({ message: 'Excel generation not implemented yet' });
    } else {
      res.json({
        success: true,
        data: reportData
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/reports/inventory:
 *   get:
 *     summary: Relatório de estoque
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório de estoque
 */
const getInventoryReport = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'sku', 'category', 'brand', 'price', 'costPrice']
        }
      ],
      order: [['currentStock', 'ASC']]
    });

    // Calcular totais
    const totals = {
      totalProducts: inventory.length,
      totalStock: inventory.reduce((sum, item) => sum + item.currentStock, 0),
      totalValue: inventory.reduce((sum, item) => sum + (item.currentStock * (item.costPrice || 0)), 0),
      lowStockCount: inventory.filter(item => item.currentStock <= item.minStock).length
    };

    // Estoque por categoria
    const inventoryByCategory = inventory.reduce((acc, item) => {
      const category = item.product?.category || 'Sem categoria';
      if (!acc[category]) {
        acc[category] = { count: 0, stock: 0, value: 0 };
      }
      acc[category].count++;
      acc[category].stock += item.currentStock;
      acc[category].value += item.currentStock * (item.costPrice || 0);
      return acc;
    }, {});

    // Produtos com estoque baixo
    const lowStockProducts = inventory
      .filter(item => item.currentStock <= item.minStock)
      .map(item => ({
        id: item.id,
        productName: item.product?.name,
        productSku: item.product?.sku,
        currentStock: item.currentStock,
        minStock: item.minStock,
        category: item.product?.category,
        location: item.location
      }));

    res.json({
      success: true,
      data: {
        totals,
        inventoryByCategory,
        lowStockProducts,
        inventory: inventory.map(item => ({
          id: item.id,
          productName: item.product?.name,
          productSku: item.product?.sku,
          category: item.product?.category,
          brand: item.product?.brand,
          currentStock: item.currentStock,
          minStock: item.minStock,
          maxStock: item.maxStock,
          costPrice: item.costPrice,
          totalValue: item.currentStock * (item.costPrice || 0),
          location: item.location,
          lastUpdated: item.lastUpdated
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/reports/clients:
 *   get:
 *     summary: Relatório de clientes
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório de clientes
 */
const getClientsReport = async (req, res) => {
  try {
    const clients = await Client.findAll({
      include: [
        {
          model: Sale,
          as: 'sales',
          where: { status: 'completed' },
          required: false,
          include: [
            {
              model: SaleItem,
              as: 'items',
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['name', 'category']
                }
              ]
            }
          ]
        },
        {
          model: Prescription,
          as: 'prescriptions',
          where: { status: 'active' },
          required: false
        }
      ]
    });

    // Calcular métricas por cliente
    const clientsWithMetrics = clients.map(client => {
      const totalSales = client.sales?.length || 0;
      const totalSpent = client.sales?.reduce((sum, sale) => sum + sale.finalAmount, 0) || 0;
      const averageTicket = totalSales > 0 ? totalSpent / totalSales : 0;
      const lastPurchase = client.sales?.length > 0 
        ? Math.max(...client.sales.map(sale => new Date(sale.saleDate).getTime()))
        : null;
      const activePrescriptions = client.prescriptions?.length || 0;

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        isActive: client.isActive,
        totalSales,
        totalSpent,
        averageTicket,
        lastPurchase: lastPurchase ? new Date(lastPurchase) : null,
        activePrescriptions,
        loyaltyPoints: client.loyaltyPoints || 0
      };
    });

    // Ordenar por total gasto
    clientsWithMetrics.sort((a, b) => b.totalSpent - a.totalSpent);

    // Calcular totais
    const totals = {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.isActive).length,
      totalRevenue: clientsWithMetrics.reduce((sum, client) => sum + client.totalSpent, 0),
      averageSpent: clientsWithMetrics.length > 0 
        ? clientsWithMetrics.reduce((sum, client) => sum + client.totalSpent, 0) / clientsWithMetrics.length 
        : 0
    };

    // Clientes por faixa de gasto
    const clientsBySpendingRange = {
      '0-100': clientsWithMetrics.filter(c => c.totalSpent >= 0 && c.totalSpent <= 100).length,
      '100-500': clientsWithMetrics.filter(c => c.totalSpent > 100 && c.totalSpent <= 500).length,
      '500-1000': clientsWithMetrics.filter(c => c.totalSpent > 500 && c.totalSpent <= 1000).length,
      '1000+': clientsWithMetrics.filter(c => c.totalSpent > 1000).length
    };

    res.json({
      success: true,
      data: {
        totals,
        clientsBySpendingRange,
        topClients: clientsWithMetrics.slice(0, 20),
        allClients: clientsWithMetrics
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardData,
  getSalesReport,
  getInventoryReport,
  getClientsReport
};
