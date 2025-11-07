# 🎯 PLANO DE AÇÃO IMEDIATO - Convergência Total

**Data:** 07/Nov/2025 16:25 UTC  
**Prioridade:** 🔴 MÁXIMA  
**Tempo Estimado:** 16-20 horas  
**Status:** ✅ PRONTO PARA EXECUÇÃO

---

## 📊 PROBLEMAS CRÍTICOS CONFIRMADOS

### 1. ❌ ABA DE EXPERIÊNCIA NÃO EXISTE
**Localização:** `/components/profile/v1.3.0/`  
**Arquivos existentes:**
- ✅ BasicDataTab.tsx
- ✅ PerformanceTab.tsx  
- ✅ HealthTab.tsx
- ✅ GoalsTab.tsx
- ✅ AvailabilityTab.tsx
- ✅ PreferencesTab.tsx
- ❌ **FALTA: ExperienceTab.tsx**

**Impacto:** Usuário não vê:
- Nível de corrida
- Anos de experiência
- Volume semanal atual
- Longão mais longo
- Pace preferido
- Outros esportes

### 2. ❌ DIA DO LONGÃO NÃO É COLETADO
**Localização:** `/components/onboarding/v1.3.0/Step6Availability.tsx`  
**Status:** Campo não existe no formulário  
**Impacto:** Sistema decide arbitrariamente o dia do treino mais importante

### 3. ⚠️ AVAILABILITY TAB INCOMPLETO
**Problema:** Não mostra claramente os dias selecionados  
**Problema:** Não mostra outras atividades  
**Problema:** Não mostra infraestrutura

---

## 🚀 SPRINT 1: CORREÇÕES CRÍTICAS (8-10 horas)

### ✅ Task 1.1: Criar ExperienceTab (2h)

**Arquivo:** `/components/profile/v1.3.0/ExperienceTab.tsx`

```typescript
'use client';
import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';

export default function ExperienceTab({ userData, onUpdate }: any) {
  const t = useTranslations('profile.experience');
  
  const [formData, setFormData] = useState({
    runningLevel: userData.runningLevel || 'beginner',
    runningYears: userData.runningYears || 0,
    currentWeeklyKm: userData.currentWeeklyKm || 0,
    longestRun: userData.longestRun || 0,
    preferredPace: userData.preferredPace || '',
    otherSportsExperience: userData.otherSportsExperience || '',
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };
  
  const handleSave = async () => {
    await onUpdate(formData);
    setHasChanges(false);
  };
  
  const levels = [
    { value: 'beginner', label: t('levels.beginner') },
    { value: 'intermediate', label: t('levels.intermediate') },
    { value: 'advanced', label: t('levels.advanced') },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {t('title')}
        </h3>
      </div>
      
      {/* Nível de Corrida */}
      <div>
        <label className="block font-medium mb-2">
          {t('runningLevel')}
        </label>
        <select 
          value={formData.runningLevel}
          onChange={(e) => handleChange('runningLevel', e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          {levels.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Anos de Experiência */}
      <div>
        <label className="block font-medium mb-2">
          {t('yearsRunning')}
        </label>
        <input
          type="number"
          value={formData.runningYears}
          onChange={(e) => handleChange('runningYears', parseInt(e.target.value) || 0)}
          className="w-full px-4 py-2 border rounded-lg"
          min="0"
          max="50"
        />
        <p className="text-sm text-gray-600 mt-1">
          {t('yearsRunningHelp')}
        </p>
      </div>
      
      {/* Volume Semanal */}
      <div>
        <label className="block font-medium mb-2">
          {t('currentWeeklyKm')}
        </label>
        <input
          type="number"
          value={formData.currentWeeklyKm}
          onChange={(e) => handleChange('currentWeeklyKm', parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-2 border rounded-lg"
          min="0"
          step="0.1"
        />
        <p className="text-sm text-gray-600 mt-1">
          {t('currentWeeklyKmHelp')}
        </p>
      </div>
      
      {/* Longão Mais Longo */}
      <div>
        <label className="block font-medium mb-2">
          {t('longestRun')}
        </label>
        <input
          type="number"
          value={formData.longestRun}
          onChange={(e) => handleChange('longestRun', parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-2 border rounded-lg"
          min="0"
          step="0.1"
        />
        <p className="text-sm text-gray-600 mt-1">
          {t('longestRunHelp')}
        </p>
      </div>
      
      {/* Pace Preferido */}
      <div>
        <label className="block font-medium mb-2">
          {t('preferredPace')}
        </label>
        <input
          type="text"
          value={formData.preferredPace}
          onChange={(e) => handleChange('preferredPace', e.target.value)}
          placeholder="Ex: 5:30/km"
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-sm text-gray-600 mt-1">
          {t('preferredPaceHelp')}
        </p>
      </div>
      
      {/* Outros Esportes */}
      <div>
        <label className="block font-medium mb-2">
          {t('otherSports')}
        </label>
        <textarea
          value={formData.otherSportsExperience}
          onChange={(e) => handleChange('otherSportsExperience', e.target.value)}
          placeholder={t('otherSportsPlaceholder')}
          className="w-full px-4 py-2 border rounded-lg"
          rows={3}
        />
        <p className="text-sm text-gray-600 mt-1">
          {t('otherSportsHelp')}
        </p>
      </div>
      
      {/* Botão Salvar */}
      {hasChanges && (
        <Button
          onClick={handleSave}
          className="w-full"
        >
          {t('saveChanges')}
        </Button>
      )}
    </div>
  );
}
```

