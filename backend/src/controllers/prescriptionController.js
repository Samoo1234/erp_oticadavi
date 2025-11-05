const { Prescription, Client, User, Product } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

/**
 * @swagger
 * components:
 *   schemas:
 *     Prescription:
 *       type: object
 *       required:
 *         - clientId
 *         - doctorName
 *         - prescriptionData
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         clientId:
 *           type: string
 *           format: uuid
 *         doctorName:
 *           type: string
 *         doctorCrm:
 *           type: string
 *         doctorPhone:
 *           type: string
 *         prescriptionDate:
 *           type: string
 *           format: date
 *         prescriptionData:
 *           type: object
 *           properties:
 *             rightEye:
 *               type: object
 *               properties:
 *                 sphere:
 *                   type: number
 *                 cylinder:
 *                   type: number
 *                 axis:
 *                   type: number
 *                 add:
 *                   type: number
 *                 pd:
 *                   type: number
 *             leftEye:
 *               type: object
 *               properties:
 *                 sphere:
 *                   type: number
 *                 cylinder:
 *                   type: number
 *                 axis:
 *                   type: number
 *                 add:
 *                   type: number
 *                 pd:
 *                   type: number
 *             type:
 *               type: string
 *               enum: [single_vision, bifocal, progressive, reading]
 *             material:
 *               type: string
 *               enum: [glass, plastic, polycarbonate, trivex]
 *             coating:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [anti_reflective, uv_protection, blue_light, scratch_resistant]
 *             notes:
 *               type: string
 *         status:
 *           type: string
 *           enum: [active, used, expired, cancelled]
 *         expirationDate:
 *           type: string
 *           format: date
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/prescriptions:
 *   get:
 *     summary: Listar prescrições
 *     tags: [Prescrições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, used, expired, cancelled]
 *       - in: query
 *         name: doctorName
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de prescrições
 */
const getPrescriptions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      clientId,
      status,
      doctorName
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (clientId) {
      where.clientId = clientId;
    }

    if (status) {
      where.status = status;
    }

    if (doctorName) {
      where.doctorName = { [Op.iLike]: `%${doctorName}%` };
    }

    const { count, rows: prescriptions } = await Prescription.findAndCountAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['name', 'email', 'phone']
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['prescriptionDate', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/prescriptions/{id}:
 *   get:
 *     summary: Obter prescrição por ID
 *     tags: [Prescrições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dados da prescrição
 *       404:
 *         description: Prescrição não encontrada
 */
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client'
        },
        {
          model: User,
          as: 'user'
        }
      ]
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescrição não encontrada'
      });
    }

    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/prescriptions:
 *   post:
 *     summary: Criar nova prescrição
 *     tags: [Prescrições]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Prescription'
 *     responses:
 *       201:
 *         description: Prescrição criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
const createPrescription = async (req, res) => {
  try {
    const {
      clientId,
      doctorName,
      doctorCrm,
      doctorPhone,
      prescriptionDate,
      prescriptionData,
      notes
    } = req.body;

    // Validar se cliente existe
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Calcular data de expiração (1 ano)
    const expirationDate = new Date(prescriptionDate);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    const prescription = await Prescription.create({
      clientId,
      doctorName,
      doctorCrm,
      doctorPhone,
      prescriptionDate: new Date(prescriptionDate),
      prescriptionData,
      status: 'active',
      expirationDate,
      notes,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Prescrição criada com sucesso',
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/prescriptions/{id}:
 *   put:
 *     summary: Atualizar prescrição
 *     tags: [Prescrições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Prescription'
 *     responses:
 *       200:
 *         description: Prescrição atualizada com sucesso
 *       404:
 *         description: Prescrição não encontrada
 */
const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const prescription = await Prescription.findByPk(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescrição não encontrada'
      });
    }

    // Verificar se prescrição pode ser editada
    if (prescription.status === 'used' || prescription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Prescrição não pode ser editada neste status'
      });
    }

    await prescription.update(updateData);

    res.json({
      success: true,
      message: 'Prescrição atualizada com sucesso',
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/prescriptions/{id}:
 *   delete:
 *     summary: Cancelar prescrição
 *     tags: [Prescrições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Prescrição cancelada com sucesso
 */
const cancelPrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findByPk(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescrição não encontrada'
      });
    }

    if (prescription.status === 'used' || prescription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Prescrição não pode ser cancelada neste status'
      });
    }

    await prescription.update({
      status: 'cancelled'
    });

    res.json({
      success: true,
      message: 'Prescrição cancelada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/prescriptions/calculate-lens:
 *   post:
 *     summary: Calcular lente baseada na prescrição
 *     tags: [Prescrições]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prescriptionData:
 *                 type: object
 *               material:
 *                 type: string
 *               coating:
 *                 type: array
 *               diameter:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cálculo da lente
 */
const calculateLens = async (req, res) => {
  try {
    const { prescriptionData, material, coating, diameter } = req.body;

    // Validações básicas
    if (!prescriptionData.rightEye && !prescriptionData.leftEye) {
      return res.status(400).json({
        success: false,
        message: 'Dados da prescrição são obrigatórios'
      });
    }

    // Calcular potência da lente
    const calculatePower = (eye) => {
      if (!eye) return null;
      
      const sphere = eye.sphere || 0;
      const cylinder = eye.cylinder || 0;
      const add = eye.add || 0;
      
      return {
        sphere,
        cylinder,
        axis: eye.axis || 0,
        add,
        power: Math.sqrt(sphere * sphere + cylinder * cylinder)
      };
    };

    const rightEye = calculatePower(prescriptionData.rightEye);
    const leftEye = calculatePower(prescriptionData.leftEye);

    // Calcular preço baseado no material e revestimento
    let basePrice = 0;
    const materialPrices = {
      'glass': 50,
      'plastic': 30,
      'polycarbonate': 80,
      'trivex': 100
    };

    basePrice = materialPrices[material] || 50;

    // Adicionar custo dos revestimentos
    const coatingPrices = {
      'anti_reflective': 40,
      'uv_protection': 20,
      'blue_light': 60,
      'scratch_resistant': 30
    };

    let coatingCost = 0;
    if (coating && coating.length > 0) {
      coatingCost = coating.reduce((total, coat) => {
        return total + (coatingPrices[coat] || 0);
      }, 0);
    }

    // Calcular preço final
    const totalPrice = basePrice + coatingCost;

    // Sugerir produtos baseados na prescrição
    const suggestedProducts = await Product.findAll({
      where: {
        category: 'lentes',
        isActive: true
      },
      limit: 5
    });

    res.json({
      success: true,
      data: {
        rightEye,
        leftEye,
        material,
        coating,
        diameter,
        basePrice,
        coatingCost,
        totalPrice,
        suggestedProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/prescriptions/expired:
 *   get:
 *     summary: Obter prescrições expiradas
 *     tags: [Prescrições]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de prescrições expiradas
 */
const getExpiredPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      where: {
        status: 'active',
        expirationDate: {
          [Op.lt]: new Date()
        }
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['name', 'email', 'phone']
        }
      ],
      order: [['expirationDate', 'ASC']]
    });

    res.json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  cancelPrescription,
  calculateLens,
  getExpiredPrescriptions
};
