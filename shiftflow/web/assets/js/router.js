/**
 * Router - SPA com hash routing
 * Gerencia a navegação entre as telas sem recarregar a página
 */

import auth from './auth.js';

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.isNavigating = false;
    this.init();
  }

  init() {
    // Configura o listener de hash
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // Primeira carga - processa a rota atual sem navegar
    const initialHash = window.location.hash;
    if (!initialHash) {
      // Sem hash, define o padrão baseado na autenticação
      if (auth.isAuthenticated()) {
        window.location.hash = '#/dashboard';
      } else {
        window.location.hash = '#/login';
      }
    } else {
      this.handleRoute();
    }
  }

  /**
   * Registra uma rota
   */
  register(path, handler) {
    this.routes[path] = handler;
  }

  /**
   * Navega para uma rota
   */
  navigate(path) {
    // Evita navegação redundante
    const currentHash = window.location.hash.substring(1);
    if (currentHash === path) {
      return;
    }

    // Evita loop de navegação
    if (this.isNavigating) {
      return;
    }

    this.isNavigating = true;
    window.location.hash = path;
    
    // Reseta o flag após um pequeno delay
    setTimeout(() => {
      this.isNavigating = false;
    }, 100);
  }

  /**
   * Trata a mudança de rota
   */
  handleRoute() {
    // Evita processamento durante navegação
    if (this.isNavigating) {
      return;
    }

    const hash = window.location.hash || '#/login';
    const route = hash.substring(1); // Remove o #

    // Verifica autenticação
    if (!auth.isAuthenticated() && route !== '/login') {
      this.navigate('/login');
      return;
    }

    // Se já está na página de login e não está autenticado, permite
    if (route === '/login' && !auth.isAuthenticated()) {
      this.currentRoute = route;
      const handler = this.routes[route];
      if (handler) {
        handler();
      }
      return;
    }

    // Verifica permissão de acesso
    if (!auth.canAccessRoute(hash)) {
      this.navigate('/dashboard');
      return;
    }

    // Executa o handler da rota
    const handler = this.routes[route];
    if (handler) {
      this.currentRoute = route;
      handler();
    } else if (route === '') {
      // Rota raiz - redireciona para login ou dashboard
      if (auth.isAuthenticated()) {
        this.navigate('/dashboard');
      } else {
        this.navigate('/login');
      }
    } else {
      // Rota não encontrada, redireciona para dashboard
      this.navigate('/dashboard');
    }
  }

  /**
   * Obtém a rota atual
   */
  getCurrentRoute() {
    return this.currentRoute;
  }
}

// Singleton instance
const router = new Router();

export default router;