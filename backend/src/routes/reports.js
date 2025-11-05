const express = require('express');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const {
  getDashboardData,
  getSalesReport,
  getInventoryReport,
  getClientsReport
} = require('../controllers/reportController');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de relatórios (apenas para admins e gerentes)
router.get('/dashboard', authorize('admin', 'manager'), getDashboardData);
router.get('/sales', authorize('admin', 'manager'), getSalesReport);
router.get('/inventory', authorize('admin', 'manager'), getInventoryReport);
router.get('/clients', authorize('admin', 'manager'), getClientsReport);

module.exports = router;