**Checklist:**
- [ ] Criar arquivo ExperienceTab.tsx
- [ ] Adicionar traduções em pt-BR, en, es
- [ ] Adicionar tab na página do perfil
- [ ] Testar carregamento de dados
- [ ] Testar salvamento
- [ ] Validar que dados aparecem

---

### ✅ Task 1.2: Adicionar Dia do Longão no Step 6 (2h)

**Arquivo:** `/components/onboarding/v1.3.0/Step6Availability.tsx`

**Adicionar após os dias de corrida:**

```typescript
{/* Dia do Longão - NOVO */}
<div className="mt-6 border-t pt-6">
  <label className="block font-semibold mb-3 text-blue-900">
    🏃‍♂️ {t('longRunDayTitle')} *
  </label>
  <p className="text-sm text-gray-600 mb-3">
    {t('longRunDayDescription')}
  </p>
  
  <select
    value={longRunDay !== null ? longRunDay : ''}
    onChange={(e) => {
      const day = e.target.value === '' ? null : parseInt(e.target.value);
      setLongRunDay(day);
      setHasChanges(true);
    }}
    className="w-full px-4 py-2 border-2 rounded-lg bg-white"
  >
    <option value="">{t('selectLongRunDay')}</option>
    {days.map((day, idx) => (
      <option 
        key={idx} 
        value={idx}
        disabled={!runDays.includes(idx)}
      >
        {day} {runDays.includes(idx) ? '' : '(não disponível)'}
      </option>
    ))}
  </select>
  
  {longRunDay !== null && (
    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm text-green-800">
        ✅ Seu longão será sempre {days[longRunDay]}
      </p>
    </div>
  )}
</div>
```

**Checklist:**
- [ ] Adicionar estado longRunDay
- [ ] Adicionar campo no formulário
- [ ] Adicionar traduções
- [ ] Salvar no onUpdate
- [ ] Validar que é obrigatório se tem dias de corrida
- [ ] Testar que só mostra dias disponíveis

---

### ✅ Task 1.3: Melhorar AvailabilityTab (2h)

**Arquivo:** `/components/profile/v1.3.0/AvailabilityTab.tsx`

**Adicionar visualização clara:**

