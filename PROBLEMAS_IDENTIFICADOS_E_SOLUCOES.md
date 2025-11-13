# 🔍 PROBLEMAS IDENTIFICADOS E SOLUÇÕES - 13/NOV/2025

## ✅ RESOLVIDOS (Já implementados)

### 1. ✅ Step2SportBackground - hasRunBefore
**Status:** JÁ IMPLEMENTADO CORRETAMENTE  
**Evidência:** Linhas 17, 64, 76, 88-94, 97-114 em `Step2SportBackground.tsx`  
**Funcionalidade:**
- Pergunta "Já correu antes?"
- Se NÃO: Esconde campos de experiência
- Se SIM: Mostra campos de experiência (anos, km/semana, longão)

**✅ NENHUMA AÇÃO NECESSÁRIA**

---

### 2. ✅ Rest Day Color
**Status:** JÁ IMPLEMENTADO CORRETAMENTE  
**Evidência:** Linhas 447-448 em `app/[locale]/plano/page.tsx`

```typescript
: isRestDay
  ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 hover:border-gray-400 hover:shadow-md'
```

**Rest days aparecem em CINZA**, não vermelho.

**✅ NENHUMA AÇÃO NECESSÁRIA**

**NOTA:** Se usuário relata que está vermelho, pode ser:
1. Problema de cache do navegador
2. Rest day não está sendo detectado corretamente
3. Treino marcado como "rest" mas title não contém "descanso"/"rest"

---

## 🟡 PROBLEMAS MENORES

### 3. 🟡 Translation Keys - Phases
**Problema:** Aparecem keys como `phases.baseaerobica`, `PHASES.BASEAEROBICA`  
**Causa:** Keys não padronizadas ou faltam traduções

**Solução:**
Adicionar todas as variações de phases em `lib/i18n/translations/pt-BR.json`:

```json
"phases": {
  "base": "Base Aeróbica",
  "baseaerobica": "Base Aeróbica",
  "baseaerobia": "Base Aeróbica",
  "build": "Construção",
  "development": "Desenvolvimento",
  "intensity": "Intensidade",
  "peak": "Pico",
  "taper": "Polimento",
  "taperrecovery": "Taper e Recuperação",
  "taper_recovery": "Taper e Recuperação",
  "race": "Corrida",
  "recovery": "Recuperação"
}
```

E criar versão uppercase:
```json
"PHASES": {
  "BASEAEROBICA": "BASE AERÓBICA",
  "BUILD": "CONSTRUÇÃO",
  "DEVELOPMENT": "DESENVOLVIMENTO",
  "INTENSITY": "INTENSIDADE",
  "PEAK": "PICO",
  "TAPER": "POLIMENTO",
  "TAPERRECOVERY": "TAPER E RECUPERAÇÃO",
  "RACE": "CORRIDA",
  "RECOVERY": "RECUPERAÇÃO"
}
```

**Prioridade:** BAIXA (visual apenas)

---

### 4. 🟡 Pace Display - "min/km/km"
**Problema:** Usuário reporta "min/km/km"  
**Status:** NÃO ENCONTRADO NO CÓDIGO

**Possíveis causas:**
1. Gerado pela IA no texto do treino
2. Problema na função `formatPace()` em algum lugar
3. Duplicação no backend ao salvar

**Ação:**
Preciso ver o workout específico ou o log para identificar onde está vindo.

**Onde procurar:**
```bash
# Buscar formatPace ou displayPace
grep -rn "formatPace\|displayPace" lib/
grep -rn "formatPace\|displayPace" components/
grep -rn "min/km" app/[locale]/plano/
```

**Prioridade:** MÉDIA (afeta UX)

---

## 🔴 PROBLEMAS CRÍTICOS

### 5. 🔴 Planos Muito Genéricos
**Feedback do usuário:**
> "Os planos ainda estão muito genéricos. Parecem iguais para todos. Como alguém que nunca correu vai começar e no primeiro treino tem que correr 3km?"

**Diagnóstico:**
1. ✅ hasRunBefore está implementado (backend + frontend)
2. ✅ AI Context Builder usa hasRunBefore
3. 🔴 **PROBLEMA:** System Prompt precisa instruções mais específicas

**Solução:**
Melhorar `lib/ai-system-prompt-v2.5.ts` com:

#### Para Iniciante Absoluto (hasRunBefore = false):
```
SE hasRunBefore = false:
  - SEMANA 1: 100% Walk/Run (ex: 1min run / 2min walk x 10 reps = 30min)
  - SEMANA 2-4: Walk/Run com progressão (1:30 run / 1:30 walk)
  - SEMANA 5-8: Walk/Run avançado (2min run / 1min walk)
  - SEMANA 9-12: Primeira corrida contínua (10-15min)
  - ZERO treinos de qualidade até semana 12
  - Volume máximo: 15-20km/semana
  - Progressão: MAX 5% por semana
  - Linguagem encorajadora e educativa
```

#### Para Intermediário:
```
SE hasRunBefore = true AND currentWeeklyKm < 30:
  - Começar com volume conservador (70% do atual)
  - Progressão 10% por semana
  - Introduzir qualidade após 4 semanas
```

