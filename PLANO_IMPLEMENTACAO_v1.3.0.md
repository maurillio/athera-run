# 🚀 PLANO DE IMPLEMENTAÇÃO - v1.3.0

**Objetivo:** Implementar sistema completo de convergência e excelência funcional  
**Prazo:** 10-13 dias úteis  
**Prioridade:** ALTA (fundacional)

---

## 📋 OVERVIEW DAS 3 FASES

```
FASE 1: FUNDAÇÃO (Schema + Backend)     [3-4 dias]
    ↓
FASE 2: ONBOARDING Melhorado            [4-5 dias]
    ↓
FASE 3: PERFIL + IA Completa            [3-4 dias]
```

---

## 🎯 FASE 1: FUNDAÇÃO (3-4 DIAS)

### **DIA 1: Migration Schema**

#### **1.1 Criar Migration**
```bash
cd nextjs_space
npx prisma migrate dev --name add_comprehensive_athlete_data
```

#### **1.2 Novos Campos (schema.prisma)**
```prisma
model AthleteProfile {
  // ... existentes ...
  
  // FISIOLOGIA
  restingHeartRate     Int?     // FC repouso
  sleepQuality         Int?     // 1-5
  stressLevel          Int?     // 1-5
  
  // EXPERIÊNCIA COMPLETA
  otherSportsExperience String? @db.Text
  otherSportsYears     Int?
  
  // LESÕES DETALHADAS
  injuryRecoveryStatus String?  // recovered/recovering/chronic
  lastInjuryDate       DateTime?
  injuryDetails        Json?    // Array detalhado
  
  // INFRAESTRUTURA
  hasGymAccess         Boolean  @default(false)
  hasPoolAccess        Boolean  @default(false)
  hasTrackAccess       Boolean  @default(false)
  
  // PREFERÊNCIAS
  trainingPreferences  Json?
  motivationFactors    Json?
  
  // PERFORMANCE
  bestTimes            Json?
  lastVDOTUpdate       DateTime?
  
  // ... restante inalterado ...
}
```

#### **1.3 Aplicar Migration**
```bash
# Dev
npx prisma migrate deploy

# Prod (Vercel auto)
git push → trigger deploy
```

---

### **DIA 2: APIs Backend**

#### **2.1 Atualizar API Onboarding**
```typescript
// app/api/onboarding/route.ts

export async function POST(request: Request) {
  const body = await request.json();
  
  // Validar TODOS os novos campos
  const validated = validateOnboardingData({
    // Básicos
    weight, height, age, gender,
    
    // NOVOS
    restingHeartRate,
    sleepQuality,
    stressLevel,
    otherSportsExperience,
    otherSportsYears,
    
    // Lesões
    injuryHistory: body.injuries, // Array
    injuryRecoveryStatus,
    lastInjuryDate,
    
    // Infraestrutura
    hasGymAccess,
    hasPoolAccess,
    hasTrackAccess,
    
    // Preferências
    trainingPreferences,
    motivationFactors,
    
    // Performance
    bestTimes,
  });
  
  // Calcular VDOT a partir de bestTimes
  const calculatedVDOT = calculateVDOTFromTimes(validated.bestTimes);
  
  // Salvar
  await prisma.athleteProfile.create({
    data: {
      ...validated,
      currentVDOT: calculatedVDOT,
      lastVDOTUpdate: new Date(),
    }
  });
}
```

#### **2.2 Atualizar API Perfil**
```typescript
// app/api/profile/route.ts

export async function PUT(request: Request) {
  const body = await request.json();
  
  // Permitir editar TUDO
  const updateData: any = {};
  
  // Dados físicos
  if (body.weight) updateData.weight = body.weight;
  if (body.restingHeartRate) updateData.restingHeartRate = body.restingHeartRate;
  if (body.sleepQuality) updateData.sleepQuality = body.sleepQuality;
  if (body.stressLevel) updateData.stressLevel = body.stressLevel;
  
  // Performance
  if (body.bestTimes) {
    updateData.bestTimes = body.bestTimes;
    updateData.currentVDOT = calculateVDOTFromTimes(body.bestTimes);
    updateData.lastVDOTUpdate = new Date();
  }
  
  // Lesões
  if (body.injuries) updateData.injuryDetails = body.injuries;
  if (body.injuryRecoveryStatus) updateData.injuryRecoveryStatus = body.injuryRecoveryStatus;
  
  // Infraestrutura
  if (body.hasGymAccess !== undefined) updateData.hasGymAccess = body.hasGymAccess;
  if (body.hasPoolAccess !== undefined) updateData.hasPoolAccess = body.hasPoolAccess;
  
  // Preferências
  if (body.trainingPreferences) updateData.trainingPreferences = body.trainingPreferences;
  
  await prisma.athleteProfile.update({
    where: { userId: session.user.id },
    data: updateData
  });
  
  // Se mudou algo crítico, trigger auto-ajuste
  if (shouldTriggerAutoAdjust(body)) {
    await fetch('/api/plan/auto-adjust', {
      method: 'POST',
      body: JSON.stringify({ reason: 'profile_update' })
    });
  }
}
```

