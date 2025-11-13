# 🔍 ANÁLISE DO PROBLEMA: Geração de Planos pela IA

## 🚨 PROBLEMA IDENTIFICADO

**Observação do Usuário:**
> "O plano começa muito forte e termina ainda intermediário, no final o usuário nem chegou ao seu objetivo"

**Sintomas:**
- ✅ Plano é gerado
- ❌ Não há evolução clara no decorrer das semanas
- ❌ Começa "forte demais"
- ❌ Termina "fraco demais"
- ❌ Usuário não atinge preparação adequada para objetivo

---

## 📊 ANÁLISE DO SYSTEM PROMPT ATUAL

### 1. **Estrutura de Fases (CORRETO)**
```
Base → Build → Peak → Taper
```
✅ Estrutura clássica está correta

### 2. **Regras de Progressão (PRESENTES)**
```typescript
- Regra de 10% aumento semanal
- Cutback (20-30%) a cada 3-4 semanas
- 80/20 (baixa/alta intensidade)
```
✅ Princípios corretos

### 3. **Validação (IMPLEMENTADA)**
```typescript
- Verifica se tem taper
- Verifica se taper reduz volume 40%
- Verifica se tem fase de pico
- Verifica saltos de volume
```
✅ Validação existe

---

## 🔴 GAPS IDENTIFICADOS

### GAP 1: **Falta de Clareza sobre ONDE CHEGAR**

**Problema:**
```
IA sabe:
- Volume atual: 20km/sem
- Objetivo: 10km race

IA NÃO sabe explicitamente:
- Qual volume ideal para correr 10km confortavelmente?
- Qual longão mínimo necessário?
- Qual ritmo de prova precisa atingir?
```

**Consequência:**
- IA pode criar plano que sai de 20km/sem e chega em 30km/sem
- MAS para 10km, ideal seria 40-50km/sem
- = **Subpreparação**

---

### GAP 2: **Falta de "META DE PREPARAÇÃO"**

**Problema:**
```
System prompt diz:
"Siga a regra de 10%"
"Use 80/20"

Mas NÃO diz:
"Para 10km, volume pico deve ser X"
"Longão deve chegar em Y km antes do taper"
"Treino de qualidade deve chegar em Z intensidade"
```

**Consequência:**
- IA progride "genericamente"
- Não tem TARGET claro para onde ir

---

### GAP 3: **Falta de Lógica de "BUILDUP to TARGET"**

**Problema Atual:**
```json
{
  "phases": [
    {
      "name": "Base",
      "weeklyKmStart": 20,
      "weeklyKmEnd": 28  // ← IA escolhe baseado em "10%"
    },
    {
      "name": "Build", 
      "weeklyKmStart": 28,
      "weeklyKmEnd": 35  // ← Mas não sabe que deveria chegar em 50!
    }
  ]
}
```

**Deveria ser:**
```json
{
  "targetPreparation": {
    "peakVolume": 50,      // ← META para 10km
    "longestRun": 14,      // ← META (140% distância prova)
    "qualityIntensity": "race pace"
  },
  "phases": [
    {
      "name": "Base",
      "weeklyKmStart": 20,
      "weeklyKmEnd": 35,    // ← Progride PARA chegar no pico
      "buildupTo": "targetPreparation"
    },
    {
      "name": "Build",
      "weeklyKmStart": 35,
      "weeklyKmEnd": 50,    // ← ATINGE o target
    },
    {
      "name": "Peak",
      "weeklyKmStart": 50,
      "weeklyKmEnd": 50,    // ← MANTÉM no pico
    }
  ]
}
```

---

### GAP 4: **Exemplo no Prompt é para 12 SEMANAS**

**Problema:**
```json
// System prompt mostra exemplo:
"12 semanas para Meia Maratona"
"Progressão: 35 → 45 → 55 → 60 → taper"
```

**Mas:**
- Usuário tem 7 semanas
- IA tenta "comprimir" o exemplo
- Resultado: Progressão não faz sentido

