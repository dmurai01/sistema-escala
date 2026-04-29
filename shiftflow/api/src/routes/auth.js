/**
 * Auth Routes - Rotas de autenticação
 * POST /api/auth/login - Login público
 * POST /api/auth/logout - Invalida token
 * GET /api/auth/me - Retorna dados do usuário logado
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const storage = require('../services/storage.service');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'shiftflow-secret-key-2024';
const JWT_EXPIRES_IN = '8h';

// Blocklist de tokens expirados (em memória)
const tokenBlocklist = new Set();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login no sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome de usuário
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: true,
        message: 'Username e senha são obrigatórios',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Hash da senha com SHA-256
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Busca usuário
    const users = storage.getCollection('users');
    const user = users.find(u => u.username === username && u.passwordHash === passwordHash && u.active);

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Gera token JWT
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Invalida o token atual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout bem-sucedido
 */
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      tokenBlocklist.add(token);
    }
  }
  res.json({ message: 'Logout realizado com sucesso' });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Retorna dados do usuário logado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 */
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      error: true,
      message: 'Token não fornecido',
      code: 'NO_TOKEN'
    });
  }

  const token = authHeader.split(' ')[1];
  if (tokenBlocklist.has(token)) {
    return res.status(401).json({
      error: true,
      message: 'Token invalidado',
      code: 'TOKEN_INVALIDATED'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({
      error: true,
      message: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
});

module.exports = router;