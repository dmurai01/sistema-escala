/**
 * Employee Panel Component - Painel do funcionário para gerenciar suas escalas
 */

import api from '../api.js';
import auth from '../auth.js';

class EmployeePanel {
  constructor(container) {
    this.container = container;
    this.schedules = [];
  }

  async render() {
    const user = auth.getCurrentUser();
    
    this.container.innerHTML = `
      <div class="employee-panel">
        <header class="page-header">
          <div class="header-content">
            <h1>Minhas Escalas</h1>
            <div class="header-actions">
              <button class="back-btn" id="backBtn">← Voltar</button>
            </div>
          </div>
        </header>

        <nav class="dashboard-nav">
          <a href="#/dashboard" class="nav-link">Dashboard</a>
          <a href="#/monthly" class="nav-link">Visão Mensal</a>
          <a href="#/my-schedules" class="nav-link active">Minhas Escalas</a>
        </nav>

        <main class="panel-content">
          <section class="upcoming-section">
            <h2>Próximas Escalas</h2>
            <div class="schedule-list" id="upcomingSchedules">
              <div class="loading">Carregando...</div>
            </div>
          </section>

          <section class="history-section">
            <h2>Histórico (últimos 30 dias)</h2>
            <button class="toggle-btn" id="toggleHistory">Mostrar Histórico</button>
            <div class="schedule-list history-list" id="historySchedules" style="display: none;">
              <div class="loading">Carregando...</div>
            </div>
          </section>
        </main>

        <div class="modal" id="rejectModal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Reprovar Escala</h3>
              <button class="close-btn" id="closeRejectModal">×</button>
            </div>
            <div class="modal-body">
              <p>Informe o motivo da reprovação (mínimo 20 caracteres):</p>
              <textarea id="rejectReason" rows="4" placeholder="Digite o motivo da reprovação..."></textarea>
              <p class="char-count"><span id="charCount">0</span>/20 caracteres</p>
              <div class="modal-actions">
                <button class="btn btn-secondary" id="cancelReject">Cancelar</button>
                <button class="btn btn-danger" id="confirmReject" disabled>Reprovar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    await this.loadData();
  }

  bindEvents() {
    document.getElementById('backBtn').addEventListener('click', () => {
      window.location.hash = '#/dashboard';
    });

    document.getElementById('toggleHistory').addEventListener('click', () => {
      const historyList = document.getElementById('historySchedules');
      const btn = document.getElementById('toggleHistory');
      if (historyList.style.display === 'none') {
        historyList.style.display = 'block';
        btn.textContent = 'Ocultar Histórico';
      } else {
        historyList.style.display = 'none';
        btn.textContent = 'Mostrar Histórico';
      }
    });

    document.getElementById('closeRejectModal').addEventListener('click', () => {
      document.getElementById('rejectModal').style.display = 'none';
    });

    document.getElementById('cancelReject').addEventListener('click', () => {
      document.getElementById('rejectModal').style.display = 'none';
    });

    document.getElementById('rejectReason').addEventListener('input', (e) => {
      const count = e.target.value.length;
      document.getElementById('charCount').textContent = count;
      document.getElementById('confirmReject').disabled = count < 20;
    });
  }

  async loadData() {
    try {
      const schedules = await api.getSchedules();
      this.schedules = schedules;
      
      this.renderUpcomingSchedules();
      this.renderHistorySchedules();
    } catch (error) {
      console.error('Erro ao carregar escalas:', error);
    }
  }

  renderUpcomingSchedules() {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = this.schedules
      .filter(s => s.date >= today && s.status === 'pending')
      .sort((a, b) => a.date.localeCompare(b.date));

    const container = document.getElementById('upcomingSchedules');
    
    if (upcoming.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhuma escala pendente</div>';
      return;
    }

    container.innerHTML = upcoming.map(schedule => `
      <div class="schedule-item" data-id="${schedule.id}">
        <div class="schedule-date">
          <span class="date">${this.formatDate(schedule.date)}</span>
          <span class="time">${schedule.startTime} - ${schedule.endTime}</span>
        </div>
        <div class="schedule-info">
          <span class="position">${schedule.position}</span>
          ${schedule.notes ? `<span class="notes">${schedule.notes}</span>` : ''}
        </div>
        <div class="schedule-actions">
          <button class="btn btn-success approve-btn" data-id="${schedule.id}">Aprovar</button>
          <button class="btn btn-danger reject-btn" data-id="${schedule.id}">Reprovar</button>
        </div>
      </div>
    `).join('');

    this.bindScheduleActions();
  }

  renderHistorySchedules() {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const history = this.schedules
      .filter(s => s.date < today || s.status !== 'pending')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 20);

    const container = document.getElementById('historySchedules');
    
    if (history.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum histórico disponível</div>';
      return;
    }

    container.innerHTML = history.map(schedule => {
      const statusClass = this.getStatusClass(schedule.status);
      return `
        <div class="schedule-item">
          <div class="schedule-date">
            <span class="date">${this.formatDate(schedule.date)}</span>
            <span class="time">${schedule.startTime} - ${schedule.endTime}</span>
          </div>
          <div class="schedule-info">
            <span class="position">${schedule.position}</span>
            ${schedule.notes ? `<span class="notes">${schedule.notes}</span>` : ''}
          </div>
          <div class="schedule-status">
            <span class="status ${statusClass}">${this.getStatusLabel(schedule.status)}</span>
          </div>
          ${schedule.rejectionReason ? `<div class="rejection-reason">Motivo: ${schedule.rejectionReason}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  bindScheduleActions() {
    document.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await this.approveSchedule(id);
      });
    });

    document.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.openRejectModal(id);
      });
    });
  }

  openRejectModal(scheduleId) {
    this.currentScheduleId = scheduleId;
    document.getElementById('rejectReason').value = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('confirmReject').disabled = true;
    document.getElementById('rejectModal').style.display = 'block';

    document.getElementById('confirmReject').onclick = () => this.confirmReject();
  }

  async confirmReject() {
    const reason = document.getElementById('rejectReason').value;
    if (reason.length < 20) return;

    try {
      await api.rejectSchedule(this.currentScheduleId, reason);
      document.getElementById('rejectModal').style.display = 'none';
      this.showToast('Escala reprovada com sucesso');
      await this.loadData();
    } catch (error) {
      this.showToast('Erro ao reprovar escala: ' + error.message, 'error');
    }
  }

  async approveSchedule(id) {
    try {
      await api.approveSchedule(id);
      this.showToast('Escala aprovada com sucesso');
      await this.loadData();
    } catch (error) {
      this.showToast('Erro ao aprovar escala: ' + error.message, 'error');
    }
  }

  formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];
    return `${dayOfWeek}, ${day}/${month}`;
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

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

export default EmployeePanel;