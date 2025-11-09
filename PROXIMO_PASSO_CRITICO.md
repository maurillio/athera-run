# 🚨 PRÓXIMO PASSO CRÍTICO - PRIORIDADE MÁXIMA

**Data**: 08/Nov/2025 18:25 UTC  
**Versão**: v1.7.0-dev  
**Status**: 🔴 BLOQUEADOR IDENTIFICADO

---

## ⚠️ PROBLEMA CRÍTICO

### Múltiplas Atividades Não Sendo Consideradas pela IA

**DESCRIÇÃO**:
No Step 6 do onboarding, o usuário pode selecionar múltiplas atividades por dia (ex: corrida + musculação + natação + bicicleta), mas apenas corrida e 1 outro esporte estão sendo salvos no perfil e considerados pela IA.

**IMPACTO**:
- 🔴 IA não gera plano completo
- 🔴 Perfil não reflete escolhas do usuário
- 🔴 Geração de plano falha com erro 400
- 🔴 Experiência do usuário quebrada

---

## 🔍 CENÁRIO DE TESTE

### Input do Usuário:
```
Step 6 - Disponibilidade:
✓ Corrida: Domingo, Terça, Quinta
✓ Musculação: Segunda, Terça, Quarta, Quinta, Sexta
✓ Natação: Quarta, Sexta
✓ Bicicleta: Sábado
✓ Longão: Domingo
```

### Output Atual (ERRADO):
```
Perfil mostra:
✓ Corrida: Domingo, Segunda, Terça, Quarta, Quinta, Sexta (DIAS ERRADOS!)
✗ Musculação: Nenhum dia (SUMIU!)
✗ Natação: Não aparece (IGNORADA!)
✗ Bicicleta: Não aparece (IGNORADA!)
✓ Longão: Domingo (CORRETO)
```

### Output Esperado:
```
Perfil deve mostrar:
✓ Corrida: Domingo, Terça, Quinta
✓ Musculação: Segunda, Terça, Quarta, Quinta, Sexta
✓ Natação: Quarta, Sexta
✓ Bicicleta: Sábado
✓ Longão: Domingo
```

---

## 🔥 ERRO CONSOLE

```javascript
POST /api/plan/generate 400 (Bad Request)

{
  success: false,
  error: 'Dados incompletos no perfil',
  message: 'Por favor, complete os seguintes campos no perfil: trainingActivities (dias disponíveis para treino)',
  missingFields: ['trainingActivities (dias disponíveis para treino)'],
  redirectTo: '/perfil'
}
```

---

## 📋 PLANO DE AÇÃO

### 1️⃣ INVESTIGAÇÃO (30 min)

#### A. Verificar Schema Prisma
```bash
# Verificar estrutura do campo trainingActivities
prisma/schema.prisma
```

**Perguntas**:
- [ ] Campo suporta array de objetos complexos?
- [ ] Há limitação de tipos de atividade?
- [ ] Estrutura permite múltiplas atividades por dia?

#### B. Auditar Step6Availability.tsx
```typescript
components/onboarding/v1.3.0/Step6Availability.tsx
```

**Perguntas**:
- [ ] Estado captura todas as atividades corretamente?
- [ ] Lógica de seleção múltipla está correta?
- [ ] Dados enviados ao Step7 estão completos?

#### C. Revisar API de Criação de Perfil
```typescript
app/api/profile/create/route.ts
```

**Perguntas**:
- [ ] Como `trainingActivities` é processado?
- [ ] Há transformação de dados que perde informação?
- [ ] Salvamento no banco está correto?

#### D. Analisar API de Geração de Plano
```typescript
app/api/plan/generate/route.ts
```

**Perguntas**:
- [ ] Validação de `trainingActivities` está correta?
- [ ] IA recebe todas as atividades?
- [ ] Há filtros que removem atividades?

---

### 2️⃣ CORREÇÃO (2-3 horas)

#### Estrutura de Dados Esperada

```typescript
interface TrainingActivity {
  day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  activities: string[]; // ['running', 'gym', 'swimming', etc]
  isAvailable: boolean;
}

// Exemplo completo
trainingActivities: [
  {
    day: 'sunday',
    activities: ['running', 'long_run'],
    isAvailable: true
  },
  {
    day: 'monday',
    activities: ['gym'],
    isAvailable: true
  },
  {
    day: 'tuesday',
    activities: ['running', 'gym'],
    isAvailable: true
  },
  {
    day: 'wednesday',
    activities: ['running', 'gym', 'swimming'],
    isAvailable: true
  },
  {
    day: 'thursday',
    activities: ['running', 'gym'],
    isAvailable: true
  },
  {
    day: 'friday',
    activities: ['gym', 'swimming'],
    isAvailable: true
  },
  {
    day: 'saturday',
    activities: ['cycling'],
    isAvailable: true
  }
]
```