**Solução:**
- Dar múltiplos exemplos (7 semanas, 12 semanas, 16 semanas)
- OU dar PRINCÍPIOS ao invés de exemplo fixo

---

### GAP 5: **Falta de "REVERSE PLANNING"**

**IA pensa assim (FORWARD):**
```
Semana 1: Volume atual + 10%
Semana 2: Semana 1 + 10%
Semana 3: Semana 2 + 10%
...
```

**Deveria pensar assim (REVERSE + FORWARD):**
```
1. ONDE PRECISO CHEGAR? (target preparation)
2. QUANTO TEMPO TENHO? (total weeks)
3. ONDE ESTOU? (current volume)
4. QUAL PROGRESSÃO me leva de AQUI até LÁ?
```

---

## 💡 SOLUÇÃO PROPOSTA

### 1. **Adicionar TARGETS por Distância**

```typescript
const PREPARATION_TARGETS = {
  '5k': {
    peakVolume: { min: 35, ideal: 50, max: 70 },
    longestRun: { min: 8, ideal: 10, max: 12 },
    qualityFrequency: '2-3x/week',
    keyWorkouts: ['intervals 400-800m', 'tempo 3-5km']
  },
  '10k': {
    peakVolume: { min: 40, ideal: 55, max: 80 },
    longestRun: { min: 12, ideal: 14, max: 16 },
    qualityFrequency: '2x/week',
    keyWorkouts: ['intervals 1-2km', 'tempo 6-8km']
  },
  // ...
}
```

### 2. **Instrução Explícita de REVERSE PLANNING**

```
PASSO 1: DETERMINE O TARGET
- Para ${goalDistance}, qual preparação mínima necessária?
- Volume pico: X km/semana
- Longão: Y km
- Qualidade: Z intensidade

PASSO 2: CALCULE A JORNADA
- Estou em: ${currentVolume} km/semana
- Preciso chegar em: X km/semana
- Tenho: ${totalWeeks} semanas
- Progressão necessária: (X - current) / weeks disponíveis

PASSO 3: DISTRIBUA EM FASES
- Base: Construir até 70% do target
- Build: Atingir 100% do target
- Peak: Manter 100% do target
- Taper: Reduzir para 30-50%
```

### 3. **Exemplos Múltiplos no Prompt**

Adicionar exemplos para:
- 7 semanas (tempo curto)
- 12 semanas (ideal)
- 16 semanas (longo)

Para cada distância:
- 5k, 10k, 21k, 42k

### 4. **Validação Melhorada**

```typescript
// Além das validações atuais, adicionar:
- Verificar se volume pico atinge TARGET mínimo
- Verificar se longão atinge TARGET mínimo
- Verificar se progressão é realista (não sub nem super prepara)
```

### 5. **Feedback Loop**

```
"Se volume atual + progressão 10% * weeks < target mínimo:
  → AVISO: Tempo insuficiente, considerar:
     a) Meta menos ambiciosa
     b) Progressão mais agressiva (15% com cuidado)
     c) Aceitar subpreparação mas maximizar o possível"
```

---

## 🎯 EXEMPLO DO PROBLEMA

**Cenário:**
- Volume atual: 20km/sem
- Objetivo: 10km race
- Tempo: 7 semanas

**O que acontece HOJE:**
```
Semana 1: 20km (base)
Semana 2: 22km (+10%)
Semana 3: 24km (+10%)
Semana 4: 26km (+10%)
Semana 5: 29km (+10%)
Semana 6: 32km (+10% - peak)
Semana 7: 16km (taper -50%)
```
❌ **Problema:** Pico em 32km é INSUFICIENTE para 10km preparado!

