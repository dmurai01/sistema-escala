/**
 * Monthly View Component - Visão mensal do calendário
 */

import api from '../api.js';
import auth from '../auth.js';

class MonthlyView {
  constructor(container) {
    this.container = container;
    this.currentDate = new Date();
    this.schedules = [];
    this.alerts = [];
    this.users = [];
  }

  async render() {
    const user = auth.getCurrentUser();
    
    this.container.innerHTML = `
      <div class="monthly-view">
        <header class="page-header">
          <div class="header-content">
            <h1>Visão Mensal</h1>
            <div class="header-actions">
              <button class="notification-btn" id="notificationBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="badge" id="notificationBadge" style="display: none;">0</span>
              </button>
              <button class="back-btn" id="backBtn">← Voltar</button>
            </div>
          </div>
        </header>

        <nav class="dashboard-nav">
          <a href="#/dashboard" class="nav-link">Dashboard</a>
          <a href="#/monthly" class="nav-link active">Visão Mensal</a>
          ${user.role === 'employee' ? '<a href="#/my-schedules" class="nav-link">Minhas Escalas</a>' : ''}
          ${user.role === 'admin' ? '<a href="#/admin" class="nav-link">Painel Admin</a>' : ''}
        </nav>

        <main class="monthly-content">
          <div class="month-navigation">
            <button class="nav-btn" id="prevMonth">←</button>
            <h2 id="monthTitle">${this.getMonthYearLabel()}</h2>
            <button class="nav-btn" id="nextMonth">→</button>
          </div>

          <div class="filters">
            <label>
              Funcionário:
              <select id="employeeFilter">
                <option value="">Todos</option>
              </select>
            </label>
          </div>

          <div class="calendar-grid">
            <div class="calendar-header">
              <span>Dom</span>
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
            </div>
            <div class="calendar-body" id="calendarBody">
              <div class="loading">Carregando...</div>
            </div>
          </div>
        </main>

        <div class="modal" id="dayModal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="modalTitle">Detalhes do Dia</h3>
              <button class="close-btn" id="closeModal">×</button>
            </div>
            <div class="modal-body" id="modalBody">
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    await this.loadData();
  }

  getMonthYearLabel() {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${months[this.currentDate.getMonth()]} de ${this.currentDate.getFullYear()}`;
  }

  bindEvents() {
    document.getElementById('prevMonth').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
    });

    document.getElementById('backBtn').addEventListener('click', () => {
      window.location.hash = '#/dashboard';
    });

    document.getElementById('closeModal').addEventListener('click', () => {
      document.getElementById('dayModal').style.display = 'none';
    });

    document.getElementById('employeeFilter').addEventListener('change', () => {
      this.renderCalendar();
    });
  }

  async loadData() {
    try {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth() + 1;

      const [schedules, alerts, users] = await Promise.all([
        api.getSchedules({ year, month }),
        api.getAlerts({ year, month }),
        api.getUsers()
      ]);

      this.schedules = schedules;
      this.alerts = alerts;
      this.users = users;

      this.renderEmployeeFilter();
      this.renderCalendar();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  renderEmployeeFilter() {
    const select = document.getElementById('employeeFilter');
    const currentUser = auth.getCurrentUser();
    
    // Se for employee, mostra apenas ele mesmo
    if (currentUser.role === 'employee') {
      select.innerHTML = `<option value="${currentUser.id}">${currentUser.name}</option>`;
      select.value = currentUser.id;
      select.disabled = true;
    } else {
      select.innerHTML = '<option value="">Todos</option>' +
        this.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    }
  }

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const selectedEmployee = document.getElementById('employeeFilter')?.value || '';
    const currentUser = auth.getCurrentUser();

    let html = '';
    
    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < startDay; i++) {
      html += '<div class="calendar-day empty"></div>';
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const daySchedules = this.schedules.filter(s => s.date === dateStr);
      const dayAlerts = this.alerts.filter(a => a.date === dateStr);
      
      // Filtra por funcionário se selecionado
      const filteredSchedules = selectedEmployee 
        ? daySchedules.filter(s => s.employeeId === selectedEmployee)
        : daySchedules;

      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const hasOwnSchedule = daySchedules.some(s => s.employeeId === currentUser.id);
      const hasAlert = dayAlerts.length > 0;

      html += `
        <div class="calendar-day ${isToday ? 'today' : ''} ${hasOwnSchedule ? 'own-schedule' : ''}" 
             data-date="${dateStr}">
          <span class="day-number">${day}</span>
          <div class="day-chips">
            ${filteredSchedules.slice(0, 2).map(s => `
              <div class="day-chip" title="${s.employee?.name} - ${s.startTime} às ${s.endTime}">
                ${s.employee?.name?.charAt(0) || '?'}
              </div>
            `).join('')}
            ${filteredSchedules.length > 2 ? `<span class="more">+${filteredSchedules.length - 2}</span>` : ''}
          </div>
          ${hasAlert ? '<span class="alert-indicator" title="' + dayAlerts[0].title + '">🔔</span>' : ''}
        </div>
      `;
    }

    const calendarBody = document.getElementById('calendarBody');
    if (calendarBody) {
      calendarBody.innerHTML = html;
      
      // Adiciona event listeners aos dias
      calendarBody.querySelectorAll('.calendar-day:not(.empty)').forEach(day => {
        day.addEventListener('click', () => this.showDayDetails(day.dataset.date));
      });
    }
  }

  async showDayDetails(dateStr) {
    const daySchedules = this.schedules.filter(s => s.date === dateStr);
    const dayAlerts = this.alerts.filter(a => a.date === dateStr);
    const selectedEmployee = document.getElementById('employeeFilter')?.value || '';
    
    const filteredSchedules = selectedEmployee 
      ? daySchedules.filter(s => s.employeeId === selectedEmployee)
      : daySchedules;

    const date = new Date(dateStr + 'T00:00:00');
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    document.getElementById('modalTitle').textContent = 
      `${dayNames[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;

    let bodyHtml = '';

    if (dayAlerts.length > 0) {
      bodyHtml += '<div class="day-alerts"><h4>Alertas</h4>';
      dayAlerts.forEach(alert => {
        bodyHtml += `<div class="alert-item ${alert.type}">
          <strong>${alert.title}</strong>
          <p>${alert.description}</p>
        </div>`;
      });
      bodyHtml += '</div>';
    }

    if (filteredSchedules.length > 0) {
      bodyHtml += '<div class="day-schedules"><h4>Escalas</h4>';
      filteredSchedules.forEach(schedule => {
        const statusClass = this.getStatusClass(schedule.status);
        bodyHtml += `
          <div class="schedule-item">
            <div class="schedule-info">
              <strong>${schedule.employee?.name || 'Desconhecido'}</strong>
              <span>${schedule.position}</span>
            </div>
            <div class="schedule-time">
              <span>${schedule.startTime} - ${schedule.endTime}</span>
              <span class="status ${statusClass}">${this.getStatusLabel(schedule.status)}</span>
            </div>
            ${schedule.notes ? `<p class="notes">${schedule.notes}</p>` : ''}
          </div>
        `;
      });
      bodyHtml += '</div>';
    } else {
      bodyHtml += '<p class="empty">Nenhuma escala para este dia</p>';
    }

    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('dayModal').style.display = 'block';
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
}

export default MonthlyView;