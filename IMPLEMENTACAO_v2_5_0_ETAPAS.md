# 🚀 IMPLEMENTAÇÃO v2.5.0 - PLANEJAMENTO POR ETAPAS

## 📋 CHECKPOINT ATUAL
- ✅ Migration aplicada (20251113144016_add_v3_profile_fields)
- ✅ Novos campos no banco: hasRunBefore, currentlyInjured, avgSleepHours, etc
- ✅ System Prompt v2.5.0 criado (SYSTEM_PROMPT_V2_5_COMPLETE.md)
- ✅ Documentação completa
- 🟡 **PRÓXIMO:** Integração backend + frontend

---

## 🎯 ESTRATÉGIA DE IMPLEMENTAÇÃO

### Princípio: **Incremental + Testável**
Cada etapa pode ser testada isoladamente antes de prosseguir.

---

## 📦 ETAPA 1: Atualizar Interfaces TypeScript (30min)
**Objetivo:** Garantir type safety para novos campos

### 1.1 ComprehensiveProfile (`lib/ai-context-builder.ts`)
```typescript
export interface ComprehensiveProfile {
  // ... campos existentes ...
  
  // ✅ NOVOS CAMPOS v2.5.0
  hasRunBefore?: boolean;          // Critical: Detecta iniciante absoluto
  currentlyInjured?: boolean;      // Flag lesão ativa
  avgSleepHours?: number;          // Horas de sono (recovery)
  tracksMenstrualCycle?: boolean;  // Mulheres (opcional)
  avgCycleLength?: number;         // Duração ciclo menstrual
  lastPeriodDate?: Date;           // Data última menstruação
  workDemand?: string;             // 'sedentary' | 'moderate' | 'physical'
  familyDemand?: string;           // 'low' | 'moderate' | 'high'
}
```

### 1.2 AIUserProfile (`lib/ai-plan-generator.ts`)
```typescript
export interface AIUserProfile {
  // ... campos existentes ...
  
  // ✅ NOVOS CAMPOS v2.5.0
  hasRunBefore?: boolean;
  currentlyInjured?: boolean;
  avgSleepHours?: number;
  tracksMenstrualCycle?: boolean;
  avgCycleLength?: number;
  lastPeriodDate?: Date;
  workDemand?: string;
  familyDemand?: string;
}
```

**Arquivo a criar:** `ETAPA1_INTERFACES_DONE.md` (checkpoint)

---

## 📦 ETAPA 2: Context Builder - Lógica de Detecção (1h)

### 2.1 Adicionar detecção em `buildComprehensiveContext()`

**Localização:** `lib/ai-context-builder.ts` - Seção "2. BASE ESPORTIVA"

```typescript
// APÓS linha ~150 (depois de runningLevel, volume atual)

// ✅ v2.5.0: Detecção de iniciante absoluto
if (profile.hasRunBefore === false) {
  context += `\n⚠️ ATENÇÃO: INICIANTE ABSOLUTO\n`;
  context += `   Esta pessoa NUNCA correu antes!\n`;
  context += `   - Começar com protocolo Walk/Run\n`;
  context += `   - ZERO treinos de qualidade por 8-12 semanas\n`;
  context += `   - Foco: Criar hábito sem lesão\n`;
  context += `   - Progressão ULTRA conservadora\n\n`;
}
```

### 2.2 Adicionar seção "SONO E RECUPERAÇÃO"

**Localização:** Nova seção após "4. HISTÓRICO DE LESÕES"

