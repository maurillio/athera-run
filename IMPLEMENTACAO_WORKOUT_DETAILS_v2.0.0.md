# 🎯 Implementação: Sistema Avançado de Apresentação de Treinos

**Versão:** 2.0.0  
**Data:** 10 de Novembro de 2025  
**Objetivo:** Transformar apresentação de treinos seguindo best practices mundiais

---

## 📋 Roadmap de Implementação

### FASE 1: Schema e Tipos (Backend) ⏱️ 1-2h

**1.1 Atualizar Prisma Schema**
```prisma
model CustomWorkout {
  // ... campos existentes ...
  
  // 🆕 Novos campos estruturados
  warmUp          Json?     // Estrutura de aquecimento detalhada
  mainWorkout     Json?     // Parte principal estruturada
  coolDown        Json?     // Desaquecimento estruturado
  
  tips            String[]  // Array de dicas práticas
  objective       String?   // Objetivo fisiológico do treino
  scientificBasis String?   // Fundamento científico
  intensityLevel  Int?      // 1-5 (Muito Leve → Muito Intenso)
  expectedRPE     Int?      // Rate of Perceived Exertion (1-10)
  heartRateZones  Json?     // Zonas de FC para cada fase
  
  // Estrutura para intervalos
  intervals       Json?     // { work: {}, recovery: {}, repetitions: n }
  
  // Enriquecimento educacional
  commonMistakes  String[]  // Erros comuns a evitar
  successCriteria String[]  // Como saber que fez bem
  
  @@map("custom_workouts")
}
```

**1.2 Criar TypeScript Interfaces**
```typescript
// lib/types/workout-structure.ts

export interface WorkoutPhase {
  duration: number; // minutos
  description: string;
  steps: string[]; // Lista de passos
  intensity: 'very-easy' | 'easy' | 'moderate' | 'hard' | 'very-hard';
  heartRateZone?: { min: number; max: number };
  pace?: string;
  notes?: string[];
}

export interface IntervalStructure {
  workInterval: {
    duration: number | string; // "2 min" ou "400m"
    pace: string;
    intensity: string;
  };
  recoveryInterval: {
    duration: number | string;
    type: 'jog' | 'walk' | 'rest';
    pace?: string;
  };
  repetitions: number;
  notes?: string[];
}

export interface EnhancedWorkout {
  id: number;
  // Campos existentes...
  
  // Estrutura em 3 fases
  warmUp?: WorkoutPhase;
  mainWorkout: WorkoutPhase | IntervalStructure;
  coolDown?: WorkoutPhase;
  
  // Enriquecimento educacional
  objective: string;
  scientificBasis?: string;
  tips: string[];
  commonMistakes?: string[];
  successCriteria?: string[];
  
  // Métricas
  intensityLevel: 1 | 2 | 3 | 4 | 5;
  expectedRPE: number; // 1-10
  expectedDuration: number; // minutos total
}
```

---

### FASE 2: Prompt da IA (Geração Inteligente) ⏱️ 2-3h

**2.1 Atualizar ai-plan-generator.ts**

Adicionar seção específica no prompt:

```typescript
const promptEnhancement = `
## 🎯 ESTRUTURA OBRIGATÓRIA DE CADA TREINO

TODOS os treinos DEVEM seguir esta estrutura em 3 fases:

### 1. AQUECIMENTO (Warm-Up) 🔥
Duração: 10-20 minutos (treinos intensos = mais longo)
Componentes obrigatórios:
- Ativação aeróbica leve (5-10 min trote/caminhada)
- Drills dinâmicos (leg swings, high knees, butt kicks, lunges)
- Acelerações progressivas (2-4x20-60m a 85-95% intensidade)

Para INTERVALOS/TEMPO RUN:
- Aumentar duração do aquecimento
- Incluir ativação específica (glúteos, quadríceps, posteriores)
- Adicionar strides no pace do treino

### 2. PARTE PRINCIPAL (Main Workout) ⚡
Estrutura varia conforme tipo:

