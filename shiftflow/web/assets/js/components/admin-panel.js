/**
 * Admin Panel Component - Painel administrativo completo
 */

import api from '../api.js';
import auth from '../auth.js';

class AdminPanel {
  constructor(container) {
    this.container = container;
    this.schedules = [];
    this.users = [];
    this.alerts = [];
    this.notifications = [];
    this.currentTab = 'schedules';
  }

  async render() {
    const user = auth.getCurrentUser();
    
    this.container.innerHTML = `
      <div class="admin-panel">
        <header class="page-header">
          <div class="header-content">
            <h1>Painel Admin</h1>
            <div class="header-actions">
              <button class="back-btn" id="backBtn">← Voltar</button>
            </div>
          </div>
        </header>

        <nav class="dashboard-nav">
          <a href="#/dashboard" class="nav-link">Dashboard</a>
          <a href="#/monthly" class="nav-link">Visão Mensal</a>
          <a href="#/admin" class="nav-link active">Painel Admin</a>
        </nav>

        <main class="admin-content">
          <div class="admin-tabs">
            <button class="tab-btn active" data-tab="schedules">Escalas</button>
            <button class="tab-btn" data-tab="users">Usuários</button>
            <button class="tab-btn" data-tab="alerts">Alertas</button>
            <button class="tab-btn" data-tab="notifications">
              Notificações
              <span class="badge" id="notificationBadge" style="display: none;">0</span>
            </button>
          </div>

          <div class="admin-actions">
            <button class="btn btn-primary" id="exportBtn">Exportar JSON</button>
            <button class="btn btn-secondary" id="importBtn">Importar JSON</button>
            <input type="file" id="importFile" accept=".json" style="display: none;">
          </div>

          <div class="tab-content" id="schedulesTab">
            <div class="tab-header">
              <h2>Gestão de Escalas</h2>
              <button class="btn btn-primary" id="addScheduleBtn">+ Nova Escala</button>
            </div>
            <div class="filters">
              <input type="date" id="scheduleDateFilter" placeholder="Filtrar por data">
              <select id="scheduleEmployeeFilter">
                <option value="">Todos os funcionários</option>
              </select>
            </div>
            <div class="data-table" id="schedulesTable">
              <div class="loading">Carregando...</div>
            </div>
          </div>

          <div class="tab-content" id="usersTab" style="display: none;">
            <div class="tab-header">
              <h2>Gestão de Usuários</h2>
              <button class="btn btn-primary" id="addUserBtn">+ Novo Usuário</button>
            </div>
            <div class="data-table" id="usersTable">
              <div class="loading">Carregando...</div>
            </div>
          </div>

          <div class="tab-content" id="alertsTab" style="display: none;">
            <div class="tab-header">
              <h2>Gestão de Alertas</h2>
              <button class="btn btn-primary" id="addAlertBtn">+ Novo Alerta</button>
            </div>
            <div class="data-table" id="alertsTable">
              <div class="loading">Carregando...</div>
            </div>
          </div>

          <div class="tab-content" id="notificationsTab" style="display: none;">
            <div class="tab-header">
              <h2>Central de Reprovações</h2>
            </div>
            <div class="data-table" id="notificationsTable">
              <div class="loading">Carregando...</div>
            </div>
          </div>
        </main>

        <!-- Modal para Escalas -->
        <div class="modal" id="scheduleModal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="scheduleModalTitle">Nova Escala</h3>
              <button class="close-btn" id="closeScheduleModal">×</button>
            </div>
            <div class="modal-body">
              <form id="scheduleForm">
                <input type="hidden" id="scheduleId">
                <div class="form-group">
                  <label>Funcionário</label>
                  <select id="scheduleEmployee" required></select>
                </div>
                <div class="form-group">
                  <label>Data</label>
                  <input type="date" id="scheduleDate" required>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Início</label>
                    <input type="time" id="scheduleStartTime" step="1800" required>
                  </div>
                  <div class="form-group">
                    <label>Fim</label>
                    <input type="time" id="scheduleEndTime" step="1800" required>
                  </div>
                </div>
                <div class="form-group">
                  <label>Cargo</label>
                  <input type="text" id="schedulePosition" required>
                </div>
                <div class="form-group">
                  <label>Observações</label>
                  <textarea id="scheduleNotes" rows="3"></textarea>
                </div>
                <div class="modal-actions">
                  <button type="button" class="btn btn-secondary" id="cancelSchedule">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Modal para Usuários -->
        <div class="modal" id="userModal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="userModalTitle">Novo Usuário</h3>
              <button class="close-btn" id="closeUserModal">×</button>
            </div>
            <div class="modal-body">
              <form id="userForm">
                <input type="hidden" id="userId">
                <div class="form-group">
                  <label>Nome</label>
                  <input type="text" id="userName" required>
                </div>
                <div class="form-group">
                  <label>Username</label>
                  <input type="text" id="userUsername" required>
                </div>
                <div class="form-group">
                  <label>Senha</label>
                  <input type="password" id="userPassword" required>
                </div>
                <div class="form-group">
                  <label>Role</label>
                  <select id="userRole" required>
                    <option value="employee">Funcionário</option>
                    <option value="admin">Administrador</option>
                    <option value="general">Geral</option>
                  </select>
                </div>
                <div class="modal-actions">
                  <button type="button" class="btn btn-secondary" id="cancelUser">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Modal para Alertas -->
        <div class="modal" id="alertModal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="alertModalTitle">Novo Alerta</h3>
              <button class="close-btn" id="closeAlertModal">×</button>
            </div>
            <div class="modal-body">
              <form id="alertForm">
                <input type="hidden" id="alertId">
                <div class="form-group">
                  <label>Data</label>
                  <input type="date" id="alertDate" required>
                </div>
                <div class="form-group">
                  <label>Título</label>
                  <input type="text" id="alertTitle" required>
                </div>
                <div class="form-group">
                  <label>Descrição</label>
                  <textarea id="alertDescription" rows="3" required></textarea>
                </div>
                <div class="form-group">
                  <label>Tipo</label>
                  <select id="alertType" required>
                    <option value="holiday">Feriado</option>
                    <option value="event">Evento</option>
                    <option value="high_traffic">Alto Movimento</option>
                  </select>
                </div>
                <div class="modal-actions">
                  <button type="button" class="btn btn-secondary" id="cancelAlert">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    await this.loadData();
  }

  bindEvents() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Back button
    document.getElementById('backBtn').addEventListener('click', () => {
      window.location.hash = '#/dashboard';
    });

    // Export/Import
    document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
    document.getElementById('importBtn').addEventListener('click', () => {
      document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));

    // Schedule modal
    document.getElementById('addScheduleBtn').addEventListener('click', () => this.openScheduleModal());
    document.getElementById('closeScheduleModal').addEventListener('click', () => this.closeModal('scheduleModal'));
    document.getElementById('cancelSchedule').addEventListener('click', () => this.closeModal('scheduleModal'));
    document.getElementById('scheduleForm').addEventListener('submit', (e) => this.saveSchedule(e));

    // User modal
    document.getElementById('addUserBtn').addEventListener('click', () => this.openUserModal());
    document.getElementById('closeUserModal').addEventListener('click', () => this.closeModal('userModal'));
    document.getElementById('cancelUser').addEventListener('click', () => this.closeModal('userModal'));
    document.getElementById('userForm').addEventListener('submit', (e) => this.saveUser(e));

    // Alert modal
    document.getElementById('addAlertBtn').addEventListener('click', () => this.openAlertModal());
    document.getElementById('closeAlertModal').addEventListener('click', () => this.closeModal('alertModal'));
    document.getElementById('cancelAlert').addEventListener('click', () => this.closeModal('alertModal'));
    document.getElementById('alertForm').addEventListener('submit', (e) => this.saveAlert(e));

    // Filters
    document.getElementById('scheduleDateFilter').addEventListener('change', () => this.renderSchedulesTable());
    document.getElementById('scheduleEmployeeFilter').addEventListener('change', () => this.renderSchedulesTable());
  }

  switchTab(tab) {
    this.currentTab = tab;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });

    document.getElementById(`${tab}Tab`).style.display = 'block';
  }

  async loadData() {
    try {
      const [schedules, users, alerts, notifications] = await Promise.all([
        api.getSchedules(),
        api.getUsers(),
        api.getAlerts(),
        api.getNotifications()
      ]);

      this.schedules = schedules;
      this.users = users;
      this.alerts = alerts;
      this.notifications = notifications;

      this.renderSchedulesTable();
      this.renderUsersTable();
      this.renderAlertsTable();
      this.renderNotificationsTable();
      this.updateNotificationBadge();
      this.populateEmployeeSelect();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  populateEmployeeSelect() {
    const employees = this.users.filter(u => u.role === 'employee');
    
    const scheduleSelect = document.getElementById('scheduleEmployee');
    scheduleSelect.innerHTML = employees.map(e => 
      `<option value="${e.id}">${e.name}</option>`
    ).join('');

    const filterSelect = document.getElementById('scheduleEmployeeFilter');
    filterSelect.innerHTML = '<option value="">Todos os funcionários</option>' +
      employees.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
  }

  renderSchedulesTable() {
    const dateFilter = document.getElementById('scheduleDateFilter').value;
    const employeeFilter = document.getElementById('scheduleEmployeeFilter').value;

    let filtered = this.schedules;
    if (dateFilter) {
      filtered = filtered.filter(s => s.date === dateFilter);
    }
    if (employeeFilter) {
      filtered = filtered.filter(s => s.employeeId === employeeFilter);
    }

    const container = document.getElementById('schedulesTable');
    
    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhuma escala encontrada</div>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Funcionário</th>
            <th>Cargo</th>
            <th>Horário</th>
            <th>Status</th>
            <th>Aprovado por</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(s => `
            <tr>
              <td>${this.formatDate(s.date)}</td>
              <td>${s.employee?.name || 'Desconhecido'}</td>
              <td>${s.position}</td>
              <td>${s.startTime} - ${s.endTime}</td>
              <td><span class="status ${this.getStatusClass(s.status)}">${this.getStatusLabel(s.status)}</span></td>
              <td>${this.getApprovedBy(s)}</td>
              <td>
                ${s.status === 'pending' ? `
                  <button class="btn-icon approve-btn" data-id="${s.id}" title="Aprovar">✅</button>
                  <button class="btn-icon reject-btn" data-id="${s.id}" title="Reprovar">❌</button>
                ` : ''}
                <button class="btn-icon edit-btn" data-id="${s.id}">✏️</button>
                <button class="btn-icon delete-btn" data-id="${s.id}">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    this.bindScheduleTableActions();
  }

