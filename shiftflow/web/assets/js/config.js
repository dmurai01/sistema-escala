/**
 * Configuração do Ambiente
 * Altere os valores conforme o ambiente de execução
 * 
 * Ambientes disponíveis:
 * - development: http://127.0.0.1:3000 (sua máquina local)
 * - production: URL da API hospedada (ex: https://seu-app.onrender.com)
 */

// Configuração global
var CONFIG = {
  // Ambiente atual: 'development' ou 'production'
  env: 'development',
  
  // URLs da API por ambiente
  apiUrls: {
    development: 'http://127.0.0.1:3000',
    production: 'https://shiftflow-api.onrender.com'
  },
  
  // Timeout das requisições em ms
  timeout: 30000,
  
  // Tempo de expiração do token em ms (8 horas)
  tokenExpiration: 8 * 60 * 60 * 1000
};

/**
 * Obtém a URL da API baseada no ambiente atual
 */
function getApiBaseUrl() {
  return CONFIG.apiUrls[CONFIG.env] || CONFIG.apiUrls.development;
}

/**
 * Verifica se está em modo de desenvolvimento
 */
function isDevelopment() {
  return CONFIG.env === 'development';
}

/**
 * Verifica se está em modo de produção
 */
function isProduction() {
  return CONFIG.env === 'production';
}

// Exporta as configurações para o objeto global
window.AppConfig = {
  CONFIG: CONFIG,
  getApiBaseUrl: getApiBaseUrl,
  isDevelopment: isDevelopment,
  isProduction: isProduction
};