const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  console.error('Erro:', err);

  // Erro de validação do Sequelize
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => error.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // Erro de chave duplicada
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Recurso já existe com essas informações';
    error = {
      message,
      statusCode: 400
    };
  }

  // Erro de chave estrangeira
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Referência inválida';
    error = {
      message,
      statusCode: 400
    };
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = {
      message,
      statusCode: 401
    };
  }

  // Erro de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = {
      message,
      statusCode: 401
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
