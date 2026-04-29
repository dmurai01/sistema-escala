/**
 * Admin Routes - Rotas de utilitários administrativos
 * GET /api/admin/export - Retorna o data.json completo para download
 * POST /api/admin/import - Substitui o data.json pelo body recebido
 */

const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const storage = require('../services/storage.service');

const router = express.Router();

// Aplica middleware de autenticação a todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * /api/admin/export:
 *   get:
 *     summary: Exporta todos os dados do sistema
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados completos do sistema
 */
router.get('/export', requireRole('admin'), (req, res) => {
  try {
    const data = storage.getAll();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=shiftflow-data.json');
    res.json(data);
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/admin/import:
 *   post:
 *     summary: Importa dados para o sistema
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users:
 *                 type: array
 *               schedules:
 *                 type: array
 *               alerts:
 *                 type: array
 *               notifications:
 *                 type: array
 *     responses:
 *       200:
 *         description: Dados importados com sucesso
 */
router.post('/import', requireRole('admin'), (req, res) => {
  try {
    const newData = req.body;

    // Valida a estrutura
    const validation = storage.validateStructure(newData);
    if (!validation.valid) {
      return res.status(400).json({
        error: true,
        message: validation.message,
        code: 'INVALID_STRUCTURE'
      });
    }

    // Substitui os dados
    storage.replaceAll(newData);

    res.json({ message: 'Dados importados com sucesso' });
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;