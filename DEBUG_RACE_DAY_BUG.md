# 🐛 DEBUG: Race Day Bug - Corrida não aparece no dia da prova

## ❌ Problema Confirmado

**Usuário teste:** `teste020202@teste.com`

**Sintoma:**
- Corrida A cadastrada: "Corrida 10km" em 31/12/2025 (Quarta-feira)
- No plano gerado: Dia 31/12 tem **Natação + Musculação** ❌
- Esperado: Dia 31/12 deveria ter **🏁 Corrida A** ✅

**Dados do banco:**
```
Race Goal:
  Name: Corrida 10km
  Date: 2025-12-31T00:00:00.000Z
  Day of week: Quarta (3)
  Priority: A
  Distance: 10k

Training Plan Week 8 (race week):
  2025-12-31 (Qua): type="swimming" - Natação 🏁 *** RACE DAY ***
  2025-12-31 (Qua): type="strength" - Musculação 🏁 *** RACE DAY ***
  (NO RACE WORKOUT!)
```

## 🔍 Investigação

### Hipóteses:

1. ✅ **Código de detecção está correto** - Implementado em `lib/ai-plan-generator.ts`:
   - Linha 1224-1244: Detecta corridas na semana
   - Linha 1708-1735: Substitui treino pela corrida
   - Linha 1982-2024: Cria workout tipo "race"

2. ❓ **Possível causa: `raceGoals` não está sendo passado corretamente**
   - O profile pode estar chegando sem as corridas
   - Ou as corridas não estão sendo buscadas do banco

3. ❓ **Possível causa: Comparação de datas falhando**
   - Mesmo com normalização, pode haver problema de timezone
   - Race date: `2025-12-31T00:00:00.000Z` (UTC)
   - Week dates: podem estar em timezone diferente

## ✅ Correções Implementadas (v1.7.4)

### 1. Melhorada Normalização de Datas
```typescript
// ANTES: Comparação direta
return raceDate >= currentWeekStart && raceDate <= weekEnd;

// DEPOIS: Normalização completa
const raceDateNorm = new Date(raceDate.getFullYear(), raceDate.getMonth(), raceDate.getDate());
const weekStartNorm = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate());
```

### 2. Adicionado Logging Extensivo

**Nível 1: API Route (`app/api/plan/generate/route.ts`)**
```
[AI PLAN] Corridas encontradas: X
[AI PLAN] Detalhes das corridas:
  - A: Nome (distância) em data
```

**Nível 2: Antes de chamar IA**
```
[AI PLAN] ✅ Chamando generateAIPlan com:
[AI PLAN]   - X corridas no perfil
[AI PLAN]     • A: Nome em data
```

**Nível 3: Dentro do AI Generator (`lib/ai-plan-generator.ts`)**
```
[AI PLAN] 🚀 generateAIPlan INICIADO
[AI PLAN] Corridas no perfil recebido: X
[AI PLAN]   1. A: "Nome" (distância) em data
```

**Nível 4: Detecção na Semana**
```
[AI PLAN DEBUG] Corrida "Nome" encontrada na semana X
[AI PLAN] ✅ Semana X: Corrida A detectada - treinos serão ajustados
```

**Nível 5: Substituição do Treino**
```
[WORKOUT GEN] 🏁 CORRIDA A detectada!
[WORKOUT GEN]   Nome: "Nome"
[WORKOUT GEN]   Data: YYYY-MM-DD
[WORKOUT GEN]   Dia da semana: X
[WORKOUT GEN]   ✅ Substituindo treino do dia X pela corrida
```

**Nível 6: Criação do Workout**
```
[WORKOUT GEN] 🏁 Criando workout de CORRIDA para dia X
[WORKOUT GEN] ✅ Workout de corrida criado: type=race
[WORKOUT GEN] ✅ CORRIDA(S) ENCONTRADA(S) NA SEMANA X
```

## 📋 Próximos Passos para Debug

### 1. Criar novo plano para usuário teste020202@teste.com

1. Deletar plano atual
2. Gerar novo plano
3. **Verificar logs do Vercel** durante a geração

### 2. Analisar logs na seguinte ordem:

**Se aparecer `[AI PLAN] Corridas encontradas: 0`:**
- ❌ Problema no banco de dados ou query
- Verificar se `raceGoals` tem `status='active'`
- Verificar se `athleteId` está correto

**Se aparecer `[AI PLAN] Corridas encontradas: 1` MAS `[AI PLAN] ⚠️ PROBLEMA: Nenhuma corrida no perfil!`:**
- ❌ Problema ao montar o `aiProfile`
- Verificar mapeamento em `app/api/plan/generate/route.ts` linha 208-215

**Se aparecer corridas no perfil MAS não aparecer `[AI PLAN DEBUG] Corrida "X" encontrada na semana Y`:**
- ❌ Problema na comparação de datas
- Verificar timezone da race date vs week dates
- Verificar se race date está dentro do range do plano

**Se aparecer corrida detectada MAS não aparecer `[WORKOUT GEN] 🏁 CORRIDA A detectada!`:**
- ❌ Problema ao passar `raceThisWeek` para `generateWeekWorkouts`
- Verificar linha 1256 em `ai-plan-generator.ts`

**Se aparecer `[WORKOUT GEN] 🏁 CORRIDA A detectada!` MAS não criar workout:**
- ❌ Problema na função `addActivity`
- Verificar se `activity.details` está sendo passado corretamente

## 🔧 Scripts de Debug Disponíveis

```bash
# Verificar dados do usuário e plano
cd /root/athera-run
export $(grep DATABASE_URL .env.local | xargs)
npx tsx check-user-020202-v2.ts
```

## 📊 Status

- ✅ Logging implementado
- ✅ Deploy realizado (Vercel)
- ⏳ Aguardando regeneração de plano para análise dos logs
- ⏳ Identificar ponto exato onde race data é perdida

## 🎯 Objetivo

Fazer com que no dia da corrida A apareça:
```
2025-12-31 (Qua): type="race" - 🏁 Corrida 10km - 10k
```

Ao invés de:
```
2025-12-31 (Qua): type="swimming" - Natação
2025-12-31 (Qua): type="strength" - Musculação
```

---

**Última atualização:** 10/11/2025 17:52 UTC  
**Versão:** v1.7.4-debug  
**Commit:** bc69ad88
