# 🚀 Guia de Aplicação de Migrations no Neon

**Data:** 13/NOV/2025  
**Versões:** v2.0.0 + v3.0.0  
**Status:** ⚠️ PENDENTE APLICAÇÃO EM PRODUÇÃO

---

## 📋 O QUE SERÁ APLICADO

### ✅ v2.0.0 - Sistema Avançado de Treinos
**13 novos campos** na tabela `custom_workouts`:

| Campo | Tipo | Propósito |
|-------|------|-----------|
| `warmUpStructure` | JSONB | Aquecimento estruturado |
| `mainWorkoutStruct` | JSONB | Parte principal detalhada |
| `coolDownStructure` | JSONB | Desaquecimento estruturado |
| `objective` | TEXT | Objetivo fisiológico |
| `scientificBasis` | TEXT | Fundamento científico |
| `tips` | JSONB | Dicas práticas |
| `commonMistakes` | JSONB | Erros comuns |
| `successCriteria` | JSONB | Critérios de sucesso |
| `intensityLevel` | INTEGER | Nível 1-5 |
| `expectedRPE` | INTEGER | RPE esperado 1-10 |
| `heartRateZones` | JSONB | Zonas de FC |
| `intervals` | JSONB | Estrutura intervalos |
| `expectedDuration` | INTEGER | Duração esperada (min) |

### ✅ v3.0.0 - Perfil Multi-Dimensional
**8 novos campos** na tabela `athlete_profiles`:

| Campo | Tipo | Default | Propósito |
|-------|------|---------|-----------|
| `hasRunBefore` | BOOLEAN | `true` | **CRÍTICO** - Iniciante absoluto |
| `currentlyInjured` | BOOLEAN | `false` | Flag lesão ativa |
| `avgSleepHours` | FLOAT | `null` | Horas médias sono |
| `tracksMenstrualCycle` | BOOLEAN | `false` | Tracking ciclo (women) |
| `avgCycleLength` | INTEGER | `null` | Duração ciclo (dias) |
| `lastPeriodDate` | TIMESTAMP | `null` | Data última menstruação |
| `workDemand` | TEXT | `null` | Demanda trabalho |
| `familyDemand` | TEXT | `null` | Responsabilidades família |

---

## 🎯 PASSO-A-PASSO APLICAÇÃO

### **1. Acessar Neon Console**
```
URL: https://console.neon.tech/
Login: [seu login]
Projeto: Athera Run
```

### **2. Abrir SQL Editor**
- Clicar em **"SQL Editor"** no menu lateral
- Selecionar o database correto (production)

### **3. Executar Migration Principal**

1. Abrir o arquivo: `prisma/APPLY_MIGRATIONS_NEON.sql`
2. Copiar **TODO O BLOCO** `BEGIN...COMMIT` (linhas 10-84)
3. Colar no SQL Editor
4. Clicar em **"Run"**
5. Aguardar conclusão (deve retornar sem erros)

### **4. Verificar Aplicação**

Executar **SEPARADAMENTE** os 2 SELECTs:

```sql
-- Query 1: Verificar custom_workouts
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'custom_workouts'
  AND column_name IN (
    'warmUpStructure', 'mainWorkoutStruct', 'coolDownStructure',
    'objective', 'scientificBasis', 'tips', 'commonMistakes', 
    'successCriteria', 'intensityLevel', 'expectedRPE', 
    'heartRateZones', 'intervals', 'expectedDuration'
  )
ORDER BY ordinal_position;
```

**Resultado esperado:** 13 linhas (uma para cada coluna)

```sql
-- Query 2: Verificar athlete_profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'athlete_profiles'
  AND column_name IN (
    'hasRunBefore', 'currentlyInjured', 'avgSleepHours',
    'tracksMenstrualCycle', 'avgCycleLength', 'lastPeriodDate',
    'workDemand', 'familyDemand'
  )
ORDER BY ordinal_position;
```

**Resultado esperado:** 8 linhas (uma para cada coluna)

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após aplicar, marque:

- [ ] Migration executada sem erros
- [ ] Query 1 retornou 13 linhas (custom_workouts)
- [ ] Query 2 retornou 8 linhas (athlete_profiles)
- [ ] Nenhuma coluna retornou erro "does not exist"
- [ ] Tipos de dados corretos (JSONB, TEXT, INTEGER, etc.)
- [ ] Defaults aplicados corretamente

---

## 🔄 APÓS APLICAÇÃO

### **Imediato:**
1. Testar geração de novo plano no frontend
2. Verificar logs do Vercel (não deve mais aparecer erro P2022)
3. Confirmar que dados enriquecidos aparecem no plano

### **Validação Completa:**
```bash
# Local (para sincronizar Prisma Client)
npx prisma generate

# Vercel (rebuild automático após push)
git add -A
git commit -m "docs: add Neon migration guide v2.0.0 + v3.0.0"
git push origin main
```

---

## 🆘 TROUBLESHOOTING

### **Erro: "relation custom_workouts does not exist"**
✅ **RESOLVIDO** - Aplicar este guia resolve o problema!

### **Erro: "column already exists"**
✅ **Seguro** - As migrations usam `IF NOT EXISTS`, pode executar múltiplas vezes

### **Erro: "constraint violation"**
- Verificar se há workouts/profiles com valores inválidos
- Pode ser necessário limpar dados de teste antes

### **Migration não aplica**
- Confirmar que está no database correto (production, não dev/test)
- Verificar permissões do usuário no Neon

---

## 📊 IMPACTO ESPERADO

### **Performance:**
- ✅ Nenhum downtime esperado
- ✅ Migrations são rápidas (< 5 segundos)
- ✅ Não afeta dados existentes

### **Funcionalidades:**
- ✅ Geração de planos agora funciona 100%
- ✅ Treinos enriquecidos com detalhes educacionais
- ✅ Perfil multi-dimensional para IA v3.0.0

### **Usuários:**
- ✅ Planos mais personalizados e detalhados
- ✅ Melhor experiência educacional
- ✅ IA adapta treinos com mais precisão

---

## 📝 LOGS DE APLICAÇÃO

Preencher após executar:

```
Data/Hora: ___________________
Executado por: _______________
Tempo total: _________________
Erros encontrados: ___________
Status: [ ] ✅ Sucesso  [ ] ❌ Erro
```

---

## 🔗 REFERÊNCIAS

- **Schema:** `prisma/schema.prisma`
- **Migration v2.0.0:** `prisma/migrations/20251110_workout_structure_v2_0_0/`
- **Migration v3.0.0:** `prisma/migrations/20251113144016_add_v3_profile_fields/`
- **SQL Consolidado:** `prisma/APPLY_MIGRATIONS_NEON.sql`
- **Documentação v3.0.0:** `IMPLEMENTATION_V3_CHECKLIST.md`

---

**⚠️ IMPORTANTE:** Após aplicar com sucesso, atualizar este arquivo com:
```markdown
**Status:** ✅ APLICADO EM PRODUÇÃO - [DATA/HORA]
```
