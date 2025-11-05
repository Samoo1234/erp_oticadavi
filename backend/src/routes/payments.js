const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const {
  processPayment,
  getTransactionStatus,
  cancelTransaction,
  getSaleTransactions
} = require('../controllers/paymentController');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// Processar pagamento
router.post('/process', processPayment);

// Consultar status de transação
router.get('/transaction/:transactionId', getTransactionStatus);

// Cancelar transação
router.post('/cancel/:transactionId', cancelTransaction);

// Listar transações de uma venda
router.get('/sale/:saleId', getSaleTransactions);

module.exports = router;