```typescript
// ═══════════════════════════════════════
// 5. SONO, LIFESTYLE E RECUPERAÇÃO (v2.5.0)
// ═══════════════════════════════════════

context += `\n═══════════════════════════════════════\n`;
context += `5. SONO, LIFESTYLE E RECUPERAÇÃO\n`;
context += `═══════════════════════════════════════\n\n`;

if (profile.avgSleepHours !== undefined) {
  context += `Sono Médio: ${profile.avgSleepHours}h por noite\n`;
  
  if (profile.avgSleepHours < 6) {
    context += `⚠️ CRÍTICO: Sono INSUFICIENTE (<6h)\n`;
    context += `   IMPACTO:\n`;
    context += `   - Reduzir volume planejado em 20%\n`;
    context += `   - Aumentar dias de descanso\n`;
    context += `   - Priorizar recuperação\n`;
    context += `   - Monitorar sinais de overtraining\n\n`;
  } else if (profile.avgSleepHours < 7) {
    context += `⚠️ Sono LIMÍTROFE (6-7h)\n`;
    context += `   - Considerar volume moderado\n`;
    context += `   - Dar atenção extra a recuperação\n\n`;
  } else if (profile.avgSleepHours >= 8) {
    context += `✅ EXCELENTE! Sono adequado (≥8h)\n`;
    context += `   Capacidade de recuperação otimizada\n\n`;
  } else {
    context += `✅ Sono ADEQUADO (7-8h)\n\n`;
  }
}

if (profile.workDemand) {
  context += `Demanda de Trabalho: ${profile.workDemand}\n`;
  if (profile.workDemand === 'physical') {
    context += `   ⚠️ Trabalho FÍSICO - considerar fadiga acumulada\n`;
  }
}

if (profile.familyDemand) {
  context += `Demanda Familiar: ${profile.familyDemand}\n`;
  if (profile.familyDemand === 'high') {
    context += `   ⚠️ Alta demanda familiar - planejar treinos flexíveis\n`;
  }
}

if (profile.workDemand === 'physical' || profile.familyDemand === 'high') {
  context += `\n💡 AJUSTE DE VOLUME RECOMENDADO:\n`;
  context += `   Vida exigente = Volume -10-15%\n`;
  context += `   Priorizar qualidade > quantidade\n`;
  context += `   Flexibilidade na programação\n\n`;
}
```

### 2.3 Adicionar seção "CICLO MENSTRUAL" (mulheres)

```typescript
// Ciclo menstrual (apenas mulheres)
if (profile.gender === 'female' && profile.tracksMenstrualCycle) {
  context += `\n📊 OTIMIZAÇÃO POR CICLO MENSTRUAL\n`;
  context += `   Atleta rastreia ciclo: SIM\n`;
  
  if (profile.avgCycleLength) {
    context += `   Duração média: ${profile.avgCycleLength} dias\n`;
  }
  
  context += `\n💡 ESTRATÉGIA DE PERIODIZAÇÃO:\n`;
  context += `   Fase Folicular (dias 1-14): Treinos de ALTA intensidade\n`;
  context += `   Fase Lútea (dias 15-28): Treinos de VOLUME, intensidade moderada\n`;
  context += `   Menstruação (dias 1-5): Ajustar volume conforme energia\n\n`;
  context += `   ⚠️ Planejar treinos chave para dias 7-14 (melhor performance)\n\n`;
}
```

### 2.4 Adicionar detecção de lesão ativa

**Localização:** Seção "4. HISTÓRICO DE LESÕES" (já existe)

```typescript
// No início da seção de lesões (antes do analyzeInjuryHistory existente)

if (profile.currentlyInjured === true) {
  context += `\n🚨 LESÃO ATIVA DETECTADA!\n`;
  context += `   PROTOCOLO DE SEGURANÇA:\n`;
  context += `   1. Volume inicial: 50% do atual\n`;
  context += `   2. ZERO intensidade alta por 4 semanas\n`;
  context += `   3. Progressão: 5% semanal (ao invés de 10%)\n`;
  context += `   4. Incluir strength & cross-training\n`;
  context += `   5. Monitorar dor a cada treino\n`;
  context += `   6. Recomendar consulta médica antes de iniciar\n\n`;
}
```

**Arquivo a criar:** `ETAPA2_CONTEXT_BUILDER_DONE.md` (checkpoint)

