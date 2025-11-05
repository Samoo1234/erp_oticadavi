const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inventory = sequelize.define('Inventory', {
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
  location: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Localização do estoque (loja, depósito, etc)'
  },
  currentStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  reservedStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Estoque reservado para vendas pendentes'
  },
  availableStock: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.currentStock - this.reservedStock;
    }
  },
  minStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Estoque mínimo para alertas'
  },
  maxStock: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estoque máximo recomendado'
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  lastCountDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data da última contagem física'
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Preço de custo atual'
  },
  averageCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Custo médio ponderado'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'inventory',
  indexes: [
    {
      fields: ['productId']
    },
    {
      fields: ['location']
    },
    {
      fields: ['currentStock']
    }
  ]
});

module.exports = Inventory;
