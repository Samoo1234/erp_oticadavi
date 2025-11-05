const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  category: {
    type: DataTypes.ENUM('oculos_grau', 'oculos_sol', 'lentes', 'acessorios', 'servicos'),
    allowNull: false
  },
  subcategory: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  material: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('M', 'F', 'U', 'C'),
    allowNull: true,
    comment: 'M=Masculino, F=Feminino, U=Unissex, C=Criança'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  profitMargin: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Margem de lucro em porcentagem'
  },
  weight: {
    type: DataTypes.DECIMAL(8, 3),
    allowNull: true,
    comment: 'Peso em gramas'
  },
  dimensions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dimensões: {width, height, depth} em mm'
  },
  specifications: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Especificações técnicas específicas do produto'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array de URLs das imagens'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPrescriptionRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se o produto requer prescrição médica'
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
  supplierId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID do fornecedor'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Tags para busca e categorização'
  }
}, {
  tableName: 'products',
  indexes: [
    {
      fields: ['sku']
    },
    {
      fields: ['category']
    },
    {
      fields: ['brand']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = Product;
