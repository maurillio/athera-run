# 🚨 HOTFIX v3.0.7 - Clear Cache and Force Redeploy

**Data:** 14/NOV/2025 - 00:04 UTC  
**Severidade:** CRÍTICA  
**Status:** 🔄 EM APLICAÇÃO

---

## 🔥 PROBLEMA

### Sintomas Reportados
- ❌ Site ainda retornando 401 no Safari (mobile)
- ❌ Mesmo após v3.0.6 aplicado
- ❌ Possível cache do Vercel ou CDN

### Análise
- v3.0.6 foi commitado: `96915a60`
- Código está correto (JWT puro em produção)
- Middleware está OK (apenas i18n redirect)
- **Suspeita:** Cache do Vercel ou CDN não foi limpo

---

## ✅ SOLUÇÃO

### 1. Force Rebuild no Vercel
```bash
# Trigger redeploy forçado
git commit --allow-empty -m "chore: force redeploy to clear cache v3.0.7"
git push origin main
```

### 2. Clear Cache no Vercel Dashboard
1. Acessar: https://vercel.com/atherarun
2. Ir em: Settings → Caching
3. Clicar: "Purge Cache"
4. Aguardar 1-2 minutos

### 3. Verificar Edge Config
```bash
# Garantir que não há middleware cache
# middleware.ts já está minimalista (apenas i18n)
```

---

## 📊 VERIFICAÇÃO

### Testes Mobile (Safari)
```
1. Fechar Safari completamente
2. Reabrir Safari
3. Acessar: https://atherarun.com
4. Resultado esperado: Redirect para /pt-BR (sem 401)
```

### Testes Desktop
```
1. Abrir aba anônima
2. Acessar: https://atherarun.com
3. Resultado esperado: Login page (sem 401)
```

### Check Vercel Logs
```bash
# Verificar se há 401 nos logs
vercel logs atherarun.com --since=1h
```

---

## 🔍 DEBUGGING

### Se 401 Persistir

#### 1. Verificar Auth Config
```typescript
// lib/auth.ts linha 56
// DEVE estar assim:
...(process.env.NODE_ENV === 'production' 
  ? {} 
  : { adapter: PrismaAdapter(prisma) }
)
```

#### 2. Verificar Middleware
```typescript
// middleware.ts
// DEVE ter APENAS i18n redirect
// SEM withAuth
// SEM PrismaClient
```

#### 3. Verificar Environment Variables
```bash
# No Vercel Dashboard
NEXTAUTH_URL=https://atherarun.com
NEXTAUTH_SECRET=[definido]
DATABASE_URL=[correto]
```

---

## 🚀 DEPLOY

### Commit
```bash
git commit: [aguardando]
git push: origin main
```

### Vercel
- Deploy automático: aguardando
- Build time: ~2-3 minutos
- Propagação CDN: ~1-2 minutos
- Total: ~5 minutos

---

## ✅ CHECKLIST

- [ ] Commit force redeploy
- [ ] Push para main
- [ ] Verificar build no Vercel
- [ ] Clear cache no Vercel Dashboard
- [ ] Testar no Safari (mobile)
- [ ] Testar no Chrome (desktop)
- [ ] Verificar logs (sem 401)
- [ ] Confirmar com usuário

---

## 📝 OBSERVAÇÕES

### Cache Layers
1. **Browser Cache:** Safari pode ter cached 401
2. **CDN Cache:** Vercel Edge pode ter cached response
3. **Function Cache:** Next.js pode ter cached auth check

### Solução Completa
- Force rebuild = limpa todos os caches
- Empty commit = força novo deployment ID
- CDN propagation = ~2 minutos

---

## 📞 PRÓXIMOS PASSOS

1. Aplicar force redeploy
2. Aguardar 5 minutos
3. Testar no Safari mobile
4. Se persistir: verificar env vars no Vercel
5. Última opção: rollback temporário

**Status:** 🔄 **AGUARDANDO DEPLOY**
