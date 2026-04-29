/**
 * ShiftFlow API - Aplicação Principal
 * Sistema de organização de escalas de trabalho
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Importa rotas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const schedulesRoutes = require('./routes/schedules');
const alertsRoutes = require('./routes/alerts');
const notificationsRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

// Importa configuração do Swagger
const setupSwagger = require('./swagger/swagger');

// Configurações
const PORT = process.env.PORT || 3000;
const WEB_ORIGIN = process.env.WEB_ORIGIN || 'http://localhost:5500';

// Inicializa o Express
const app = express();

// Middleware para parsing de JSON
app.use(express.json());

// Configuração de CORS - permite todas as origens para desenvolvimento
app.use(cors({
  origin: true, // Permite todas as origens
  credentials: true
}));

// Middleware de log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Configura rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

// Configura Swagger
setupSwagger(app);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    error: true,
    message: 'Erro interno do servidor',
    code: 'INTERNAL_ERROR'
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Rota não encontrada',
    code: 'NOT_FOUND'
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   ShiftFlow API                             ║
║           Sistema de Escalas de Trabalho                    ║
╠═══════════════════════════════════════════════════════════╣
║  Servidor rodando em: http://localhost:${PORT}               ║
║  Swagger UI: http://localhost:${PORT}/api-docs               ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;