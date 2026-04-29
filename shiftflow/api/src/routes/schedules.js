/**
 * Schedules Routes - Rotas de gestão de escalas
 * GET /api/schedules - Lista escalas (com filtros)
 * POST /api/schedules - Cria nova escala (admin)
 * PUT /api/schedules/:id - Edita escala (admin)
 * DELETE /api/schedules/:id - Remove escala (admin)
 * PATCH /api/schedules/:id/approve - Aprova própria escala (employee)
 * PATCH /api/schedules/:id/reject - Reprova escala com motivo (employee)
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole, requireAdminOrEmployee } = require('../middlewares/role.middleware');
const storage = require('../services/storage.service');

const router = express.Router();

// Aplica middleware de autenticação a todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: Lista escalas com filtros opcionais
 *     tags: [Schedules]
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
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de escalas
 */
router.get('/', (req, res) => {
  try {
    const { month, year, employeeId } = req.query;
    let schedules = storage.getCollection('schedules');

    // Filtro por mês e ano
    if (month && year) {
      const monthStr = String(month).padStart(2, '0');
      schedules = schedules.filter(s => s.date.startsWith(`${year}-${monthStr}`));
    }

    // Filtro por employeeId
    if (employeeId) {
      schedules = schedules.filter(s => s.employeeId === employeeId);
    }

    // Se for employee, retorna apenas suas próprias escalas
    if (req.user.role === 'employee') {
      schedules = schedules.filter(s => s.employeeId === req.user.id);
    }

    // Inclui dados do employee para cada escala
    const users = storage.getCollection('users');
    const schedulesWithEmployee = schedules.map(schedule => {
      const employee = users.find(u => u.id === schedule.employeeId);
      return {
        ...schedule,
        employee: employee ? { id: employee.id, name: employee.name, role: employee.role } : null
      };
    });

    res.json(schedulesWithEmployee);
  } catch (error) {
    console.error('Erro ao listar escalas:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Cria nova escala
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - date
 *               - startTime
 *               - endTime
 *               - position
 *             properties:
 *               employeeId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               position:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Escala criada
 */
router.post('/', requireRole('admin'), (req, res) => {
  try {
    const { employeeId, date, startTime, endTime, position, notes } = req.body;

    if (!employeeId || !date || !startTime || !endTime || !position) {
      return res.status(400).json({
        error: true,
        message: 'employeeId, date, startTime, endTime e position são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }

    // Verifica se o employee existe
    const employee = storage.findById('users', employeeId);
    if (!employee) {
      return res.status(404).json({
        error: true,
        message: 'Funcionário não encontrado',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    const newSchedule = {
      id: uuidv4(),
      employeeId,
      date,
      startTime,
      endTime,
      position,
      notes: notes || '',
      status: 'pending',
      rejectionReason: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storage.add('schedules', newSchedule);

    res.status(201).json(newSchedule);
  } catch (error) {
    console.error('Erro ao criar escala:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/schedules/{id}:
 *   put:
 *     summary: Edita escala
 *     tags: [Schedules]
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
 *               date:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               position:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Escala atualizada
 */
router.put('/:id', requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, position, notes } = req.body;

    const schedule = storage.findById('schedules', id);
    if (!schedule) {
      return res.status(404).json({
        error: true,
        message: 'Escala não encontrada',
        code: 'SCHEDULE_NOT_FOUND'
      });
    }

    const updates = {
      updatedAt: new Date().toISOString()
    };

    if (date) updates.date = date;
    if (startTime) updates.startTime = startTime;
    if (endTime) updates.endTime = endTime;
    if (position) updates.position = position;
    if (notes !== undefined) updates.notes = notes;

    storage.update('schedules', id, updates);

    const updatedSchedule = storage.findById('schedules', id);
    res.json(updatedSchedule);
  } catch (error) {
    console.error('Erro ao editar escala:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/schedules/{id}:
 *   delete:
 *     summary: Remove escala
 *     tags: [Schedules]
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
 *         description: Escala removida
 */
router.delete('/:id', requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;

    const schedule = storage.findById('schedules', id);
    if (!schedule) {
      return res.status(404).json({
        error: true,
        message: 'Escala não encontrada',
        code: 'SCHEDULE_NOT_FOUND'
      });
    }

    storage.remove('schedules', id);

    res.json({ message: 'Escala removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover escala:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/schedules/{id}/approve:
 *   patch:
 *     summary: Aprova própria escala
 *     tags: [Schedules]
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
 *         description: Escala aprovada
 */
router.patch('/:id/approve', requireAdminOrEmployee, (req, res) => {
  try {
    const { id } = req.params;

    const schedule = storage.findById('schedules', id);
    if (!schedule) {
      return res.status(404).json({
        error: true,
        message: 'Escala não encontrada',
        code: 'SCHEDULE_NOT_FOUND'
      });
    }

    // Employee só pode aprovar suas próprias escalas
    if (req.user.role === 'employee' && schedule.employeeId !== req.user.id) {
      return res.status(403).json({
        error: true,
        message: 'Você só pode aprovar suas próprias escalas',
        code: 'FORBIDDEN'
      });
    }

    storage.update('schedules', id, {
      status: 'approved',
      updatedAt: new Date().toISOString()
    });

    const updatedSchedule = storage.findById('schedules', id);
    res.json(updatedSchedule);
  } catch (error) {
    console.error('Erro ao aprovar escala:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/schedules/{id}/reject:
 *   patch:
 *     summary: Reprova escala com motivo
 *     tags: [Schedules]
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
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Escala reprovada
 */
router.patch('/:id/reject', requireAdminOrEmployee, (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.length < 20) {
      return res.status(400).json({
        error: true,
        message: 'Motivo da reprovação deve ter pelo menos 20 caracteres',
        code: 'INVALID_REJECTION_REASON'
      });
    }

    const schedule = storage.findById('schedules', id);
    if (!schedule) {
      return res.status(404).json({
        error: true,
        message: 'Escala não encontrada',
        code: 'SCHEDULE_NOT_FOUND'
      });
    }

    // Employee só pode reprovar suas próprias escalas
    if (req.user.role === 'employee' && schedule.employeeId !== req.user.id) {
      return res.status(403).json({
        error: true,
        message: 'Você só pode reprovar suas próprias escalas',
        code: 'FORBIDDEN'
      });
    }

    storage.update('schedules', id, {
      status: 'rejected',
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    });

    const updatedSchedule = storage.findById('schedules', id);

    // Cria notificação para o admin
    const notification = {
      id: uuidv4(),
      toUserId: 'admin', // O admin recebe a notificação
      fromUserId: req.user.id,
      type: 'rejection_alert',
      message: `Escala reprovada por ${req.user.name}: ${reason}`,
      scheduleId: id,
      read: false,
      resolved: false,
      createdAt: new Date().toISOString()
    };

    // Busca o admin para enviar notificação
    const users = storage.getCollection('users');
    const admin = users.find(u => u.role === 'admin');
    if (admin) {
      notification.toUserId = admin.id;
      storage.add('notifications', notification);
    }

    res.json(updatedSchedule);
  } catch (error) {
    console.error('Erro ao reprovar escala:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;