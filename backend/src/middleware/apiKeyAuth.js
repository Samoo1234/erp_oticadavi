/**
 * Middleware para autenticação via API Key
 * Usado para integração entre sistemas
 */

const apiKeyAuth = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API Key não fornecida'
      });
    }

    // Verificar se a API Key é válida
    // IMPORTANTE: Adicione sua chave em uma variável de ambiente
    const validApiKeys = process.env.INTEGRATION_API_KEYS?.split(',') || [];

    if (!validApiKeys.includes(apiKey)) {
      return res.status(401).json({
        success: false,
        message: 'API Key inválida'
      });
    }

    // Log de acesso para auditoria
    console.log(`[API Integration] Request from external system at ${new Date().toISOString()}`);

    next();
  } catch (error) {
    console.error('Erro na autenticação por API Key:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na autenticação'
    });
  }
};

module.exports = { apiKeyAuth };

