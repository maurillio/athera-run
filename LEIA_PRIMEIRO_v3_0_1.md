# ⚡ GUIA RÁPIDO - v3.0.1 Hotfix

**Data:** 13/NOV/2025  
**Commit:** 74e89fba  
**Status:** ⚠️ CÓDIGO DEPLOYADO - MIGRATION PENDENTE

---

## 🎯 O QUE FOI FEITO

✅ **Corrigido:**
- Traduções i18n (goalLabels.5k → 5km)
- Fases (phases.baseaerobica → Base)
- Pace display (min/km/km → min/km)

⏳ **Pendente:**
- Aplicar migration no banco Neon

---

## 🚨 AÇÃO URGENTE (5 minutos)

### 1. Acessar Neon Console
```
https://console.neon.tech/
```

### 2. Abrir SQL Editor
- Projeto: Athera Run
- Menu: SQL Editor

### 3. Executar Migration
```bash
# No seu terminal local:
cat /root/athera-run/apply-migration-neon.sql

# Copiar TODO o conteúdo
# Colar no SQL Editor do Neon
# Clicar em "Run"
```

### 4. Verificar Sucesso
As queries SELECT no final devem retornar:
- `custom_workouts`: 13 linhas
- `athlete_profiles`: 8 linhas

---

## ✅ DEPOIS DA MIGRATION

### Testar Geração de Plano:
```
1. Criar usuário: teste-v3.0.1@teste.com
2. Preencher onboarding
3. Gerar plano
4. Verificar: SEM erro "column does not exist"
```

### Testar Traduções:
```
1. Acessar /plano
2. Ver: "10km" ✅ (não goalLabels.10k)
3. Ver: "Base" ✅ (não phases.baseaerobica)  
4. Ver: "5:30 min/km" ✅ (não min/km/km)
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

**Leia nesta ordem:**

1. ⭐ `MIGRACAO_URGENTE_V3_0_1.md` - Detalhes completos
2. ⭐ `RESUMO_SESSAO_13NOV2025_PARTE4.md` - Resumo executivo
3. 📄 `CHANGELOG.md` - v3.0.1 entry

**Execute:**
- ⭐ `apply-migration-neon.sql` - No Neon SQL Editor

---

## 🆘 AJUDA

### Migration não funciona?
```bash
# Tentar via Vercel CLI:
vercel env pull
npx prisma migrate deploy
```

### Planos ainda quebrados?
Ver logs:
```
https://vercel.com/maurillio/atherarun/logs
Procurar: "column does not exist"
```

### Traduções ainda erradas?
```
Ctrl+Shift+R (limpar cache)
Aguardar 2-3 min (Vercel CDN)
```

---

## 📊 STATUS ATUAL

| Item | Status |
|------|--------|
| Código i18n | ✅ Deployado |
| Código pace | ✅ Deployado |
| Vercel deploy | ✅ Completo |
| **Database migration** | ⚠️ **PENDENTE** |
| Testes | ⏳ Após migration |

---

## 🎯 PRÓXIMO PASSO

**➡️ APLICAR MIGRATION NO NEON (5 min)**

Arquivo: `apply-migration-neon.sql`  
Local: Neon SQL Editor  
Impacto: ✅ Libera geração de planos

---

**Data:** 13/NOV/2025 18:15 UTC  
**Versão:** v3.0.1  
**Commit:** 74e89fba
