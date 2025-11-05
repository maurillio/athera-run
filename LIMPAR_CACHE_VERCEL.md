# 🔧 INSTRUÇÕES - Limpar Cache do Vercel Manualmente

**Problema:** Build continua falhando com erro de .env mesmo após remover arquivos  
**Causa:** Cache do Vercel ainda contém arquivos .env antigos da raiz do projeto

---

## ⚡ SOLUÇÃO RÁPIDA (2 minutos)

### Opção 1: Via Vercel Dashboard (Recomendado)

1. **Acesse:** https://vercel.com/[seu-usuario]/athera-run/settings/data-cache

2. **Clique em:** "Clear Data Cache" ou "Purge Cache"

3. **Aguarde** confirmação (poucos segundos)

4. **Force um novo deploy:**
   - Vá em: https://vercel.com/[seu-usuario]/athera-run/deployments
   - Clique no último deployment
   - Clique em "⋯" (três pontos)
   - Clique em "Redeploy"
   - ✅ Marque "Use existing Build Cache" = **OFF** (desligado)
   - Clique em "Redeploy"

---

### Opção 2: Via CLI (Se tiver Vercel CLI instalado)

```bash
vercel env pull
vercel build --force
vercel deploy --prod
```

---

### Opção 3: Temporariamente Desabilitar Build Command com Prisma

Se ainda falhar, faça isso TEMPORARIAMENTE:

1. **Vá em:** Vercel Dashboard > Settings > General

2. **Build & Development Settings:**
   - Build Command: `cd nextjs_space && npm install --force && npm run build`
   - (Remove `npx prisma generate && npx prisma migrate deploy` temporariamente)

3. **Salve** e force um redeploy

4. **Após build passar**, aplique migration manualmente:
   ```bash
   cd /root/athera-run/nextjs_space
   npx prisma migrate deploy
   ```

5. **Restaure** o build command original:
   ```
   cd nextjs_space && npm install --force && npx prisma generate && npx prisma migrate deploy && npm run build
   ```

---

## 🎯 O QUE DEVE ACONTECER

### Antes (❌ Erro):
```
10:21:26.340 Error: There is a conflict between env vars in ../.env and .env
10:21:26.341 Conflicting env vars:
10:21:26.341   STRAVA_CLIENT_ID
10:21:26.341   GOOGLE_CLIENT_ID
```

### Depois (✅ Sucesso):
```
✓ Prisma generate completed
✓ Migrations deployed successfully
✓ Build completed
✓ Deployed to production
```

---

## 📞 VERIFICAR APÓS LIMPAR CACHE

1. ✅ Build passou sem erro de .env
2. ✅ Migrations aplicadas
3. ✅ Deploy concluído
4. ✅ Site funcionando: https://atherarun.com
5. ✅ Datas em português: "terça-feira, 5 de novembro"

---

**IMPORTANTE:** Após o cache ser limpo, os próximos deploys funcionarão automaticamente.
O problema é **apenas no cache antigo** que contém o .env da raiz.