---

## 📦 ETAPA 3: System Prompt v2.5 - Integração (30min)

### 3.1 Atualizar `classifyRunner()`

**Localização:** `lib/ai-system-prompt-v2.5.ts` (criar se não existe)

```typescript
export function classifyRunner(profile: AIUserProfile): string {
  const volume = profile.currentWeeklyKm || 0;
  const experience = profile.runningYears || 0;
  
  // ✅ v2.5.0: Detecção de iniciante absoluto
  if (profile.hasRunBefore === false) {
    const hasAerobicBase = profile.otherSportsExperience?.length > 0;
    
    if (hasAerobicBase) {
      return 'ABSOLUTE_BEGINNER_WITH_BASE';
    }
    return 'ABSOLUTE_BEGINNER_NO_BASE';
  }
  
  // Restante da lógica existente...
  if (volume < 20 || experience < 1) return 'BEGINNER';
  if (volume < 60 || experience < 3) return 'INTERMEDIATE';
  return 'ADVANCED';
}
```

### 3.2 Criar `buildSpecialAdjustments()`

```typescript
export function buildSpecialAdjustments(profile: AIUserProfile): string {
  let adjustments = '';
  
  // Sono insuficiente
  if (profile.avgSleepHours && profile.avgSleepHours < 6) {
    adjustments += `⚠️ SONO CRÍTICO (<6h): Volume -20%, aumentar descanso\n`;
  }
  
  // Lesão ativa
  if (profile.currentlyInjured) {
    adjustments += `🚨 LESÃO ATIVA: Protocolo conservador (50% volume, +cross-training)\n`;
  }
  
  // Lifestyle exigente
  if (profile.workDemand === 'physical' || profile.familyDemand === 'high') {
    adjustments += `💼 VIDA EXIGENTE: Volume -15%, flexibilidade na programação\n`;
  }
  
  // Ciclo menstrual
  if (profile.gender === 'female' && profile.tracksMenstrualCycle) {
    adjustments += `📊 OTIMIZAR: Qualidade na fase folicular, volume na lútea\n`;
  }
  
  return adjustments;
}
```

**Arquivo a criar:** `ETAPA3_SYSTEM_PROMPT_DONE.md` (checkpoint)

---

## 📦 ETAPA 4: API Routes - Backend (30min)

### 4.1 Profile Creation: `app/api/athlete-profile/route.ts`

**Localização:** POST handler, no `profileData` object

```typescript
// ADICIONAR após os campos existentes:

// ✅ v2.5.0: Novos campos
hasRunBefore: body.hasRunBefore ?? null,
currentlyInjured: body.currentlyInjured ?? false,
avgSleepHours: body.avgSleepHours ?? null,
tracksMenstrualCycle: body.tracksMenstrualCycle ?? false,
avgCycleLength: body.avgCycleLength ?? 28,
lastPeriodDate: body.lastPeriodDate ? new Date(body.lastPeriodDate) : null,
workDemand: body.workDemand ?? null,
familyDemand: body.familyDemand ?? null,
```

### 4.2 Profile Update: `app/api/athlete-profile/[id]/route.ts`

**Localização:** PATCH handler, no `updateData` object

```typescript
// ADICIONAR aos campos atualizáveis:

if (body.hasRunBefore !== undefined) updateData.hasRunBefore = body.hasRunBefore;
if (body.currentlyInjured !== undefined) updateData.currentlyInjured = body.currentlyInjured;
if (body.avgSleepHours !== undefined) updateData.avgSleepHours = body.avgSleepHours;
if (body.tracksMenstrualCycle !== undefined) updateData.tracksMenstrualCycle = body.tracksMenstrualCycle;
if (body.avgCycleLength !== undefined) updateData.avgCycleLength = body.avgCycleLength;
if (body.lastPeriodDate !== undefined) updateData.lastPeriodDate = body.lastPeriodDate ? new Date(body.lastPeriodDate) : null;
if (body.workDemand !== undefined) updateData.workDemand = body.workDemand;
if (body.familyDemand !== undefined) updateData.familyDemand = body.familyDemand;
```

