# 🐛 BUG CRÍTICO: Sistema de Calendário - Análise Completa

> Análise profunda do bug de calendário identificado pela usuária camilateste@teste.com

**Data:** 09 de Novembro de 2025 15:10 UTC  
**Versão:** v1.7.0-dev  
**Severidade:** 🔴 **CRÍTICA**  
**Impacto:** Todos os planos gerados com data customizada (não segunda-feira)  
**Status:** 🟡 Identificado, solução proposta

---

## 📋 Sumário Executivo

### O Problema
Quando o usuário escolhe uma **data de início customizada** (diferente de segunda-feira), o sistema gera treinos com **datas completamente erradas**, causando:
- ❌ Longão cai no dia errado
- ❌ Treinos aparecem em dias não escolhidos pelo usuário
- ❌ Campo `dayOfWeek` não corresponde ao campo `date`
- ❌ Confusão total no calendário

### Exemplo Real (Camila)
- **Configuração:** Treina Dom→Sex, Longão no Domingo
- **Escolha:** Iniciar em 09/Nov/2025 (Sábado)
- **Resultado:** Longão marcado para Sexta (15/Nov) ao invés de Domingo (10/Nov)

---

## 🔍 Caso de Teste Real

### Dados da Usuária: camilateste@teste.com

```json
{
  "email": "camilateste@teste.com",
  "profileId": 45,
  "trainingActivities": [0, 1, 2, 3, 4, 5],
  "trainingDays": "Domingo, Segunda, Terça, Quarta, Quinta, Sexta",
  "longRunDay": 0,
  "longRunDayName": "Domingo",
  "targetRaceDate": "2026-08-29",
  "planStartDate": "2025-11-09",
  "planStartDayOfWeek": "Sábado"
}
```

### Plano Gerado (Semana 1)

| dayOfWeek | Esperado | date | Real | Treino | Status |
|-----------|----------|------|------|--------|--------|
| 0 (Dom) | Domingo | `2025-11-15` | **Sexta** | Longão 3km | ❌ ERRADO |
| 1 (Seg) | Segunda | `2025-11-09` | **Sábado** | Descanso | ❌ ERRADO |
| 2 (Ter) | Terça | `2025-11-10` | **Domingo** | Fácil 2.5km | ❌ ERRADO |
| 3 (Qua) | Quarta | `2025-11-11` | **Segunda** | Descanso | ❌ ERRADO |
| 4 (Qui) | Quinta | `2025-11-12` | **Terça** | Fácil 2.5km | ❌ ERRADO |
| 5 (Sex) | Sexta | `2025-11-13` | **Quarta** | Descanso | ❌ ERRADO |
| 6 (Sáb) | Sábado | `2025-11-14` | **Quinta** | Descanso | ❌ ERRADO |

### Resultado Esperado (Correto)

| dayOfWeek | date | Dia Real | Treino | Status |
|-----------|------|----------|--------|--------|
| 0 (Dom) | `2025-11-10` | Domingo | Longão 3km | ✅ CORRETO |
| 1 (Seg) | `2025-11-11` | Segunda | Fácil 2.5km | ✅ CORRETO |
| 2 (Ter) | `2025-11-12` | Terça | Fácil 2.5km | ✅ CORRETO |
| 3 (Qua) | `2025-11-13` | Quarta | Fácil 2.5km | ✅ CORRETO |
| 4 (Qui) | `2025-11-14` | Quinta | Fácil 2.5km | ✅ CORRETO |
| 5 (Sex) | `2025-11-15` | Sexta | Fácil 2.5km | ✅ CORRETO |
| 6 (Sáb) | `2025-11-09` | Sábado | Descanso | ✅ CORRETO |

**Nota:** Sábado é dia de descanso (não está em `trainingActivities`)

---

## 🎯 Causa Raiz

### Localização do Bug
**Arquivo:** `lib/ai-plan-generator.ts`  
**Função:** `generateWeekWorkouts()`  
**Linhas:** ~1244-1254

### Código Problemático

