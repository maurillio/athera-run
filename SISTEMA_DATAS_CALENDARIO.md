# 📅 Sistema de Datas e Calendário - Athera Run

> Documentação completa sobre tratamento de datas, calendários e cronogramas no sistema

**Data:** 09 de Novembro de 2025  
**Versão Sistema:** v1.7.0-dev  
**Autor:** Documentação Técnica

---

## 🎯 Visão Geral

O Athera Run possui um **sistema robusto de datas** que gerencia todo o ciclo de vida de um plano de treino, desde a geração até a execução. O sistema é projetado para ser **flexível, preciso e amigável ao usuário**.

### Principais Componentes

1. **Date Formatter** - Formatação localizada de datas
2. **Plan Generator** - Cálculo de datas de início e fim
3. **Week Calculator** - Distribuição de treinos por semana
4. **Workout Scheduler** - Atribuição de datas específicas
5. **Calendar System** - Navegação e visualização

---

## 📦 1. Date Formatter (`lib/utils/date-formatter.ts`)

### Biblioteca Utilizada: **Day.js**

```typescript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
```

### Timezone Principal
```typescript
const APP_TIMEZONE = 'America/Sao_Paulo'; // UTC-3
```

**Todas as datas são normalizadas para este timezone** para evitar inconsistências.

---

## 🌍 Localização de Datas

### Função: `formatLocalizedDate()`

Formata datas com **nome do dia da semana completo** em 3 idiomas:

**Português (pt-BR):**
```typescript
formatLocalizedDate('2025-11-05', 'pt-BR', true)
// Output: "terça-feira, 5 de novembro de 2025"

formatLocalizedDate('2025-11-05', 'pt-BR', false)
// Output: "terça-feira, 5 de novembro"
```

**Inglês (en):**
```typescript
formatLocalizedDate('2025-11-05', 'en', true)
// Output: "Tuesday, November 5, 2025"
```

**Espanhol (es):**
```typescript
formatLocalizedDate('2025-11-05', 'es', true)
// Output: "martes, 5 de noviembre de 2025"
```

### Função: `formatShortDate()`

Formato curto DD/MM ou MM/DD conforme locale:

```typescript
formatShortDate('2025-11-05', 'pt-BR') // "05/11"
formatShortDate('2025-11-05', 'en')    // "11/05"
formatShortDate('2025-11-05', 'es')    // "05/11"
```

### Função: `formatDateRange()`

Formata intervalos de datas:

```typescript
formatDateRange('2025-11-04', '2025-11-10', 'pt-BR') // "4-10 nov"
formatDateRange('2025-11-04', '2025-11-10', 'en')    // "Nov 4-10"
```

### Função: `formatRelativeTime()`

Tempo relativo (ex: "há 2 dias", "2 days ago"):

```typescript
formatRelativeTime('2025-11-07', 'pt-BR') // "há 2 dias"
formatRelativeTime('2025-11-07', 'en')    // "2 days ago"
```

---

## 🚀 2. Geração do Plano - Cálculo de Datas

### Fluxo Principal (API: `/api/plan/generate`)

#### Entrada do Usuário

No **Step 7 do Onboarding**, o usuário pode escolher:

```typescript
interface PlanStartInput {
  startDate?: string; // Opcional: data customizada (ISO 8601)
  // Exemplo: "2025-11-18T00:00:00.000Z"
}
```

**Opções:**
1. **Nada informado**: Sistema começa na **próxima segunda-feira**
2. **Data específica**: Sistema respeita a escolha do usuário

#### Processamento no Backend

```typescript
// app/api/plan/generate/route.ts (linha 26-28)
const body = await request.json().catch(() => ({}));
const customStartDate = body.startDate 
  ? new Date(body.startDate) 
  : undefined;
```

#### Cálculo de Semanas até a Corrida

```typescript
// lib/ai-plan-generator.ts (linhas 402-408)
const today = new Date();
today.setHours(0, 0, 0, 0); // Zerar horas para comparação precisa

const raceDate = new Date(profile.targetRaceDate);
raceDate.setHours(0, 0, 0, 0);

// Usar Math.ceil para incluir semanas parciais
const weeksCalculated = Math.ceil(
  (raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7)
);
```

**Por que `Math.ceil`?**
- Garante que semanas parciais sejam incluídas
- Exemplo: 12.3 semanas → 13 semanas (arredonda para cima)
- Evita que o atleta fique sem treino na semana da prova

#### Validação de Data