```typescript
{/* Resumo Visual dos Dias - NOVO */}
<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
  <h4 className="font-semibold mb-3">📅 Seus Dias de Treino</h4>
  
  <div className="space-y-2">
    {/* Dias de Corrida */}
    <div>
      <span className="font-medium">🏃 Corrida:</span>
      <span className="ml-2">
        {runDays.length > 0 
          ? runDays.map(d => days[d]).join(', ')
          : 'Nenhum dia selecionado'
        }
      </span>
    </div>
    
    {/* Dia do Longão */}
    {userData.longRunDay !== null && userData.longRunDay !== undefined && (
      <div>
        <span className="font-medium">🏃‍♂️ Longão:</span>
        <span className="ml-2 text-green-700 font-semibold">
          {days[userData.longRunDay]}
        </span>
      </div>
    )}
    
    {/* Outras Atividades */}
    {strengthDays.length > 0 && (
      <div>
        <span className="font-medium">💪 Musculação:</span>
        <span className="ml-2">
          {strengthDays.map(d => days[d]).join(', ')}
        </span>
      </div>
    )}
    
    {swimmingDays.length > 0 && (
      <div>
        <span className="font-medium">🏊 Natação:</span>
        <span className="ml-2">
          {swimmingDays.map(d => days[d]).join(', ')}
        </span>
      </div>
    )}
    
    {yogaDays.length > 0 && (
      <div>
        <span className="font-medium">🧘 Yoga:</span>
        <span className="ml-2">
          {yogaDays.map(d => days[d]).join(', ')}
        </span>
      </div>
    )}
  </div>
</div>

{/* Infraestrutura Disponível - NOVO */}
<div className="mb-6">
  <h4 className="font-semibold mb-3">🏗️ Infraestrutura Disponível</h4>
  
  <div className="grid grid-cols-3 gap-3">
    <div className={`p-3 rounded-lg text-center ${userData.hasGymAccess ? 'bg-green-50 border-green-200' : 'bg-gray-50'} border`}>
      <div className="text-2xl mb-1">💪</div>
      <div className="text-sm font-medium">Academia</div>
      <div className="text-xs text-gray-600">
        {userData.hasGymAccess ? 'Disponível' : 'Não disponível'}
      </div>
    </div>
    
    <div className={`p-3 rounded-lg text-center ${userData.hasPoolAccess ? 'bg-green-50 border-green-200' : 'bg-gray-50'} border`}>
      <div className="text-2xl mb-1">🏊</div>
      <div className="text-sm font-medium">Piscina</div>
      <div className="text-xs text-gray-600">
        {userData.hasPoolAccess ? 'Disponível' : 'Não disponível'}
      </div>
    </div>
    
    <div className={`p-3 rounded-lg text-center ${userData.hasTrackAccess ? 'bg-green-50 border-green-200' : 'bg-gray-50'} border`}>
      <div className="text-2xl mb-1">🏃</div>
      <div className="text-sm font-medium">Pista</div>
      <div className="text-xs text-gray-600">
        {userData.hasTrackAccess ? 'Disponível' : 'Não disponível'}
      </div>
    </div>
  </div>
</div>
```

**Checklist:**
- [ ] Adicionar resumo visual
- [ ] Mostrar dia do longão
- [ ] Mostrar infraestrutura
- [ ] Testar com diferentes configurações

---

### ✅ Task 1.4: Adicionar Tab de Experiência no Perfil (1h)

**Arquivo:** `/app/[locale]/perfil/page.tsx`

**Adicionar importação:**
```typescript
import ExperienceTab from '@/components/profile/v1.3.0/ExperienceTab';
```

**Adicionar no Tabs:**
```typescript
<TabsList>
  <TabsTrigger value="basic">
    <User className="w-4 h-4 mr-2" />
    {t('tabs.basic')}
  </TabsTrigger>
  
  {/* NOVO */}
  <TabsTrigger value="experience">
    <TrendingUp className="w-4 h-4 mr-2" />
    {t('tabs.experience')}
  </TabsTrigger>
  
  <TabsTrigger value="performance">
    <Activity className="w-4 h-4 mr-2" />
    {t('tabs.performance')}
  </TabsTrigger>
  
  {/* ... outros tabs */}
</TabsList>

{/* NOVO TabsContent */}
<TabsContent value="experience">
  <Card>
    <CardHeader>
      <CardTitle>{t('experience.title')}</CardTitle>
      <CardDescription>{t('experience.description')}</CardDescription>
    </CardHeader>
    <CardContent>
      <ExperienceTab
        userData={profile}
        onUpdate={handleUpdateProfile}
      />
    </CardContent>
  </Card>
</TabsContent>
```

**Checklist:**
- [ ] Adicionar import
- [ ] Adicionar TabsTrigger
- [ ] Adicionar TabsContent
- [ ] Testar navegação
- [ ] Validar dados carregam

---

### ✅ Task 1.5: Traduções (1h)

**Arquivos:** 
- `/lib/i18n/translations/pt-BR.json`
- `/lib/i18n/translations/en.json`
- `/lib/i18n/translations/es.json`

**Adicionar em todos:**