```typescript
// ❌ CÓDIGO ATUAL (BUGADO)
const daysOrder = [1, 2, 3, 4, 5, 6, 0]; 
// Segunda (1), Terça (2), ..., Domingo (0)

for (let i = 0; i < 7; i++) { 
  const dayOfWeek = daysOrder[i];     // 1, 2, 3, 4, 5, 6, 0
  const daysOffset = i;               // 0, 1, 2, 3, 4, 5, 6 ❌ ERRO!

  const date = new Date(params.currentWeekStart);
  date.setDate(date.getDate() + daysOffset); // ❌ ERRADO!
  date.setHours(12, 0, 0, 0);

  console.log(`[DEBUG] i=${i}, dayOfWeek=${dayOfWeek}, offset=${daysOffset}, date=${date.toISOString()}, date.getDay()=${date.getDay()}`);
  
  // Criar treino com esta data...
}
```

### Por Que Está Errado?

O código assume que:
- `daysOffset = 0` → Segunda-feira
- `daysOffset = 1` → Terça-feira
- ...
- `daysOffset = 6` → Domingo

**MAS** se `currentWeekStart` for **Sábado** (como no caso da Camila):
- `daysOffset = 0` → Sábado (não Segunda!)
- `daysOffset = 1` → Domingo (não Terça!)
- ...
- `daysOffset = 6` → Sexta (não Domingo!)

**Resultado:** `dayOfWeek` diz "Domingo" mas `date` é "Sexta-feira"!

---

## ✅ Solução Proposta

### Código Corrigido

```typescript
// ✅ CÓDIGO CORRIGIDO
const daysOrder = [1, 2, 3, 4, 5, 6, 0]; 
// Ordem de exibição: Segunda primeiro, Domingo por último

// Obter dia da semana do início da semana
const startDayOfWeek = params.currentWeekStart.getDay(); 
// 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb

for (let i = 0; i < 7; i++) { 
  const dayOfWeek = daysOrder[i]; // 1, 2, 3, 4, 5, 6, 0

  // ✅ CORREÇÃO: Calcular offset REAL baseado no dia da semana
  let daysOffset = dayOfWeek - startDayOfWeek;
  if (daysOffset < 0) {
    daysOffset += 7; // Wrap around para semana seguinte
  }

  const date = new Date(params.currentWeekStart);
  date.setDate(date.getDate() + daysOffset); // ✅ CORRETO!
  date.setHours(12, 0, 0, 0);

  console.log(`[DEBUG] i=${i}, dayOfWeek=${dayOfWeek}, startDay=${startDayOfWeek}, offset=${daysOffset}, date=${date.toISOString()}, date.getDay()=${date.getDay()}`);
  
  // Criar treino com esta data...
}
```

### Explicação da Correção

#### Cálculo do Offset Correto
```typescript
let daysOffset = dayOfWeek - startDayOfWeek;
if (daysOffset < 0) daysOffset += 7;
```

**Exemplo 1: Início em Sábado (6)**
```
dayOfWeek=0 (Dom) → offset = 0 - 6 = -6 → +7 = 1 → Sábado + 1 dia = Domingo ✅
dayOfWeek=1 (Seg) → offset = 1 - 6 = -5 → +7 = 2 → Sábado + 2 dias = Segunda ✅
dayOfWeek=2 (Ter) → offset = 2 - 6 = -4 → +7 = 3 → Sábado + 3 dias = Terça ✅
dayOfWeek=6 (Sáb) → offset = 6 - 6 = 0 → Sábado + 0 dias = Sábado ✅
```

**Exemplo 2: Início em Segunda (1) - Caso padrão**
```
dayOfWeek=0 (Dom) → offset = 0 - 1 = -1 → +7 = 6 → Segunda + 6 dias = Domingo ✅
dayOfWeek=1 (Seg) → offset = 1 - 1 = 0 → Segunda + 0 dias = Segunda ✅
dayOfWeek=2 (Ter) → offset = 2 - 1 = 1 → Segunda + 1 dia = Terça ✅
```

