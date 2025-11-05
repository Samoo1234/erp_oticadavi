const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Vendedor responsável pela venda'
  },
  prescriptionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'prescriptions',
      key: 'id'
    }
  },
  saleNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Número da venda (ex: V2024001)'
  },
  saleDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled'),
    defaultValue: 'draft'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  discountPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'installments'),
    allowNull: true
  },
  installments: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 24
    }
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'partial', 'overdue', 'cancelled'),
    defaultValue: 'pending'
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveryAddress: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Endereço de entrega se diferente do cliente'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  internalNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas internas não visíveis ao cliente'
  },
  warrantyPeriod: {
    type: DataTypes.INTEGER,
    defaultValue: 12,
    comment: 'Período de garantia em meses'
  },
  warrantyExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de expiração da garantia'
  },
  isGift: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  giftMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'sales',
  indexes: [
    {
      fields: ['clientId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['saleNumber']
    },
    {
      fields: ['saleDate']
    },
    {
      fields: ['status']
    },
    {
      fields: ['paymentStatus']
    }
  ]
});

module.exports = Sale;
