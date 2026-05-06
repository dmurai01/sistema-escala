const swaggerAutogen = require('swagger-autogen')();
const doc = { info: { title: 'API', version: '1.0.0' } };
const outputFile = './src/swagger/swagger.json';
const routes = ['./src/app.js']; // arquivos de rota
swaggerAutogen(outputFile, routes, doc);