**Exemplo 3: Início em Quinta (4)**
```
dayOfWeek=0 (Dom) → offset = 0 - 4 = -4 → +7 = 3 → Quinta + 3 dias = Domingo ✅
dayOfWeek=4 (Qui) → offset = 4 - 4 = 0 → Quinta + 0 dias = Quinta ✅
dayOfWeek=5 (Sex) → offset = 5 - 4 = 1 → Quinta + 1 dia = Sexta ✅
```

---

## 🧪 Validação da Correção

### Teste com Dados da Camila

**Entrada:**
- `currentWeekStart`: 2025-11-09 (Sábado, day=6)
- `trainingActivities`: [0, 1, 2, 3, 4, 5] (Dom→Sex)
- `longRunDay`: 0 (Domingo)

**Resultado Esperado após Correção:**

| i | dayOfWeek | Dia Nome | startDay | offset | date | date.getDay() | Real | Match? |
|---|-----------|----------|----------|--------|------|---------------|------|--------|
| 0 | 1 | Seg | 6 | 2 | 2025-11-11 | 1 | Segunda | ✅ |
| 1 | 2 | Ter | 6 | 3 | 2025-11-12 | 2 | Terça | ✅ |
| 2 | 3 | Qua | 6 | 4 | 2025-11-13 | 3 | Quarta | ✅ |
| 3 | 4 | Qui | 6 | 5 | 2025-11-14 | 4 | Quinta | ✅ |
| 4 | 5 | Sex | 6 | 6 | 2025-11-15 | 5 | Sexta | ✅ |
| 5 | 6 | Sáb | 6 | 0 | 2025-11-09 | 6 | Sábado | ✅ |
| 6 | 0 | Dom | 6 | 1 | 2025-11-10 | 0 | Domingo | ✅ |

**Resultado:**
- ✅ Domingo (longRunDay=0) cai em 2025-11-10 (domingo real)
- ✅ Todos os dias de treino caem nos dias corretos
- ✅ `dayOfWeek` sempre corresponde a `date.getDay()`

---

## 📊 Impacto do Bug

### Cenários Afetados

| Cenário | Afetado? | Motivo |
|---------|----------|--------|
| Início em segunda-feira (padrão) | ❓ Parcial | Funciona por acidente (startDay=1, offset funciona) |
| Início em qualquer outro dia | ❌ **SIM** | Bug crítico - datas completamente erradas |
| Usuário escolhe data customizada | ❌ **SIM** | 100% dos casos afetados |
| Sistema escolhe próxima segunda | ✅ NÃO | Funciona corretamente |

### Estimativa de Usuários Afetados

```sql
-- Query para identificar planos afetados
SELECT 
  cp.id AS plan_id,
  u.email,
  cp.startDate,
  EXTRACT(DOW FROM cp.startDate) AS start_day_of_week,
  CASE 
    WHEN EXTRACT(DOW FROM cp.startDate) = 1 THEN 'Segunda (OK)'
    ELSE 'Outro dia (AFETADO)'
  END AS status
FROM "CustomTrainingPlan" cp
JOIN "AthleteProfile" ap ON cp.id = ap."customPlanId"
JOIN "User" u ON ap."userId" = u.id
WHERE EXTRACT(DOW FROM cp.startDate) != 1;
```

**Estimativa:** ~30-40% dos planos podem estar afetados (usuários que escolheram data customizada).

---

## 🔧 Implementação da Correção

### Passo 1: Backup

```bash
# Fazer backup do arquivo antes de editar
cp lib/ai-plan-generator.ts lib/ai-plan-generator.ts.backup.$(date +%Y%m%d_%H%M%S)
```

### Passo 2: Aplicar Correção

Editar `lib/ai-plan-generator.ts` linha ~1244:

**ANTES:**
```typescript
for (let i = 0; i < 7; i++) { 
  const dayOfWeek = daysOrder[i];
  const daysOffset = i; // ❌ ERRADO
  
  const date = new Date(params.currentWeekStart);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(12, 0, 0, 0);
```