**Arquivo a criar:** `ETAPA4_API_ROUTES_DONE.md` (checkpoint)

---

## 📦 ETAPA 5: Frontend - Step 2 (Experience) (1h)

### 5.1 Adicionar pergunta "Já correu antes?"

**Localização:** `components/onboarding/StepExperience.tsx` (ou similar)

```typescript
// NO INÍCIO do formulário:

<div className="space-y-4">
  <Label>Você já correu antes?</Label>
  <RadioGroup
    value={hasRunBefore === null ? '' : hasRunBefore ? 'yes' : 'no'}
    onValueChange={(value) => {
      const ran = value === 'yes';
      setHasRunBefore(ran);
      
      // Se nunca correu, resetar campos de experiência
      if (!ran) {
        setRunningYears(0);
        setCurrentWeeklyKm(0);
        setLongestRun(0);
        // ...
      }
    }}
  >
    <RadioGroupItem value="yes" label="Sim, já corri" />
    <RadioGroupItem value="no" label="Não, nunca corri" />
  </RadioGroup>
</div>

{/* CONDICIONAL: Só mostrar se hasRunBefore === true */}
{hasRunBefore && (
  <>
    {/* Campos existentes: runningYears, volume, etc */}
  </>
)}

{/* MENSAGEM ACOLHEDORA para iniciantes */}
{hasRunBefore === false && (
  <Alert>
    <InfoIcon className="h-4 w-4" />
    <AlertTitle>Bem-vindo!</AlertTitle>
    <AlertDescription>
      Ótimo! Vamos criar um plano especial para você começar do zero,
      com segurança e progressão gradual.
    </AlertDescription>
  </Alert>
)}
```

**Arquivo a criar:** `ETAPA5_STEP2_DONE.md` (checkpoint)

---

## 📦 ETAPA 6: Frontend - Step 4 (Health) (45min)

### 6.1 Adicionar campos de sono e lesão

**Localização:** `components/onboarding/StepHealth.tsx`

```typescript
{/* Lesão ativa */}
<div className="space-y-2">
  <Label>Você está com alguma lesão atualmente?</Label>
  <RadioGroup
    value={currentlyInjured ? 'yes' : 'no'}
    onValueChange={(value) => setCurrentlyInjured(value === 'yes')}
  >
    <RadioGroupItem value="no" label="Não" />
    <RadioGroupItem value="yes" label="Sim" />
  </RadioGroup>
  
  {currentlyInjured && (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Atenção</AlertTitle>
      <AlertDescription>
        Recomendamos consulta médica antes de iniciar treinos.
        O plano será adaptado para sua recuperação.
      </AlertDescription>
    </Alert>
  )}
</div>

{/* Sono */}
<div className="space-y-2">
  <Label>Quantas horas você dorme por noite (em média)?</Label>
  <Slider
    min={4}
    max={10}
    step={0.5}
    value={[avgSleepHours]}
    onValueChange={([value]) => setAvgSleepHours(value)}
  />
  <div className="text-sm text-muted-foreground text-center">
    {avgSleepHours}h por noite
  </div>
  
  {avgSleepHours < 6 && (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Sono insuficiente</AlertTitle>
      <AlertDescription>
        Menos de 6h de sono prejudica recuperação. O plano será ajustado.
      </AlertDescription>
    </Alert>
  )}
</div>
```

### 6.2 Ciclo menstrual (apenas mulheres)

