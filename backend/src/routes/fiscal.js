const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  cancelInvoice,
  sendInvoiceToSEFAZ,
  uploadCertificate,
  getCertificates,
  getFiscalStats
} = require('../controllers/fiscalController');

// Middleware de autenticação (se necessário)
// const auth = require('../middleware/auth');

// Rotas para notas fiscais
router.post('/invoices', createInvoice);
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.put('/invoices/:id', updateInvoice);
router.delete('/invoices/:id', cancelInvoice);
router.post('/invoices/:id/send', sendInvoiceToSEFAZ);

// Rotas para certificados digitais
router.post('/certificates', uploadCertificate);
router.get('/certificates', getCertificates);

// Rotas para estatísticas e relatórios
router.get('/stats', getFiscalStats);

module.exports = router;
