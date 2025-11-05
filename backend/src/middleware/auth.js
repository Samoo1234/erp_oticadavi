const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso necessário'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Buscar usuário no Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, phone, is_active')
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single();
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissão insuficiente'
      });
    }

    next();
  };
};

module.exports = { auth, authorize };
