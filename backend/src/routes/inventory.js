const express = require('express');
const { auth } = require('../middleware/auth');
const { validateInventoryMovement, validateUUID, validatePagination } = require('../middleware/validation');
const {
  getInventory,
  getInventoryByProduct,
  createMovement,
  getMovements,
  adjustStock,
  getInventoryStats
} = require('../controllers/inventoryController');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de estoque
router.get('/', validatePagination, getInventory);
router.get('/stats', getInventoryStats);
router.get('/product/:productId', validateUUID('productId'), getInventoryByProduct);
router.post('/movement', validateInventoryMovement, createMovement);
router.get('/movements', validatePagination, getMovements);
router.post('/adjust', validateInventoryMovement, adjustStock);

module.exports = router;