---

### **DIA 3: Funções Utilitárias**

#### **3.1 VDOT Calculator**
```typescript
// lib/vdot-calculator.ts

export function calculateVDOTFromTime(
  distance: string, 
  timeInSeconds: number
): number {
  // Tabela VDOT de Jack Daniels
  const vdotTable = loadVDOTTable();
  
  // Interpolar valor exato
  return interpolateVDOT(distance, timeInSeconds, vdotTable);
}

export function calculateAllPaces(vdot: number) {
  return {
    easy: calculatePaceForZone(vdot, 'easy'),
    marathon: calculatePaceForZone(vdot, 'marathon'),
    threshold: calculatePaceForZone(vdot, 'threshold'),
    interval: calculatePaceForZone(vdot, 'interval'),
    repetition: calculatePaceForZone(vdot, 'repetition'),
  };
}

export function interpretVDOT(vdot: number): string {
  if (vdot < 35) return 'Iniciante';
  if (vdot < 45) return 'Intermediário';
  if (vdot < 55) return 'Avançado';
  if (vdot < 65) return 'Elite Amador';
  return 'Elite Profissional';
}
```

#### **3.2 Injury Analysis**
```typescript
// lib/injury-analyzer.ts

export function analyzeInjuryHistory(injuries: Array<any>) {
  const analysis = {
    totalInjuries: injuries.length,
    recentInjuries: injuries.filter(inj => 
      isWithinMonths(inj.date, 6)
    ).length,
    chronicInjuries: injuries.filter(inj => 
      inj.status === 'chronic'
    ),
    recoveringInjuries: injuries.filter(inj =>
      inj.status === 'recovering'
    ),
    riskLevel: 'low' as 'low' | 'medium' | 'high',
    recommendations: [] as string[],
  };
  
  // Determinar risco
  if (analysis.recentInjuries > 0) {
    analysis.riskLevel = 'high';
    analysis.recommendations.push(
      'Reduzir volume inicial em 30%',
      'Aumentar dias de recuperação',
      'Incluir fortalecimento obrigatório'
    );
  }
  
  if (analysis.chronicInjuries.length > 0) {
    analysis.riskLevel = 'medium';
    analysis.recommendations.push(
      'Evitar treinos que agravam lesão',
      'Fisioterapia preventiva',
      'Monitoramento de dor semanal'
    );
  }
  
  return analysis;
}

export function generateInjuryPreventionPlan(injuries: Array<any>) {
  const plan = [];
  
  injuries.forEach(injury => {
    switch (injury.type) {
      case 'fascite plantar':
        plan.push({
          exercise: 'Alongamento de panturrilha',
          frequency: '2x dia',
          duration: '3min cada',
        });
        break;
      case 'canelite':
        plan.push({
          exercise: 'Fortalecimento de tibial anterior',
          frequency: '3x semana',
          duration: '10min',
        });
        break;
      // ... outros
    }
  });
  
  return plan;
}
```

#### **3.3 Recovery Adjuster**
```typescript
// lib/recovery-adjuster.ts

export function adjustVolumeForRecovery(profile: {
  sleepQuality: number;
  stressLevel: number;
  age: number;
  currentWeeklyKm: number;
}) {
  let multiplier = 1.0;
  
  // Sono ruim
  if (profile.sleepQuality < 3) {
    multiplier *= 0.8; // -20%
  }
  
  // Estresse alto
  if (profile.stressLevel > 3) {
    multiplier *= 0.9; // -10%
  }
  
  // Idade (50+)
  if (profile.age > 50) {
    multiplier *= 0.95; // -5%
  }
  
  if (profile.age > 60) {
    multiplier *= 0.85; // -15% adicional
  }
  
  const adjustedVolume = profile.currentWeeklyKm * multiplier;
  
  return {
    original: profile.currentWeeklyKm,
    adjusted: adjustedVolume,
    reduction: ((1 - multiplier) * 100).toFixed(0) + '%',
    reason: generateReductionReason(profile),
  };
}
```