```typescript
{/* Só mostrar se gender === 'female' */}
{gender === 'female' && (
  <div className="space-y-4 border-t pt-4">
    <Label>Você rastreia seu ciclo menstrual?</Label>
    <p className="text-sm text-muted-foreground">
      Opcional: Podemos otimizar seus treinos baseado nas fases do ciclo
    </p>
    
    <RadioGroup
      value={tracksMenstrualCycle ? 'yes' : 'no'}
      onValueChange={(value) => setTracksMenstrualCycle(value === 'yes')}
    >
      <RadioGroupItem value="no" label="Não rastreio" />
      <RadioGroupItem value="yes" label="Sim, rastreio" />
    </RadioGroup>
    
    {tracksMenstrualCycle && (
      <div className="space-y-2 pl-6">
        <Label>Data da última menstruação</Label>
        <Input
          type="date"
          value={lastPeriodDate}
          onChange={(e) => setLastPeriodDate(e.target.value)}
        />
        
        <Label>Duração média do ciclo (dias)</Label>
        <Input
          type="number"
          min={21}
          max={35}
          value={avgCycleLength}
          onChange={(e) => setAvgCycleLength(parseInt(e.target.value))}
        />
      </div>
    )}
  </div>
)}
```

**Arquivo a criar:** `ETAPA6_STEP4_DONE.md` (checkpoint)

---

## 📦 ETAPA 7: Frontend - NOVO Step Lifestyle (1h)

### 7.1 Criar componente `components/onboarding/StepLifestyle.tsx`

```typescript
export function StepLifestyle({ data, onUpdate, onNext, onBack }) {
  const [workDemand, setWorkDemand] = useState(data.workDemand || 'moderate');
  const [familyDemand, setFamilyDemand] = useState(data.familyDemand || 'moderate');
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Contexto de Vida</h2>
        <p className="text-muted-foreground">
          Para criar um plano realista e sustentável
        </p>
      </div>
      
      {/* Demanda de trabalho */}
      <div className="space-y-2">
        <Label>Qual a exigência física do seu trabalho?</Label>
        <RadioGroup value={workDemand} onValueChange={setWorkDemand}>
          <RadioGroupItem 
            value="sedentary" 
            label="Sedentário (escritório, computador)" 
          />
          <RadioGroupItem 
            value="moderate" 
            label="Moderado (alguns deslocamentos, carregar peso leve)" 
          />
          <RadioGroupItem 
            value="physical" 
            label="Físico (trabalho braçal, construção, pé o dia todo)" 
          />
        </RadioGroup>
      </div>
      
      {/* Demanda familiar */}
      <div className="space-y-2">
        <Label>Qual sua carga de responsabilidades familiares?</Label>
        <RadioGroup value={familyDemand} onValueChange={setFamilyDemand}>
          <RadioGroupItem 
            value="low" 
            label="Baixa (mora sozinho ou rotina tranquila)" 
          />
          <RadioGroupItem 
            value="moderate" 
            label="Moderada (família, mas com flexibilidade)" 
          />
          <RadioGroupItem 
            value="high" 
            label="Alta (filhos pequenos, cuidador, múltiplas demandas)" 
          />
        </RadioGroup>
      </div>
      
      {/* Aviso se vida muito exigente */}
      {(workDemand === 'physical' || familyDemand === 'high') && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Plano Adaptado</AlertTitle>
          <AlertDescription>
            Entendemos que sua vida é exigente. O plano priorizará
            flexibilidade e qualidade sobre volume puro.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Botões */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack}>Voltar</Button>
        <Button 
          onClick={() => {
            onUpdate({ workDemand, familyDemand });
            onNext();
          }}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
```

### 7.2 Adicionar Step ao fluxo de onboarding

**Localização:** `app/[locale]/onboarding/page.tsx` (ou arquivo principal)

```typescript
// Adicionar após Step 4 (Health), antes de Step 5 (Goals)

{currentStep === 5 && (
  <StepLifestyle
    data={formData}
    onUpdate={updateFormData}
    onNext={() => setCurrentStep(6)}
    onBack={() => setCurrentStep(4)}
  />
)}

// Ajustar numeração dos steps seguintes (+1)
```

