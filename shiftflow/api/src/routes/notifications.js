/**
 * Notifications Routes - Rotas de gestão de notificações
 * GET /api/notifications - Lista notificações do usuário logado
 * PATCH /api/notifications/:id/read - Marca como lida
 * PATCH /api/notifications/read-all - Marca todas como lidas
 * PATCH /api/notifications/:id/resolve - Marca reprovação como resolvida (admin)
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
 * /api/notifications:
 *   get:
 *     summary: Lista notificações do usuário logado
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificações
 */
router.get('/', (req, res) => {
  try {
    const notifications = storage.getCollection('notifications');
    
    // Se for admin, retorna todas as notificações
    // Se for employee, retorna apenas as suas
    let userNotifications;
    if (req.user.role === 'admin') {
      userNotifications = notifications;
    } else {
      userNotifications = notifications.filter(n => n.toUserId === req.user.id);
    }

    // Inclui dados do remetente
    const users = storage.getCollection('users');
    const notificationsWithSender = userNotifications.map(notification => {
      const sender = users.find(u => u.id === notification.fromUserId);
      return {
        ...notification,
        sender: sender ? { id: sender.id, name: sender.name } : null
      };
    });

    res.json(notificationsWithSender);
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marca notificação como lida
 *     tags: [Notifications]
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
 *         description: Notificação marcada como lida
 */
router.patch('/:id/read', (req, res) => {
  try {
    const { id } = req.params;

    const notification = storage.findById('notifications', id);
    if (!notification) {
      return res.status(404).json({
        error: true,
        message: 'Notificação não encontrada',
        code: 'NOTIFICATION_NOT_FOUND'
      });
    }

    // Verifica se o usuário é o destinatário ou admin
    if (req.user.role !== 'admin' && notification.toUserId !== req.user.id) {
      return res.status(403).json({
        error: true,
        message: 'Acesso negado',
        code: 'FORBIDDEN'
      });
    }

    storage.update('notifications', id, { read: true });

    const updatedNotification = storage.findById('notifications', id);
    res.json(updatedNotification);
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Marca todas as notificações como lidas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificações marcadas como lidas
 */
router.patch('/read-all', (req, res) => {
  try {
    const notifications = storage.getCollection('notifications');
    
    // Atualiza todas as notificações do usuário
    notifications.forEach(notification => {
      if (req.user.role === 'admin' || notification.toUserId === req.user.id) {
        storage.update('notifications', notification.id, { read: true });
      }
    });

    res.json({ message: 'Todas as notificações marcadas como lidas' });
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/resolve:
 *   patch:
 *     summary: Marca reprovação como resolvida (admin)
 *     tags: [Notifications]
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
 *         description: Notificação resolvida
 */
router.patch('/:id/resolve', requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;

    const notification = storage.findById('notifications', id);
    if (!notification) {
      return res.status(404).json({
        error: true,
        message: 'Notificação não encontrada',
        code: 'NOTIFICATION_NOT_FOUND'
      });
    }

    storage.update('notifications', id, { resolved: true });

    const updatedNotification = storage.findById('notifications', id);
    res.json(updatedNotification);
  } catch (error) {
    console.error('Erro ao resolver notificação:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;