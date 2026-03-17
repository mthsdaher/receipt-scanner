# Google OAuth Setup

Para habilitar "Sign in with Google" na página de login:

## 1. Criar credenciais no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Selecione ou crie um projeto
3. Clique em **Create Credentials** → **OAuth client ID**
4. Tipo: **Web application**
5. Nome: ex. "Receipt Scanner"
6. Em **Authorized redirect URIs**, adicione:
   - Local: `http://localhost:3002/api/auth/google/callback`
   - Produção: `https://seu-backend.com/api/auth/google/callback`
7. Copie o **Client ID** e **Client secret**

## 2. Configurar variáveis de ambiente

No `.env` ou `.env.development` do backend:

```
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
BACKEND_PUBLIC_URL=http://localhost:3002
```

Para produção, use a URL pública do backend em `BACKEND_PUBLIC_URL`.

## 3. Reiniciar o backend

Após configurar, reinicie o servidor. O botão "Sign in with Google" passará a redirecionar para o consentimento do Google.

## Fluxo

1. Usuário clica em "Sign in with Google"
2. Backend redireciona para Google
3. Usuário faz login no Google e autoriza
4. Google redireciona para `/api/auth/google/callback`
5. Backend cria ou encontra o usuário e redireciona para o frontend com o token JWT
6. Frontend armazena o token e redireciona para o dashboard