  bindScheduleTableActions() {
    document.querySelectorAll('#schedulesTable .approve-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.approveSchedule(e.target.dataset.id));
    });

    document.querySelectorAll('#schedulesTable .reject-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.openRejectModal(e.target.dataset.id));
    });

    document.querySelectorAll('#schedulesTable .edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.editSchedule(e.target.dataset.id));
    });

    document.querySelectorAll('#schedulesTable .delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.deleteSchedule(e.target.dataset.id));
    });
  }

  async approveSchedule(id) {
    if (!confirm('Tem certeza que deseja APPROVAR esta escala?')) {
      return;
    }

    try {
      const result = await api.approveSchedule(id);
      alert('Escala aprovada com sucesso!');
      await this.loadData();
    } catch (error) {
      alert('Erro ao aprovar escala: ' + (error.message || 'Erro desconhecido'));
    }
  }

  openRejectModal(id) {
    const reason = prompt('Digite o motivo da reprovação (mínimo 20 caracteres):');
    if (!reason) return;
    
    if (reason.length < 20) {
      alert('O motivo deve ter pelo menos 20 caracteres.');
      return;
    }

    this.rejectSchedule(id, reason);
  }

  async rejectSchedule(id, reason) {
    try {
      const result = await api.rejectSchedule(id, reason);
      alert('Escala reprovada com sucesso!');
      await this.loadData();
    } catch (error) {
      alert('Erro ao reprovar escala: ' + (error.message || 'Erro desconhecido'));
    }
  }

  renderUsersTable() {
    const container = document.getElementById('usersTable');
    
    if (this.users.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum usuário encontrado</div>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Username</th>
            <th>Role</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${this.users.map(u => `
            <tr>
              <td>${u.name}</td>
              <td>${u.username}</td>
              <td>${this.getRoleLabel(u.role)}</td>
              <td><span class="status ${u.active ? 'status-approved' : 'status-rejected'}">${u.active ? 'Ativo' : 'Inativo'}</span></td>
              <td>
                <button class="btn-icon edit-btn" data-id="${u.id}">✏️</button>
                <button class="btn-icon delete-btn" data-id="${u.id}">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    this.bindUsersTableActions();
  }

  bindUsersTableActions() {
    document.querySelectorAll('#usersTable .edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.editUser(e.target.dataset.id));
    });

    document.querySelectorAll('#usersTable .delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.deleteUser(e.target.dataset.id));
    });
  }

  renderAlertsTable() {
    const container = document.getElementById('alertsTable');
    
    if (this.alerts.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum alerta encontrado</div>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Título</th>
            <th>Tipo</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${this.alerts.map(a => `
            <tr>
              <td>${this.formatDate(a.date)}</td>
              <td>${a.title}</td>
              <td><span class="alert-type ${a.type}">${this.getAlertTypeLabel(a.type)}</span></td>
              <td>${a.description}</td>
              <td>
                <button class="btn-icon delete-btn" data-id="${a.id}">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    this.bindAlertsTableActions();
  }

  bindAlertsTableActions() {
    document.querySelectorAll('#alertsTable .delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.deleteAlert(e.target.dataset.id));
    });
  }

  renderNotificationsTable() {
    const container = document.getElementById('notificationsTable');
    
    const rejectionNotifications = this.notifications.filter(n => n.type === 'rejection_alert');
    
    if (rejectionNotifications.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhuma reprovação registrada</div>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>De</th>
            <th>Mensagem</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${rejectionNotifications.map(n => `
            <tr>
              <td>${this.formatDate(n.createdAt)}</td>
              <td>${n.sender?.name || 'Desconhecido'}</td>
              <td>${n.message}</td>
              <td><span class="status ${n.resolved ? 'status-approved' : 'status-pending'}">${n.resolved ? 'Resolvido' : 'Pendente'}</span></td>
              <td>
                ${!n.resolved ? `<button class="btn-icon resolve-btn" data-id="${n.id}">✓</button>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    this.bindNotificationsTableActions();
  }

  bindNotificationsTableActions() {
    document.querySelectorAll('#notificationsTable .resolve-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.resolveNotification(e.target.dataset.id));
    });
  }

  // Schedule methods
  openScheduleModal(schedule = null) {
    document.getElementById('scheduleModalTitle').textContent = schedule ? 'Editar Escala' : 'Nova Escala';
    document.getElementById('scheduleId').value = schedule?.id || '';
    document.getElementById('scheduleEmployee').value = schedule?.employeeId || '';
    document.getElementById('scheduleDate').value = schedule?.date || '';
    
    // Define valores padrão com minutos 00 ou 30 para novas escalas
    const defaultStartTime = schedule?.startTime || this.getDefaultTime();
    const defaultEndTime = schedule?.endTime || this.getDefaultTime(1);
    
    document.getElementById('scheduleStartTime').value = defaultStartTime;
    document.getElementById('scheduleEndTime').value = defaultEndTime;
    document.getElementById('schedulePosition').value = schedule?.position || '';
    document.getElementById('scheduleNotes').value = schedule?.notes || '';
    document.getElementById('scheduleModal').style.display = 'block';
  }

  // Retorna hora com minutos 00 ou 30
  getDefaultTime(hoursOffset = 0) {
    const now = new Date();
    now.setHours(now.getHours() + hoursOffset);
    let hours = now.getHours();
    const minutes = now.getMinutes() < 30 ? 0 : 30;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  editSchedule(id) {
    const schedule = this.schedules.find(s => s.id === id);
    if (schedule) {
      this.openScheduleModal(schedule);
    }
  }

  async saveSchedule(e) {
    e.preventDefault();
    
    const id = document.getElementById('scheduleId').value;
    const data = {
      employeeId: document.getElementById('scheduleEmployee').value,
      date: document.getElementById('scheduleDate').value,
      startTime: document.getElementById('scheduleStartTime').value,
      endTime: document.getElementById('scheduleEndTime').value,
      position: document.getElementById('schedulePosition').value,
      notes: document.getElementById('scheduleNotes').value
    };

    try {
      if (id) {
        await api.updateSchedule(id, data);
        this.showToast('Escala atualizada com sucesso');
      } else {
        await api.createSchedule(data);
        this.showToast('Escala criada com sucesso');
      }
      this.closeModal('scheduleModal');
      await this.loadData();
    } catch (error) {
      this.showToast('Erro: ' + error.message, 'error');
    }
  }

  async deleteSchedule(id) {
    if (!confirm('Tem certeza que deseja excluir esta escala?')) return;
    
    try {
      await api.deleteSchedule(id);
      this.showToast('Escala excluída com sucesso');
      await this.loadData();
    } catch (error) {
      this.showToast('Erro: ' + error.message, 'error');
    }
  }

  // User methods
  openUserModal(user = null) {
    document.getElementById('userModalTitle').textContent = user ? 'Editar Usuário' : 'Novo Usuário';
    document.getElementById('userId').value = user?.id || '';
    document.getElementById('userName').value = user?.name || '';
    document.getElementById('userUsername').value = user?.username || '';
    document.getElementById('userPassword').value = '';
    document.getElementById('userRole').value = user?.role || 'employee';
    document.getElementById('userModal').style.display = 'block';
  }

  editUser(id) {
    const user = this.users.find(u => u.id === id);
    if (user) {
      this.openUserModal(user);
    }
  }

  async saveUser(e) {
    e.preventDefault();
    
    const id = document.getElementById('userId').value;
    const data = {
      name: document.getElementById('userName').value,
      username: document.getElementById('userUsername').value,
      password: document.getElementById('userPassword').value,
      role: document.getElementById('userRole').value
    };

    try {
      if (id) {
        await api.updateUser(id, data);
        this.showToast('Usuário atualizado com sucesso');
      } else {
        await api.createUser(data);
        this.showToast('Usuário criado com sucesso');
      }
      this.closeModal('userModal');
      await this.loadData();
    } catch (error) {
      this.showToast('Erro: ' + error.message, 'error');
    }
  }

  async deleteUser(id) {
    if (!confirm('Tem certeza que deseja desativar este usuário?')) return;
    
    try {
      await api.deleteUser(id);
      this.showToast('Usuário desativado com sucesso');
      await this.loadData();
    } catch (error) {
      this.showToast('Erro: ' + error.message, 'error');
    }
  }

  // Alert methods
  openAlertModal(alert = null) {
    document.getElementById('alertModalTitle').textContent = alert ? 'Editar Alerta' : 'Novo Alerta';
    document.getElementById('alertId').value = alert?.id || '';
    document.getElementById('alertDate').value = alert?.date || '';
    document.getElementById('alertTitle').value = alert?.title || '';
    document.getElementById('alertDescription').value = alert?.description || '';
    document.getElementById('alertType').value = alert?.type || 'event';
    document.getElementById('alertModal').style.display = 'block';
  }

  async saveAlert(e) {
    e.preventDefault();
    
    const id = document.getElementById('alertId').value;
    const data = {
      date: document.getElementById('alertDate').value,
      title: document.getElementById('alertTitle').value,
      description: document.getElementById('alertDescription').value,
      type: document.getElementById('alertType').value
    };

    try {
      if (id) {
        // Update não existe para alertas, então cria novo
        await api.createAlert(data);
        this.showToast('Alerta atualizado com sucesso');
      } else {
        await api.createAlert(data);
        this.showToast('Alerta criado com sucesso');
      }
      this.closeModal('alertModal');
      await this.loadData();
    } catch (error) {
      this.showToast('Erro: ' + error.message, 'error');
    }
  }

  async deleteAlert(id) {
    if (!confirm('Tem certeza que deseja excluir este alerta?')) return;
    
    try {
      await api.deleteAlert(id);
      this.showToast('Alerta excluído com sucesso');
      await this.loadData();
    } catch (error) {
      this.showToast('Erro: ' + error.message, 'error');
    }
  }

  // Notification methods
  async resolveNotification(id) {
    try {
      await api.resolveNotification(id);
      this.showToast('Notificação resolvida');
      await this.loadData();
    } catch (error) {
      this.showToast('Erro: ' + error.message, 'error');
    }
  }

  // Export/Import
  async exportData() {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shiftflow-data.json';
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('Dados exportados com sucesso');
    } catch (error) {
      this.showToast('Erro ao exportar: ' + error.message, 'error');
    }
  }

  async importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await api.importData(data);
      this.showToast('Dados importados com sucesso');
      await this.loadData();
    } catch (error) {
      this.showToast('Erro ao importar: ' + error.message, 'error');
    }

    e.target.value = '';
  }

  // Helpers
  closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
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

  getRoleLabel(role) {
    const labels = {
      admin: 'Administrador',
      employee: 'Funcionário',
      general: 'Geral'
    };
    return labels[role] || role;
  }

  getApprovedBy(schedule) {
    if (schedule.status === 'pending') {
      return '-';
    }
    
    if (schedule.status === 'approved') {
      return schedule.approvedByName || schedule.approvedBy || 'Aprovado';
    }
    
    if (schedule.status === 'rejected') {
      return schedule.rejectedByName || schedule.rejectedBy || 'Reprovado';
    }
    
    return '-';
  }

  getAlertTypeLabel(type) {
    const labels = {
      holiday: 'Feriado',
      event: 'Evento',
      high_traffic: 'Alto Movimento'
    };
    return labels[type] || type;
  }

  updateNotificationBadge() {
    const unread = this.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    
    if (unread > 0) {
      badge.textContent = unread;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
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

export default AdminPanel;