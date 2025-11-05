const express = require('express');
const { auth } = require('../middleware/auth');
const { validateProduct, validateUUID, validatePagination } = require('../middleware/validation');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
  getLowStockProducts
} = require('../controllers/productController');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de produtos
router.get('/', validatePagination, getProducts);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/low-stock', getLowStockProducts);
router.get('/:id', validateUUID('id'), getProductById);
router.post('/', validateProduct, createProduct);
router.put('/:id', validateUUID('id'), validateProduct, updateProduct);
router.delete('/:id', validateUUID('id'), deleteProduct);

module.exports = router;