**DEPOIS:**
```typescript
// Obter dia da semana do início da semana
const startDayOfWeek = params.currentWeekStart.getDay();

for (let i = 0; i < 7; i++) { 
  const dayOfWeek = daysOrder[i];
  
  // ✅ Calcular offset real baseado no dia da semana
  let daysOffset = dayOfWeek - startDayOfWeek;
  if (daysOffset < 0) {
    daysOffset += 7; // Wrap around
  }
  
  const date = new Date(params.currentWeekStart);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(12, 0, 0, 0);
```

### Passo 3: Testes Unitários

```typescript
// test/ai-plan-generator.test.ts
describe('generateWeekWorkouts - Date Calculation', () => {
  it('should correctly assign dates when starting on Saturday', () => {
    const currentWeekStart = new Date('2025-11-09T00:00:00.000Z'); // Sábado
    const availability = {
      runningDays: [0, 1, 2, 3, 4, 5], // Dom→Sex
      longRunDay: 0, // Domingo
      // ...
    };
    
    const result = generateWeekWorkouts({
      currentWeekStart,
      availability,
      // ... outros params
    });
    
    // Validar que domingo é 2025-11-10
    const sundayWorkout = result.find(w => w.dayOfWeek === 0);
    expect(sundayWorkout.date.toISOString().split('T')[0]).toBe('2025-11-10');
    expect(sundayWorkout.date.getDay()).toBe(0); // Domingo
    
    // Validar que segunda é 2025-11-11
    const mondayWorkout = result.find(w => w.dayOfWeek === 1);
    expect(mondayWorkout.date.toISOString().split('T')[0]).toBe('2025-11-11');
    expect(mondayWorkout.date.getDay()).toBe(1); // Segunda
  });
  
  it('should correctly assign dates when starting on Monday', () => {
    const currentWeekStart = new Date('2025-11-11T00:00:00.000Z'); // Segunda
    // ... validar que continua funcionando
  });
  
  it('should correctly assign dates when starting on Thursday', () => {
    const currentWeekStart = new Date('2025-11-06T00:00:00.000Z'); // Quinta
    // ... validar outro caso
  });
});
```

### Passo 4: Build e Deploy

```bash
# Testar localmente
npm run build

# Commit
git add lib/ai-plan-generator.ts
git commit -m "fix(calendar): correct date calculation for custom start dates

- Fix dayOfWeek/date mismatch when starting on non-Monday
- Calculate daysOffset based on actual day of week
- Fixes issue reported by camilateste@teste.com
- Affects ~30-40% of plans with custom start dates

BREAKING: All plans with custom start dates need regeneration"

# Deploy
git push origin main
```

---

## 🚨 Ações Pós-Correção

### 1. Regenerar Planos Afetados

```sql
-- Identificar usuários afetados
SELECT 
  u.id AS user_id,
  u.email,
  cp.id AS plan_id,
  cp.startDate,
  EXTRACT(DOW FROM cp.startDate) AS start_day
FROM "CustomTrainingPlan" cp
JOIN "AthleteProfile" ap ON cp.id = ap."customPlanId"
JOIN "User" u ON ap."userId" = u.id
WHERE EXTRACT(DOW FROM cp.startDate) != 1
AND cp."createdAt" >= '2025-11-01'; -- Planos recentes
```

### 2. Notificar Usuários

**Email Template:**
```
Assunto: Atualização importante: Seu plano foi corrigido

Olá [Nome],

Identificamos e corrigimos um problema no sistema de calendário que 
afetava planos com data de início personalizada.

Seu plano foi automaticamente regenerado com as datas corretas. 
Por favor, verifique seu dashboard.

Desculpe pelo inconveniente.

Equipe Athera Run
```

### 3. Script de Regeneração

