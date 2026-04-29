/**
 * Swagger Configuration - Configura o Swagger UI
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShiftFlow API',
      version: '1.0.0',
      description: 'Sistema de organização de escalas de trabalho',
      contact: {
        name: 'ShiftFlow Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'employee', 'general'] },
            active: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Schedule: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            date: { type: 'string', format: 'date' },
            startTime: { type: 'string' },
            endTime: { type: 'string' },
            position: { type: 'string' },
            notes: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            rejectionReason: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Alert: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            date: { type: 'string', format: 'date' },
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['holiday', 'event', 'high_traffic'] },
            createdBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            toUserId: { type: 'string' },
            fromUserId: { type: 'string' },
            type: { type: 'string', enum: ['rejection_alert', 'approval', 'new_schedule'] },
            message: { type: 'string' },
            scheduleId: { type: 'string' },
            read: { type: 'boolean' },
            resolved: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                username: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'boolean' },
            message: { type: 'string' },
            code: { type: 'string' }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 2.5em }
      .swagger-ui .info .description { font-size: 1.1em; line-height: 1.6; }
    `,
    customSiteTitle: 'ShiftFlow API Documentation',
    customfavIcon: '/favicon.ico'
  }));
};

module.exports = setupSwagger;