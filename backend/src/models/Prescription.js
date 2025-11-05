const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Prescription = sequelize.define('Prescription', {
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
  doctorName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  doctorCrm: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  doctorPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  prescriptionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  expirationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Data de validade da receita'
  },
  // Dados do olho direito
  rightEye: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Dados do olho direito: {sphere, cylinder, axis, add, pd}'
  },
  // Dados do olho esquerdo
  leftEye: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Dados do olho esquerdo: {sphere, cylinder, axis, add, pd}'
  },
  // Distância pupilar
  pupillaryDistance: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true,
    comment: 'Distância pupilar em mm'
  },
  // Tipo de lente prescrita
  lensType: {
    type: DataTypes.ENUM('monofocal', 'bifocal', 'progressiva', 'multifocal'),
    allowNull: true
  },
  // Tratamentos especiais
  treatments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array de tratamentos: [antireflexo, fotossensível, etc]'
  },
  // Observações médicas
  medicalNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Observações do óptico
  opticianNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Status da prescrição
  status: {
    type: DataTypes.ENUM('active', 'used', 'expired', 'cancelled'),
    defaultValue: 'active'
  },
  // Arquivo da receita digitalizada
  prescriptionFile: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL do arquivo da receita digitalizada'
  },
  // Data de uso da prescrição
  usedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data em que a prescrição foi utilizada'
  },
  // ID da venda que utilizou a prescrição
  saleId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID da venda que utilizou esta prescrição'
  }
}, {
  tableName: 'prescriptions',
  indexes: [
    {
      fields: ['clientId']
    },
    {
      fields: ['prescriptionDate']
    },
    {
      fields: ['status']
    },
    {
      fields: ['expirationDate']
    }
  ]
});

module.exports = Prescription;