```typescript
// lib/ai-plan-generator.ts (linhas 415-418)
if (totalWeeks < 1) {
  throw new Error(
    'A data da corrida não pode estar no passado. ' +
    'Por favor, escolha uma data futura para sua corrida.'
  );
}
```

#### Tempo Curto (Short Notice)

```typescript
// lib/ai-plan-generator.ts (linhas 420-434)
const recommendedWeeksByDistance: Record<string, number> = {
  '5K': 8,
  '10K': 10,
  'Meia Maratona': 12,
  'Maratona': 16,
  'Ultramaratona': 20,
};

const recommendedWeeks = recommendedWeeksByDistance[profile.goalDistance] || 12;
if (totalWeeks < recommendedWeeks) {
  isShortNotice = true;
  console.warn(`⚠️ AVISO: ${totalWeeks} semanas é curto para ${profile.goalDistance}.`);
  console.log(`Mas vamos gerar o plano respeitando a data escolhida!`);
}
```

**Resultado:** IA ajusta o plano para ser **mais intenso e focado**, mas continua sendo gerado.

---

## 📆 3. Cálculo de Data de Início

### Função: `expandStrategyToPlan()` (lib/ai-plan-generator.ts, linhas 684-716)

#### Lógica de Data de Início

```typescript
let startDate: Date;

if (customStartDate) {
  // ✅ OPÇÃO 1: Usuário escolheu data específica
  startDate = new Date(customStartDate);
  startDate.setHours(0, 0, 0, 0);
  console.log(`Usando data customizada: ${startDate.toISOString()}`);
} else {
  // ✅ OPÇÃO 2: Próxima segunda-feira
  startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const dayOfWeek = startDate.getDay();
  // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

  let daysToMonday;
  if (dayOfWeek === 1) {
    daysToMonday = 0; // Já é segunda → começar hoje
  } else if (dayOfWeek === 0) {
    daysToMonday = 1; // Domingo → próxima segunda (amanhã)
  } else {
    daysToMonday = 8 - dayOfWeek; // Terça-Sábado → próxima segunda
  }

  startDate.setDate(startDate.getDate() + daysToMonday);
  console.log(`Próxima segunda: ${startDate.toISOString()}`);
}
```

#### Tabela de Conversão (Dia da Semana → Dias até Segunda)

| Dia Atual | `dayOfWeek` | `daysToMonday` | Lógica |
|-----------|-------------|----------------|--------|
| Domingo   | 0           | 1              | Amanhã |
| Segunda   | 1           | 0              | Hoje |
| Terça     | 2           | 6              | 8 - 2 |
| Quarta    | 3           | 5              | 8 - 3 |
| Quinta    | 4           | 4              | 8 - 4 |
| Sexta     | 5           | 3              | 8 - 5 |
| Sábado    | 6           | 2              | 8 - 6 |

**Por que sempre segunda-feira?**
- Convenção comum em planos de treino
- Facilita organização mental do atleta
- Semana de treino = segunda a domingo
- **MAS**: Se o usuário quiser outra data, **respeitamos 100%**

---

## 🗓️ 4. Cálculo de Semanas e Treinos

### Iteração de Semanas

```typescript
// lib/ai-plan-generator.ts (linhas 717-820)
const weeks: any[] = [];
let weekNumber = 1;
let currentWeekStart = new Date(startDate);

// Processar cada fase do plano
for (const phase of strategy.phases) {
  const phaseWeeks = Math.min(phase.weeks, totalWeeks - weekNumber + 1);

  for (let phaseWeek = 0; phaseWeek < phaseWeeks; phaseWeek++) {
    // Calcular fim da semana
    const weekEnd = new Date(
      currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000
    );

    // Gerar treinos...
    const workouts = generateWeekWorkouts({ /* ... */ });

    const week = {
      weekNumber,
      startDate: new Date(currentWeekStart),
      endDate: weekEnd,
      phase: phase.name,
      focus: phase.focus,
      totalDistance: Math.round(weeklyKm * 10) / 10,
      workouts,
    };

    weeks.push(week);
    weekNumber++;

    // Avançar para próxima semana (+ 7 dias)
    currentWeekStart = new Date(
      currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    if (weekNumber > totalWeeks) break;
  }
}
```

### Cálculo de Data de Cada Treino

```typescript
// lib/ai-plan-generator.ts (linhas 1244-1254)
const daysOrder = [1, 2, 3, 4, 5, 6, 0]; 
// Segunda (1), Terça (2), ..., Domingo (0)

for (let i = 0; i < 7; i++) { 
  const dayOfWeek = daysOrder[i]; // Dia da semana real (0-6)
  const daysOffset = i;           // Offset em relação à segunda (0-6)

  const date = new Date(params.currentWeekStart);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas timezone

  // Criar treino com esta data
  const workout = {
    dayOfWeek: dayOfWeek,
    date: date,
    type: 'running',
    // ...
  };
}
```