**O que DEVERIA acontecer:**
```
1. IA calcula: "Para 10km, preciso de 50km/semana no pico"
2. IA vê: "Tenho 7 semanas, estou em 20km"
3. IA pensa: "Preciso ganhar 30km em ~5 semanas (7 - 2 taper)"
4. IA decide: "Isso é +6km/semana = progressão agressiva mas viável"

Resultado:
Semana 1: 20km (base)
Semana 2: 26km (+30%)
Semana 3: 32km (+23%)
Semana 4: 38km (+19%)
Semana 5: 45km (+18%)
Semana 6: 50km (+11% - peak!)
Semana 7: 25km (taper)
```
✅ **Atinge o target!** (Progressão mais agressiva, mas IA AVISA sobre o risco)

---

## 📝 PRÓXIMOS PASSOS

1. **Definir PREPARATION_TARGETS** para cada distância
2. **Refatorar System Prompt** com reverse planning
3. **Adicionar validação** de target atingido
4. **Testar** com cenários reais
5. **Ajustar** baseado em resultados

---

## 🏃 PERFIS REAIS DE CORREDORES (Expandido)

### **PERFIL 1: Experiente buscando tempo (Speed Seeker)**

**Características:**
- Já corre longas distâncias (21k, 42k) confortavelmente
- Volume alto e consolidado (70-120km/sem)
- Muita resistência aeróbica (força)
- **Objetivo:** Melhorar tempo em distâncias mais curtas (5k, 10k, 15k)

**Problema Típico:**
- "Consigo correr 42km mas meu 10km é lento"
- Base aeróbica forte, mas falta velocidade
- Acostumado com volume, não com intensidade

**O que o PLANO precisa:**
```
🎯 OBJETIVO PRIMÁRIO: Desenvolver VELOCIDADE
   Não é falta de resistência, é falta de turnover!

ESTRATÉGIA:
1. MANTER base aeróbica (não perder o forte)
2. REDUZIR volume ligeiramente (liberar energia)
3. ADICIONAR treinos de velocidade específicos
4. TRABALHAR economia de corrida

FASES:
- Base (2-3 sem): Manter volume, adicionar strides
- Build (4-6 sem): Intervalos progressivos (1500→1000→800→400m)
- Peak (2-3 sem): Treinos em race pace + velocidade máxima
- Taper (1-2 sem): Volume -50%, intensidade mantém

TREINOS CHAVE:
- Intervalos curtos (400-800m) em 5k pace
- Tempo runs em 10k pace
- Fartleks com picos de velocidade
- Trabalho técnico (drills, strides)

VOLUME PICO:
- Se está em 100km/sem → Reduzir para 80km/sem
- Foco: qualidade > quantidade
- 20% do volume em alta intensidade (inverter 80/20!)

MÉTRICA DE SUCESSO:
- Melhorar VDOT
- Pace de threshold 15-20s/km mais rápido
- 5k/10k time melhora 5-10%
```

---

### **PERFIL 2: Busca eficiência e resistência (Endurance Optimizer)**

**Características:**
- Consegue correr, mas sente muito esforço
- Quer ir mais longe com menos cansaço
- Volume baixo/médio (20-50km/sem)
- **Objetivo:** Correr mais confortavelmente, aumentar resistência

**Problema Típico:**
- "Depois de 8km já estou destruído"
- "Ritmo lento mas me sinto correndo forte"
- Falta de base aeróbica sólida
- Pode estar correndo rápido demais nos treinos fáceis

