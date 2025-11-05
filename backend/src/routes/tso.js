const express = require('express');
const router = express.Router();
const { createTSO, getTSOs, getTSOById } = require('../controllers/tsoController');
const { validateUUID } = require('../middleware/validation');

// Criar novo TSO
router.post('/', createTSO);

// Listar TSOs
router.get('/', getTSOs);

// Buscar TSO por ID
router.get('/:id', validateUUID('id'), getTSOById);

module.exports = router;
