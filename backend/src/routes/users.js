const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { validateUser, validateUUID, validatePagination } = require('../middleware/validation');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de usuários
router.get('/', authorize('admin', 'manager'), validatePagination, getUsers);
router.get('/:id', authorize('admin', 'manager'), validateUUID('id'), getUserById);
router.post('/', authorize('admin'), validateUser, createUser);
router.put('/:id', authorize('admin', 'manager'), validateUUID('id'), updateUser);
router.delete('/:id', authorize('admin'), validateUUID('id'), deleteUser);

module.exports = router;
