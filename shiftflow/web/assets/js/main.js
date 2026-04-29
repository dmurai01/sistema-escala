/**
 * ShiftFlow Web - Main Entry Point
 * Inicializa o router e os componentes
 */

import router from './router.js';
import auth from './auth.js';
import Dashboard from './components/dashboard.js';
import MonthlyView from './components/monthly.js';
import EmployeePanel from './components/employee-panel.js';
import AdminPanel from './components/admin-panel.js';

// Referência ao container principal
const app = document.getElementById('app');

// Componentes
let dashboardComponent = null;
let monthlyComponent = null;
let employeePanelComponent = null;
let adminPanelComponent = null;

/**
 * Renderiza a tela de login
 */
function renderLogin() {
  app.innerHTML = `
    <div class="login-container">
      <div class="login-box">
        <div class="login-logo">
          <h1>ShiftFlow</h1>
          <p>Sistema de Organização de Escalas</p>
        </div>
        
        <div class="login-error" id="loginError"></div>
        
        <form class="login-form" id="loginForm">
          <div class="form-group">
            <label for="username">Usuário</label>
            <input type="text" id="username" name="username" required autocomplete="username">
          </div>
          
          <div class="form-group">
            <label for="password">Senha</label>
            <input type="password" id="password" name="password" required autocomplete="current-password">
          </div>
          
          <button type="submit" class="btn btn-primary">Entrar</button>
        </form>
        
        <p style="text-align: center; margin-top: 1.5rem; font-size: 0.75rem; color: var(--text-muted);">
          Credenciais padrão: admin / Admin@123
        </p>
      </div>
    </div>
  `;

  // Bind do form de login
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');
    
    try {
      const result = await auth.login(username, password);
      
      if (result.success) {
        // Redireciona diretamente para evitar problemas de timing
        window.location.hash = '#/dashboard';
      } else {
        errorEl.textContent = result.error;
        errorEl.classList.add('show');
      }
    } catch (error) {
      errorEl.textContent = 'Erro ao conectar com o servidor';
      errorEl.classList.add('show');
    }
  });
}

/**
 * Renderiza o dashboard
 */
function renderDashboard() {
  // Limpa componentes anteriores
  if (monthlyComponent) {
    monthlyComponent.destroy?.();
    monthlyComponent = null;
  }
  if (employeePanelComponent) {
    employeePanelComponent.destroy?.();
    employeePanelComponent = null;
  }
  if (adminPanelComponent) {
    adminPanelComponent.destroy?.();
    adminPanelComponent = null;
  }
  
  dashboardComponent = new Dashboard(app);
  dashboardComponent.render();
}

/**
 * Renderiza a visão mensal
 */
function renderMonthly() {
  // Limpa componentes anteriores
  if (dashboardComponent) {
    dashboardComponent.destroy?.();
    dashboardComponent = null;
  }
  if (employeePanelComponent) {
    employeePanelComponent.destroy?.();
    employeePanelComponent = null;
  }
  if (adminPanelComponent) {
    adminPanelComponent.destroy?.();
    adminPanelComponent = null;
  }
  
  monthlyComponent = new MonthlyView(app);
  monthlyComponent.render();
}

/**
 * Renderiza o painel do funcionário
 */
function renderMySchedules() {
  // Limpa componentes anteriores
  if (dashboardComponent) {
    dashboardComponent.destroy?.();
    dashboardComponent = null;
  }
  if (monthlyComponent) {
    monthlyComponent.destroy?.();
    monthlyComponent = null;
  }
  if (adminPanelComponent) {
    adminPanelComponent.destroy?.();
    adminPanelComponent = null;
  }
  
  employeePanelComponent = new EmployeePanel(app);
  employeePanelComponent.render();
}

/**
 * Renderiza o painel admin
 */
function renderAdmin() {
  // Limpa componentes anteriores
  if (dashboardComponent) {
    dashboardComponent.destroy?.();
    dashboardComponent = null;
  }
  if (monthlyComponent) {
    monthlyComponent.destroy?.();
    monthlyComponent = null;
  }
  if (employeePanelComponent) {
    employeePanelComponent.destroy?.();
    employeePanelComponent = null;
  }
  
  adminPanelComponent = new AdminPanel(app);
  adminPanelComponent.render();
}

// Registra as rotas no router
router.register('/login', renderLogin);
router.register('/dashboard', renderDashboard);
router.register('/monthly', renderMonthly);
router.register('/my-schedules', renderMySchedules);
router.register('/admin', renderAdmin);
router.register('/admin/users', renderAdmin);
router.register('/admin/alerts', renderAdmin);
router.register('/admin/notifications', renderAdmin);

// Inicializa o router
// O router vai verificar a hash atual e renderizar a rota apropriada