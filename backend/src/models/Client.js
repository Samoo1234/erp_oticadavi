const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true,
    unique: true,
    validate: {
      is: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    }
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('M', 'F', 'O'),
    allowNull: true
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalPurchases: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  lastPurchase: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'clients',
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['phone']
    },
    {
      fields: ['cpf']
    }
  ]
});

module.exports = Client;
