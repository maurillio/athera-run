# 🎨 Plano de Melhorias UX v1.7.0
**Data:** 2025-11-07  
**Versão:** 1.7.0  
**Duração Estimada:** 9-11 horas

---

## 📋 Resumo Executivo

Implementação de melhorias de UX focadas em:
1. **Auto-save** nos Steps 3, 4, 6 do onboarding
2. **Melhorias visuais** no perfil (Performance, Availability, Preferences)

---

## 🎯 Opção 2: Auto-save no Onboarding (2h)

### 📊 Status Atual
- ❌ Usuário precisa clicar "Próximo" para salvar
- ❌ Perda de dados se fechar navegador
- ❌ UX menos fluida

### ✨ Implementação

#### 2.1 Hook useAutoSave (30min)
```typescript
// src/hooks/useAutoSave.ts
import { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';

export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  options = { delay: 2000, enabled: true }
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const debouncedSave = useRef(
    debounce(async (dataToSave: T) => {
      if (!options.enabled) return;
      
      setIsSaving(true);
      try {
        await onSave(dataToSave);
        setLastSaved(new Date());
      } catch (error) {
        console.error('[AutoSave] Error:', error);
      } finally {
        setIsSaving(false);
      }
    }, options.delay)
  ).current;

  useEffect(() => {
    if (data && options.enabled) {
      debouncedSave(data);
    }
    return () => debouncedSave.cancel();
  }, [data, options.enabled]);

  return { isSaving, lastSaved };
}
```

#### 2.2 Step3 - Experience (30min)
```typescript
// src/components/onboarding/Step3Experience.tsx
import { useAutoSave } from '@/hooks/useAutoSave';

export function Step3Experience({ onNext, onBack, initialData }) {
  const [formData, setFormData] = useState(initialData);
  
  // ✅ Auto-save implementation
  const { isSaving, lastSaved } = useAutoSave(
    formData,
    async (data) => {
      // Save to sessionStorage
      sessionStorage.setItem('onboarding_step3', JSON.stringify(data));
      
      // Optional: Save to API
      await fetch('/api/onboarding/autosave', {
        method: 'POST',
        body: JSON.stringify({ step: 3, data })
      });
    },
    { delay: 2000, enabled: true }
  );

  return (
    <div>
      {/* Auto-save indicator */}
      <div className="fixed top-4 right-4">
        {isSaving && (
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Salvando...</span>
          </div>
        )}
        {lastSaved && !isSaving && (
          <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">
              Salvo {formatDistanceToNow(lastSaved, { locale: ptBR })}
            </span>
          </div>
        )}
      </div>

      {/* Form fields */}
      <input
        value={formData.runningYears}
        onChange={(e) => setFormData({ ...formData, runningYears: e.target.value })}
      />
      
      {/* ... rest of the form ... */}
    </div>
  );
}
```

#### 2.3 Step4 - Goals (30min)
```typescript
// Similar implementation for Step4Goals
// Auto-save goal distance, target race date, etc.
```

#### 2.4 Step6 - Health (30min)
```typescript
// Similar implementation for Step6Health
// Auto-save sleep quality, stress level, etc.
```

### 🎯 Resultados Esperados
- ✅ Dados salvos automaticamente a cada 2 segundos
- ✅ Indicador visual de "salvando" / "salvo"
- ✅ Recuperação de dados ao recarregar página
- ✅ UX mais fluida e confiável

---

## 🎨 Opção 3: Melhorias Visuais (7-9h)

### 3.1 PerformanceTab Expandido (3-4h) 🟡 Alta Prioridade

#### Status Atual
- ✅ Lista de tempos com VDOT
- ❌ Sem visualização gráfica
- ❌ Sem histórico de evolução
- ❌ Sem comparação entre distâncias

#### Implementação

