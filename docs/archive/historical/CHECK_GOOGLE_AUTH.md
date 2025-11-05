# 🔍 CHECKLIST - Google OAuth Fix

## 1. Google Cloud Console (CRÍTICO ⚠️)

Acesse: https://console.cloud.google.com/apis/credentials

### Projeto: Athera Run

#### Origens JavaScript Autorizadas:
```
https://atherarun.com
```

#### URIs de Redirecionamento Autorizados (ADICIONAR TODOS):
```
https://atherarun.com/api/auth/callback/google
https://atherarun.com/pt-BR/api/auth/callback/google
https://atherarun.com/en/api/auth/callback/google
https://atherarun.com/es/api/auth/callback/google
```

**⚠️ IMPORTANTE:** 
- Clique em "ADD URI" para cada uma
- Salve as alterações
- Aguarde 1-2 minutos para propagar

---

## 2. Vercel Environment Variables

Acesse: https://vercel.com/[seu-projeto]/settings/environment-variables

### Verificar se existem:

```bash
NEXTAUTH_URL=https://atherarun.com
NEXTAUTH_SECRET=[seu-secret]
GOOGLE_CLIENT_ID=[seu-client-id]
GOOGLE_CLIENT_SECRET=[seu-client-secret]
```

**⚠️ ATENÇÃO:**
- NEXTAUTH_URL deve ser EXATAMENTE: `https://atherarun.com`
- Sem trailing slash (/)
- Sem locale (pt-BR, en, es)

---

## 3. Testar Localmente (Opcional)

```bash
cd nextjs_space

# Criar .env.local
cat > .env.local << 'ENV'
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret-local
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
DATABASE_URL=postgresql://...
ENV

# Rodar
yarn dev

# Testar em: http://localhost:3000/login
```

---

## 4. Deploy e Teste

```bash
# Commit middleware fix
git add .
git commit -m "fix(auth): update middleware to allow OAuth callbacks"
git push origin main

# Aguardar deploy Vercel (2-3 min)
# Testar em: https://atherarun.com/login
```

---

## 5. Troubleshooting

### Se ainda der erro:

#### A) Verificar logs Vercel
- https://vercel.com/[seu-projeto]/logs
- Procurar por: `[AUTH]` ou `callback`

#### B) Testar callback manualmente
```
https://atherarun.com/api/auth/callback/google?code=test
```
Deve retornar erro de "invalid code", mas confirma que rota existe

#### C) Verificar cookies
- Abrir DevTools > Application > Cookies
- Limpar cookies de atherarun.com
- Tentar login novamente

#### D) Verificar se Google Client ID está correto
```bash
# No Vercel dashboard, verificar se GOOGLE_CLIENT_ID
# corresponde ao ID no Google Cloud Console
```

---

## 6. Depois de Funcionar

### Remover URIs antigas/desnecessárias
No Google Cloud Console, manter apenas:
```
https://atherarun.com/api/auth/callback/google
```

(As com locale podem ser removidas depois se não forem usadas)

---

## Status Atual:
- [ ] Google Cloud Console atualizado
- [ ] Vercel env vars verificadas
- [ ] Middleware atualizado e deployed
- [ ] Teste de login funcionando