**Arquivo a criar:** `ETAPA7_STEP_LIFESTYLE_DONE.md` (checkpoint)

---

## 📦 ETAPA 8: Dashboard Fixes (30min)

### 8.1 Fix: Rest days showing RED

**Localização:** `app/[locale]/(dashboard)/plano/page.tsx`

```typescript
// Procurar função que determina cor do treino
// Algo como: getWorkoutColor(workout.type)

function getWorkoutStatusColor(workout) {
  // ✅ v2.5.0: Rest/Preparation não deve ser vermelho
  if (workout.type === 'rest' || workout.type === 'preparation') {
    return 'gray'; // Cinza neutro
  }
  
  if (workout.completed) return 'green';
  if (workout.skipped) return 'red';
  if (isFutureWorkout(workout)) return 'blue';
  
  return 'yellow'; // Pendente
}
```

### 8.2 Fix: "min/km/km" bug

**Localização:** Onde pace é exibido (provavelmente em WorkoutDetails ou workout card)

```typescript
// ANTES: {pace} min/km/km
// DEPOIS: {pace}
// (O pace já contém "min/km")
```

### 8.3 Fix: Translation keys

**Localização:** `lib/i18n/translations/pt.json` e `en.json`

```json
{
  "goalLabels": {
    "5k": "5 km",
    "10k": "10 km",
    "15k": "15 km",
    "21k": "Meia Maratona",
    "42k": "Maratona"
  },
  "phases": {
    "baseaerobica": "Base Aeróbica",
    "desenvolvimento": "Desenvolvimento",
    "intensidade": "Intensidade",
    "pico": "Pico de Forma",
    "taper": "Taper",
    "recuperacao": "Recuperação"
  }
}
```

**Arquivo a criar:** `ETAPA8_DASHBOARD_FIXES_DONE.md` (checkpoint)

---

## ✅ CHECKLIST FINAL

Após completar todas as etapas:

- [ ] ETAPA 1: Interfaces TypeScript atualizadas
- [ ] ETAPA 2: Context Builder com detecções v2.5.0
- [ ] ETAPA 3: System Prompt v2.5 integrado
- [ ] ETAPA 4: API routes salvando novos campos
- [ ] ETAPA 5: Step 2 (Experience) com detecção iniciante
- [ ] ETAPA 6: Step 4 (Health) com sono + lesão + ciclo
- [ ] ETAPA 7: Novo Step Lifestyle criado
- [ ] ETAPA 8: Dashboard fixes aplicados

### Testes de Validação:
- [ ] Criar usuário iniciante absoluto (hasRunBefore=false)
- [ ] Criar usuário intermediário com sono ruim (<6h)
- [ ] Criar usuária rastreando ciclo menstrual
- [ ] Criar usuário com lesão ativa
- [ ] Verificar planos gerados são personalizados
- [ ] Verificar dashboard sem bugs visuais

---

## 📝 NOTAS IMPORTANTES

### Ordem de Implementação Recomendada:
1. **Backend primeiro** (Etapas 1-4): ~2-3h
   - Garantir dados fluem corretamente
   - Testar com API calls diretos
   
2. **Frontend depois** (Etapas 5-7): ~3-4h
   - UI coleta dados
   - Testa fluxo completo
   
3. **Fixes finais** (Etapa 8): ~30min
   - Polish da UX

### Estratégia de Deploy:
- ✅ Migration JÁ aplicada (não precisa rodar novamente)
- Campos novos têm defaults → não quebra users antigos
- Deploy incremental: Pode fazer por etapa se quiser
- Teste em `localhost` antes de push para Vercel

### Rollback Strategy:
- Novos campos são opcionais
- Sistema funciona sem eles (backward compatible)
- Se der problema: Basta não enviar novos campos do frontend

---

**Status:** 🟡 PRONTO PARA COMEÇAR  
**Tempo Estimado Total:** 8-10 horas  
**Próxima Ação:** Começar ETAPA 1 (Interfaces)