---

### **DIA 4: Testes + Validação**

#### **4.1 Testes Unitários**
```typescript
// __tests__/vdot-calculator.test.ts

describe('VDOT Calculator', () => {
  test('10k em 50min = VDOT 42', () => {
    const vdot = calculateVDOTFromTime('10k', 50 * 60);
    expect(vdot).toBeCloseTo(42, 1);
  });
  
  test('Marathon 4h = VDOT 38', () => {
    const vdot = calculateVDOTFromTime('marathon', 4 * 60 * 60);
    expect(vdot).toBeCloseTo(38, 1);
  });
});

describe('Injury Analyzer', () => {
  test('Lesão recente = risco alto', () => {
    const analysis = analyzeInjuryHistory([
      { type: 'fascite', date: '2025-09-01', status: 'recovering' }
    ]);
    expect(analysis.riskLevel).toBe('high');
  });
});
```

#### **4.2 Teste de Integração**
```bash
# Rodar todos os testes
npm run test

# Verificar migration
npx prisma studio # Check novos campos

# Testar APIs
curl -X POST /api/onboarding \
  -d '{ "restingHeartRate": 55, "sleepQuality": 4, ... }'
```

---

## 🎯 FASE 2: ONBOARDING (4-5 DIAS)

### **DIA 5-6: Redesign 7 Etapas**

#### **Estrutura de Componentes**
```typescript
// app/onboarding/page.tsx

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    // Etapa 1: Básicos
    age: null,
    gender: '',
    weight: null,
    height: null,
    restingHeartRate: null,
    sleepQuality: 3,
    stressLevel: 3,
    
    // Etapa 2: Base Esportiva
    hasRunBefore: null,
    runningYears: null,
    currentWeeklyKm: null,
    otherSportsExperience: [],
    otherSportsYears: {},
    
    // Etapa 3: Performance
    bestTimes: {
      '5k': null,
      '10k': null,
      '21k': null,
      '42k': null,
    },
    
    // Etapa 4: Saúde
    injuries: [],
    medicalConditions: [],
    medications: '',
    
    // Etapa 5: Objetivos
    goalDistance: '',
    targetRaceDate: null,
    targetTime: null,
    motivationFactors: [],
    otherRaces: [],
    
    // Etapa 6: Disponibilidade
    weeklyDays: 5,
    availableDays: [],
    preferredTime: '',
    hasGymAccess: false,
    hasPoolAccess: false,
    complementaryActivities: [],
    longRunDay: null,
    
    // Etapa 7: Revisão
    // (calculado automaticamente)
  });
  
  // Calcular VDOT em tempo real
  const calculatedVDOT = useMemo(() => {
    if (!formData.bestTimes) return null;
    return calculateVDOTFromBestTimes(formData.bestTimes);
  }, [formData.bestTimes]);
  
  return (
    <>
      {step === 1 && <Step1BasicData />}
      {step === 2 && <Step2SportBackground />}
      {step === 3 && <Step3Performance />}
      {step === 4 && <Step4Health />}
      {step === 5 && <Step5Goals />}
      {step === 6 && <Step6Availability />}
      {step === 7 && <Step7Review />}
    </>
  );
}
```

#### **Componentes Individuais**
```typescript
// components/onboarding/Step1BasicData.tsx
// components/onboarding/Step2SportBackground.tsx
// components/onboarding/Step3Performance.tsx
// components/onboarding/Step4Health.tsx
// components/onboarding/Step5Goals.tsx
// components/onboarding/Step6Availability.tsx
// components/onboarding/Step7Review.tsx
```

---

### **DIA 7: Validações Inteligentes**

