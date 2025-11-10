# 🔍 Análise: Corridas-Alvo Não Sendo Consideradas Adequadamente

**Data:** 10/11/2025  
**Problema:** IA não está considerando adequadamente as corridas cadastradas como objetivos (RaceGoals). No dia da corrida aparece treino qualquer, como se não soubesse da prova.

---

## 📊 Diagnóstico do Problema

### **1. Dados Chegam Corretamente** ✅

As corridas estão sendo passadas para a IA:

```typescript
// app/api/plan/generate/route.ts (linha 195)
raceGoals: raceGoals.map(race => ({
  id: race.id,
  name: race.raceName,
  distance: race.distance,
  date: race.raceDate,
  targetTime: race.targetTime || undefined,
  priority: race.priority as 'A' | 'B' | 'C'
}))
```

**Exemplo:**
```typescript
raceGoals: [
  {
    id: 1,
    name: "Meia Maratona São Paulo",
    distance: "21K",
    date: new Date("2025-12-15"),
    targetTime: "1:45:00",
    priority: "A"
  }
]
```

### **2. Contexto Passa Para IA** ✅

```typescript
// lib/ai-plan-generator.ts (linha 368-395)
context += `\n## Corridas Cadastradas (Sistema A/B/C)\n`;
profile.raceGoals.forEach(race => {
  context += `\n### ${race.name} (Corrida ${race.priority})\n`;
  context += `- Distância: ${race.distance}\n`;
  context += `- Data: ${raceDate.toLocaleDateString('pt-BR')} (em ${weeksUntilRace} semanas)\n`;
  if (race.targetTime) context += `- Meta de Tempo: ${race.targetTime}\n`;
  
  if (race.priority === 'A') {
    context += `**CORRIDA A (Objetivo Principal)** - Todo o plano deve ser estruturado para chegar no pico nesta corrida\n`;
  }
});

context += `\n**IMPORTANTE:** O plano deve considerar todas as corridas cadastradas:\n`;
context += `- Corrida A: Estruturar periodização para pico nesta data\n`;
context += `- Corridas B: Incluir como treinos de teste de ritmo 2-6 semanas antes da A\n`;
context += `- Corridas C: Incluir como treinos longos sem redução de volume\n`;
```

### **3. Código Detecta Corrida na Semana** ✅

```typescript
// lib/ai-plan-generator.ts (linha 859-866)
const raceThisWeek = profile.raceGoals?.find(race => {
  const raceDate = new Date(race.date);
  return raceDate >= currentWeekStart && raceDate <= weekEnd;
});

