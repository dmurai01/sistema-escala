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
- `GET /api/auth/me` - Dados do usuário

### Escalas
- `GET /api/schedules` - Listar escalas
- `POST /api/schedules` - Criar escala (admin)
- `PATCH /api/schedules/:id/approve` - Aprovar escala
- `PATCH /api/schedules/:id/reject` - Reprovar escala

### Usuários
- `GET /api/users` - Listar usuários (admin)
- `POST /api/users` - Criar usuário (admin)

### Alertas
- `GET /api/alerts` - Listar alertas
- `POST /api/alerts` - Criar alerta (admin)

### Admin
- `GET /api/admin/export` - Exportar dados
- `POST /api/admin/import` - Importar dados

---

## 🛠️ Tecnologias

### API
- Node.js
- Express.js
- JWT (autenticação)
- SHA-256 (hash de senhas)
- Swagger (documentação)

### Web
- HTML5
- CSS3
- JavaScript ES6+
- Fetch API

---

## 📝 Licença

ISC