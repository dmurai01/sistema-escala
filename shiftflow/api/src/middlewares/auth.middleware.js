/**
 * Auth Middleware - Valida o JWT do header Authorization
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'shiftflow-secret-key-2024';

/**
 * Middleware de autenticação JWT
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: true,
      message: 'Token não fornecido',
      code: 'NO_TOKEN'
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: true,
      message: 'Formato de token inválido',
      code: 'INVALID_TOKEN_FORMAT'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({
      error: true,
      message: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
};

module.exports = authMiddleware;