# 🚨 MIGRAÇÃO URGENTE v3.0.1 - Correções Críticas

**Data:** 13/NOV/2025  
**Versão:** v3.0.1  
**Status:** ⚠️ CORREÇÕES URGENTES NECESSÁRIAS

---

## 🔥 PROBLEMAS IDENTIFICADOS

### 1. ❌ Database Migration Não Aplicada (CRÍTICO)
**Erro:** `The column 'custom_workouts.warmUpStructure' does not exist`

**Causa:** Migration `20251110_workout_structure_v2_0_0` não foi aplicada em produção

**Impacto:** ❌ **GERAÇÃO DE PLANOS QUEBRADA**

### 2. ❌ Traduções i18n Quebradas
**Erro:** Mostrando `goalLabels.5k`, `phases.baseaerobica`, `PHASES.BASEAEROBICA`

**Causa:** Chaves de tradução erradas

**Impacto:** 🟡 UX ruim, mas sistema funciona

### 3. ❌ Descanso Aparecendo Vermelho
**Erro:** Dia de descanso marca como atividade não executada

**Impacto:** 🟡 Confunde usuário

### 4. ❌ Unidade Errada: "min/km/km"
**Erro:** Mostrando "min/km/km" ao invés de "min/km"

**Impacto:** 🟡 Confunde usuário

### 5. ⚠️ Planos Genéricos (Médio)
**Causa:** Prompt v2.5.0 pode não estar sendo usado

**Impacto:** 🟡 Personalização insuficiente

---

## ✅ SOLUÇÃO IMEDIATA

### PASSO 1: Aplicar Migration no Neon (VIA VERCEL)

**Opção A: Via Vercel CLI (RECOMENDADO)**
```bash
# No seu terminal local com Vercel CLI instalado
vercel env pull
npx prisma migrate deploy
```

**Opção B: Via Vercel Dashboard**
1. Acessar: https://vercel.com/settings/environment-variables
2. Copiar `DATABASE_URL`
3. No terminal local:
```bash
export DATABASE_URL="<cole_aqui>"
npx prisma migrate deploy
npx prisma generate
```

**Opção C: Via GitHub Action**
Criar `.github/workflows/migrate.yml`:
```yaml
name: Apply Migrations
on:
  workflow_dispatch:

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### PASSO 2: Verificar Migrations Aplicadas

```sql
-- Conectar no Neon e rodar:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'custom_workouts' 
  AND column_name IN ('warmUpStructure', 'mainWorkoutStruct', 'coolDownStructure');
```

**Esperado:** 3 linhas (warmUpStructure, mainWorkoutStruct, coolDownStructure)

---

## 🔧 CORREÇÕES DE CÓDIGO

### CORREÇÃO 1: I18n - goalLabels e phases

**Arquivo:** `app/[locale]/plano/page.tsx`

**Problema atual (linha 163):**
```typescript
return t(`plano.goalLabels.${distance}`, distance);
```

**Correção:**
```typescript
// Normalizar distância
const normalizeDistance = (dist: string) => {
  const map: Record<string, string> = {
    '5k': '5k',
    '10k': '10k',
    '15k': '15k',
    '21k': '21k',
    '42k': '42k',
    'half_marathon': '21k',
    'marathon': '42k'
  };
  return map[dist] || dist;
};

const normalized = normalizeDistance(distance);
return t(`plano.goalLabels.${normalized}`, normalized);
```

### CORREÇÃO 2: Phases Tradução

**Problema:** `phases.baseaerobica` → deve ser `phases.base`

**Solução:** Mapear fase para tradução correta

```typescript
const phaseNameMap: Record<string, string> = {
  'base': 'base',
  'baseaerobica': 'base',
  'build': 'build',
  'desenvolvimento': 'build',
  'peak': 'peak',
  'pico': 'peak',
  'taper': 'taper',
  'polimento': 'taper',
  'recovery': 'recovery',
  'recuperacao': 'recovery'
};

const normalizedPhase = phaseNameMap[phase.toLowerCase()] || 'base';
return t(`plano.phases.${normalizedPhase}`);
```

### CORREÇÃO 3: Descanso Vermelho

**Arquivo:** Componente que exibe status do treino

**Problema:** Rest day marcado como "not completed"

**Solução:**
```typescript
// Se é descanso E data já passou, não marcar como erro
const isRestDay = workout.type === 'rest';
const isPast = isAfter(today, workoutDate);

