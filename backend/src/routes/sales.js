const express = require('express');
const { auth } = require('../middleware/auth');
const { validateSale, validateUUID, validatePagination } = require('../middleware/validation');
const {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  confirmSale,
  cancelSale,
  getSalesStats
} = require('../controllers/saleController');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de vendas
router.get('/', validatePagination, getSales);
router.get('/stats', getSalesStats);
router.get('/:id', validateUUID('id'), getSaleById);
router.post('/', validateSale, createSale);
router.put('/:id', validateUUID('id'), validateSale, updateSale);
router.post('/:id/confirm', validateUUID('id'), confirmSale);
router.delete('/:id', validateUUID('id'), cancelSale);

module.exports = router;
