const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');
const {
  login,
  register,
  getMe,
  changePassword
} = require('../controllers/authController');

const router = express.Router();

// Rotas públicas
router.post('/login', login);
router.post('/register', auth, authorize('admin', 'manager'), validateUser, register);

// Rotas protegidas
router.get('/me', auth, getMe);
router.put('/change-password', auth, changePassword);

module.exports = router;
