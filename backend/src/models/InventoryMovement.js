const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InventoryMovement = sequelize.define('InventoryMovement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  inventoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'inventory',
      key: 'id'
    }
  },
  movementType: {
    type: DataTypes.ENUM('in', 'out', 'adjustment', 'transfer', 'return'),
    allowNull: false,
    comment: 'Tipo de movimento: entrada, saída, ajuste, transferência, devolução'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Quantidade movimentada (positiva para entrada, negativa para saída)'
  },
  previousStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Estoque anterior ao movimento'
  },
  newStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Estoque após o movimento'
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Custo unitário do produto no movimento'
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Custo total do movimento'
  },
  reason: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Motivo do movimento'
  },
  reference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Referência externa (nota fiscal, transferência, etc)'
  },
  referenceId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID da referência (venda, compra, etc)'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que realizou o movimento'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  movementDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'inventory_movements',
  indexes: [
    {
      fields: ['productId']
    },
    {
      fields: ['inventoryId']
    },
    {
      fields: ['movementType']
    },
    {
      fields: ['movementDate']
    },
    {
      fields: ['referenceId']
    }
  ]
});

module.exports = InventoryMovement;