**Por que `setHours(12, 0, 0, 0)`?**
- Evita problemas com mudanças de horário de verão
- Garante que o dia não mude acidentalmente ao converter timezones
- Meio-dia é "seguro" em qualquer timezone

---

## 📊 5. Estrutura de Dados de Datas

### No Banco de Dados (Prisma)

```prisma
model CustomTrainingPlan {
  id              Int      @id @default(autoincrement())
  startDate       DateTime // Data de início do plano (primeira segunda)
  targetRaceDate  DateTime // Data da corrida alvo
  totalWeeks      Int      // Número total de semanas
  // ...
}

model CustomWeek {
  id          Int      @id @default(autoincrement())
  weekNumber  Int      // 1, 2, 3, ...
  startDate   DateTime // Segunda-feira
  endDate     DateTime // Domingo
  // ...
}

model CustomWorkout {
  id          Int      @id @default(autoincrement())
  dayOfWeek   Int      // 0=Dom, 1=Seg, ..., 6=Sáb
  date        DateTime // Data específica (YYYY-MM-DD HH:MM:SS)
  type        String   // running, strength, rest, etc
  // ...
}
```

### Formato JSON Retornado pela API

```json
{
  "plan": {
    "id": 123,
    "startDate": "2025-11-18T00:00:00.000Z",
    "targetRaceDate": "2026-06-07T00:00:00.000Z",
    "totalWeeks": 28,
    "weeks": [
      {
        "weekNumber": 1,
        "startDate": "2025-11-18T00:00:00.000Z",
        "endDate": "2025-11-24T00:00:00.000Z",
        "phase": "Base Aeróbica",
        "totalDistance": 35.5,
        "workouts": [
          {
            "dayOfWeek": 1,
            "date": "2025-11-18T12:00:00.000Z",
            "type": "running",
            "subtype": "easy",
            "title": "Corrida Fácil - 6km",
            "distance": 6.0
          },
          {
            "dayOfWeek": 2,
            "date": "2025-11-19T12:00:00.000Z",
            "type": "strength",
            "title": "Musculação/Força"
          }
        ]
      }
    ]
  }
}
```

---

## 🎨 6. Visualização no Frontend

### Dashboard - Semana Atual

```typescript
// app/api/plan/current/route.ts (linha 52)
const currentWeek = plan.weeks.find(
  (week) => now >= week.startDate && now <= week.endDate
);

if (!currentWeek) {
  // Buscar próxima semana futura
  const futureWeeks = plan.weeks.filter((week) => week.startDate > now);
  return futureWeeks[0] || plan.weeks[0];
}
```

**Lógica:** 
- Verifica se **hoje** (`now`) está entre `startDate` e `endDate` da semana
- Se não encontrar: retorna próxima semana futura
- Fallback: primeira semana do plano

### Componente de Calendário (Exemplo)

```typescript
// Simplificado para ilustração
const WeekCalendar = ({ week }) => {
  const locale = useLocale(); // 'pt-BR', 'en', 'es'
  
  return (
    <div>
      <h3>{formatDateRange(week.startDate, week.endDate, locale)}</h3>
      
      {week.workouts.map(workout => (
        <WorkoutCard 
          key={workout.id}
          date={formatLocalizedDate(workout.date, locale, false)}
          dayOfWeek={workout.dayOfWeek}
          {...workout}
        />
      ))}
    </div>
  );
};
```

---

## 🔄 7. Sistema Multi-Corrida (Corridas B/C)

### Detecção de Corridas na Semana

```typescript
// lib/ai-plan-generator.ts (linhas 756-766)
const weekEnd = new Date(
  currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000
);

const raceThisWeek = profile.raceGoals?.find(race => {
  const raceDate = new Date(race.date);
  return raceDate >= currentWeekStart && raceDate <= weekEnd;
});

if (raceThisWeek) {
  console.log(`Corrida ${raceThisWeek.priority} detectada na semana ${weekNumber}`);
  // IA já considerou isso no volume da fase
}
```

### Inserção de Corrida como Treino