##### 3.1.1 Gráfico de Evolução VDOT (2h)
```typescript
// src/components/profile/PerformanceChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function PerformanceChart({ bestTimes }) {
  const data = Object.entries(bestTimes).map(([distance, record]) => ({
    distance,
    vdot: record.vdot,
    time: record.time,
    date: record.date
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>📈 Evolução de Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="distance" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="vdot" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

##### 3.1.2 Comparação de Paces (1h)
```typescript
// Tabela comparativa de paces por distância
export function PaceComparison({ vdot }) {
  const distances = ['5k', '10k', '21k', '42k'];
  const paces = distances.map(d => ({
    distance: d,
    easy: calculateEasyPace(vdot),
    marathon: calculateMarathonPace(vdot),
    threshold: calculateThresholdPace(vdot),
    interval: calculateIntervalPace(vdot)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>⚡ Paces de Treino (baseado no seu VDOT {vdot})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>5k</TableHead>
              <TableHead>10k</TableHead>
              <TableHead>21k</TableHead>
              <TableHead>42k</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Easy</TableCell>
              {paces.map(p => <TableCell key={p.distance}>{p.easy}</TableCell>)}
            </TableRow>
            {/* ... outras linhas ... */}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

##### 3.1.3 Histórico de PRs (1h)
```typescript
// Timeline de recordes pessoais
export function PRTimeline({ personalRecords }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🏆 Histórico de Recordes Pessoais</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {personalRecords.map((pr, i) => (
            <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="text-3xl">{pr.distance === '5k' ? '🏃' : pr.distance === '42k' ? '🏅' : '⚡'}</div>
              <div className="flex-1">
                <div className="font-bold">{pr.distance}</div>
                <div className="text-sm text-muted-foreground">
                  {pr.time} • VDOT {pr.vdot}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(pr.date), "dd/MM/yyyy")}
              </div>
              {pr.improvement && (
                <Badge variant="success">
                  ⬆️ {pr.improvement}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3.2 AvailabilityTab Melhorado (2-3h) 🟡 Média Prioridade

#### Implementação

##### 3.2.1 Calendário Visual (2h)
```typescript
// src/components/profile/WeeklyCalendar.tsx
import { Calendar } from '@/components/ui/calendar';

export function WeeklyCalendar({ trainingActivities, longRunDay, onUpdate }) {
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>📅 Calendário Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const isRunDay = trainingActivities.includes(index);
            const isLongRun = longRunDay === index;
            
            return (
              <div
                key={index}
                onClick={() => handleDayClick(index)}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all",
                  isLongRun && "bg-orange-500 text-white border-orange-600",
                  isRunDay && !isLongRun && "bg-blue-500 text-white border-blue-600",
                  !isRunDay && "border-gray-200 hover:border-blue-300"
                )}
              >
                <div className="text-center">
                  <div className="text-sm font-medium">{day}</div>
                  {isLongRun && <div className="text-xs mt-1">🏃‍♂️ Longão</div>}
                  {isRunDay && !isLongRun && <div className="text-xs mt-1">🏃 Corrida</div>}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

##### 3.2.2 Resumo Visual Melhorado (1h)
```typescript
// Heatmap de atividades
export function ActivityHeatmap({ activities }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🔥 Mapa de Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <ActivityRow 
            icon="🏃" 
            label="Corrida" 
            days={activities.running} 
            color="orange"
          />
          <ActivityRow 
            icon="💪" 
            label="Musculação" 
            days={activities.strength} 
            color="purple"
          />
          <ActivityRow 
            icon="🏊" 
            label="Natação" 
            days={activities.swimming} 
            color="blue"
          />
          <ActivityRow 
            icon="🧘" 
            label="Yoga" 
            days={activities.yoga} 
            color="pink"
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3.3 PreferencesTab + Step7Review (2h) 🟢 Baixa Prioridade

#### 3.3.1 Preferências Expandidas (1h)
```typescript
// Adicionar mais opções de preferências
export function PreferencesTab() {
  return (
    <div className="space-y-6">
      {/* Idioma (já existe) */}
      <LanguagePreference />
      
      {/* Unidades (já existe) */}
      <UnitsPreference />
      
      {/* ✨ NOVO: Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>🔔 Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <SwitchItem label="Lembrete de treino" />
            <SwitchItem label="Resumo semanal" />
            <SwitchItem label="Dicas de performance" />
          </div>
        </CardContent>
      </Card>
      
      {/* ✨ NOVO: Tema */}
      <Card>
        <CardHeader>
          <CardTitle>🎨 Aparência</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>
      
      {/* ✨ NOVO: Privacidade */}
      <Card>
        <CardHeader>
          <CardTitle>🔒 Privacidade</CardTitle>
        </CardHeader>
        <CardContent>
          <SwitchItem label="Perfil público" />
          <SwitchItem label="Compartilhar estatísticas" />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 3.3.2 Step7Review Melhorado (1h)
```typescript
// Review visual aprimorado
export function Step7Review({ data }) {
  return (
    <div className="space-y-6">
      {/* Cards visuais em vez de lista */}
      <div className="grid md:grid-cols-2 gap-4">
        <ReviewCard
          icon="👤"
          title="Dados Pessoais"
          items={[
            { label: 'Idade', value: `${data.age} anos` },
            { label: 'Peso', value: `${data.weight}kg` },
            { label: 'Altura', value: `${data.height}cm` }
          ]}
        />
        
        <ReviewCard
          icon="🏃"
          title="Experiência"
          items={[
            { label: 'Nível', value: data.runningLevel },
            { label: 'Longão', value: `${data.longestRun}km` }
          ]}
        />
        
        <ReviewCard
          icon="🎯"
          title="Objetivos"
          items={[
            { label: 'Meta', value: data.goalDistance },
            { label: 'Data', value: format(new Date(data.targetRaceDate), 'dd/MM/yyyy') }
          ]}
        />
        
        <ReviewCard
          icon="📅"
          title="Disponibilidade"
          items={[
            { label: 'Dias/semana', value: data.trainingActivities.length },
            { label: 'Longão', value: weekDays[data.longRunDay] }
          ]}
        />
      </div>
      
      {/* Progress indicator */}
      <Card className="bg-gradient-to-r from-orange-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Tudo pronto!</h3>
            <p className="text-muted-foreground mb-4">
              Seu plano personalizado será gerado em instantes
            </p>
            <Progress value={100} className="mb-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 📦 Dependências Adicionais

```json
{
  "dependencies": {
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@types/lodash": "^4.14.200"
  }
}
```

---

## 🎯 Checklist de Implementação

### Fase 1: Auto-save (2h)
- [ ] Criar hook useAutoSave
- [ ] Implementar no Step3Experience
- [ ] Implementar no Step4Goals
- [ ] Implementar no Step6Health
- [ ] Adicionar indicadores visuais
- [ ] Testar recuperação de dados

### Fase 2: Performance Tab (3-4h)
- [ ] Instalar recharts
- [ ] Criar PerformanceChart component
- [ ] Criar PaceComparison component
- [ ] Criar PRTimeline component
- [ ] Integrar na PerformanceTab
- [ ] Testar com dados reais

### Fase 3: Availability Tab (2-3h)
- [ ] Criar WeeklyCalendar component
- [ ] Criar ActivityHeatmap component
- [ ] Atualizar AvailabilityTab
- [ ] Testar interações

### Fase 4: Preferences + Review (2h)
- [ ] Expandir PreferencesTab
- [ ] Melhorar Step7Review
- [ ] Testar fluxo completo

---

## ✅ Critérios de Sucesso

1. **Auto-save**
   - ✅ Dados salvos automaticamente
   - ✅ Indicador visual funcionando
   - ✅ Recuperação após reload

2. **Performance**
   - ✅ Gráficos renderizando corretamente
   - ✅ Cálculos de pace precisos
   - ✅ Timeline de PRs funcional

3. **Availability**
   - ✅ Calendário visual interativo
   - ✅ Heatmap de atividades claro

4. **Preferences**
   - ✅ Novas opções funcionais
   - ✅ Review visual aprimorado

---

## 🚀 Próximos Passos

Após implementação:
1. Deploy em produção
2. Coletar feedback dos usuários
3. Ajustes finos baseados no uso real
4. Documentar novas features

---

**Prioridade de Execução:**
1. 🟡 Auto-save (2h) - Nice to have mas melhora muito UX
2. 🟡 PerformanceTab (3-4h) - Alta visibilidade
3. 🟡 AvailabilityTab (2-3h) - Melhora compreensão
4. 🟢 Preferences (2h) - Pode ser incremental

**Total: 9-11 horas**