if (raceThisWeek) {
  console.log(`[AI PLAN] Semana ${weekNumber}: Corrida ${raceThisWeek.priority} "${raceThisWeek.name}" detectada`);
}
```

### **4. Código Substitui Treino por Corrida** ✅

```typescript
// lib/ai-plan-generator.ts (linha 1324-1344)
if (params.raceThisWeek) {
  const raceDate = new Date(params.raceThisWeek.date);
  const raceDayOfWeek = raceDate.getDay();
  
  console.log(`[WORKOUT GEN] Corrida ${params.raceThisWeek.priority} "${params.raceThisWeek.name}" no dia ${raceDayOfWeek}`);
  
  // Adicionar a corrida no dia correto
  addActivity(raceDayOfWeek, 'race', params.raceThisWeek);
  
  // Para corridas A e B: semana de taper
  const isTaperWeek = params.raceThisWeek.priority === 'A' || params.raceThisWeek.priority === 'B';
}
```

---

## ❌ PROBLEMAS IDENTIFICADOS

### **Problema 1: Prompt da IA é GENÉRICO** ❌

**Arquivo:** `lib/ai-plan-generator.ts` (linha 536-541)

O prompt menciona corridas A/B/C mas de forma muito superficial:

```typescript
**Corridas A/B/C - Análise Contextual Obrigatória:**
Antes de decidir o volume da semana de uma corrida B ou C, você DEVE analisar:
1. Histórico de Execução Recente...
2. Objetivo do Atleta na Corrida B/C...
3. Relação com Corrida A...
4. Nível de Preparação...
```

**O que falta:**
- ❌ Não explica COMO estruturar as FASES do plano em torno das corridas
- ❌ Não dá exemplos concretos de periodização
- ❌ Não explica o que é TAPER e como aplicar
- ❌ Não explica semanas de recuperação pós-corrida

---

### **Problema 2: IA Gera ESTRATÉGIA sem Calendário de Corridas** ❌

A IA recebe o contexto das corridas mas gera uma ESTRATÉGIA genérica:

```json
{
  "phases": [
    {
      "name": "Base Aeróbica",
      "weeks": 4,
      "weeklyKmStart": 25,
      "weeklyKmEnd": 35
    },
    {
      "name": "Desenvolvimento",
      "weeks": 6,
      "weeklyKmStart": 35,
      "weeklyKmEnd": 45
    },
    {
      "name": "Afinamento",
      "weeks": 2,
      "weeklyKmStart": 45,
      "weeklyKmEnd": 25
    }
  ]
}
```

**O que deveria gerar (com corrida em 12 semanas):**

```json
{
  "phases": [
    {
      "name": "Base Aeróbica",
      "weeks": 4,
      "weeklyKmStart": 25,
      "weeklyKmEnd": 35
    },
    {
      "name": "Desenvolvimento",
      "weeks": 4,
      "weeklyKmStart": 35,
      "weeklyKmEnd": 50
    },
    {
      "name": "Pico (Peak)",
      "weeks": 2,
      "weeklyKmStart": 50,
      "weeklyKmEnd": 55,
      "note": "Máximo volume 2 semanas antes da corrida"
    },
    {
      "name": "Taper (Afinamento)",
      "weeks": 2,
      "weeklyKmStart": 55,
      "weeklyKmEnd": 20,
      "note": "Redução progressiva: Semana -2 (70%), Semana da Prova (35%)"
    }
  ],
  "raceWeek": 12,
  "taperWeeks": [11, 12]
}
```

---

### **Problema 3: Falta Educação Sobre Taper** ❌

O prompt não explica CLARAMENTE o que é taper e sua importância:

**TAPER** é a redução gradual de volume nas últimas 2-3 semanas antes de uma corrida importante para permitir que o corpo:
- ✅ Se recupere completamente do treinamento acumulado
- ✅ Repare fibras musculares
- ✅ Recarregue glicogênio muscular
- ✅ Chegue FRESCO e NO PICO na linha de largada

**Protocolo Científico de Taper:**
- **Semana -3:** 100% volume (semana pico)
- **Semana -2:** 70-75% volume + manter intensidade
- **Semana -1:** 40-50% volume + manter intensidade
- **Semana da prova:** 20-30% volume + corrida fácil até 3 dias antes

**O que o prompt atual NÃO deixa claro:**
- ❌ Quando começar o taper (2-3 semanas antes)
- ❌ Quanto reduzir (70% → 50% → 30%)
- ❌ Manter INTENSIDADE mas reduzir VOLUME
- ❌ Última corrida longa 2 semanas antes
- ❌ Descanso completo ou corrida muito fácil nos 2-3 dias antes

---

### **Problema 4: Falta Exemplos Concretos** ❌

O prompt não dá EXEMPLOS PRÁTICOS de como estruturar o plano:

**Exemplo que falta:**

```
📅 EXEMPLO PRÁTICO - Corrida A (Meia Maratona) em 12 semanas:

Semana 1-4 (Base Aeróbica):
- Volume: 25km → 40km
- Foco: Construir base aeróbica
- Longão: 10km → 15km
- Qualidade: Apenas 1x/semana (fartlek leve)

Semana 5-8 (Desenvolvimento):
- Volume: 40km → 50km
- Foco: Adicionar qualidade
- Longão: 15km → 18km
- Qualidade: 2x/semana (tempo run + intervalos)

