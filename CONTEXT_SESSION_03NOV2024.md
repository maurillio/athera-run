# Contexto da Sessão - 03 de Novembro de 2024

## 📅 Data: 03/11/2024
## ⏰ Horário: 13:52 UTC

---

## 🎯 Alterações Realizadas

### 1. ✅ **Upgrade do Modelo de IA: GPT-4o-mini → GPT-4o**

**Problema:** Sistema estava usando GPT-4o-mini (modelo mais simples)

**Solução:**
- Atualizado `.env`: `LLM_MODEL=gpt-4o`
- GPT-4o oferece inteligência superior para coaching complexo
- Melhor análise de treinos, planos mais sofisticados
- Custo: ~$5/1M tokens (vs $0.15 do mini)
- **Impacto:** Qualidade significativamente maior nos planos gerados

**Arquivos:**
- `nextjs_space/.env`
- `VERCEL_ENV_CHECKLIST.md` (criado)

---

### 2. ✅ **Remoção de Botão Redundante no Menu Dropdown**

**Problema:** Botão "Minha Assinatura" aparecia tanto no menu dropdown quanto na página de perfil

**Solução:**
- Removido botão "Minha Assinatura" do menu dropdown
- Mantido apenas na página de perfil (onde funciona perfeitamente)
- Removido ícone `CreditCard` não utilizado

**Arquivos:**
- `nextjs_space/components/user-dropdown.tsx`

---

### 3. ✅ **Fix: Erro "esperado -1, recebido 0" na Geração de Planos**

**Problema:** Usuário joaomarcosaraujooliveira@gmail.com não conseguia gerar plano
- Erro: "Total de semanas inválido, Número de semanas inconsistente: esperado -1, recebido 0"
- Ocorria quando data da corrida estava no passado ou muito próxima

**Solução:**
- Adicionada validação: se `totalWeeks < 1`, rejeita com mensagem clara
- Se data for inválida (passado), erro: "A data da corrida não pode estar no passado"
- Garantido mínimo de 1 semana para gerar plano

**Arquivos:**
- `nextjs_space/lib/ai-plan-generator.ts`

---

### 4. ✅ **Fix: Semana da Corrida Não Estava Sendo Incluída no Plano**

**Problema:** 
- Corrida dia 16/11, plano gerado até 09/11 apenas
- Semana da corrida (10-16/11) não estava sendo incluída

**Causa Raiz:**
- `Math.floor` estava truncando semanas parciais
- Exemplo: 13 dias ÷ 7 = 1.857 → `floor` = 1 semana ❌

**Solução:**
- Substituído `Math.floor` por `Math.ceil` em 3 lugares:
  1. `generateAIPlan()` - Geração principal
  2. `prepareUserContext()` - Contexto para IA
  3. Listagem de corridas B/C

**Resultado:**
- 13 dias ÷ 7 = 1.857 → `ceil` = 2 semanas ✅
- Semana da corrida agora é sempre incluída

**Arquivos:**
- `nextjs_space/lib/ai-plan-generator.ts`

---

### 5. ✅ **Fix CRÍTICO: Sistema SEMPRE Respeita Data Escolhida pelo Atleta**

**Problema GRAVE:**
- Sistema **IGNORAVA** a data escolhida pelo atleta se fosse < 4 semanas
- Usava valores padrão **FIXOS** (5K=8sem, Maratona=16sem)
- **NÃO respeitava** o compromisso real do atleta com a corrida

**Solução Implementada:**

#### A. Data do Atleta é SAGRADA
```typescript
// SEMPRE usa a data escolhida pelo atleta
let totalWeeks = weeksCalculated;

// Só rejeita se data no PASSADO
if (totalWeeks < 1) {
  throw new Error('A data da corrida não pode estar no passado...');
}
```

#### B. Sistema de Avisos Inteligente
```typescript
// Valores recomendados para REFERÊNCIA (não forçado)
const recommendedWeeksByDistance = {
  '5K': 8,
  '10K': 10,
  'Meia Maratona': 12,
  'Maratona': 16,
  'Ultramaratona': 20,
};

// Se tempo < recomendado, AVISA mas GERA o plano
if (totalWeeks < recommendedWeeks) {
  warnings = {
    isShortNotice: true,
    shortNoticeMessage: "⚠️ Aviso: X semanas é curto para Y..."
  };
}
```

#### C. Exemplos Práticos

| Situação | Antes ❌ | Agora ✅ |
|----------|---------|---------|
| Maratona em 2 semanas | Usava 16 semanas (ignora data) | Usa 2 semanas + aviso |
| 5K em 3 semanas | Usava 8 semanas (ignora data) | Usa 3 semanas + aviso |
| Meia em 15 semanas | Usava 15 semanas ✓ | Usa 15 semanas ✓ (sem aviso) |
| Corrida ontem | Erro genérico | Erro claro: "Data no passado" |

**Interface Atualizada:**
```typescript
export interface AIGeneratedPlan {
  // ... campos existentes
  warnings?: {
    isShortNotice?: boolean;
    shortNoticeMessage?: string;
  };
}
```

**Arquivos:**
- `nextjs_space/lib/ai-plan-generator.ts`
- `nextjs_space/app/api/plan/generate/route.ts`

---

### 6. 🚧 **EM PROGRESSO: Fix de Exclusão de Perfil**

**Problemas Identificados:**
1. Quando usuário exclui perfil, não redireciona para onboarding automaticamente
2. Após exclusão, disponibilidade continua preenchida (dados não são limpos)
3. Possível falta de API robusta para exclusão completa

