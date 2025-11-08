# PROBLEMAS CRÍTICOS ONBOARDING - 08 NOV 2025

## STATUS: ANÁLISE E RESOLUÇÃO EM ANDAMENTO

## PROBLEMAS IDENTIFICADOS

### 1. ❌ CRÍTICO: Erro ao criar perfil
**Erro**: `WeeklySchedule does not exist in the current database`
**Causa**: Referência a tabela inexistente
**Solução**: Remover referências antigas, usar `trainingSchedule` (JSON)
**Status**: INVESTIGANDO

### 2. ❌ CRÍTICO: trainingActivities vazio
**Erro**: API `/api/plan/generate` retorna 400 - "trainingActivities (dias disponíveis para treino)"
**Causa**: Step6 não está salvando corretamente os dados no formato esperado
**Solução**: Converter `trainingSchedule` para `trainingActivities` no formato antigo
**Status**: PRIORIDADE MÁXIMA

### 3. ⚠️ UX: Acentos e cedilhas faltando
**Problema**: "musculação" aparece como "musculacao"
**Causa**: Encoding UTF-8 não preservado
**Solução**: Garantir UTF-8 em todos i18n e salvamento de dados custom
**Status**: PENDENTE

### 4. ⚠️ UX: Step 5 - Distância/data pré-selecionadas
**Problema**: Ao abrir Step 5, já vem "10km" e data selecionada
**Causa**: useState com valor inicial incorreto
**Solução**: Inicializar vazio ou null
**Status**: PENDENTE

### 5. ⚠️ UX: Step 7 - Sem loading e sem geração automática
**Problema**: Após finalizar onboarding, não mostra loading e não gera plano
**Causa**: Step7Review não implementa loading animation + geração automática
**Solução**: Adicionar loading criativo + chamar `/api/plan/generate`
**Status**: PENDENTE

### 6. ⚠️ LÓGICA: Data do plano aleatória (28/02/2026)
**Problema**: planStartDate sendo gerado como 28/02/2026 sem lógica
**Causa**: Possível hardcoded ou lógica de cálculo incorreta
**Solução**: Usuário deve escolher quando quer começar
**Status**: PENDENTE - NOVA FUNCIONALIDADE

### 7. ⚠️ I18N: Botões e textos em inglês
**Problema**: "finishAndCreatePlan" aparece literal, não traduzido
**Causa**: Chave i18n não existe ou não está sendo usada
**Solução**: Adicionar traduções faltantes
**Status**: PENDENTE

## PLANO DE AÇÃO

### FASE 1: RESOLVER ERRO CRÍTICO DE CRIAÇÃO (AGORA)
1. Limpar cache Vercel
2. Verificar schema Prisma no banco Neon
3. Converter `trainingSchedule` → `trainingActivities` corretamente

### FASE 2: MELHORIAS UX STEP 7 (PRÓXIMO)
1. Implementar loading criativo com frases de corrida
2. Gerar plano automaticamente após criar perfil
3. Implementar escolha de data de início pelo usuário

### FASE 3: AJUSTES FINAIS (DEPOIS)
1. Corrigir acentos/cedilhas
2. Limpar valores pré-selecionados no Step 5
3. Adicionar traduções faltantes
4. Validar todo fluxo E2E

## NOTAS TÉCNICAS

### Conversão trainingSchedule → trainingActivities
```typescript
// trainingSchedule (novo formato - Step 6)
{
  0: { running: true, activities: ['Musculação'] }, // Domingo
  2: { running: true, activities: ['Yoga'] },       // Terça
}

// trainingActivities (formato antigo - API espera)
[
  { day: 'domingo', activity: 'running' },
  { day: 'domingo', activity: 'strength' },
  { day: 'terça', activity: 'running' },
  { day: 'terça', activity: 'yoga' },
]
```

### Data de Início do Plano
- Opção A: Usuário escolhe data no Step 5 ou 7
- Opção B: Sugestão inteligente baseada em hoje + folga
- **ESCOLHIDO**: Usuário escolhe, com sugestão "hoje" ou "próxima segunda"