**A) Corrida Contínua (Easy, Tempo, Longão):**
- Distância/Duração
- Pace alvo
- Zona de FC
- Critério de esforço (ex: "conversar facilmente", "frases curtas")
- Pontos de atenção (hidratação, alimentação, técnica)

**B) Treino Intervalado:**
- Work Interval: duração, distância, pace, intensidade
- Recovery Interval: duração, tipo (jog/walk), pace
- Número de repetições
- Ratio work:recovery
- Como executar cada repetição
- Critérios de parada (se não conseguir manter pace)

**C) Treino Misto:**
- Sequência completa de atividades
- Transições entre fases
- Carga de trabalho de cada parte

### 3. DESAQUECIMENTO (Cool-Down) 🧘
Duração: 5-15 minutos
Componentes obrigatórios:
- Trote/caminhada leve (5-10 min)
- Alongamento estático (20-30s cada grupo muscular):
  * Posteriores de coxa (hamstrings)
  * Quadríceps
  * Panturrilha
  * Glúteos
  * Flexores do quadril

---

## 📚 ENRIQUECIMENTO EDUCACIONAL OBRIGATÓRIO

Para CADA treino, você DEVE incluir:

### 🎯 OBJETIVO FISIOLÓGICO
Explique o que o treino desenvolve:
- Exemplo: "Desenvolver resistência aeróbica e melhorar utilização de gordura como combustível"
- Exemplo: "Aumentar VO₂max e capacidade de sustentar ritmos intensos"
- Exemplo: "Melhorar limiar de lactato e ritmo de prova"

### 💡 DICAS PRÁTICAS (3-5 dicas)
- Como executar corretamente
- Sinais para observar
- Ajustes durante o treino
- Momento ideal do dia
- Alimentação/hidratação
Exemplo:
- "Mantenha postura ereta e olhar no horizonte"
- "Cadência ideal: 170-180 passos por minuto"
- "Hidrate a cada 20-30 minutos em treinos longos"

### ⚠️ CUIDADOS IMPORTANTES (2-3 alertas)
- Sinais de alerta
- Quando parar
- Prevenção de lesões
Exemplo:
- "Se sentir dor aguda, pare imediatamente"
- "Não force o pace; respeite as zonas de FC"
- "Aumente volume gradualmente (máx 10% por semana)"

### 📊 CRITÉRIOS DE SUCESSO (2-3 critérios)
Como saber se executou bem:
Exemplo:
- "Conseguiu manter pace constante durante todo o treino"
- "FC permaneceu na zona alvo (±5 bpm)"
- "Terminou com energia para completar cool-down"

---

## 🎨 TIPOS DE TREINO E SUAS ESPECIFICIDADES

### LONGÃO (Long Run) ⛰️
**Intensidade:** 1-2/5
**RPE:** 3-5/10
**FC Zone:** 60-75% máxima

