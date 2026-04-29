/**
 * Alerts Routes - Rotas de gestão de alertas
 * GET /api/alerts - Lista alertas (com filtros)
 * POST /api/alerts - Cria alerta (admin)
 * DELETE /api/alerts/:id - Remove alerta (admin)
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const storage = require('../services/storage.service');

const router = express.Router();

// Aplica middleware de autenticação a todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Lista alertas com filtros opcionais
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de alertas
 */
router.get('/', (req, res) => {
  try {
    const { month, year } = req.query;
    let alerts = storage.getCollection('alerts');

    // Filtro por mês e ano
    if (month && year) {
      const monthStr = String(month).padStart(2, '0');
      alerts = alerts.filter(a => a.date.startsWith(`${year}-${monthStr}`));
    }

    // Inclui dados do criador
    const users = storage.getCollection('users');
    const alertsWithCreator = alerts.map(alert => {
      const creator = users.find(u => u.id === alert.createdBy);
      return {
        ...alert,
        creator: creator ? { id: creator.id, name: creator.name } : null
      };
    });

    res.json(alertsWithCreator);
  } catch (error) {
    console.error('Erro ao listar alertas:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Cria novo alerta
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - title
 *               - description
 *               - type
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [holiday, event, high_traffic]
 *     responses:
 *       201:
 *         description: Alerta criado
 */
router.post('/', requireRole('admin'), (req, res) => {
  try {
    const { date, title, description, type } = req.body;

    if (!date || !title || !description || !type) {
      return res.status(400).json({
        error: true,
        message: 'date, title, description e type são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }

    if (!['holiday', 'event', 'high_traffic'].includes(type)) {
      return res.status(400).json({
        error: true,
        message: 'Type deve ser: holiday, event ou high_traffic',
        code: 'INVALID_TYPE'
      });
    }

    const newAlert = {
      id: uuidv4(),
      date,
      title,
      description,
      type,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    storage.add('alerts', newAlert);

    res.status(201).json(newAlert);
  } catch (error) {
    console.error('Erro ao criar alerta:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: Remove alerta
 *     tags: [Alerts]
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
 *         description: Alerta removido
 */
router.delete('/:id', requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;

    const alert = storage.findById('alerts', id);
    if (!alert) {
      return res.status(404).json({
        error: true,
        message: 'Alerta não encontrado',
        code: 'ALERT_NOT_FOUND'
      });
    }

    storage.remove('alerts', id);

    res.json({ message: 'Alerta removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover alerta:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;