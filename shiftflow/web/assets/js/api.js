/**
 * API Wrapper - Comunicação com a API ShiftFlow
 * Adiciona automaticamente o JWT no header Authorization
 */

// Importa configuração do ambiente (disponível globalmente)
const API_BASE_URL = window.AppConfig ? window.AppConfig.getApiBaseUrl() : 'http://127.0.0.1:3000';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Obtém o token do sessionStorage
   */
  getToken() {
    return sessionStorage.getItem('shiftflow_token');
  }

  /**
   * Armazena o token no sessionStorage
   */
  setToken(token) {
    sessionStorage.setItem('shiftflow_token', token);
  }

  /**
   * Remove o token do sessionStorage
   */
  removeToken() {
    sessionStorage.removeItem('shiftflow_token');
  }

  /**
   * Obtém os dados do usuário logado
   */
  getUser() {
    const user = sessionStorage.getItem('shiftflow_user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Armazena os dados do usuário
   */
  setUser(user) {
    sessionStorage.setItem('shiftflow_user', JSON.stringify(user));
  }

  /**
   * Remove os dados do usuário
   */
  removeUser() {
    sessionStorage.removeItem('shiftflow_user');
  }

  /**
   * Verifica se o usuário está logado
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Faz uma requisição para a API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Se receber 401, redireciona para login
      if (response.status === 401) {
        this.removeToken();
        this.removeUser();
        window.location.hash = '#/login';
        throw new Error('Sessão expirada');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  }

  // Métodos HTTP
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Métodos específicos de autenticação
  async login(username, password) {
    const data = await this.post('/api/auth/login', { username, password });
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  logout() {
    this.removeToken();
    this.removeUser();
    window.location.hash = '#/login';
  }

  async getMe() {
    return this.get('/api/auth/me');
  }

  // Métodos de usuários
  async getUsers() {
    return this.get('/api/users');
  }

  async createUser(userData) {
    return this.post('/api/users', userData);
  }

  async updateUser(id, userData) {
    return this.put(`/api/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/api/users/${id}`);
  }

  // Métodos de escalas
  async getSchedules(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/schedules?${queryString}` : '/api/schedules';
    return this.get(endpoint);
  }

  async createSchedule(scheduleData) {
    return this.post('/api/schedules', scheduleData);
  }

  async updateSchedule(id, scheduleData) {
    return this.put(`/api/schedules/${id}`, scheduleData);
  }

  async deleteSchedule(id) {
    return this.delete(`/api/schedules/${id}`);
  }

  async approveSchedule(id) {
    return this.patch(`/api/schedules/${id}/approve`, {});
  }

  async rejectSchedule(id, reason) {
    return this.patch(`/api/schedules/${id}/reject`, { reason });
  }

  // Métodos de alertas
  async getAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/alerts?${queryString}` : '/api/alerts';
    return this.get(endpoint);
  }

  async createAlert(alertData) {
    return this.post('/api/alerts', alertData);
  }

  async deleteAlert(id) {
    return this.delete(`/api/alerts/${id}`);
  }

  // Métodos de notificações
  async getNotifications() {
    return this.get('/api/notifications');
  }

  async markNotificationRead(id) {
    return this.patch(`/api/notifications/${id}/read`, {});
  }

  async markAllNotificationsRead() {
    return this.patch('/api/notifications/read-all', {});
  }

  async resolveNotification(id) {
    return this.patch(`/api/notifications/${id}/resolve`, {});
  }

  // Métodos admin
  async exportData() {
    return this.get('/api/admin/export');
  }

  async importData(data) {
    return this.post('/api/admin/import', data);
  }
}

// Singleton instance
const api = new ApiClient();

export default api;