```typescript
// Se a corrida cai em um dos dias de treino, substituir o longão:
if (raceThisWeek && dayOfWeek === raceDayOfWeek) {
  workout = {
    dayOfWeek: dayOfWeek,
    date: new Date(raceThisWeek.date),
    type: 'race',
    subtype: raceThisWeek.priority, // 'A', 'B', 'C'
    title: `🏁 ${raceThisWeek.name}`,
    description: `Corrida ${raceThisWeek.priority} - ${raceThisWeek.distance}`,
    distance: getDistanceInKm(raceThisWeek.distance),
    targetPace: raceThisWeek.targetTime ? calculatePace(...) : null,
  };
}
```

---

## ⏰ 8. Horários Preferenciais

### Estrutura de Dados

```typescript
interface TrainingActivity {
  id: string;              // 'running', 'strength', 'swimming', etc
  name: string;            // 'Corrida', 'Musculação', 'Natação'
  availableDays: number[]; // [1, 3, 5] = Segunda, Quarta, Sexta
  preferredTime: 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';
}
```

### Uso na Geração

```typescript
// lib/ai-plan-generator.ts (linhas 1290-1298)
const timeMap: Record<string, string> = { 
  'early_morning': 'Manhã Cedo (5-7h)',
  'morning': 'Manhã (7-12h)',
  'afternoon': 'Tarde (12-18h)',
  'evening': 'Noite (18-21h)',
  'night': 'Noite (após 21h)',
  'flexible': '',
};

const timeInfo = timeMap[activityTime] || '';
const timeInfoShort = timeInfo ? ` • ${timeInfo}` : '';

// Exemplo de título gerado:
// "Corrida Fácil - 8km • Manhã (7-12h)"
```

**Visualização no App:**
- Horários aparecem nos títulos e descrições dos treinos
- Usuário vê quando deve fazer cada atividade
- Facilita organização da rotina

---

## 🧮 9. Cálculos de Tempo

### Duração Baseada em Distância e Pace

```typescript
// Exemplo: calcular duração de um treino
function calculateDuration(distanceKm: number, paceMinPerKm: string): string {
  // paceMinPerKm = "5:30" (5min 30s por km)
  const [min, sec] = paceMinPerKm.split(':').map(Number);
  const paceSeconds = min * 60 + sec;
  
  const totalSeconds = distanceKm * paceSeconds;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  return hours > 0 
    ? `${hours}h ${minutes}min`
    : `${minutes}min`;
}

// Exemplo:
calculateDuration(10, "5:30") // "55min"
calculateDuration(21.1, "5:00") // "1h 45min"
```

### Paces por Zona (VDOT)

```typescript
// Calculado pela IA ou tabelas VDOT
const paces = {
  easy: "6:00",       // Treino fácil/recuperação
  marathon: "5:30",   // Ritmo de maratona
  threshold: "4:45",  // Treino de limiar (tempo run)
  interval: "4:15",   // Intervalados (velocidade)
  repetition: "3:50", // Tiros curtos (máxima velocidade)
};
```

---

## 📝 10. Timezone e Conversões

### Por que America/Sao_Paulo?

```typescript
const APP_TIMEZONE = 'America/Sao_Paulo';
```

**Razões:**
1. **Público principal:** Brasil (UTC-3)
2. **Consistência:** Todas as datas normalizadas para mesmo timezone
3. **Evita bugs:** Conversões automáticas podem causar erros de "dia anterior/posterior"

### Conversão Segura

```typescript
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(timezone);

// ✅ CORRETO: Sempre especificar timezone
const date = dayjs(dateStr).tz(APP_TIMEZONE);

// ❌ ERRADO: Deixar JavaScript decidir (pode usar timezone local)
const date = new Date(dateStr); // Pode dar problema!
```

### Formato ISO 8601

**Sempre usado no sistema:**
```typescript
"2025-11-18T12:00:00.000Z"
```

**Vantagens:**
- Universal e não ambíguo
- Fácil parse em qualquer linguagem/lib
- Suportado nativamente por JSON
- Ordenação alfabética = ordenação cronológica

---

## 🐛 11. Problemas Comuns e Soluções

### Problema 1: Treino Aparece no Dia Errado

**Causa:** Timezone não especificado ao criar `new Date()`

**Solução:**
```typescript
// ❌ ERRADO
const date = new Date('2025-11-18'); 
// Pode virar 17/11 às 21h (UTC-3)

// ✅ CORRETO
const date = new Date('2025-11-18T12:00:00.000Z');
// Sempre meio-dia UTC = 9h em São Paulo
```

### Problema 2: Semana Começa no Domingo

**Causa:** JavaScript usa `getDay()` onde 0 = Domingo

