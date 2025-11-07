# Diagnóstico Crítico - Onboarding v1.5.4
**Data:** 07 de Novembro de 2025
**Versão:** 1.5.4
**Status:** 🔴 CRÍTICO - Sistema não salva dados completos

## 📋 Problemas Identificados

### 1. **Perda de Dados ao Navegar entre Steps**
- **Severidade:** 🔴 CRÍTICA
- **Descrição:** Quando o usuário volta para um step anterior, todos os dados preenchidos são perdidos
- **Causa:** Estado local (`useState`) nos componentes de step não persiste quando o componente é desmontado
- **Impacto:** Usuário precisa preencher tudo novamente

### 2. **Botões Duplicados no Step 7**
- **Severidade:** 🟠 ALTA
- **Descrição:** Existem 2 botões "Finalizar" no Step7:
  - Um botão opaco/desabilitado no componente Step7Review
  - Um botão verde funcional na página principal
- **Causa:** Navegação sendo renderizada tanto no componente quanto na página
- **Localização:**
  - `/app/[locale]/onboarding/page.tsx` linha 309-338
  - `/components/onboarding/v1.3.0/Step7Review.tsx` linha 180-207

### 3. **Dados Não Salvos no Perfil**
- **Severidade:** 🔴 CRÍTICA
- **Descrição:** Apenas `goalDistance`, `targetRaceDate` e `targetTime` são salvos
- **Dados Perdidos:**
  - Nome, email, gênero, idade
  - Peso, altura
  - Nível de corrida, experiência
  - Volume semanal, longão
  - Dias de treino, horários preferenciais
  - Lesões, condições médicas
  - Motivações
- **Causa:** Dados não estão sendo passados corretamente entre steps

### 4. **Step 7 Não Mostra Resumo Completo**
- **Severidade:** 🟠 ALTA
- **Descrição:** Review final não exibe todas as informações preenchidas
- **Exemplo:** Mostra apenas:
  - ✓ 🎯 Completar primeira corrida
  - ✓ 🏁 Meta: 10km
  - ✓ 📅 Data da prova: 29/11/2025
- **Falta:**
  - Dados pessoais (idade, peso, altura, gênero)
  - Experiência de corrida
  - Dias e horários de treino
  - Lesões e restrições
  - Outros detalhes preenchidos

### 5. **Conversão Incorreta de availableDays**
- **Severidade:** 🟠 ALTA
- **Descrição:** O Step 6 coleta `availableDays` mas a API espera `trainingActivities`
- **Problema:** Conversão é feita mas pode perder informações
- **Código Problemático (page.tsx, linha 159):**
```typescript
const trainingActivities = formData.availableDays?.running || [];
```

## 🔍 Análise Técnica

### Fluxo de Dados Atual

```
Step1 → onUpdate() → page.tsx formData
Step2 → onUpdate() → page.tsx formData
...
Step7 → Lê formData → Mas dados podem estar incompletos
```

### Problemas no Fluxo

1. **Estado Local vs Global:**
   - Cada step usa `useState` local para inputs
   - `onUpdate()` é chamado apenas no `handleNext()`
   - Se usuário voltar, estado local é perdido

2. **Validação Inconsistente:**
   - Steps 1-4: Validam internamente
   - Steps 5-6: Validação na página principal (comentada)
   - Step 7: Validação parcial

3. **Inicialização Incorreta:**
   - Steps não inicializam estado local com `data` props
   - Quando volta ao step, campos aparecem vazios

## 🛠️ Soluções Necessárias

### 1. Persistir Estado dos Steps
**Prioridade:** 🔴 CRÍTICA

```typescript
// Em cada componente de step, inicializar estado com props:
const [campo, setCampo] = useState(data.campo || '');

// E salvar ao mudar (não apenas no next):
useEffect(() => {
  const timeoutId = setTimeout(() => {
    onUpdate({ campo });
  }, 500); // Debounce
  return () => clearTimeout(timeoutId);
}, [campo]);
```

### 2. Remover Botões Duplicados
**Prioridade:** 🟠 ALTA

Remover navegação da página principal no Step 7, deixar apenas no componente Step7Review.

### 3. Corrigir Mapeamento de Dados
**Prioridade:** 🔴 CRÍTICA

Garantir que TODOS os campos do onboarding sejam mapeados para o formato da API:

```typescript
// Mapeamento completo necessário:
{
  // Step 1
  name, email, gender, age, weight, height,
  restingHeartRate, sleepQuality, stressLevel,
  
  // Step 2
  runningLevel, yearsRunning, weeklyVolume,
  weeklyFrequency, longestRun, preferredPace, otherSports,
  
  // Step 3
  personalBests,
  
  // Step 4
  injuries, medicalConditions, medicalClearance, medicalNotes,
  
  // Step 5
  primaryGoal, targetRaceDate, goalDistance, targetTime,
  secondaryGoals, motivationFactors,
  
  // Step 6
  trainingDays, preferredTimes, longRunDay, otherActivities
}
```