**Solução em Desenvolvimento:**
- ✅ Criada API `/api/profile/delete` robusta que deleta:
  - CustomWorkouts
  - CustomWeeks
  - CustomTrainingPlan
  - RaceGoals (corridas)
  - Workouts (treinos registrados)
  - AthleteFeedback
  - StravaActivities
  - AthleteProfile
- 🚧 Adicionando botão na UI (em progresso)
- 🚧 Redirecionamento automático para onboarding

**Arquivos:**
- ✅ `nextjs_space/app/api/profile/delete/route.ts` (criado)
- 🚧 `nextjs_space/app/perfil/page.tsx` (em edição)

---

## 📊 Commits Realizados

### Commit 1: Upgrade para GPT-4o e remoção de botão redundante
```bash
git commit -m "Upgrade para GPT-4o e remove botão redundante de assinatura do menu dropdown"
```
- Alterações: 4 arquivos, 93 inserções, 12 deleções

### Commit 2: Fix de validação de data
```bash
git commit -m "Fix: Adiciona validação de data de corrida para evitar totalWeeks zero ou negativo"
```
- Alterações: 1 arquivo, 18 inserções, 1 deleção

### Commit 3: Fix de semana da corrida
```bash
git commit -m "Fix: Inclui semana da corrida no plano usando Math.ceil"
```
- Alterações: 1 arquivo, 6 inserções, 3 deleções

### Commit 4: Fix crítico - respeita data do atleta
```bash
git commit -m "Fix: SEMPRE respeita data escolhida pelo atleta"
```
- Alterações: 2 arquivos, 54 inserções, 16 deleções

---

## 🎓 Lições Aprendidas

### 1. **A Data da Corrida é Sagrada**
- NUNCA ignorar a data escolhida pelo atleta
- É o compromisso mais importante dele
- Avisar se tempo é curto, MAS gerar o plano mesmo assim

### 2. **Math.floor vs Math.ceil em Semanas**
- `Math.floor` trunca semanas parciais (perde semana da corrida)
- `Math.ceil` garante que semana parcial é incluída
- Sempre usar `Math.ceil` para calcular semanas até eventos

### 3. **Qualidade vs Custo em LLMs**
- GPT-4o-mini: rápido e barato, mas básico
- GPT-4o: mais caro (~33x), mas MUITO mais inteligente
- Para coaching complexo, vale o upgrade

### 4. **UX: Evitar Redundância**
- Múltiplos caminhos para mesma ação confunde usuário
- Manter apenas o caminho mais intuitivo

---

## 🔄 Estado Atual do Sistema

### ✅ Funcionando
- Geração de planos com GPT-4o (inteligência superior)
- Validação robusta de datas
- Inclusão da semana da corrida
- Respeito à data escolhida pelo atleta
- Sistema de avisos para tempo curto
- Menu dropdown limpo (sem redundância)

### 🚧 Em Desenvolvimento
- Botão de exclusão de perfil na UI
- Redirecionamento automático para onboarding após exclusão
- Limpeza completa de dados ao excluir perfil

### 📋 Próximos Passos
1. Finalizar função `handleDeleteProfile` na página de perfil
2. Adicionar botão de exclusão de perfil na UI
3. Testar fluxo completo de exclusão → onboarding
4. Verificar se todos os dados relacionados são realmente deletados

---

## 🔧 Variáveis de Ambiente Importantes

### Vercel Environment Variables
```env
# IA / LLM
OPENAI_API_KEY=sk-proj-...
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o  # ⚠️ Atualizado de gpt-4o-mini

# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://atherarun.com

# Strava
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 📞 Issues Reportados pelo Usuário

### ✅ Resolvidos
1. Erro ao gerar plano (joaomarcosaraujooliveira@gmail.com) - RESOLVIDO
2. Semana da corrida não sendo incluída - RESOLVIDO
3. Sistema ignorando data escolhida pelo atleta - RESOLVIDO
4. Botão redundante no menu - RESOLVIDO

### 🔄 Em Andamento
1. Exclusão de perfil não redireciona para onboarding
2. Disponibilidade não é limpa ao excluir perfil

---

## 📝 Notas Técnicas

### Cálculo de Semanas
```typescript
// ❌ ERRADO (perde semana parcial)
const weeks = Math.floor(daysToRace / 7);

// ✅ CORRETO (inclui semana parcial)
const weeks = Math.ceil(daysToRace / 7);
```

### Validação de Data
```typescript
// Sempre normalizar horas antes de comparar
const today = new Date();
today.setHours(0, 0, 0, 0);

const raceDate = new Date(targetDate);
raceDate.setHours(0, 0, 0, 0);

const weeks = Math.ceil((raceDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000));
```

### Exclusão em Cascata no Prisma
```typescript
// Ordem importa! Deletar dependências primeiro
1. CustomWorkouts (depende de CustomWeeks)
2. CustomWeeks (depende de CustomTrainingPlan)
3. CustomTrainingPlan
4. RaceGoals, Workouts, Feedback (independentes)
5. AthleteProfile (último)
```

---

## 🚀 Deploy Status

Todos os commits foram enviados para `main` branch e deployados automaticamente no Vercel.

**URL de Produção:** https://atherarun.com

**Status:** ✅ Deploy bem-sucedido

---

## 👤 Usuários Mencionados

- **joaomarcosaraujooliveira@gmail.com** - Reportou erro de geração de plano (resolvido)

---

**Sessão salva em:** 03/11/2024 13:52 UTC