**O que o PLANO precisa:**
```
🎯 OBJETIVO PRIMÁRIO: Construir BASE AERÓBICA sólida
   80% dos treinos devem ser REALMENTE fáceis!

ESTRATÉGIA:
1. REDUZIR pace dos treinos fáceis (paradoxo: ir devagar para ir longe)
2. AUMENTAR volume gradualmente (adaptação)
3. FOCO em longões progressivos
4. Ensinar diferença entre zonas

FASES:
- Base Extendida (60-70% do plano): Volume aeróbico puro
- Build Conservador: Qualidade MUITO progressiva
- Peak Moderado: Manter conforto, não destruir
- Taper Suave

TREINOS CHAVE:
- Easy runs verdadeiramente fáceis (conversação fluente)
- Longões progressivos (começa fácil, termina moderado)
- Tempo runs curtos (10-15min) para ensinar limiar
- SEM intervalados por enquanto (não está pronto)

VOLUME PICO:
- Se está em 20km/sem → Chegar em 40-50km/sem
- Se está em 40km/sem → Chegar em 60-70km/sem
- Progressão: 10% semanal COM cutbacks

EDUCAÇÃO:
- Ensinar o que é "pace fácil" (RPE 2-4/10)
- Explicar adaptação aeróbica (mitocôndrias, capilares)
- Reforçar: "Devagar constrói rápido"

MÉTRICA DE SUCESSO:
- Mesmo pace, menor FC (eficiência cardíaca)
- Longão aumenta sem sofrimento proporcional
- Recuperação entre treinos melhora
```

---

### **PERFIL 3: Corredor casual (Recreational Runner)**

**Características:**
- Corre regularmente mas sem meta específica
- Quer melhorar "em geral"
- Volume estável (30-50km/sem)
- **Objetivo:** Ser um corredor melhor, mais completo

**Problema Típico:**
- "Corro a mesma coisa todo dia"
- Progresso estagnou
- Falta variedade e desafio
- Não sabe como melhorar

**O que o PLANO precisa:**
```
🎯 OBJETIVO PRIMÁRIO: VARIEDADE e DESENVOLVIMENTO COMPLETO
   Quebrar monotonia, criar desafios progressivos

ESTRATÉGIA:
1. VARIAR tipos de treino (evitar platô)
2. Desenvolver TODOS os sistemas (aeróbico, limiar, velocidade)
3. Adicionar DESAFIOS motivadores
4. Criar senso de PROGRESSÃO clara

FASES:
- Base Variada: Easy + Fartleks + Longões
- Build Completo: Adicionar tempo runs e intervalos leves
- Peak: Semanas com treinos desafiadores
- Recovery: Semanas mais leves (ciclagem)

TREINOS CHAVE:
- Fartleks divertidos (por sensação)
- Tempo runs progressivos
- Intervalos em pista (novidade!)
- Longões com variações (long progressivo, long com ritmo)

VOLUME PICO:
- Aumentar 20-30% do atual
- Foco em QUALIDADE da experiência
- Cada semana deve ser diferente

ENGAJAMENTO:
- Desafios semanais ("Tente fazer X")
- Comparação consigo mesmo ("Na semana 1 você fazia Y, agora faz Z!")
- Celebrar pequenas vitórias

MÉTRICA DE SUCESSO:
- VDOT melhora 2-3 pontos
- Longão +3-5km
- Pace médio melhora 10-15s/km
- Mais importante: ENGAJAMENTO ALTO!
```

---

### **PERFIL 4: Iniciante absoluto (True Beginner)**

**Características:**
- NUNCA correu
- Zero experiência em corrida
- Não sabe nada sobre paces, zonas, treinos
- **Objetivo:** Começar a correr sem se machucar

**Problema Típico:**
- "Não sei por onde começar"
- "Tentei correr e não consegui"
- Medo de lesão, de fracasso
- Ansiedade sobre "fazer certo"