```json
{
  "profile": {
    "tabs": {
      "experience": "Experiência"
    },
    "experience": {
      "title": "Experiência de Corrida",
      "description": "Seu histórico e experiência como corredor",
      "runningLevel": "Nível de Corrida",
      "levels": {
        "beginner": "Iniciante",
        "intermediate": "Intermediário",
        "advanced": "Avançado"
      },
      "yearsRunning": "Anos Correndo",
      "yearsRunningHelp": "Há quantos anos você corre regularmente?",
      "currentWeeklyKm": "Volume Semanal Atual (km)",
      "currentWeeklyKmHelp": "Quantos km você corre por semana atualmente?",
      "longestRun": "Longão Mais Longo (km)",
      "longestRunHelp": "Qual foi o treino mais longo que você já fez?",
      "preferredPace": "Pace Preferido",
      "preferredPaceHelp": "Qual seu pace habitual em treinos leves?",
      "otherSports": "Outros Esportes",
      "otherSportsPlaceholder": "Ex: Natação 2x/semana, Ciclismo aos finais de semana",
      "otherSportsHelp": "Outras atividades físicas que você pratica",
      "saveChanges": "Salvar Alterações"
    }
  },
  "onboarding": {
    "step6": {
      "longRunDayTitle": "Dia do Longão",
      "longRunDayDescription": "Escolha o dia da semana para seu treino mais longo. Geralmente é no final de semana, mas você decide!",
      "selectLongRunDay": "Selecione o dia..."
    }
  }
}
```

**Checklist:**
- [ ] Adicionar em pt-BR
- [ ] Adicionar em en
- [ ] Adicionar em es
- [ ] Testar troca de idiomas

---

## 🚀 SPRINT 2: MELHORIAS IMPORTANTES (6-8 horas)

### ✅ Task 2.1: Melhorar Step 7 Review (3h)

**Adicionar seções faltantes:**
- Outros esportes
- Melhores tempos
- Infraestrutura
- Dia do longão

### ✅ Task 2.2: Edição de Preferências (3h)

**Adicionar na aba Preferências:**
- Escolha de idioma
- Unidades (km/mi)
- Salvar no banco

---

## 🚀 SPRINT 3: VALIDAÇÃO (2-3 horas)

### ✅ Task 3.1: Testes E2E (2h)

**Fluxo completo:**
1. Completar onboarding
2. Verificar perfil mostra tudo
3. Editar no perfil
4. Gerar plano
5. Validar plano usa dados corretos

### ✅ Task 3.2: Documentação (1h)

- Atualizar CONTEXTO.md
- Criar CHANGELOG entry
- Documentar novos campos

---

## 📊 PRIORIDADES REORDENADAS

### 🔥 FAZER HOJE (4 horas)
1. Task 1.1: Criar ExperienceTab (2h)
2. Task 1.2: Adicionar dia do longão (2h)

### ⚡ FAZER AMANHÃ (4 horas)
3. Task 1.3: Melhorar AvailabilityTab (2h)
4. Task 1.4: Adicionar tab no perfil (1h)
5. Task 1.5: Traduções (1h)

### 📅 FAZER DIA SEGUINTE (6 horas)
6. Task 2.1: Melhorar Review (3h)
7. Task 2.2: Preferências (3h)

### ✅ FAZER PRÓXIMA SEMANA (3 horas)
8. Task 3.1: Testes (2h)
9. Task 3.2: Documentação (1h)

---

## ✅ RESULTADO FINAL ESPERADO

**Após implementação completa:**

```
✅ Onboarding coleta DIA DO LONGÃO
✅ Perfil tem aba EXPERIÊNCIA
✅ Perfil mostra TODOS os dados coletados
✅ Disponibilidade mostra dias claramente
✅ Infraestrutura aparece no perfil
✅ Review Step 7 é COMPLETO
✅ Preferências permite escolher idioma
✅ Geração de plano usa longão no dia correto
✅ 100% CONVERGÊNCIA entre onboarding, perfil e planos
```

---

## 📝 PRÓXIMA AÇÃO

**COMEÇAR AGORA:**
1. Criar arquivo `ExperienceTab.tsx`
2. Implementar formulário básico
3. Testar carregamento de dados

**Estimativa de conclusão total:** 3-4 dias úteis (16-20 horas)

---

*Documento criado em: 07/Nov/2025 16:40 UTC*  
*Status: ✅ Pronto para execução imediata*
