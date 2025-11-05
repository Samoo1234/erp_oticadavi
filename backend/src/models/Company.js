const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: 'Ótica'
  },
  document: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'CNPJ da empresa'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone principal'
  },
  phone2: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone secundário'
  },
  address: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  neighborhood: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Bairro'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(2),
    allowNull: true,
    comment: 'Estado (UF)'
  },
  zipCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'CEP'
  },
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL ou caminho do logo'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'companies',
  timestamps: true
});

module.exports = Company;










