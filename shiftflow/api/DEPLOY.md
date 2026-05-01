# Guia de Deploy - ShiftFlow API no Render

## Opção 1: Deploy via Git (Recomendado)

### Passo 1: Criar conta no Render
1. Acesse [render.com](https://render.com)
2. Clique em "Start Free" ou "Sign Up"
3. Conecte com sua conta do GitHub

### Passo 2: Criar novo Web Service
1. No dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Na próxima tela, procure pelo repositório `sistema-escala`
3. Selecione o repositório

### Passo 3: Configurar o deploy
Preencha os campos:

| Campo | Valor |
|-------|-------|
| Name | `shiftflow-api` |
| Environment | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Plan | `Free` |

### Passo 4: Variáveis de ambiente
Clique em **"Advanced"** → **"Add Environment Variables"**:

```
NODE_ENV = production
```

### Passo 5: Deploy
1. Clique em **"Create Web Service"**
2. Aguarde o build terminar (pode levar 1-2 minutos)
3. Quando finalizar, você verá uma URL como: `https://shiftflow-api.onrender.com`

---

## Opção 2: Deploy via render.yaml (Automático)

### Pré-requisito
- Ter o arquivo `render.yaml` na pasta `shiftflow/api/`

### Passos
1. No dashboard do Render, clique em **"New +"** → **"Blueprint"**
2. Selecione seu repositório
3. O Render detectará automaticamente o `render.yaml`
4. Clique em **"Apply"**

---

## Após o deploy

### 1. Testar a API
Acesse: `https://seu-app.onrender.com/api/auth/login`

### 2. Atualizar o config.js do frontend
Edite o arquivo `shiftflow/web/assets/js/config.js`:

```javascript
env: 'production',
apiUrls: {
  development: 'http://127.0.0.1:3000',
  production: 'https://SEU-APPS-NO-RENDER.onrender.com'
}
```

### 3. Fazer push para o GitHub
```bash
git add .
git commit -m "Configure production API URL"
git push origin main
```

---

## Observações importantes

### Persistência de dados
O Render **apaga o filesystem** a cada deploy ou quando o serviço dorme. Os dados em `data.json` serão perdidos.

**Solução recomendada**: Usar um banco de dados externo como:
- **Render PostgreSQL** (gratuito)
- **MongoDB Atlas** (gratuito)

### Alternativa sem banco de dados
Se quiser manter sem banco externo, considere:
- Exportar/importar dados manualmente
- Usar o sistema apenas localmente

---

## Troubleshooting

### "Service failed to build"
- Verifique se o `package.json` tem o comando `start` correto
- Certifique-se que as dependências estão corretas

### "502 Bad Gateway"
- A API pode estar dormindo (serviço gratuito desativa após 15 min de inatividade)
- Na primeira requisição pode demorar alguns segundos

### Dados perdidos após deploy
- É esperado no plano gratuito do Render
- Considere adicionar um banco de dados PostgreSQL