**O que o PLANO precisa:**
```
🎯 OBJETIVO PRIMÁRIO: CRIAR HÁBITO e CONFIANÇA
   Sucesso = Pessoa vira "corredor" sem se lesionar

ESTRATÉGIA:
1. COMEÇAR do BÁSICO (caminhada → trote → corrida)
2. CELEBRAR cada pequena vitória
3. EDUCAR sobre corrida (é processo longo)
4. PREVENIR lesões (progressão ultra conservadora)

FASES ESPECIAIS:
- Adaptação (3-4 sem): Walk/run, construir articulações
- Transição (3-4 sem): Mais run, menos walk
- Consolidação (4-6 sem): Corrida contínua curta
- Desenvolvimento: Aumentar distância gradualmente

PROTOCOLO WALK/RUN:
Semana 1-2: 1min trote + 2min caminhada (10x)
Semana 3-4: 2min trote + 1min caminhada (10x)
Semana 5-6: 3min trote + 1min caminhada (8x)
Semana 7: Primeira corrida contínua 15-20min!

TREINOS:
- SEM pace específico (por sensação: "confortável")
- SEM qualidade (zero velocidade por 8-12 semanas)
- FOCO em tempo, não distância
- Descanso é OBRIGATÓRIO

EDUCAÇÃO CONTÍNUA:
- "Seu corpo está se adaptando, demora!"
- "Dor = pare. Desconforto = ok"
- "Tênis adequado é investimento"
- "Descanso é quando fica forte"

VOLUME:
- Não pensar em km/semana ainda
- Pensar em MINUTOS de atividade
- Meta: 60-90 min/semana de movimento

MÉTRICA DE SUCESSO:
- Completar 30min corrida contínua
- Zero lesões
- Criar hábito (3x/semana consistente)
- QUERER continuar!
```

---

## 🎯 MATRIZ DE PRIORIDADES POR PERFIL

| Perfil | Objetivo Primário | Volume | Intensidade | Educação | Risco Lesão |
|--------|------------------|--------|-------------|----------|-------------|
| **Speed Seeker** | Velocidade | Reduzir 10-20% | ALTA (30%) | Técnica avançada | Baixo (experiente) |
| **Endurance Optimizer** | Base aeróbica | Aumentar 50-100% | BAIXA (10%) | Zonas de treino | Médio (overtraining) |
| **Recreational Runner** | Variedade | Aumentar 20-30% | MÉDIA (20%) | Periodização | Baixo-Médio |
| **True Beginner** | Hábito + Confiança | Construir do zero | ZERO (0%) | Fundamentos | ALTO (tudo é novo) |

---

## 🧠 DECISÕES DA IA BASEADAS EM PERFIL

### **Como a IA deve DETECTAR o perfil?**

```typescript
function detectRunnerProfile(user) {
  const volume = user.currentWeeklyKm;
  const experience = user.runningYears;
  const hasRaceTimes = user.usualPaces?.length > 0;
  const longestRun = user.longestRun;
  const goal = user.goalDistance;
  
  // TRUE BEGINNER
  if (volume === 0 || experience === 0 || !hasRunBefore) {
    return {
      profile: 'TRUE_BEGINNER',
      priority: 'build_habit',
      riskLevel: 'HIGH',
      approach: 'ultra_conservative'
    };
  }
  
  // SPEED SEEKER
  if (volume >= 70 && longestRun >= 20 && 
      ['5k', '10k', '15k'].includes(goal) &&
      experience >= 2) {
    return {
      profile: 'SPEED_SEEKER',
      priority: 'develop_speed',
      riskLevel: 'LOW',
      approach: 'quality_focused'
    };
  }
  
  // ENDURANCE OPTIMIZER
  if (volume < 50 && 
      user.motivation?.includes('resistência') ||
      user.goal === 'ir_mais_longe') {
    return {
      profile: 'ENDURANCE_OPTIMIZER',
      priority: 'aerobic_base',
      riskLevel: 'MEDIUM',
      approach: 'volume_focused'
    };
  }
  
  // RECREATIONAL RUNNER (default intermediário)
  return {
    profile: 'RECREATIONAL_RUNNER',
    priority: 'complete_development',
    riskLevel: 'LOW_MEDIUM',
    approach: 'balanced_varied'
  };
}
```

### **Como a IA deve ADAPTAR o plano?**

