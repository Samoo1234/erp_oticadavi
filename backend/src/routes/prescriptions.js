const express = require('express');
const { auth } = require('../middleware/auth');
const { validatePrescription, validateUUID, validatePagination } = require('../middleware/validation');
const {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  cancelPrescription,
  calculateLens,
  getExpiredPrescriptions
} = require('../controllers/prescriptionController');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de prescrições
router.get('/', validatePagination, getPrescriptions);
router.get('/expired', getExpiredPrescriptions);
router.get('/:id', validateUUID('id'), getPrescriptionById);
router.post('/', validatePrescription, createPrescription);
router.put('/:id', validateUUID('id'), validatePrescription, updatePrescription);
router.delete('/:id', validateUUID('id'), cancelPrescription);
router.post('/calculate-lens', calculateLens);

module.exports = router;
