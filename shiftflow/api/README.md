# ShiftFlow API

Sistema de organização de escalas de trabalho via API REST.

## Descrição

API RESTful para gerenciamento de escalas de trabalho, usuários, alertas e notificações. Persistência de dados em arquivo JSON.

## Pré-requisitos

- Node.js 18+
- npm

## Instalação

```bash
cd api
npm install
```

## Como Rodar

### Modo Produção
```bash
npm start
```
O servidor estará disponível em `http://localhost:3000`

### Modo Desenvolvimento (com nodemon)
```bash
npm run dev
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (ou use o `.env.example` como base):

```env
JWT_SECRET=shiftflow-secret-key-2024
PORT=3000
WEB_ORIGIN=http://localhost:5500
```

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| JWT_SECRET | Chave secreta para assinatura do JWT | shiftflow-secret-key-2024 |
| PORT | Porta do servidor | 3000 |
| WEB_ORIGIN | Origem permitida para CORS | http://localhost:5500 |

## Documentação Swagger

Acesse a documentação interativa em: `http://localhost:3000/api-docs`

## Estrutura de Pastas

```
api/
├── src/
│   ├── routes/          # Rotas da API
│   │   ├── auth.js     # Autenticação (login, logout, me)
│   │   ├── users.js    # Gestão de usuários
│   │   ├── schedules.js # Gestão de escalas
│   │   ├── alerts.js   # Gestão de alertas
│   │   ├── notifications.js # Gestão de notificações
│   │   └── admin.js    # Utilitários admin (export/import)
│   ├── middlewares/    # Middlewares Express
│   │   ├── auth.middleware.js # Validação JWT
│   │   └── role.middleware.js # Verificação de role
│   ├── services/       # Serviços
│   │   └── storage.service.js # Leitura/escrita do data.json
│   ├── swagger/       # Configuração Swagger
│   │   └── swagger.js
│   └── app.js         # Aplicação principal
├── data/
│   └── data.json      # Arquivo de dados
├── package.json
└── README.md
```

## Sistema de Storage

O `storage.service.js` gerencia toda a persistência de dados:

- **Leitura**: O data.json é carregado na memória ao iniciar o servidor
- **Escrita**: Toda modificação é persistida imediatamente em disco
- **Fila**: Uma fila simples garante que apenas uma escrita ocorra por vez

## Endpoints Principais

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/login | Login (retorna JWT) |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Dados do usuário logado |

### Usuários (admin)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/users | Lista todos os usuários |
| POST | /api/users | Cria novo usuário |
| PUT | /api/users/:id | Atualiza usuário |
| DELETE | /api/users/:id | Desativa usuário |

### Escalas
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/schedules | Lista escalas (filtros: month, year, employeeId) |
| POST | /api/schedules | Cria escala (admin) |
| PUT | /api/schedules/:id | Edita escala (admin) |
| DELETE | /api/schedules/:id | Remove escala (admin) |
| PATCH | /api/schedules/:id/approve | Aprova escala (employee) |
| PATCH | /api/schedules/:id/reject | Reprova escala (employee, mín 20 chars) |

### Alertas
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/alerts | Lista alertas |
| POST | /api/alerts | Cria alerta (admin) |
| DELETE | /api/alerts/:id | Remove alerta (admin) |

### Notificações
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/notifications | Lista notificações |
| PATCH | /api/notifications/:id/read | Marca como lida |
| PATCH | /api/notifications/read-all | Marca todas como lidas |
| PATCH | /api/notifications/:id/resolve | Resolve notificação (admin) |

### Admin Utilities
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/admin/export | Exporta data.json completo |
| POST | /api/admin/import | Importa dados (substitui) |

## Credenciais Iniciais

| Usuário | Senha | Role |
|---------|-------|------|
| admin | Admin@123 | admin |
| carlos | (hash SHA-256) | employee |
| maria | (hash SHA-256) | employee |
| joao | (hash SHA-256) | employee |

## Como Exportar e Importar Dados

### Exportar
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/admin/export
```

### Importar
```bash
curl -X POST -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d @data.json http://localhost:3000/api/admin/import
```

## Tratamento de Erros

Todos os erros seguem o formato:
```json
{
  "error": true,
  "message": "Descrição do erro",
  "code": "ERROR_CODE"
}
```

Códigos de resposta: 200, 201, 400, 401, 403, 404, 500