#### Para Avançado:
```
SE currentWeeklyKm > 50 AND bestTimes existe:
  - Começar próximo ao volume atual
  - Qualidade desde semana 1
  - Progressão agressiva (até 15%/sem em build phase)
```

**Prioridade:** 🔴 CRÍTICA (afeta qualidade do produto)

---

### 6. 🔴 Falta Progressão Clara
**Problema:** Planos começam forte e terminam no mesmo nível  
**Esperado:** Evolução clara semana a semana

**Solução:**
Adicionar ao System Prompt:

```typescript
// PROGRESSÃO OBRIGATÓRIA:
// Fase Base (semanas 1-N):
//   - Volume: +10% por semana
//   - Intensidade: ZERO (apenas easy + long)
//   - Força: 2-3x/semana

// Fase Build (semanas N+1 a M):
//   - Volume: Mantém ou +5%
//   - Intensidade: Adiciona 1x quality/sem
//   - Força: 2x/semana

// Fase Peak (semanas M+1 a P):
//   - Volume: -10% (recuperação)
//   - Intensidade: 2x quality/sem
//   - Força: 1x/semana

// Fase Taper (últimas 2 semanas):
//   - Volume: -40% a -60%
//   - Intensidade: 1x quality (curto, fast)
//   - Força: 1x (manutenção)
```

**Prioridade:** 🔴 CRÍTICA

---

## 📋 PLANO DE AÇÃO IMEDIATO

### ETAPA 1: Melhorar System Prompt (2-3h)
**Arquivo:** `lib/ai-system-prompt-v2.5.ts`

**Ações:**
1. [ ] Adicionar seção específica para iniciantes absolutos
2. [ ] Adicionar tabela de progressão clara por fase
3. [ ] Adicionar instruções de Walk/Run protocol
4. [ ] Adicionar validação de evolução semana a semana
5. [ ] Testar com 3 perfis diferentes

**Exemplo de teste:**
```bash
# Criar usuário teste:
# - hasRunBefore: false
# - age: 35
# - goal: 10k em 12 semanas

# Verificar plano gerado:
# - Semana 1: Walk/Run?
# - Semana 6: Progressão clara?
# - Semana 12: Alcança objetivo?
```

---

### ETAPA 2: Corrigir Translations (30min)
**Arquivo:** `lib/i18n/translations/pt-BR.json`

**Ações:**
1. [ ] Adicionar todas variações de phases (baseaerobica, taperrecovery, etc)
2. [ ] Adicionar seção PHASES (uppercase)
3. [ ] Testar dashboard e plano

---

### ETAPA 3: Debugar Pace Display (30-60min)
**Investigação:**

1. [ ] Verificar workout específico que mostra "min/km/km"
2. [ ] Buscar origem do bug:
   ```bash
   grep -rn "min/km" lib/
   grep -rn "formatPace" lib/
   ```
3. [ ] Corrigir função responsável
4. [ ] Validar em todos componentes

---

### ETAPA 4: Testar E2E (1h)
**Cenários de teste:**

**Teste 1: Iniciante Absoluto**
```
Input:
- hasRunBefore: false
- age: 30
- goal: 5k em 12 semanas

Esperado:
- Semana 1: Walk/Run (não corrida contínua)
- Progressão gradual e clara
- Linguagem encorajadora
```

**Teste 2: Intermediário**
```
Input:
- hasRunBefore: true
- currentWeeklyKm: 25
- goal: 10k em 10 semanas

Esperado:
- Começa com 20-25km/sem
- Progride até 35-40km/sem
- Qualidade introduzida semana 4-5
```

**Teste 3: Avançado**
```
Input:
- hasRunBefore: true
- currentWeeklyKm: 60
- bestTimes: { 10k: "42:00" }
- goal: 10k sub40 em 8 semanas

Esperado:
- Volume alto desde início
- Qualidade desde semana 1
- Treinos específicos para pace alvo
```

---

## 📊 PRIORIZAÇÃO

| Problema | Impacto | Urgência | Prioridade |
|----------|---------|----------|------------|
| Planos genéricos | 🔴 Alto | 🔴 Alta | P0 |
| Falta progressão | 🔴 Alto | 🔴 Alta | P0 |
| Pace display bug | 🟡 Médio | 🟡 Média | P1 |
| Translation keys | 🟢 Baixo | 🟢 Baixa | P2 |

---

## ✅ CHECKLIST ANTES DE DEPLOY

- [ ] System Prompt melhorado e testado
- [ ] 3 perfis testados com planos personalizados
- [ ] Progressão clara em todos os casos
- [ ] Iniciante absoluto não recebe corrida contínua semana 1
- [ ] Translations completas
- [ ] Pace display corrigido (se bug confirmado)
- [ ] Dashboard sem bugs visuais
- [ ] E2E test passando

---

**Última Atualização:** 13/NOV/2025 17:10 UTC  
**Próxima Ação:** Melhorar System Prompt v2.5 (PRIORIDADE P0)  
**Tempo Estimado:** 2-3 horas