Semana 9-10 (Pico):
- Volume: 50km → 55km (MÁXIMO!)
- Foco: Volume máximo + qualidade intensa
- Longão: 18km → 20km
- Qualidade: 2x/semana (ritmo de prova + VO2max)

Semana 11 (Taper 1):
- Volume: 40km (70% do pico)
- Foco: Manter intensidade, reduzir volume
- Longão: 15km (ÚLTIMA corrida longa!)
- Qualidade: 1x/semana (ritmo de prova curto)

Semana 12 (Taper 2 - SEMANA DA PROVA):
- Volume: 15-20km (30% do pico)
- Segunda: 5km fácil
- Terça: DESCANSO ou 3km fácil
- Quarta: 5km com 3x 1km ritmo de prova
- Quinta: DESCANSO
- Sexta: 3km MUITO fácil ou DESCANSO
- Sábado: DESCANSO TOTAL
- Domingo: 🏁 MEIA MARATONA!
```

---

## ✅ Solução Completa

### **Passo 1: Enriquecer Contexto das Corridas**

Adicionar informações detalhadas sobre cada corrida no contexto:

```typescript
// ANTES
context += `- Data: ${raceDate.toLocaleDateString('pt-BR')} (em ${weeksUntilRace} semanas)\n`;

// DEPOIS
context += `- Data: ${raceDate.toLocaleDateString('pt-BR')}\n`;
context += `- Semana do Plano: Semana ${weeksUntilRace}\n`;
context += `- Dias até a corrida: ${daysUntilRace} dias\n`;

if (race.priority === 'A') {
  context += `\n🎯 **ESTA É A CORRIDA PRINCIPAL!**\n`;
  context += `- TODO o plano deve ser estruturado em FASES que culminam nesta data\n`;
  context += `- Última corrida longa: 2 semanas antes (Semana ${weeksUntilRace - 2})\n`;
  context += `- Início do Taper: Semana ${weeksUntilRace - 2}\n`;
  context += `- Volume máximo (pico): Semana ${weeksUntilRace - 3}\n`;
  context += `- Taper progressivo:\n`;
  context += `  * Semana ${weeksUntilRace - 2}: 70% do volume pico\n`;
  context += `  * Semana ${weeksUntilRace - 1}: 50% do volume pico\n`;
  context += `  * Semana ${weeksUntilRace} (prova): 30% do volume, descanso 2-3 dias antes\n`;
}
```

---

### **Passo 2: Prompt MUITO Mais Específico**

Adicionar seção dedicada ao taper com protocolo científico:

```typescript
const systemPrompt = `...

## 🎯 PERIODIZAÇÃO COM CORRIDAS A/B/C - PROTOCOLO COMPLETO

### **CORRIDA A (Objetivo Principal)**

A Corrida A é o OBJETIVO PRINCIPAL do atleta. TODO o plano deve ser estruturado em torno dela.

**ESTRUTURA OBRIGATÓRIA:**

1. **Fase Base (primeiras 30-40% das semanas)**
   - Construir volume aeróbico gradualmente
   - Progressão: +10% volume/semana (máximo)
   - Qualidade: Mínima (apenas 1x/semana fartlek/tempo leve)
   - Longão: 20-30% do volume semanal

2. **Fase Desenvolvimento (40-60% das semanas)**
   - Volume se aproxima do máximo
   - Adicionar treinos de qualidade: 2x/semana
   - Introduzir ritmo de prova nos treinos
   - Longão: 30-35% do volume semanal

3. **Fase Pico (Semana -3 antes da corrida)**
   - VOLUME MÁXIMO do atleta
   - Intensidade ALTA: treinos em ritmo de prova
   - Longão MAIS LONGO do ciclo (mas não mais de 35km para maratona, 20km para meia)
   - ÚLTIMA semana pesada antes do taper

4. **Fase Taper (Semanas -2 e -1)**
   - **Semana -2:**
     * Volume: 70% do pico
     * Longão: 60-70% do longão máximo (ÚLTIMA corrida longa!)
     * Qualidade: 1x sessão curta em ritmo de prova
     * Manter INTENSIDADE, reduzir VOLUME
   
   - **Semana -1 (Semana da Prova):**
     * Volume: 30-40% do pico
     * Segunda: Corrida fácil 5-8km
     * Terça: DESCANSO ou 3-5km muito fácil
     * Quarta/Quinta: 5km com 3-4x 1km em ritmo de prova (manter pernas vivas)
     * Sexta: 3km MUITO fácil OU descanso
     * Sábado (se prova domingo): DESCANSO TOTAL
     * Domingo: 🏁 CORRIDA!

**EXEMPLO PRÁTICO - 12 semanas até Meia Maratona:**
```
Semanas 1-4: Base (25→40km, longão 10→15km)
Semanas 5-8: Desenvolvimento (40→50km, longão 15→18km, qualidade 2x)
Semana 9-10: Pico (50→55km, longão 18→20km, qualidade intensa)
Semana 11: Taper 1 (40km = 70%, longão 14km ÚLTIMO, qualidade 1x)
Semana 12: Taper 2 (20km = 35%, corridas fáceis, descanso 2 dias antes)
           DOMINGO: 🏁 MEIA MARATONA!
