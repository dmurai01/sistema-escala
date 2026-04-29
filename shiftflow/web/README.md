# ShiftFlow Web

Interface Web em HTML/CSS/JS puro para o sistema de escalas ShiftFlow.

## Descrição

Interface web responsiva para gerenciamento de escalas de trabalho. Segue o padrão SPA (Single Page Application) com hash routing.

## Pré-requisitos

- Um servidor estático (Live Server, http-server, etc.)
- Navegador moderno com suporte a ES6+

## Como Rodar

### Usando Live Server (VS Code)
1. Abra a pasta `web` no VS Code
2. Instale a extensão "Live Server"
3. Clique com o botão direito em `index.html` e selecione "Open with Live Server"

### Usando http-server
```bash
cd web
npx http-server .
```
Acesse `http://localhost:5500`

## Configuração da URL da API

A URL da API está configurada no topo do arquivo `assets/js/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000';
```

Se a API estiver rodando em outra porta ou endereço, altere esta variável.

## Estrutura de Pastas

```
web/
├── assets/
│   ├── css/
│   │   └── styles.css    # Estilos (industrial-refined)
│   └── js/
│       ├── api.js       # Wrapper de fetch() para a API
│       ├── auth.js      # Gerenciamento de autenticação
│       ├── router.js    # SPA com hash routing
│       ├── main.js      # Entry point
│       └── components/
│           ├── dashboard.js      # Dashboard principal
│           ├── monthly.js       # Visão mensal
│           ├── employee-panel.js # Painel do funcionário
│           └── admin-panel.js   # Painel admin
├── index.html
└── README.md
```

## Credenciais de Acesso

| Usuário | Senha | Role |
|---------|-------|------|
| admin | Admin@123 | admin |

## Telas e Funcionalidades

### Login (#/login)
- Formulário de autenticação
- Armazena JWT no sessionStorage
- Redireciona para dashboard após login

### Dashboard (#/dashboard)
- Bloco "Escala do Dia" com cards
- Card do próprio usuário destacado (borda âmbar)
- Bloco "Escala da Semana" com grade de 7 dias
- Ícone de alerta (🔔) em dias com eventos
- Sininho de notificações com badge de contagem

### Visão Mensal (#/monthly)
- Calendário mensal navegável (← →)
- Chips de funcionários por dia
- Ícone 🔔 para alertas com tooltip
- Clique no dia abre modal com detalhe dos turnos
- Filtro por funcionário (dropdown)
- Dias com escala do employee logado têm fundo diferenciado

### Minhas Escalas (#/my-schedules) - Apenas employee
- Lista "Próximas Escalas" com botões Aprovar / Reprovar
- Modal de reprovação com campo de texto obrigatório (mín. 20 chars)
- Histórico colapsável dos últimos 30 dias

### Painel Admin (#/admin) - Apenas admin
- **Abas:**
  - Escalas: criar, editar, excluir, filtrar
  - Usuários: criar, editar role, ativar/desativar
  - Alertas: criar, excluir
  - Notificações: central de reprovações com flag "Resolvido"

- **Botões de Export/Import:**
  - Exportar JSON: faz download do data.json completo
  - Importar JSON: upload de arquivo → POST para /api/admin/import

## Polling de Notificações

A cada 30 segundos, o sistema faz polling no endpoint `GET /api/notifications` para atualizar o badge de notificações não lidas.

## Design System

### Identidade Visual
- **Fundo:** Escuro (#0f0f0f)
- **Acento:** Âmbar (#F59E0B)
- **Tipografia:** DM Sans + Space Mono
- **Cards:** Bordas sutis, sombras suaves
- **Toasts:** Feedback de ações
- **Animações:** Fade suave

### Cores de Status
- **Pendente:** Amarelo (#eab308)
- **Aprovado:** Verde (#22c55e)
- **Reprovado:** Vermelho (#ef4444)

## Rotas e Permissões

| Rota | Acesso | Descrição |
|------|--------|-----------|
| #/login | Público | Login |
| #/dashboard | Autenticado | Dashboard principal |
| #/monthly | Autenticado | Visão mensal |
| #/my-schedules | Employee | Minhas escalas |
| #/admin | Admin | Painel admin |

- Usuários não autenticados são redirecionados para #/login
- Usuários com role `general` são redirecionados para #/dashboard
- Rotas de admin são restritas a role `admin`

## Tecnologias

- HTML5
- CSS3 (variáveis, grid, flexbox)
- JavaScript ES6+ (modules, async/await, fetch)
- Sem frameworks ou bibliotecas externas