### 4. Melhorar Step 7 Review
**Prioridade:** 🟠 ALTA

Exibir TODAS as informações em seções organizadas:
- Dados Pessoais
- Experiência de Corrida
- Objetivos e Metas
- Disponibilidade
- Saúde e Restrições

### 5. Adicionar Validação Progressiva
**Prioridade:** 🟡 MÉDIA

- Validar cada campo ao sair dele (onBlur)
- Mostrar indicadores visuais de preenchimento
- Bloquear avanço apenas se campos obrigatórios estiverem vazios

## 📊 Campos vs Schema Prisma

### Campos Coletados no Onboarding:
```typescript
{
  name, email, gender, age, weight, height,
  restingHeartRate, sleepQuality, stressLevel,
  runningLevel, yearsRunning, weeklyVolume,
  weeklyFrequency, longestRun, preferredPace,
  otherSports, personalBests, injuries,
  medicalConditions, medicalClearance, medicalNotes,
  primaryGoal, targetRaceDate, goalDistance,
  targetTime, secondaryGoals, trainingDays,
  preferredTimes, longRunDay, otherActivities,
  motivationFactors
}
```

### Campos no Schema Prisma (AthleteProfile):
```prisma
weight, height, age, gender, runningLevel,
currentWeeklyKm, longestRun, experienceDescription,
goalDistance (REQUIRED), targetRaceDate (REQUIRED),
targetTime, trainingActivities, longRunDay,
runningYears, maxHeartRate, restingHeartRate,
sleepQuality, stressLevel, otherSportsExperience,
otherSportsYears, injuryDetails, injuryRecoveryStatus,
lastInjuryDate, bestTimes, hasGymAccess,
hasPoolAccess, hasTrackAccess, trainingPreferences,
motivationFactors, hasCustomPlan
```

### Mapeamento Necessário:
```typescript
// Onboarding → Prisma
{
  name → user.name (atualizar user)
  email → user.email (atualizar user)
  weeklyVolume → currentWeeklyKm
  yearsRunning → runningYears
  personalBests → bestTimes
  injuries + medicalConditions → injuryDetails
  otherSports → otherSportsExperience
  trainingDays + preferredTimes → trainingActivities
  primaryGoal + secondaryGoals + motivationFactors → motivationFactors (structured)
}
```

## 🎯 Priorização de Correções

### Sprint 1 (Imediato - Hoje)
1. ✅ Fix perda de dados ao navegar (persistência)
2. ✅ Remover botões duplicados
3. ✅ Garantir que TODOS os dados são enviados à API
4. ✅ Validar que perfil salva corretamente

### Sprint 2 (Próximas 2h)
1. Melhorar Step 7 Review (mostrar todos os dados)
2. Adicionar indicadores de progresso por step
3. Adicionar auto-save enquanto preenche

### Sprint 3 (Próximo dia)
1. Implementar validação progressiva
2. Adicionar tooltips e ajuda contextual
3. Melhorar UX de navegação entre steps

## 📝 Checklist de Testes

Após correções, validar:

- [ ] Preencher Step 1 → Ir para Step 2 → Voltar para Step 1 → Dados ainda lá
- [ ] Preencher todos os 6 steps → Step 7 mostra TUDO
- [ ] Finalizar onboarding → Perfil salvo com TODOS os campos
- [ ] Verificar no banco: `select * from "AthleteProfile"` mostra dados completos
- [ ] Verificar `RaceGoal` criada automaticamente
- [ ] Tentar gerar plano → Sucesso (sem erro de dados faltando)

## 🔐 Segurança

- Remover credenciais do PostgreSQL do código
- Adicionar ao .gitignore: `**/*.env*`, `**/DATABASE_URL`
- Migrar para variáveis de ambiente apenas

## 📚 Documentação a Atualizar

1. `CONTEXTO.md` - Adicionar seção sobre persistência de estado
2. `GUIA_TECNICO.md` - Documentar fluxo de dados do onboarding
3. `CHANGELOG.md` - v1.5.5 com correções críticas
4. `README.md` - Atualizar status do onboarding

## 🎭 Comparação com v1.3.0

### O que funcionava na v1.3.0:
- Dia do longão era perguntado no onboarding ✅
- Todos os dados eram salvos ✅
- Step 7 mostrava resumo completo ✅

### O que quebrou na v1.4.0:
- Implementação de i18n mudou estrutura dos steps
- Perda de lógica de persistência
- Simplificação excessiva do mapeamento de dados

### Lições Aprendidas:
1. Sempre preservar funcionalidades ao refatorar
2. Testes de regressão são críticos
3. Documentar decisões de arquitetura
4. Validar TODAS as features após mudanças grandes

---

**Próximos Passos:**
1. Implementar correções do Sprint 1
2. Testar exaustivamente
3. Deploy em staging
4. Validar em produção com usuário real
5. Monitorar logs por 24h

**ETA para correção completa:** 4-6 horas
**Risco de regressão:** Baixo (correções focadas)
**Impacto:** 🔴 CRÍTICO (bloqueia onboarding completamente)
