/**
 * Auth Module - Gerenciamento de autenticação no frontend
 */

import api from './api.js';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    if (api.isAuthenticated()) {
      this.currentUser = api.getUser();
    }
  }

  async login(username, password) {
    try {
      const data = await api.login(username, password);
      this.currentUser = data.user;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  logout() {
    this.currentUser = null;
    api.logout();
  }

  isAuthenticated() {
    return api.isAuthenticated();
  }

  getCurrentUser() {
    return this.currentUser || api.getUser();
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  isEmployee() {
    const user = this.getCurrentUser();
    return user && user.role === 'employee';
  }

  isGeneral() {
    const user = this.getCurrentUser();
    return user && user.role === 'general';
  }

  canAccessRoute(route) {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Rotas públicas
    if (route === '#/login') return true;

    // Rotas restritas
    if (route.startsWith('#/admin')) {
      return user.role === 'admin';
    }

    if (route.startsWith('#/my-schedules')) {
      return user.role === 'employee';
    }

    return true;
  }
}

const auth = new AuthManager();

export default auth;