**Solução:**
```typescript
// Ordem customizada: Segunda primeiro
const daysOrder = [1, 2, 3, 4, 5, 6, 0];

for (let i = 0; i < 7; i++) {
  const dayOfWeek = daysOrder[i]; // 1, 2, 3, ... 6, 0
  // ...
}
```

### Problema 3: Data da Corrida no Passado

**Causa:** Usuário escolheu data inválida ou sistema desatualizado

**Solução:**
```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

const raceDate = new Date(profile.targetRaceDate);
raceDate.setHours(0, 0, 0, 0);

if (raceDate <= today) {
  throw new Error('Data da corrida deve ser no futuro');
}
```

### Problema 4: Horário de Verão

**Causa:** Mudança de horário pode afetar cálculo de dias

**Solução:**
```typescript
// Sempre usar meio-dia (12h) ao calcular datas
date.setHours(12, 0, 0, 0);

// OU usar milissegundos direto
const nextWeek = new Date(
  currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
);
nextWeek.setHours(12, 0, 0, 0); // Normalizar depois
```

---

## 🧪 12. Testes de Datas

### Casos de Teste Importantes

```typescript
describe('Date System', () => {
  it('should start plan on next Monday', () => {
    // Hoje: Quarta, 06/Nov/2025
    const startDate = calculateStartDate();
    expect(startDate.getDay()).toBe(1); // Segunda
    expect(startDate.toISOString()).toBe('2025-11-11T00:00:00.000Z');
  });

  it('should respect custom start date', () => {
    const customDate = '2025-12-01';
    const startDate = calculateStartDate(customDate);
    expect(startDate.toISOString()).toBe('2025-12-01T00:00:00.000Z');
  });

  it('should calculate correct weeks until race', () => {
    const today = '2025-11-09';
    const raceDate = '2026-06-07';
    const weeks = calculateWeeksUntilRace(today, raceDate);
    expect(weeks).toBe(30); // ~30 semanas
  });

  it('should generate 7 workouts per week', () => {
    const week = generateWeek(/* ... */);
    expect(week.workouts).toHaveLength(7);
  });

  it('should assign correct dates to each workout', () => {
    const week = generateWeek({ startDate: '2025-11-18' });
    expect(week.workouts[0].date).toBe('2025-11-18'); // Segunda
    expect(week.workouts[6].date).toBe('2025-11-24'); // Domingo
  });
});
```

---

## 📚 13. Referências e Boas Práticas

### Bibliotecas Recomendadas

1. **Day.js** ✅ (atual)
   - Leve (2KB)
   - API similar ao Moment.js
   - Suporte a timezones e locales

2. ~~Moment.js~~ (deprecated)
   - Muito pesado
   - Não usar em projetos novos

3. **date-fns** (alternativa)
   - Funcional e modular
   - Boa performance

### Boas Práticas

✅ **SEMPRE:**
- Normalizar timezone para `America/Sao_Paulo`
- Usar formato ISO 8601
- Zerar horas ao comparar datas (`setHours(0,0,0,0)`)
- Fixar meio-dia para datas de treinos (`setHours(12,0,0,0)`)
- Documentar cálculos complexos

❌ **NUNCA:**
- Assumir timezone local do usuário
- Usar `new Date()` sem parâmetros para datas específicas
- Fazer matemática de datas sem considerar horário de verão
- Confiar em `getDay()` sem mapear (0=Domingo!)

---

## 🎯 14. Roadmap Futuro

### Melhorias Planejadas

1. **Múltiplos Timezones** (Q1 2026)
   - Detectar timezone do usuário
   - Converter automaticamente todas as datas
   - Exemplo: Usuário em Lisboa vê horários em UTC+0

2. **Calendário Inteligente** (Q2 2026)
   - Integração com Google Calendar
   - Export para iCal/ICS
   - Lembretes automáticos

3. **Ajuste Dinâmico de Datas** (Q2 2026)
   - Permitir usuário "empurrar" treinos
   - Recalcular plano automaticamente
   - Manter progressão lógica

4. **Análise de Padrões** (Q3 2026)
   - Detectar dias/horários que o usuário mais completa treinos
   - Sugerir ajustes de schedule baseado em histórico
   - IA aprende preferências reais

---

## 📞 Suporte

Para dúvidas sobre o sistema de datas:
- **Código:** `lib/utils/date-formatter.ts`, `lib/ai-plan-generator.ts`
- **APIs:** `app/api/plan/generate/route.ts`, `app/api/plan/current/route.ts`
- **Documentação:** Este arquivo

---

**Última atualização:** 09/Nov/2025  
**Versão:** 1.0  
**Mantido por:** Equipe Athera Run

