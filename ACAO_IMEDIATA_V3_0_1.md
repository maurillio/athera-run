# 🚨 AÇÃO IMEDIATA - v3.0.1 Migration

**Status**: ⚠️ CRÍTICO - Banco desatualizado  
**Tempo estimado**: 5 minutos  
**Impacto**: Resolve 100% dos erros de geração de plano

---

## 🎯 PROBLEMA ATUAL

```
ERROR: relation "custom_workouts" does not exist
The column `custom_workouts.warmUpStructure` does not exist
```

**Causa raiz**: Migration v2.0.0 + v3.0.0 não foi aplicada no Neon.

---

## ✅ SOLUÇÃO (3 passos)

### 📍 PASSO 1: Aplicar Migration no Neon (2 min)

1. Acesse: https://console.neon.tech/
2. Selecione projeto **"Athera Run"**
3. Clique em **"SQL Editor"**
4. Abra o arquivo: `neon-migration-v3.0.1-SAFE.sql`
5. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
6. **Cole** no SQL Editor
7. Clique em **"Run"** (ou Ctrl+Enter)

**✅ Sucesso se ver**:
- 13 linhas retornadas (custom_workouts)
- 8 linhas retornadas (athlete_profiles)

---

### 📍 PASSO 2: Fazer Deploy (1 min)

```bash
git add .
git commit -m "fix(database): apply v3.0.1 migration - add v2.0.0 + v3.0.0 fields"
git push origin main
```

Vercel irá:
- Detectar mudança
- Rebuildar
- Aplicar automaticamente

---

### 📍 PASSO 3: Testar (2 min)

1. Acesse: https://atherarun.com
2. Faça login com usuário teste
3. Gere um novo plano
4. Verifique se aparece:
   - ✅ Estrutura detalhada de treinos
   - ✅ Objetivo do treino
   - ✅ Dicas práticas
   - ✅ Intensidade (1-5)
   - ✅ RPE esperado

---

## 📊 O QUE A MIGRATION FAZ

### custom_workouts (13 novas colunas)
```sql
✅ warmUpStructure      (JSONB)   -- Aquecimento detalhado
✅ mainWorkoutStruct    (JSONB)   -- Parte principal
✅ coolDownStructure    (JSONB)   -- Desaquecimento
✅ objective            (TEXT)    -- Objetivo fisiológico
✅ scientificBasis      (TEXT)    -- Base científica
✅ tips                 (JSONB)   -- Dicas práticas
✅ commonMistakes       (JSONB)   -- Erros comuns
✅ successCriteria      (JSONB)   -- Critérios de sucesso
✅ intensityLevel       (INT)     -- 1-5
✅ expectedRPE          (INT)     -- 1-10
✅ heartRateZones       (JSONB)   -- Zonas FC
✅ intervals            (JSONB)   -- Estrutura intervalos
✅ expectedDuration     (INT)     -- Duração esperada
```

### athlete_profiles (8 novas colunas)
```sql
✅ hasRunBefore          (BOOLEAN)  -- Já correu? (CRÍTICO!)
✅ currentlyInjured      (BOOLEAN)  -- Está lesionado?
✅ avgSleepHours         (FLOAT)    -- Horas de sono
✅ tracksMenstrualCycle  (BOOLEAN)  -- Rastreia ciclo?
✅ avgCycleLength        (INT)      -- Duração ciclo
✅ lastPeriodDate        (TIMESTAMP)-- Última menstruação
✅ workDemand            (TEXT)     -- Demanda trabalho
✅ familyDemand          (TEXT)     -- Demanda família
```

---

## 🛡️ SEGURANÇA

✅ Script usa `IF NOT EXISTS` - não quebra se já existir  
✅ Não usa `DROP` - não apaga dados  
✅ Transações seguras com `DO $$ blocks`  
✅ Logs detalhados com `RAISE NOTICE`  
✅ Verificação ao final

---

## ⚠️ SE DER ERRO

### "permission denied"
**Solução**: Use usuário owner do banco

### "column already exists"
**Solução**: Está OK! Script pula colunas existentes

### "relation does not exist"
**Solução**: Verifique se está no projeto correto

---

## 📞 APÓS APLICAR

### ✅ FUNCIONARÁ
- Geração de planos v3.0.0
- Estrutura detalhada de treinos
- Personalização avançada
- Dashboard com métricas completas

### ⏸️ AINDA NÃO FUNCIONARÁ (v3.1.0)
- Coleta de novos campos no onboarding (UI)
- Campos opcionais em settings (UI)

**Motivo**: Backend pronto, falta UI (não é crítico)

---

## 📚 DOCUMENTOS DE SUPORTE

1. `INSTRUCOES_NEON_V3_0_1.md` - Guia detalhado
2. `VERIFICACAO_IMPLEMENTACAO_V3_0_0.md` - Status completo
3. `neon-migration-v3.0.1-SAFE.sql` - Script a executar
4. `LEIA_ISTO_PRIMEIRO_v3_0_0.md` - Contexto geral

---

## ✅ CHECKLIST FINAL

- [ ] Abri Neon Console
- [ ] Selecionei projeto Athera Run
- [ ] Executei SQL no SQL Editor
- [ ] Vi 13 + 8 linhas retornadas
- [ ] Fiz commit + push
- [ ] Vercel deployou
- [ ] Testei geração de plano
- [ ] ✅ TUDO FUNCIONANDO!

---

**🚀 Ação requerida**: Executar migration no Neon (5 min)  
**⏱️ Urgência**: Alta - Bloqueia geração de planos  
**💪 Impacto**: Resolve 100% dos erros

---

**Arquivo**: `neon-migration-v3.0.1-SAFE.sql`  
**Instruções**: `INSTRUCOES_NEON_V3_0_1.md`  
**Data**: 13/NOV/2025
