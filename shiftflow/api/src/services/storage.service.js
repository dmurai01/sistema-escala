/**
 * Storage Service - Gerencia a leitura e escrita do data.json
 * Toda leitura é síncrona em memória, toda escrita persiste imediatamente em disco
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'data.json');

// Filha simples para garantir que apenas uma operação de escrita ocorra por vez
let writeQueue = Promise.resolve();

class StorageService {
  constructor() {
    this.data = null;
    this.loadData();
  }

  /**
   * Carrega o data.json na memória
   */
  loadData() {
    try {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      this.data = JSON.parse(fileContent);
    } catch (error) {
      console.error('Erro ao carregar data.json:', error.message);
      // Inicializa com estrutura vazia se o arquivo não existir
      this.data = {
        users: [],
        schedules: [],
        alerts: [],
        notifications: []
      };
    }
  }

  /**
   * Retorna todos os dados em memória
   */
  getAll() {
    return this.data;
  }

  /**
   * Retorna dados de uma coleção específica
   */
  getCollection(collection) {
    return this.data[collection] || [];
  }

  /**
   * Busca um item por ID em uma coleção
   */
  findById(collection, id) {
    const items = this.getCollection(collection);
    return items.find(item => item.id === id);
  }

  /**
   * Adiciona um novo item a uma coleção
   */
  add(collection, item) {
    this.data[collection].push(item);
    return this.persist();
  }

  /**
   * Atualiza um item existente em uma coleção
   */
  update(collection, id, updates) {
    const index = this.data[collection].findIndex(item => item.id === id);
    if (index === -1) {
      return null;
    }
    this.data[collection][index] = { ...this.data[collection][index], ...updates };
    return this.persist();
  }

  /**
   * Remove um item de uma coleção
   */
  remove(collection, id) {
    const index = this.data[collection].findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }
    this.data[collection].splice(index, 1);
    return this.persist();
  }

  /**
   * Persiste os dados em disco (fila para evitar escritas simultâneas)
   */
  persist() {
    writeQueue = writeQueue.then(() => {
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
        return true;
      } catch (error) {
        console.error('Erro ao persistir data.json:', error.message);
        return false;
      }
    });
    return writeQueue;
  }

  /**
   * Substitui todos os dados (para import)
   */
  replaceAll(newData) {
    this.data = newData;
    return this.persist();
  }

  /**
   * Valida a estrutura do data.json
   */
  validateStructure(data) {
    const requiredKeys = ['users', 'schedules', 'alerts', 'notifications'];
    for (const key of requiredKeys) {
      if (!Array.isArray(data[key])) {
        return { valid: false, message: `Campo '${key}' deve ser um array` };
      }
    }
    return { valid: true };
  }
}

// Singleton instance
const storage = new StorageService();

module.exports = storage;