/**
 * Dashboard Component - Tela principal após login
 */

import api from '../api.js';
import auth from '../auth.js';

class Dashboard {
  constructor(container) {
    this.container = container;
    this.schedules = [];
    this.alerts = [];
    this.notifications = [];
    this.pollingInterval = null;
  }

  async render() {
    const user = auth.getCurrentUser();
    
    this.container.innerHTML = `
      <div class="dashboard">
        <header class="dashboard-header">
          <div class="header-content">
            <h1>ShiftFlow</h1>
            <div class="header-actions">
              <button class="notification-btn" id="notificationBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="badge" id="notificationBadge" style="display: none;">0</span>
              </button>
              <div class="user-info">
                <span class="user-name">${user.name}</span>
                <span class="user-role">${this.getRoleLabel(user.role)}</span>
              </div>
              <button class="logout-btn" id="logoutBtn">Sair</button>
            </div>
          </div>
        </header>

        <nav class="dashboard-nav">
          <a href="#/dashboard" class="nav-link active">Dashboard</a>
          <a href="#/monthly" class="nav-link">Visão Mensal</a>
          ${user.role === 'employee' ? '<a href="#/my-schedules" class="nav-link">Minhas Escalas</a>' : ''}
          ${user.role === 'admin' ? '<a href="#/admin" class="nav-link">Painel Admin</a>' : ''}
        </nav>

        <main class="dashboard-content">
          <section class="today-section">
            <h2>Escala do Dia</h2>
            <div class="schedule-cards" id="todaySchedules">
              <div class="loading">Carregando...</div>
            </div>
          </section>

          <section class="week-section">
            <h2>Escala da Semana</h2>
            <div class="week-grid" id="weekGrid">
              <div class="loading">Carregando...</div>
            </div>
          </section>
        </main>
      </div>
    `;

    this.bindEvents();
    await this.loadData();
    this.startPolling();
  }

  getRoleLabel(role) {
    const labels = {
      admin: 'Administrador',
      employee: 'Funcionário',
      general: 'Geral'
    };
    return labels[role] || role;
  }

  bindEvents() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
      auth.logout();
    });

    document.getElementById('notificationBtn').addEventListener('click', () => {
      window.location.hash = '#/admin/notifications';
    });
  }

  async loadData() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [schedules, alerts, notifications] = await Promise.all([
        api.getSchedules(),
        api.getAlerts(),
        api.getNotifications()
      ]);

      this.schedules = schedules;
      this.alerts = alerts;
      this.notifications = notifications;

      this.renderTodaySchedules();
      this.renderWeekGrid();
      this.updateNotificationBadge();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.showError('Erro ao carregar dados');
    }
  }

  renderTodaySchedules() {
    const today = new Date().toISOString().split('T')[0];
    const todaySchedules = this.schedules.filter(s => s.date === today);
    const user = auth.getCurrentUser();

    const container = document.getElementById('todaySchedules');
    
    if (todaySchedules.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhuma escala para hoje</div>';
      return;
    }

    // Ordena as escalas por horário de entrada
    const sortedSchedules = [...todaySchedules].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });

    container.innerHTML = sortedSchedules.map(schedule => {
      const isOwn = schedule.employeeId === user.id;
      const statusClass = this.getStatusClass(schedule.status);
      
      return `
        <div class="schedule-card ${isOwn ? 'own-schedule' : ''}">
          <div class="schedule-header">
            <span class="employee-name">${schedule.employee?.name || 'Desconhecido'}</span>
            <span class="schedule-status ${statusClass}">${this.getStatusLabel(schedule.status)}</span>
          </div>
          <div class="schedule-details">
            <span class="position">${schedule.position}</span>
            <span class="time">${schedule.startTime} - ${schedule.endTime}</span>
          </div>
          ${schedule.notes ? `<div class="schedule-notes">${schedule.notes}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  renderWeekGrid() {
    const container = document.getElementById('weekGrid');
    const days = this.getWeekDays();
    
    let html = '';
    days.forEach(day => {
      const daySchedules = this.schedules.filter(s => s.date === day.date);
      const dayAlerts = this.alerts.filter(a => a.date === day.date);
      const hasAlert = dayAlerts.length > 0;
      const isToday = day.isToday;

      html += `
        <div class="week-day ${isToday ? 'today' : ''}">
          <div class="day-header">
            <span class="day-name">${day.dayName}</span>
            <span class="day-date">${day.dayNumber}</span>
            ${hasAlert ? '<span class="alert-icon">🔔</span>' : ''}
          </div>
          <div class="day-schedules">
            ${daySchedules.length === 0 ? '<span class="no-schedule">-</span>' : 
              daySchedules.slice(0, 3).map(s => `
                <div class="schedule-chip" title="${s.employee?.name} - ${s.startTime} às ${s.endTime}">
                  ${s.employee?.name?.split(' ')[0] || ''}
                </div>
              `).join('')
            }
            ${daySchedules.length > 3 ? `<div class="more-schedules">+${daySchedules.length - 3}</div>` : ''}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  getWeekDays() {
    const days = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: dayNames[i],
        dayNumber: date.getDate(),
        isToday: date.toISOString().split('T')[0] === today.toISOString().split('T')[0]
      });
    }

    return days;
  }

  getStatusClass(status) {
    const classes = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    };
    return classes[status] || '';
  }

  getStatusLabel(status) {
    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Reprovado'
    };
    return labels[status] || status;
  }

  updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    
    const unread = this.notifications ? this.notifications.filter(n => !n.read).length : 0;
    
    if (unread > 0) {
      badge.textContent = unread;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }

  startPolling() {
    this.pollingInterval = setInterval(async () => {
      try {
        const notifications = await api.getNotifications();
        this.notifications = notifications;
        this.updateNotificationBadge();
      } catch (error) {
        console.error('Erro no polling de notificações:', error);
      }
    }, 30000);
  }

  showError(message) {
    const container = document.getElementById('todaySchedules');
    container.innerHTML = `<div class="error-state">${message}</div>`;
  }

  destroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}

export default Dashboard;