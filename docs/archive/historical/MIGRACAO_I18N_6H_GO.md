# 🚀 MIGRAÇÃO i18n COMPLETA - PLANO 6 HORAS

**Hora Atual:** 14:30 UTC (11:30 BRT)  
**Término Estimado:** 20:30 UTC (17:30 BRT)  
**Objetivo:** 43% → 100% i18n

---

## ⏰ CRONOGRAMA EXECUTIVO

### **14:30-14:40 | PREPARAÇÃO (10min)**
- Criar backup branch
- Validar build atual
- ☕ Preparar ambiente

### **14:40-14:50 | FASE 1: LIMPEZA (10min)**
- Deletar 6 rotas duplicadas
- Commit: "chore: remove duplicates"

### **14:50-16:00 | FASE 2A: TRACKING (70min)**
- Copiar estrutura
- Adicionar i18n hooks
- Extrair 130+ textos
- Traduzir PT/EN/ES
- Testar 3 idiomas

**🍕 PAUSA: 16:00-16:10**

### **16:10-17:30 | FASE 2B: TRAINING + CALCULATOR (80min)**
- training: 40min
- calculator: 25min
- chat (preparação): 15min

**☕ PAUSA: 17:30-17:40**

### **17:40-19:00 | FASE 3: CHAT + SUBSCRIPTION + NUTRITION (80min)**
- chat completo: 40min
- subscription: 25min
- nutrition (prep): 15min

**🥤 PAUSA: 19:00-19:10**

### **19:10-20:00 | FASE 4: FINAL BATCH (50min)**
- nutrition completo: 30min
- 6 rotas simples em batch: 20min
  - prevention, glossary, overtraining, pricing, admin

### **20:00-20:30 | FASE 5: FINALIZAÇÃO (30min)**
- Atualizar middleware (5min)
- Deletar rotas antigas (5min)
- Build final (5min)
- Commit massivo (5min)
- Deploy e testes (10min)

---

## 📊 MÉTRICAS

**Translation Keys:**
- Antes: 918 × 3 = 2,754 keys
- Depois: 1,800 × 3 = 5,400 keys
- **+882 keys por idioma**

**Rotas:**
- Antes: 6/17 (35%)
- Depois: 17/17 (100%) ✅

**Rotas a migrar:** 11
1. tracking ⭐ CRÍTICO
2. training
3. calculator
4. chat
5. subscription
6. nutrition
7. prevention
8. glossary
9. overtraining
10. pricing
11. admin

---

## 🎯 TEMPLATE DE MIGRAÇÃO (REUTILIZÁVEL)

```bash
# 1. COPIAR
cp -r app/ROTA app/[locale]/ROTA

# 2. ADICIONAR HOOKS (no page.tsx)
import { useLocale, useTranslations } from '@/lib/i18n/hooks';
const locale = useLocale();
const t = useTranslations('ROTA');

# 3. SUBSTITUIR TEXTOS
"Texto hardcoded" → {t('key')}

# 4. CRIAR TRADUÇÕES (3 idiomas)
lib/i18n/translations/pt-BR.json → adicionar seção "ROTA"
lib/i18n/translations/en.json
lib/i18n/translations/es.json

# 5. ATUALIZAR LINKS
router.push('/ROTA') → router.push(`/${locale}/ROTA`)
href="/ROTA" → href={`/${locale}/ROTA`}

# 6. TESTAR
/pt-BR/ROTA ✓
/en/ROTA ✓
/es/ROTA ✓

# 7. DELETAR ANTIGA (só no final!)
rm -rf app/ROTA
```

---

## 🛡️ CONTINGÊNCIA

**Se algo quebrar:**
```bash
# Rollback total
git checkout backup-pre-i18n-migration
git push origin main --force

# Rollback parcial (1 rota)
git checkout backup -- app/[locale]/ROTA_PROBLEMA
```

---

## ✅ CHECKLIST FINAL

- [ ] Backup criado
- [ ] 11 rotas migradas
- [ ] 882+ keys traduzidas × 3
- [ ] Middleware atualizado
- [ ] Rotas antigas deletadas
- [ ] Build passou
- [ ] Deploy OK
- [ ] Testes em 3 idiomas
- [ ] Sistema 100% i18n ✅

---

## 🚀 INICIAR AGORA

```bash
cd /root/athera-run
git checkout -b backup-pre-i18n-migration
git push origin backup-pre-i18n-migration
git checkout main

echo "✅ BACKUP CRIADO! INICIANDO MIGRAÇÃO... 🚀"
```

**AGUARDANDO SEU "GO!"** 💪

---

**Você está pronto para começar as 6 horas de migração?**

Digite **"GO!"** e eu começo a Fase 0 imediatamente! 🎯
