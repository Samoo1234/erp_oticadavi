const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SaleItem = sequelize.define('SaleItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  saleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sales',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Preço unitário no momento da venda'
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Desconto aplicado neste item'
  },
  discountPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    comment: 'Percentual de desconto aplicado'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Subtotal do item (quantidade * preço - desconto)'
  },
  // Especificações para lentes
  lensSpecifications: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Especificações da lente: {type, material, treatment, etc}'
  },
  // Dados da prescrição aplicada a este item
  prescriptionData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dados da prescrição específicos para este item'
  },
  // Observações específicas do item
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Status de produção/entrega do item
  productionStatus: {
    type: DataTypes.ENUM('pending', 'in_production', 'ready', 'delivered'),
    defaultValue: 'pending'
  },
  // Data estimada de entrega
  estimatedDelivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Data real de entrega
  actualDelivery: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'sale_items',
  indexes: [
    {
      fields: ['saleId']
    },
    {
      fields: ['productId']
    },
    {
      fields: ['productionStatus']
    }
  ]
});

module.exports = SaleItem;