```typescript
// lib/onboarding-validator.ts

export function validateStep3Performance(data: {
  bestTimes: any;
  currentWeeklyKm: number;
}) {
  const vdot = calculateVDOTFromBestTimes(data.bestTimes);
  const expectedVolume = estimateVolumeFromVDOT(vdot);
  
  // Detectar inconsistência
  if (data.currentWeeklyKm < expectedVolume * 0.5) {
    return {
      valid: true, // Não bloqueante
      warning: {
        type: 'inconsistency',
        message: `Seu pace indica nível avançado (VDOT ${vdot}), 
                 mas volume atual é baixo. 
                 Está voltando de pausa ou lesão?`,
        actions: [
          { label: 'Sim, voltando agora', value: 'returning' },
          { label: 'Não, sempre corri pouco', value: 'low_volume' },
        ]
      }
    };
  }
  
  return { valid: true };
}
```

---

### **DIA 8-9: UI/UX Polimento**

- Tooltips explicativos
- Feedback visual (badges VDOT)
- Animações de transição
- Responsividade mobile
- Progress bar inteligente

---

## 🎯 FASE 3: PERFIL + IA (3-4 DIAS)

### **DIA 10-11: Perfil com Tabs**

```typescript
// app/perfil/page.tsx

<Tabs defaultValue="basicos">
  <TabsList>
    <TabsTrigger value="basicos">Dados Básicos</TabsTrigger>
    <TabsTrigger value="performance">Performance</TabsTrigger>
    <TabsTrigger value="saude">Saúde</TabsTrigger>
    <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
    <TabsTrigger value="disponibilidade">Disponibilidade</TabsTrigger>
    <TabsTrigger value="preferencias">Preferências</TabsTrigger>
  </TabsList>
  
  <TabsContent value="basicos">
    <BasicDataEditor profile={profile} />
  </TabsContent>
  
  <TabsContent value="performance">
    <PerformanceEditor 
      profile={profile}
      onUpdateVDOT={handleVDOTUpdate}
    />
  </TabsContent>
  
  <TabsContent value="saude">
    <HealthEditor profile={profile} />
  </TabsContent>
  
  {/* ... */}
</Tabs>
```

---

### **DIA 12: IA Contexto Completo**

```typescript
// lib/ai-plan-generator.ts

export async function generateAIPlan(profile: FullProfile) {
  // Construir contexto COMPLETO
  const comprehensiveContext = buildComprehensiveContext(profile);
  
  // Análises específicas
  const injuryAnalysis = analyzeInjuryHistory(profile.injuryDetails);
  const recoveryAdjustment = adjustVolumeForRecovery(profile);
  const motivationalContext = buildMotivationalMessages(profile.motivationFactors);
  
  // Prompt para IA
  const prompt = `
    ${comprehensiveContext}
    
    ${injuryAnalysis.recommendations.length > 0 ? `
    ATENÇÃO - PREVENÇÃO DE LESÕES:
    ${injuryAnalysis.recommendations.join('\n')}
    ` : ''}
    
    ${recoveryAdjustment.reduction > 0 ? `
    AJUSTE DE RECUPERAÇÃO:
    Volume ajustado de ${recoveryAdjustment.original}km 
    para ${recoveryAdjustment.adjusted}km (-${recoveryAdjustment.reduction})
    Razão: ${recoveryAdjustment.reason}
    ` : ''}
    
    GERE UM PLANO COMPLETO considerando TODO o contexto acima.
  `;
  
  const aiPlan = await callLLM(prompt);
  
  return aiPlan;
}
```

---

### **DIA 13: Testes Finais + Deploy**

```bash
# Testes E2E
npm run test:e2e

# Build produção
npm run build

# Deploy
git push origin main
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### **Antes do Deploy:**
- [ ] Migration aplicada (dev + prod)
- [ ] Todos os testes passando
- [ ] Onboarding completo funcional
- [ ] Perfil editável 100%
- [ ] IA usando todos os dados
- [ ] Validações funcionando
- [ ] Responsivo mobile
- [ ] Performance OK (< 3s geração)

### **Pós-Deploy:**
- [ ] Smoke tests produção
- [ ] Monitorar erros Sentry
- [ ] Verificar taxa conclusão onboarding
- [ ] Feedback primeiros usuários
- [ ] Ajustes rápidos se necessário

---

## 📊 MÉTRICAS DE SUCESSO

Acompanhar por 2 semanas após deploy:

- Taxa conclusão onboarding: meta 85%+
- Tempo médio onboarding: < 10 min
- Taxa de erros: < 1%
- Satisfação (NPS): 9+
- Taxa de edição perfil: > 40%
- Taxa de lesões (6 meses): < 20%

---

**Status:** 🟡 Aguardando aprovação

**Última atualização:** 03/Nov/2025 20:00