```
SE perfil = SPEED_SEEKER:
  - Targets de volume: REDUZIR 10-20%
  - Targets de intensidade: AUMENTAR para 30%
  - Foco: Intervalos curtos + técnica
  - Longão: Manter mas não aumentar
  - Força: Explosiva, não resistência

SE perfil = ENDURANCE_OPTIMIZER:
  - Targets de volume: AUMENTAR 50-100%
  - Targets de intensidade: Manter 10% ou menos
  - Foco: Easy runs + longões progressivos
  - Qualidade: Só tempo runs suaves
  - Educação: Explicar zonas, paciência

SE perfil = RECREATIONAL_RUNNER:
  - Targets de volume: AUMENTAR 20-30%
  - Targets de intensidade: 20% balanceado
  - Foco: VARIEDADE (fartlek, tempo, intervalos)
  - Cada semana diferente
  - Desafios motivadores

SE perfil = TRUE_BEGINNER:
  - Targets: NÃO use km, use MINUTOS
  - Walk/run protocol obrigatório
  - ZERO intensidade por 8-12 semanas
  - Foco: Criar hábito sem lesão
  - Tom: Encorajador, educativo, paciente
```

---

## 🎯 REVERSE PLANNING ADAPTADO POR PERFIL

### **SPEED SEEKER (Exemplo: 10km em 12 semanas)**
```
ANÁLISE:
- Volume atual: 90km/sem
- Objetivo: 10km race
- VDOT atual: 48 (baseado em tempos)
- Meta: VDOT 52 (melhorar tempo)

REVERSE PLANNING:
1. TARGET: Não é volume, é VELOCIDADE
   - Threshold pace: De 4:45 para 4:30 min/km
   - Interval pace: De 4:20 para 4:05 min/km
   
2. JORNADA:
   - Semanas 1-3: Manter volume, adicionar strides
   - Semanas 4-8: Reduzir volume 10%, intensidade 2x/sem
   - Semanas 9-10: Peak de qualidade (3x/sem)
   - Semanas 11-12: Taper mantendo intensidade

3. VOLUME:
   90km → 85km → 80km (REDUZIR para treinar qualidade)
   
4. INTENSIDADE:
   10% → 20% → 30% do volume (AUMENTAR progressivamente)
```

### **ENDURANCE OPTIMIZER (Exemplo: 21km em 16 semanas)**
```
ANÁLISE:
- Volume atual: 25km/sem
- Objetivo: 21km race
- Problema: Sente muito esforço em distâncias curtas
- Meta: Correr com conforto

REVERSE PLANNING:
1. TARGET: Volume aeróbico sólido
   - Peak volume: 70km/sem (para 21km confortável)
   - Longão: 22-24km
   - 85% do volume em baixa intensidade

2. JORNADA:
   - De 25km → 70km = +45km em 14 semanas (antes taper)
   - Progressão: +3-4km/semana (conservadora)
   
3. FASES:
   Sem 1-8: Base (25→50km) - SEM qualidade
   Sem 9-12: Build (50→70km) - Qualidade leve
   Sem 13-14: Peak (70km) - Manter volume
   Sem 15-16: Taper (35km)

4. INTENSIDADE:
   90% fácil (primeiras 8 sem)
   85% fácil (sem 9-12)
   80% fácil (peak)
```

### **TRUE BEGINNER (Exemplo: 5km em 12 semanas)**
```
ANÁLISE:
- Volume atual: 0
- Objetivo: Completar 5km sem parar
- Experiência: Nenhuma
- Meta: Virar "corredor"

REVERSE PLANNING:
1. TARGET: Não é km, é CAPACIDADE
   - Meta: 30min corrida contínua
   - Depois: Aumentar para 40min (≈5km)
   
2. JORNADA ESPECIAL:
   Sem 1-2: Adaptação articular (walk/run)
   Sem 3-4: Transição (mais run)
   Sem 5-6: Primeira corrida contínua 15min
   Sem 7-8: Aumentar para 20-25min
   Sem 9-10: Chegar em 30min contínuo!
   Sem 11-12: Preparar para 5km (35-40min)

3. PROTOCOLO:
   NÃO usar km/semana
   Usar: "X minutos de atividade física"
   
4. PROGRESSÃO:
   Foco: TEMPO de movimento, não distância
   Qualidade: ZERO (só sensação "confortável")
   Frequência: 3x/semana (consistência > volume)
```