```

### **CORRIDA B (Preparatória)**

Use como simulado/teste de ritmo 4-8 semanas antes da Corrida A.

**PROTOCOLO:**
- Mini-taper: Semana da corrida com 80-85% volume
- Sem redução de volume na semana anterior
- Treino de qualidade 3-4 dias antes: curto e em ritmo
- Descanso 1 dia antes
- Semana seguinte: Volume normal (não é taper completo)

**EXEMPLO - Corrida B (10K) 6 semanas antes da Corrida A:**
```
Semana -1: Volume normal (ex: 45km)
Semana da B: 40km (85%)
  - Seg: Fácil
  - Ter: DESCANSO
  - Qua: 5km com 3x1km ritmo 10K
  - Qui: Fácil 3km
  - Sex: DESCANSO
  - Sáb: 3km aquecimento
  - Dom: 🏁 10K (testar ritmo de prova)
Semana +1: Voltar ao volume normal (45km)
```

### **CORRIDA C (Volume)**

Tratar como treino longo intenso. SEM taper, SEM redução de volume.

**PROTOCOLO:**
- Volume da semana: 100% (normal)
- Substituir o longão pela corrida
- Sem descanso extra antes ou depois
- Use para acumular km e ganhar experiência

---

## ⚠️ REGRAS CRÍTICAS

1. **NUNCA ignore corridas cadastradas** - Se há Corrida A em 12 semanas, TODO o plano deve culminar nela
2. **SEMPRE aplique taper para Corrida A** - 2 semanas obrigatório (70% → 30%)
3. **ÚLTIMA corrida longa** deve ser 2 semanas antes da Corrida A (não 1 semana!)
4. **Manter INTENSIDADE** durante taper - Reduzir volume mas manter ritmo
5. **Descanso TOTAL** 1-2 dias antes da Corrida A
6. **Semana PICO** deve ser Semana -3 (não -2, não -1)

...
`;
```

---

### **Passo 3: Validar Estratégia Gerada**

Adicionar validação após IA gerar estratégia:

```typescript
function validateStrategyWithRaces(strategy: any, profile: AIUserProfile): boolean {
  if (!profile.raceGoals || profile.raceGoals.length === 0) return true;
  
  const corrida A = profile.raceGoals.find(r => r.priority === 'A');
  if (!raciaA) return true;
  
  const today = new Date();
  const raceDate = new Date(raciaA.date);
  const totalWeeks = Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  // Validar que última fase é "Taper" ou "Afinamento"
  const lastPhase = strategy.phases[strategy.phases.length - 1];
  const isTaperPhase = lastPhase.name.toLowerCase().includes('taper') || 
                       lastPhase.name.toLowerCase().includes('afinamento') ||
                       lastPhase.name.toLowerCase().includes('polimento');
  
  if (!isTaperPhase) {
    console.error('[AI PLAN] ❌ ERRO: Estratégia não tem fase de taper para Corrida A!');
    return false;
  }
  
  // Validar que taper tem 2-3 semanas
  if (lastPhase.weeks < 2) {
    console.error('[AI PLAN] ❌ ERRO: Taper muito curto! Mínimo 2 semanas.');
    return false;
  }
  
  // Validar redução de volume no taper
  const volumeReduction = (lastPhase.weeklyKmStart - lastPhase.weeklyKmEnd) / lastPhase.weeklyKmStart;
  if (volumeReduction < 0.5) { // Deve reduzir pelo menos 50%
    console.error('[AI PLAN] ❌ ERRO: Redução de volume no taper insuficiente!');
    return false;
  }
  
  console.log('[AI PLAN] ✅ Estratégia validada: Taper adequado para Corrida A');
  return true;
}
```

---

## 📋 Checklist de Implementação

- [ ] Enriquecer contexto das corridas (semana do plano, dias restantes, protocolo taper)
- [ ] Adicionar seção DETALHADA sobre Corrida A/B/C no prompt
- [ ] Adicionar EXEMPLOS PRÁTICOS de periodização no prompt
- [ ] Adicionar protocolo científico de taper
- [ ] Adicionar validação da estratégia gerada
- [ ] Adicionar logs detalhados para debug
- [ ] Testar com corrida em 8 semanas
- [ ] Testar com corrida em 12 semanas
- [ ] Testar com corrida em 16 semanas
- [ ] Testar com múltiplas corridas (A + B + C)

---

## 🎯 Resultado Esperado

### **ANTES (Problema):**
```
Semana 12 (Semana da Prova):
- Segunda: Corrida Fácil 8km
- Terça: Treino Intervalado 6x800m  ❌ (intenso demais!)
- Quarta: Corrida Moderada 10km      ❌ (volume demais!)
- Quinta: Musculação
- Sexta: Corrida Fácil 5km           ❌ (deveria descansar!)
- Sábado: Longão 15km                ❌❌❌ (NÃO pode ter longão na semana da prova!)
- Domingo: Descanso                  ❌ (ESTE é o dia da prova!)
```

### **DEPOIS (Correto):**
```
Semana 10 (Pico - 3 semanas antes):
- Segunda: Fácil 8km
- Terça: Intervalado 5x1km ritmo de prova
- Quarta: Fácil 6km + Musculação
- Quinta: Tempo Run 8km
- Sexta: DESCANSO
- Sábado: LONGÃO 20km (ÚLTIMO longão!)
- Domingo: Fácil 5km
VOLUME: 55km (MÁXIMO)

Semana 11 (Taper 1 - 2 semanas antes):
- Segunda: Fácil 8km
- Terça: DESCANSO
- Quarta: 5km + 3x1km ritmo de prova
- Quinta: Fácil 5km + Musculação leve
- Sexta: DESCANSO
- Sábado: Corrida longa moderada 14km (70% do longão máximo)
- Domingo: DESCANSO ou 3km muito fácil
VOLUME: 40km (70% do pico)

Semana 12 (Taper 2 - SEMANA DA PROVA):
- Segunda: Fácil 5km
- Terça: DESCANSO TOTAL
- Quarta: 5km + 3x800m ritmo de prova (manter pernas ativas)
- Quinta: Fácil 3km MUITO fácil
- Sexta: DESCANSO TOTAL
- Sábado: DESCANSO TOTAL ou caminhada 20min
- Domingo: 🏁 MEIA MARATONA 21K - BOA PROVA! 🎯
VOLUME: 20km (35% do pico)
```

---

**Status:** 📋 **ANÁLISE COMPLETA**  
**Próximo:** 🔧 **IMPLEMENTAR CORREÇÕES**

**Estimativa:** 3-4 horas (prompt complexo + validações + testes)
