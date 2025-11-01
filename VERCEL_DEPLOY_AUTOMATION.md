# 🚀 AUTOMAÇÃO DE DEPLOY NO VERCEL

**Data:** 01/11/2025  
**Status:** Usando Vercel para deploy automático

---

## 📋 PROBLEMA IDENTIFICADO

O build local estava falhando por problemas de dependências e path resolution.
**Solução:** Usar Vercel que resolve dependências automaticamente.

---

## ✅ CONFIGURAÇÃO DO VERCEL

### 1. Projeto conectado ao GitHub
- **Repositório:** maurillio/athera-run
- **Branch:** main
- **Deploy automático:** Ativado

### 2. Configurações do Projeto

**Root Directory:** `nextjs_space`

**Build Command:**
```
npm install --legacy-peer-deps && npm run build
```

**Install Command:**
```
npm install --legacy-peer-deps
```

**Output Directory:** `.next`

---

## 🔧 PROBLEMAS COMUNS E SOLUÇÕES

### Problema: Module not found '@/components/...'

**Causa:** Path resolution no webpack  
**Solução:** Adicionar no `next.config.js`:

```javascript
webpack: (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.join(__dirname),
  };
  return config;
}
```

### Problema: STRIPE_SECRET_KEY not set during build

**Causa:** Stripe client sendo inicializado em build time  
**Solução:** Em `lib/stripe.ts`, permitir null durante build:

```typescript
export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
}) : null as any;
```

### Problema: useSearchParams() needs Suspense

**Causa:** Next.js 14+ requer Suspense para hooks que dependem de navegação  
**Solução:** Envolver componente em Suspense:

```tsx
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  );
}
```

---

## 🎯 WORKFLOW RECOMENDADO

1. **Fazer mudanças localmente**
2. **Testar com `npm run dev`**
3. **Commitar e push para GitHub**
4. **Vercel faz deploy automático**
5. **Verificar logs do Vercel se falhar**

### Não tentar:
- ❌ Build local em produção
- ❌ Resolver conflitos de dependências manualmente
- ❌ Instalar/desinstalar pacotes repetidamente

---

## 📊 MONITORAMENTO

### Ver logs do Vercel:
1. Acessar dashboard.vercel.com
2. Selecionar projeto "athera-run"
3. Ver "Deployments"
4. Clicar no deployment
5. Ver logs completos

### Status do build:
- ✅ Success: Deploy ok
- ⚠️ Building: Em progresso
- ❌ Failed: Ver logs para detalhes

---

## 🔑 VARIÁVEIS DE AMBIENTE

**IMPORTANTE:** Configurar no Vercel Dashboard:

```env
DATABASE_URL=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://seu-dominio.vercel.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REDIRECT_URI=https://seu-dominio.vercel.app/api/strava/callback
OPENAI_API_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_MONTHLY=...
STRIPE_PRICE_ANNUAL=...
NODE_ENV=production
```

---

## 🆘 SE O DEPLOY FALHAR NO VERCEL

1. **Ver logs completos** no Vercel Dashboard
2. **Identificar o erro específico:**
   - Module not found → Problema de path
   - Type error → Problema TypeScript
   - Environment variable → Falta variável
3. **Corrigir localmente**
4. **Commitar e push**
5. **Vercel tenta deploy novamente**

---

## ✅ CHECKLIST PRÉ-COMMIT

- [ ] `npm run dev` funciona localmente
- [ ] Não tem erros de TypeScript óbvios
- [ ] Imports estão corretos
- [ ] .env.example está atualizado
- [ ] Commit tem mensagem descritiva

---

**Última atualização:** 01/11/2025 20:56 UTC