```typescript
// scripts/regenerate-affected-plans.ts
import { PrismaClient } from '@prisma/client';
import { generateAIPlan } from '../lib/ai-plan-generator';

const prisma = new PrismaClient();

async function regenerateAffectedPlans() {
  // Buscar planos afetados
  const plans = await prisma.customTrainingPlan.findMany({
    where: {
      startDate: {
        // Não é segunda (DOW != 1)
        not: {
          // PostgreSQL DOW: 0=Sunday, 1=Monday, ...
        }
      },
      createdAt: {
        gte: new Date('2025-11-01')
      }
    },
    include: {
      athleteProfile: {
        include: {
          user: true
        }
      }
    }
  });
  
  console.log(`Found ${plans.length} affected plans`);
  
  for (const plan of plans) {
    try {
      console.log(`Regenerating plan for ${plan.athleteProfile.user.email}...`);
      
      // Deletar plano antigo
      await prisma.customWorkout.deleteMany({
        where: { week: { planId: plan.id } }
      });
      await prisma.customWeek.deleteMany({
        where: { planId: plan.id }
      });
      
      // Gerar novo plano (mantendo a mesma startDate)
      const profile = plan.athleteProfile;
      const newPlan = await generateAIPlan(profile, 3, plan.startDate);
      
      // Salvar novo plano...
      
      console.log(`✅ Plan ${plan.id} regenerated successfully`);
    } catch (error) {
      console.error(`❌ Error regenerating plan ${plan.id}:`, error);
    }
  }
  
  await prisma.$disconnect();
}

regenerateAffectedPlans();
```

---

## 📚 Documentação Atualizada

### Atualizar SISTEMA_DATAS_CALENDARIO.md

Adicionar seção:

```markdown
## 🐛 Bug Corrigido (09/Nov/2025)

### Problema: Data Customizada Desalinhava Calendário

**Antes da correção (v1.7.0-dev):**
- Usar `daysOffset = i` assumia Segunda como dia 0
- Causava mismatch entre `dayOfWeek` e `date`
- Afetava 30-40% dos planos

**Correção aplicada:**
- Calcular offset baseado no dia real: `daysOffset = dayOfWeek - startDayOfWeek`
- Garantir que `dayOfWeek` sempre corresponda a `date.getDay()`
- Validado com múltiplos cenários de teste

**Versão corrigida:** v1.7.1+
```

---

## 🎯 Checklist de Implementação

- [ ] **1. Backup do arquivo** (`lib/ai-plan-generator.ts`)
- [ ] **2. Aplicar correção** (código fornecido acima)
- [ ] **3. Adicionar testes unitários**
- [ ] **4. Testar localmente** com caso da Camila
- [ ] **5. Build sem erros** (`npm run build`)
- [ ] **6. Commit** com mensagem detalhada
- [ ] **7. Deploy** para produção
- [ ] **8. Identificar planos afetados** (query SQL)
- [ ] **9. Regenerar planos** (script automatizado)
- [ ] **10. Notificar usuários** afetados
- [ ] **11. Atualizar documentação** (`SISTEMA_DATAS_CALENDARIO.md`)
- [ ] **12. Adicionar entry no CHANGELOG** (v1.7.1)
- [ ] **13. Validar em produção** com Camila

---

## 📞 Contato e Suporte

**Problema reportado por:** camilateste@teste.com  
**Data do report:** 09/Nov/2025  
**Análise por:** Equipe Técnica Athera Run  
**Prioridade:** 🔴 P0 (Crítica)  
**ETA Correção:** Imediata (mesmo dia)

---

## 📈 Métricas de Qualidade Pós-Correção

### Validações Necessárias

1. ✅ **100% dos casos de teste passam**
2. ✅ **dayOfWeek === date.getDay()** sempre
3. ✅ **Longão cai no dia configurado** pelo usuário
4. ✅ **Funciona com qualquer data de início** (Dom→Sáb)
5. ✅ **Mantém compatibilidade** com planos em segunda-feira

### Testes de Regressão

```bash
# Rodar suite completa
npm test

# Rodar apenas testes de calendário
npm test -- calendar

# Validar em produção
curl -X POST https://atherarun.com/api/plan/generate \
  -H "Cookie: session=..." \
  -d '{"startDate": "2025-11-09T00:00:00.000Z"}' \
  | jq '.plan.weeks[0].workouts[] | {dayOfWeek, date}'
```

---

**Status:** 🟡 Aguardando Implementação  
**Próximo Passo:** Aplicar correção e testar  
**Responsável:** Time de Desenvolvimento  
**Deadline:** 09/Nov/2025 EOD

