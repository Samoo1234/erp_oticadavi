const express = require('express');
const { auth } = require('../middleware/auth');
const { apiKeyAuth } = require('../middleware/apiKeyAuth');
const { validateClient, validateUUID, validatePagination } = require('../middleware/validation');
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientStats,
  getClientPurchases,
  getClientPrescriptions,
  updateLoyaltyPoints,
  searchClients,
  syncClient
} = require('../controllers/clientController');

const router = express.Router();

// Rota de sincronização (usa API Key ao invés de JWT)
router.post('/sync', apiKeyAuth, syncClient);

// Todas as outras rotas requerem autenticação JWT
router.use(auth);

// Rotas de clientes
router.get('/', validatePagination, getClients);
router.get('/search', searchClients);
router.get('/:id', validateUUID('id'), getClientById);
router.get('/:id/purchases', validateUUID('id'), validatePagination, getClientPurchases);
router.get('/:id/prescriptions', validateUUID('id'), validatePagination, getClientPrescriptions);
router.get('/:id/stats', validateUUID('id'), getClientStats);
router.post('/', validateClient, createClient);
router.put('/:id', validateUUID('id'), validateClient, updateClient);
router.put('/:id/loyalty', validateUUID('id'), updateLoyaltyPoints);
router.delete('/:id', validateUUID('id'), deleteClient);

module.exports = router;
