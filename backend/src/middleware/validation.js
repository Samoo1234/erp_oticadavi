const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Validações para usuários
const validateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'seller', 'optician'])
    .withMessage('Role inválida'),
  handleValidationErrors
];

// Validações para clientes
const validateClient = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('phone')
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Telefone deve ter entre 10 e 20 caracteres'),
  body('cpf')
    .optional()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve estar no formato 000.000.000-00'),
  body('gender')
    .optional()
    .isIn(['M', 'F', 'O'])
    .withMessage('Gênero deve ser M, F ou O'),
  handleValidationErrors
];

// Validações para produtos
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Nome deve ter entre 2 e 200 caracteres'),
  body('sku')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('SKU é obrigatório e deve ter até 50 caracteres'),
  body('category')
    .isIn(['oculos_grau', 'oculos_sol', 'lentes', 'acessorios', 'servicos'])
    .withMessage('Categoria inválida'),
  body('price')
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser um número positivo'),
  body('gender')
    .optional()
    .isIn(['M', 'F', 'U', 'C'])
    .withMessage('Gênero deve ser M, F, U ou C'),
  handleValidationErrors
];

// Validações para prescrições
const validatePrescription = [
  body('clientId')
    .isUUID()
    .withMessage('ID do cliente inválido'),
  body('doctorName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do médico deve ter entre 2 e 100 caracteres'),
  body('prescriptionDate')
    .isISO8601()
    .withMessage('Data da prescrição inválida'),
  body('rightEye')
    .isObject()
    .withMessage('Dados do olho direito são obrigatórios'),
  body('leftEye')
    .isObject()
    .withMessage('Dados do olho esquerdo são obrigatórios'),
  handleValidationErrors
];

// Validações para vendas
const validateSale = [
  body('clientId')
    .isUUID()
    .withMessage('ID do cliente inválido'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Venda deve ter pelo menos um item'),
  body('items.*.productId')
    .isUUID()
    .withMessage('ID do produto inválido'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser um número inteiro positivo'),
  body('items.*.unitPrice')
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 0 })
    .withMessage('Preço unitário deve ser um número positivo'),
  handleValidationErrors
];

// Validações para movimentação de estoque
const validateInventoryMovement = [
  body('productId')
    .isUUID()
    .withMessage('ID do produto inválido'),
  body('movementType')
    .isIn(['in', 'out', 'adjustment', 'transfer', 'return'])
    .withMessage('Tipo de movimento inválido'),
  body('quantity')
    .isInt()
    .withMessage('Quantidade deve ser um número inteiro'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Motivo deve ter até 200 caracteres'),
  handleValidationErrors
];

// Validação de UUID
const validateUUID = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} deve ser um UUID válido`),
  handleValidationErrors
];

// Validação de paginação
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUser,
  validateClient,
  validateProduct,
  validatePrescription,
  validateSale,
  validateInventoryMovement,
  validateUUID,
  validatePagination
};