Estrutura:
\`\`\`
1. Aquecimento: 10 min progressivo
2. Parte Principal:
   • Distância planejada em ritmo constante
   • Pace: Z2 (conversação fácil)
   • Foco: volume, não velocidade
   • Hidratação: a cada 20-30 min
   • Alimentação: gel/goma a cada 45-60 min (>90 min)
3. Desaquecimento: 5-10 min + stretching completo
\`\`\`

Objetivo: Resistência aeróbica, eficiência metabólica
Dicas:
- Mantenha ritmo que permitta conversar
- Últimos km podem ser ligeiramente mais rápidos
- Foco em boa técnica mesmo cansado

### INTERVALOS (Interval Training) ⚡
**Intensidade:** 4-5/5
**RPE:** 7-9/10
**FC Zone:** 85-95% máxima

Estrutura:
\`\`\`
1. Aquecimento: 15-20 min
   • 10 min trote fácil
   • 5 min drills dinâmicos
   • 3-4 strides a 90% intensidade
   
2. Série Principal:
   • Exemplo: 8 x 400m
   • Work: 400m @ pace 5k (4:30/km)
   • Recovery: 200m trote suave ou 2-3 min rest
   • Total reps: completar todas com boa forma
   
3. Desaquecimento: 10 min trote + stretching
\`\`\`

Objetivo: VO₂max, velocidade, economia de corrida
Dicas:
- Acelere progressivamente em cada repeat
- Recuperação COMPLETA entre séries
- Última rep deve ser tão boa quanto primeira

### TEMPO RUN (Threshold) ⏱️
**Intensidade:** 3-4/5
**RPE:** 6-8/10
**FC Zone:** 80-90% máxima

Estrutura:
\`\`\`
1. Aquecimento: 15 min fácil + drills
2. Parte Principal:
   • 20-40 min em pace de limiar
   • Pace: "confortavelmente difícil"
   • Teste: consegue falar frases curtas
   • Esforço: poderia manter por 60 min
3. Desaquecimento: 10 min fácil + stretching
\`\`\`

Objetivo: Limiar de lactato, ritmo de prova
Dicas:
- Não comece rápido demais
- Foque em manter pace constante
- Respiração controlada mas trabalhada

### REGENERATIVO (Easy/Recovery) ❤️
**Intensidade:** 1/5
**RPE:** 2-4/10
**FC Zone:** 60-70% máxima

Estrutura:
\`\`\`
1. Aquecimento: Integrado (primeiros km progressivos)
2. Parte Principal:
   • Ritmo MUITO confortável
   • Teste: conversa fácil e fluida
   • Objetivo: recuperação ativa
3. Desaquecimento: Últimos km + stretching leve
\`\`\`

Objetivo: Recuperação, adaptação aeróbica base
Dicas:
- Regra: se ficou sem fôlego = muito rápido!
- Foque em movimento, não performance
- Aproveite para trabalhar técnica

---

## 📝 FORMATO DE SAÍDA JSON

Gere cada workout com esta estrutura:

\`\`\`json
{
  "dayOfWeek": 1,
  "date": "2025-11-11",
  "type": "long_run",
  "title": "Longão Base Aeróbica",
  "description": "Corrida longa para desenvolver resistência",
  "distance": 15,
  "targetPace": "6:00",
  "duration": 90,
  
  "warmUp": {
    "duration": 10,
    "description": "Aquecimento progressivo para longão",
    "steps": [
      "5 min caminhada rápida ou trote muito leve",
      "Drills dinâmicos: 10 leg swings cada perna, 10 high knees, 10 butt kicks",
      "2 acelerações de 40m progressivas (60% → 85% intensidade)"
    ],
    "intensity": "very-easy",
    "heartRateZone": { "min": 50, "max": 65 },
    "notes": ["Comece devagar", "Prepare corpo para esforço prolongado"]
  },
  
  "mainWorkout": {
    "duration": 90,
    "description": "15km em ritmo confortável de conversação",
    "steps": [
      "Mantenha pace constante de 6:00/km durante todo o percurso",
      "Foque em boa postura: olhar no horizonte, ombros relaxados",
      "Cadência: 170-180 passos por minuto",
      "Hidrate a cada 20-30 minutos",
      "Se treino >90min: gel/goma a cada 45-60 min"
    ],
    "intensity": "easy",
    "heartRateZone": { "min": 60, "max": 70 },
    "pace": "6:00",
    "notes": [
      "Deve conseguir conversar facilmente durante todo o treino",
      "Últimos 2km podem ser ligeiramente mais rápidos (progressivo)",
      "Se sentir muito cansado, reduza pace ao invés de parar"
    ]
  },
  
  "coolDown": {
    "duration": 10,
    "description": "Desaquecimento e alongamento",
    "steps": [
      "5 min trote muito leve ou caminhada",
      "Alongamento estático (20-30s cada):",
      "• Posteriores de coxa (hamstrings)",
      "• Quadríceps",
      "• Panturrilha",
      "• Glúteos",
      "• Flexores do quadril"
    ],
    "intensity": "very-easy",
    "notes": ["Não pule o alongamento", "Hidrate e alimente-se após"]
  },
  
  "objective": "Desenvolver resistência aeróbica de base, melhorar eficiência na utilização de gordura como combustível, e preparar sistema cardiovascular para esforços prolongados",
  
  "scientificBasis": "Corridas longas em Z2 (60-70% FC max) maximizam adaptações mitocondriais, aumentam densidade capilar, e treinam o corpo a usar gordura eficientemente, economizando glicogênio para esforços mais intensos.",
  
  "tips": [
    "Mantenha ritmo que permita conversar facilmente - se ficou sem fôlego, está rápido demais",
    "Foque em completar a distância, não em bater recordes de pace",
    "Use este treino para trabalhar aspectos técnicos: postura, cadência, respiração",
    "Planeje rota com água disponível ou leve garrafa/mochila de hidratação",
    "Alimente-se 1-2h antes com carboidratos de fácil digestão"
  ],
  
  "commonMistakes": [
    "Começar rápido demais e não conseguir completar a distância",
    "Pular aquecimento e desaquecimento",
    "Não hidratar adequadamente em treinos longos (>60 min)"
  ],
  
  "successCriteria": [
    "Completou a distância planejada sem parar",
    "FC permaneceu na zona alvo (60-70% máxima)",
    "Terminou com energia para fazer cool-down completo",
    "Conseguiu conversar facilmente durante maior parte do treino"
  ],
  
  "intensityLevel": 2,
  "expectedRPE": 4,
  "expectedDuration": 110
}
\`\`\`

---

## ✅ CHECKLIST DE VALIDAÇÃO

Antes de gerar o plano, verifique:

- [ ] TODOS os treinos têm estrutura de 3 fases (warm-up, main, cool-down)
- [ ] CADA treino tem objetivo fisiológico claro
- [ ] CADA treino tem 3-5 dicas práticas
- [ ] CADA treino tem 2-3 alertas de segurança
- [ ] CADA treino tem critérios de sucesso
- [ ] Intervalados têm estrutura work/recovery detalhada
- [ ] Longões têm orientações de hidratação/alimentação
- [ ] Treinos intensos têm aquecimento mais longo e detalhado
- [ ] Desaquecimentos incluem alongamentos específicos
- [ ] Paces e zonas de FC são coerentes com nível do atleta

---

## 🎯 PRIORIDADES POR TIPO DE ATLETA

### Iniciante
- Foque em explicações claras e simples
- Mais dicas práticas
- Enfatize prevenção de lesões
- Use linguagem acessível

### Intermediário
- Balance teoria e prática
- Inclua fundamentos científicos
- Dê mais autonomia para ajustes

### Avançado
- Aprofunde fundamentos científicos
- Assuma conhecimento técnico
- Foque em otimização

---

IMPORTANTE: Esta estrutura é OBRIGATÓRIA para TODOS os treinos gerados.
Não gere treinos simples sem essas informações!
`;