#### Checklist de Correção

**Step 6 - Coleta de Dados**:
- [ ] Estado armazena múltiplas atividades por dia
- [ ] Lógica de toggle não sobrescreve atividades
- [ ] Todas as atividades são enviadas ao Step 7

**API Create Profile**:
- [ ] Recebe todas as atividades
- [ ] Não há transformação que perde dados
- [ ] Salva corretamente no banco

**Schema Prisma**:
- [ ] Campo suporta estrutura necessária
- [ ] Sem limitações de tipos ou quantidade

**API Generate Plan**:
- [ ] Validação não bloqueia múltiplas atividades
- [ ] IA recebe contexto completo
- [ ] Prompt inclui todas as atividades

**Perfil Display**:
- [ ] Mostra todas as atividades
- [ ] Permite edição de cada uma
- [ ] Atualização reflete no plano

---

### 3️⃣ VALIDAÇÃO (1 hora)

#### Testes E2E

**Teste 1: Corrida + 1 Esporte**
```
Input: Corrida (Dom, Ter, Qui) + Musculação (Seg, Qua, Sex)
Expected: Ambos aparecem no perfil, plano considera ambos
```

**Teste 2: Corrida + 2 Esportes**
```
Input: Corrida (Dom, Ter) + Musculação (Seg, Qua) + Natação (Qui, Sex)
Expected: Todos aparecem no perfil, plano considera todos
```

**Teste 3: Corrida + 3+ Esportes**
```
Input: Corrida + Musculação + Natação + Bicicleta + Yoga
Expected: Todos aparecem no perfil, plano considera todos
```

**Teste 4: Esporte Personalizado**
```
Input: Corrida + Musculação + "Escalada" (customizado)
Expected: "Escalada" aparece e é considerado
```

**Teste 5: Apenas Corrida**
```
Input: Apenas Corrida (dias variados)
Expected: Funciona normalmente
```

---

## 🎯 CRITÉRIOS DE SUCESSO

### ✅ Checklist Final

- [ ] Usuário pode selecionar N atividades por dia
- [ ] Todas as atividades aparecem no perfil
- [ ] Perfil permite editar cada atividade
- [ ] API de geração não falha com erro 400
- [ ] IA recebe lista completa de atividades
- [ ] Plano gerado considera todas as atividades
- [ ] Review (Step 7) mostra todas as atividades
- [ ] Esportes personalizados funcionam
- [ ] Build passa no Vercel
- [ ] Testes E2E passam

---

## 📊 ARQUIVOS ENVOLVIDOS

### Prioridade ALTA (precisam revisão):
```
1. components/onboarding/v1.3.0/Step6Availability.tsx
2. app/api/profile/create/route.ts
3. app/api/plan/generate/route.ts
4. prisma/schema.prisma
5. components/onboarding/v1.3.0/Step7Review.tsx
```

### Prioridade MÉDIA (podem precisar ajuste):
```
6. app/[locale]/perfil/page.tsx
7. lib/ai/generate-plan.ts
8. types/athlete.ts
```

---

## 🚀 ESTIMATIVA

- **Investigação**: 30 min
- **Correção**: 2-3 horas
- **Validação**: 1 hora
- **Total**: 3.5 - 4.5 horas

---

## 📝 NOTAS IMPORTANTES

1. **Não quebrar funcionalidade existente**: Garantir que corrida simples ainda funciona
2. **Manter convergência**: Todas as partes do sistema devem estar sincronizadas
3. **Testar edge cases**: Usuário remove atividade, adiciona nova, etc
4. **Documentar mudanças**: Atualizar CONTEXTO.md após correção

---

## 🔗 REFERÊNCIAS

- **Sessão Completa**: `SESSAO_ONBOARDING_08NOV2025_COMPLETA.md`
- **Contexto**: `CONTEXTO.md`
- **Schema**: `prisma/schema.prisma`
- **Documentação IA**: `docs/ai-context-format.md`

---

**Criado em**: 08/Nov/2025 18:25 UTC  
**Por**: Sistema Athera Run  
**Prioridade**: 🔴 CRÍTICA - BLOQUEADOR
