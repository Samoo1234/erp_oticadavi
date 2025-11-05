const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getCompany, updateCompany } = require('../controllers/companyController');

// Todas as rotas exigem autenticação
router.use(auth);

/**
 * @swagger
 * /api/v1/company:
 *   get:
 *     summary: Obter dados da empresa
 *     tags: [Empresa]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', getCompany);

/**
 * @swagger
 * /api/v1/company:
 *   put:
 *     summary: Atualizar dados da empresa
 *     tags: [Empresa]
 *     security:
 *       - bearerAuth: []
 */
router.put('/', updateCompany);

module.exports = router;