// Adicionar ao prompt principal em ai-plan-generator.ts
```

**2.2 Exemplos de Treinos para IA**

Criar arquivo com exemplos para "few-shot learning":

```typescript
// lib/ai-workout-examples.ts

export const workoutExamples = {
  longRun: {
    // Exemplo completo de longão...
  },
  intervals: {
    // Exemplo completo de intervalos...
  },
  tempo: {
    // Exemplo completo de tempo run...
  },
  easy: {
    // Exemplo completo de regenerativo...
  }
};
```

---

### FASE 3: Componente Frontend (Apresentação) ⏱️ 3-4h

**3.1 Criar WorkoutDetailCard.tsx**

```typescript
// components/workout/WorkoutDetailCard.tsx

interface Props {
  workout: EnhancedWorkout;
  isExpanded: boolean;
  onToggle: () => void;
}

export function WorkoutDetailCard({ workout, isExpanded, onToggle }: Props) {
  return (
    <Card className={getIntensityColor(workout.intensityLevel)}>
      {/* Header compacto */}
      <CardHeader onClick={onToggle} className="cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWorkoutIcon(workout.type)}
            <div>
              <CardTitle>{workout.title}</CardTitle>
              <CardDescription>
                {workout.distance}km • {workout.targetPace}/km
              </CardDescription>
            </div>
          </div>
          <Badge>{workout.expectedDuration} min</Badge>
        </div>
      </CardHeader>
      
      {/* Conteúdo expandido */}
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Objetivo */}
          <Section icon={Target} title="Objetivo">
            {workout.objective}
          </Section>
          
          {/* 3 Fases */}
          <WorkoutPhases 
            warmUp={workout.warmUp}
            main={workout.mainWorkout}
            coolDown={workout.coolDown}
          />
          
          {/* Dicas */}
          <TipsSection tips={workout.tips} />
          
          {/* Alertas */}
          <AlertsSection alerts={workout.commonMistakes} />
          
          {/* Critérios de Sucesso */}
          <SuccessSection criteria={workout.successCriteria} />
          
          {/* Fundamento Científico (colapsável) */}
          {workout.scientificBasis && (
            <ScientificSection basis={workout.scientificBasis} />
          )}
        </CardContent>
      )}
    </Card>
  );
}
```

**3.2 Subcomponentes**

- `WorkoutPhases.tsx` - Timeline das 3 fases
- `TipsSection.tsx` - Lista de dicas com ícones
- `AlertsSection.tsx` - Alertas em vermelho/amarelo
- `SuccessSection.tsx` - Checklist de critérios
- `ScientificSection.tsx` - Explicação científica colapsável

**3.3 Color Coding System**

```typescript
const getIntensityColor = (level: number) => {
  switch(level) {
    case 1: return 'from-green-100 to-green-50 border-green-500'; // Very Easy
    case 2: return 'from-blue-100 to-blue-50 border-blue-500';    // Easy  
    case 3: return 'from-yellow-100 to-yellow-50 border-yellow-500'; // Moderate
    case 4: return 'from-orange-100 to-orange-50 border-orange-500'; // Hard
    case 5: return 'from-red-100 to-red-50 border-red-500';       // Very Hard
  }
};
```

---

### FASE 4: Traduções ⏱️ 1-2h

Adicionar em `lib/i18n/translations/`:

```json
{
  "workout": {
    "phases": {
      "warmUp": "Aquecimento",
      "main": "Parte Principal",
      "coolDown": "Desaquecimento"
    },
    "sections": {
      "objective": "Objetivo do Treino",
      "tips": "Dicas Práticas",
      "alerts": "Cuidados Importantes",
      "success": "Critérios de Sucesso",
      "scientific": "Fundamento Científico"
    },
    "intensity": {
      "1": "Muito Leve",
      "2": "Leve",
      "3": "Moderado",
      "4": "Intenso",
      "5": "Muito Intenso"
    }
  }
}
```

---

### FASE 5: Testes e Validação ⏱️ 2h

1. **Gerar plano de teste com novo sistema**
2. **Validar estrutura JSON completa**
3. **Testar visualização em mobile/desktop**
4. **Verificar tradução em 3 idiomas**
5. **Performance check (rendering de muitos workouts)**
6. **Ajustes finais de UX**

---

## 📊 Cronograma Estimado

| Fase | Descrição | Tempo | Status |
|------|-----------|-------|--------|
| 1 | Schema e Tipos | 1-2h | ⏳ Pendente |
| 2 | Prompt da IA | 2-3h | ⏳ Pendente |
| 3 | Frontend Components | 3-4h | ⏳ Pendente |
| 4 | Traduções | 1-2h | ⏳ Pendente |
| 5 | Testes | 2h | ⏳ Pendente |
| **TOTAL** | **Full Implementation** | **9-13h** | ⏳ Pendente |

---

## 🚀 Começar Agora?

Posso começar pela **Fase 1** (Schema e Tipos) que é a base para tudo?

Isso envolve:
1. Atualizar schema do Prisma
2. Criar interfaces TypeScript
3. Preparar estruturas de dados

Confirma para eu começar?