const shouldMarkAsIncomplete = isPast && !workout.isCompleted && !isRestDay;
```

### CORREÇÃO 4: "min/km/km" → "min/km"

**Buscar:** Onde renderiza pace
```bash
grep -r "min/km/km" app/ components/
```

**Correção:**
```typescript
// Antes
const paceDisplay = `${pace} min/km/km`;

// Depois
const paceDisplay = `${pace} min/km`;
```

---

## 🧪 TESTES PÓS-MIGRAÇÃO

### Teste 1: Criar Novo Plano
```
Email: teste-migracao@teste.com
Objetivo: 10km em 8 semanas
```

**Verificar:**
- ✅ Plano criado sem erro
- ✅ `warmUpStructure` salvo corretamente
- ✅ Traduções corretas
- ✅ Descanso não vermelho
- ✅ Pace mostra "min/km"

### Teste 2: Personalização
```
Teste 3 perfis diferentes:
1. Iniciante absoluto (hasRunBefore = false)
2. Experiente (40km/semana)
3. Masters 50+ (5h sono)
```

**Verificar:**
- ✅ Planos diferentes entre si
- ✅ Iniciante: walk/run protocol
- ✅ Masters: recovery extra

---

## 📊 CHECKLIST DE DEPLOY

### Pré-Deploy
- [ ] Revisar código das correções
- [ ] Testar localmente se possível
- [ ] Backup do DATABASE_URL

### Deploy
- [ ] Aplicar migrations no Neon
- [ ] Verificar migrations aplicadas (SQL query)
- [ ] Push código corrigido
- [ ] Vercel auto-deploy
- [ ] Aguardar build (3-5min)

### Pós-Deploy
- [ ] Criar usuário teste
- [ ] Gerar plano
- [ ] Verificar traduções
- [ ] Verificar descanso
- [ ] Verificar pace
- [ ] Testar 3 perfis diferentes

---

## 🚀 COMANDOS RÁPIDOS

### Local (se tiver Vercel CLI)
```bash
# 1. Baixar env vars
vercel env pull

# 2. Aplicar migrations
npx prisma migrate deploy

# 3. Gerar Prisma Client
npx prisma generate

# 4. Build local (opcional)
npm run build
```

### Via Vercel Dashboard
```bash
# 1. Conectar ao banco via Neon Dashboard
# 2. Rodar SQL manualmente (ver migration file)
cat prisma/migrations/20251110_workout_structure_v2_0_0/migration.sql

# 3. Executar no SQL Editor do Neon
```

---

## 📞 SUPORTE

### Arquivos para Revisar:
1. `app/[locale]/plano/page.tsx` - Traduções goalLabels
2. `app/[locale]/dashboard/page.tsx` - Dashboard
3. `components/*` - Componentes que usam i18n
4. `prisma/migrations/20251110_workout_structure_v2_0_0/` - Migration

### Logs Úteis:
```bash
# Ver logs Vercel
vercel logs atherarun --follow

# Ver último deploy
vercel ls atherarun

# Ver env vars
vercel env ls
```

---

## ⏱️ ESTIMATIVA DE TEMPO

- **Aplicar migration:** 5 minutos
- **Correções de código:** 15 minutos
- **Testes:** 10 minutos
- **Deploy:** 5 minutos

**TOTAL:** ~35 minutos

---

## 🎯 PRIORIDADE

1. **P0 (CRÍTICO):** Migration database ← **FAZER AGORA**
2. **P1 (ALTO):** Traduções i18n
3. **P1 (ALTO):** Descanso vermelho
4. **P2 (MÉDIO):** Pace "min/km/km"
5. **P3 (BAIXO):** Melhorar personalização

---

## ✅ CRITÉRIOS DE SUCESSO

### Migration Aplicada ✅
```sql
-- Deve retornar 3 linhas
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'custom_workouts' 
  AND column_name LIKE '%Structure%';
```

### Geração de Plano ✅
```
POST /api/plan/generate
Status: 200
Response: { success: true, planId: 123 }
Logs: Sem erros "column does not exist"
```

### Traduções ✅
```
Página do plano: "10km" (não "goalLabels.10k")
Fases: "Base" (não "phases.baseaerobica")
```

### UX ✅
```
Descanso: ✅ Verde ou neutro (não vermelho)
Pace: "5:30 min/km" (não "5:30 min/km/km")
```

---

**🔥 AÇÃO IMEDIATA: APLICAR MIGRATION NO NEON VIA VERCEL! 🔥**
