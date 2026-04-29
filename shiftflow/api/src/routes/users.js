/**
 * Users Routes - Rotas de gestão de usuários (apenas admin)
 * GET /api/users - Lista todos os usuários
 * POST /api/users - Cria novo usuário
 * PUT /api/users/:id - Atualiza usuário
 * DELETE /api/users/:id - Desativa usuário (soft delete)
 */

const express = require('express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const storage = require('../services/storage.service');

const router = express.Router();

// Aplica middleware de autenticação a todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get('/', requireRole('admin'), (req, res) => {
  try {
    const users = storage.getCollection('users');
    const usersWithoutPassword = users.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt
    }));
    res.json(usersWithoutPassword);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria novo usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, employee, general]
 *     responses:
 *       201:
 *         description: Usuário criado
 */
router.post('/', requireRole('admin'), (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password || !role) {
      return res.status(400).json({
        error: true,
        message: 'Nome, username, password e role são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }

    if (!['admin', 'employee', 'general'].includes(role)) {
      return res.status(400).json({
        error: true,
        message: 'Role deve ser: admin, employee ou general',
        code: 'INVALID_ROLE'
      });
    }

    // Verifica se username já existe
    const users = storage.getCollection('users');
    if (users.some(u => u.username === username)) {
      return res.status(400).json({
        error: true,
        message: 'Username já existe',
        code: 'USERNAME_EXISTS'
      });
    }

    // Hash da senha com SHA-256
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const newUser = {
      id: uuidv4(),
      name,
      username,
      passwordHash,
      role,
      active: true,
      createdAt: new Date().toISOString()
    };

    storage.add('users', newUser);

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      role: newUser.role,
      active: newUser.active,
      createdAt: newUser.createdAt
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuário atualizado
 */
router.put('/:id', requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, active } = req.body;

    const user = storage.findById('users', id);
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (role && ['admin', 'employee', 'general'].includes(role)) updates.role = role;
    if (typeof active === 'boolean') updates.active = active;

    storage.update('users', id, updates);

    const updatedUser = storage.findById('users', id);
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      username: updatedUser.username,
      role: updatedUser.role,
      active: updatedUser.active,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Desativa usuário (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário desativado
 */
router.delete('/:id', requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;

    const user = storage.findById('users', id);
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    storage.update('users', id, { active: false });

    res.json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;