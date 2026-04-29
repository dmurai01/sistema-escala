/**
 * Role Middleware - Fábrica de middleware para verificação de role
 */

/**
 * Cria um middleware que verifica se o usuário tem o role especificado
 * @param {string} requiredRole - O role necessário para acessar a rota
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        error: true,
        message: `Acesso negado. Role '${requiredRole}' necessário.`,
        code: 'FORBIDDEN'
      });
    }

    next();
  };
};

/**
 * Middleware que permite apenas admin e employee
 */
const requireAdminOrEmployee = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: true,
      message: 'Usuário não autenticado',
      code: 'NOT_AUTHENTICATED'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'employee') {
    return res.status(403).json({
      error: true,
      message: 'Acesso negado. Role admin ou employee necessário.',
      code: 'FORBIDDEN'
    });
  }

  next();
};

module.exports = { requireRole, requireAdminOrEmployee };