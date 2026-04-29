# ShiftFlow - Sistema de Organização de Escalas de Trabalho

Sistema completo para gerenciamento de escalas de trabalho, composto por uma API REST e uma interface Web.

## 📁 Estrutura do Projeto

```
shiftflow/
├── api/                    # API REST (Node.js + Express)
│   ├── src/
│   │   ├── routes/        # Endpoints da API
│   │   ├── middlewares/   # Middlewares de autenticação
│   │   ├── services/      # Serviços de storage
│   │   └── app.js         # Aplicação principal
│   ├── data/
│   │   └── data.json      # Banco de dados JSON
│   ├── package.json
│   └── README.md
│
└── web/                    # Interface Web (HTML/CSS/JS)
    ├── assets/
    │   ├── css/          # Estilos
    │   └── js/           # Scripts e componentes
    ├── index.html
    └── README.md
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm

---

### 1. API (Porta 3000)

```bash
# Acessar a pasta da API
cd shiftflow/api

# Instalar dependências
npm install

# Iniciar o servidor
npm start
```

A API estará disponível em: `http://localhost:3000`

Documentação Swagger: `http://localhost:3000/api-docs`

---

### 2. Interface Web (Porta 5500)

```bash
# Acessar a pasta Web
cd shiftflow/web

# Iniciar servidor estático
npx http-server .
```

A interface estará disponível em: `http://localhost:5500`

---

## 🔑 Credenciais de Acesso

| Usuário | Senha | Role |
|---------|-------|------|
| admin | Admin@123 | admin |

---

## 📡 Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário atual

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Detalhes do usuário
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Excluir usuário

### Escalas
- `GET /api/shifts` - Listar escalas
- `GET /api/shifts/:id` - Detalhes da escala
- `POST /api/shifts` - Criar escala
- `PUT /api/shifts/:id` - Atualizar escala
- `DELETE /api/shifts/:id` - Excluir escala

### Turnos
- `GET /api/shifts/:shiftId/shifts` - Listar turnos de uma escala
- `POST /api/shifts/:shiftId/shifts` - Criar turno
- `PUT /api/shifts/:shiftId/shifts/:id` - Atualizar turno
- `DELETE /api/shifts/:shiftId/shifts/:id` - Excluir turno

---

## 🛠️ Tecnologias

### Backend
- Node.js
- Express.js
- JWT (JSON Web Tokens)
- SHA-256 (hash de senhas)

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)
- Hash-based SPA routing

### Armazenamento
- data.json (arquivo único)

---

## 📄 Licença

MIT