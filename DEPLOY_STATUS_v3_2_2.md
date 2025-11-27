# 🚀 DEPLOY STATUS - v3.2.2 (Hotfix)

## ✅ MIGRATION APLICADA NO NEON

**Data:** 26/11/2025  
**Status:** ✅ Migration aplicada manualmente

### Campos adicionados:
```sql
-- ✅ AthleteProfile
stravaStats          Json?
stravaZones          Json?  
stravaGear           Json?

-- ✅ Activity  
isTargetRace         Boolean DEFAULT false
detectedAsTargetRace Boolean DEFAULT false
targetRaceConfidence Float?
```

---

## 🔄 DEPLOY EM ANDAMENTO

**Commit:** `3bcca0c7` - fix: sync prisma schema with strava migration v3.2.1  
**Push:** ✅ Enviado para GitHub  
**Vercel:** 🔄 Deploy automático iniciado

---

## 📋 O QUE FOI FEITO

1. ✅ Schema Prisma sincronizado com banco
2. ✅ Commit + Push realizado
3. 🔄 Aguardando build Vercel

---

## 🎯 PRÓXIMOS PASSOS

Aguardar ~2-3 minutos para:
1. Vercel fazer build
2. Deploy em produção
3. Testar geração de plano novamente

---

**Versão:** v3.2.2 (Hotfix - Strava Schema Sync)  
**Branch:** main