---

## 📊 VALIDAÇÃO ADAPTADA POR PERFIL

```typescript
function validatePlanByProfile(plan, profile, user) {
  
  if (profile === 'SPEED_SEEKER') {
    // Validar que volume REDUZ e intensidade AUMENTA
    if (plan.peakVolume > user.currentVolume) {
      warn("Speed seeker não precisa mais volume!");
    }
    if (plan.intensityPercent < 25) {
      error("Speed seeker precisa mais qualidade!");
    }
  }
  
  if (profile === 'ENDURANCE_OPTIMIZER') {
    // Validar que volume AUMENTA suficientemente
    const targetVolume = getTargetVolumeForDistance(user.goalDistance);
    if (plan.peakVolume < targetVolume * 0.8) {
      error(`Volume pico ${plan.peakVolume} insuficiente! Mínimo ${targetVolume * 0.8}km`);
    }
    if (plan.intensityPercent > 15) {
      warn("Endurance optimizer deve focar em volume, não intensidade!");
    }
  }
  
  if (profile === 'TRUE_BEGINNER') {
    // Validar que começa MUITO devagar
    if (plan.week1.includes('corrida contínua')) {
      error("Iniciante deve começar com walk/run!");
    }
    if (plan.hasQuality antes de semana 8) {
      error("Iniciante não deve ter qualidade por 8+ semanas!");
    }
  }
}
```

---

## 🎨 TOM E LINGUAGEM POR PERFIL

### **SPEED SEEKER**
```
Tom: Técnico, desafiador, respeitoso
Linguagem: "Foco em economy", "VO2max intervals", "lactate threshold"

Exemplo:
"Dado seu volume consolidado de 90km/sem, o limitador não é resistência aeróbica.
Vamos trabalhar velocidade específica com intervalados curtos (400-800m) para 
melhorar seu turnover e economia de corrida. Reduziremos volume 10% para 
garantir recuperação adequada para treinos de qualidade."
```

### **ENDURANCE OPTIMIZER**
```
Tom: Educativo, paciente, encorajador
Linguagem: "Base aeróbica", "adaptação gradual", "ritmo confortável"

Exemplo:
"Seu objetivo é correr com mais conforto. O segredo? Paradoxalmente, é correr 
DEVAGAR agora para correr mais rápido e mais longe depois. Vamos construir sua
base aeróbica com paciência. Seus treinos fáceis devem ser REALMENTE fáceis - 
conseguir conversar fluentemente. Seu corpo está se adaptando mesmo quando
parece 'muito devagar'."
```

### **RECREATIONAL RUNNER**
```
Tom: Motivador, divertido, desafiador
Linguagem: "Vamos experimentar", "desafio desta semana", "evolução clara"

Exemplo:
"Esta semana vamos quebrar a monotonia! Terça: fartlek divertido (corra forte
até aquela árvore, depois recupere até sentir-se pronto). Quinta: tempo run 
estruturado. Domingo: longão progressivo. Cada treino é uma aventura diferente,
e você vai sentir a evolução claramente."
```

### **TRUE BEGINNER**
```
Tom: Encorajador, simples, acolhedor
Linguagem: Sem jargões, explicações claras, celebração de vitórias

Exemplo:
"Parabéns por dar esse primeiro passo! Esta semana você vai alternar entre 
caminhar e trotar levemente. Não se preocupe com velocidade ou distância - 
foque em completar os minutos propostos. É normal sentir um pouco de 
desconforto muscular (é seu corpo adaptando!), mas se sentir dor, PARE. 
Você está construindo a base para se tornar um corredor!"
```

---

**Análise expandida completa. Aguardando aprovação para implementar sistema inteligente de perfis!**
