# 🚀 v4.0.20 - Hotfix Athera Flex (05/DEZ/2025)

## 🎯 Problema
- Domingo: sem badge "🔄 Substituição"
- Sábado: cinza (órfão invisível)

## 🔧 Causa
1. API sobrescrevia `wasSubstitution` com `|| false` (apagava true)
2. Órfãos em array separado não renderizados pelo frontend

## ✅ Solução
1. Removido sobrescrita de campos (preservar banco)
2. Mesclar órfãos + workouts em array unificado

## 📊 Resultado
- ✅ Domingo: badge roxo visível
- ✅ Sábado: card verde "16.2km executados"
- ✅ Volume semanal correto

## 🔗 Deploy
- Commit: `b8c6c6d3` + `183a442e`
- Status: **DEPLOYED** (aguardar ~2-3 min)
- URL: https://atherarun.com

## 📝 Arquivos
- `app/api/plan/[planId]/weeks/route.ts` (linhas 75-113)
- `CHANGELOG.md` (v4.0.20)
- `CONTEXTO.md` (v4.0.20)

**Validar agora:** https://atherarun.com
