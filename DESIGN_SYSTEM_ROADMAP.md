# 🗺️ Roadmap de Implementação - Design System v1.8.x

**Objetivo:** Aplicar Design System em todo o sistema Athera Run  
**Data Início:** 10 de Novembro de 2025  
**Prazo Total:** 3-4 semanas  
**Status:** 🟢 Pronto para iniciar

---

## 📊 Visão Geral

```
ATUAL:  ████░░░░░░░░░░░░░░░░ 14% (1/7 páginas)
META:   ████████████████████ 100% (7/7 páginas)

Tempo Total: ~25 horas (~3-4 dias de trabalho)
ROI: Positivo em < 1 mês
```

---

## 🎯 Sprint 1 - Dashboard & Perfil (Semana 1)

**Objetivo:** Páginas mais acessadas pelos usuários  
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 7 horas (~1 dia)

### 1.1 Dashboard (`/dashboard`) - 4 horas

**Alterações:**

```tsx
// Cards de Resumo (topo)
✅ ANTES: Cards básicos brancos
✅ DEPOIS: 4 cards com gradientes suaves
   - Meta (laranja leve)
   - Semana Atual (azul leve)
   - Progresso (verde leve)
   - Próxima Corrida (amarelo leve)

// Próximo Treino (destaque)
✅ ANTES: Card branco simples
✅ DEPOIS: Card laranja gradiente com:
   - Ícone de treino inteligente
   - Título em negrito
   - Badges: distância, pace, duração
   - Status visual (🔥 HOJE)

// Treinos da Semana
✅ ANTES: Lista simples
✅ DEPOIS: Grid responsivo com:
   - 1 col mobile, 2 cols tablet, 3 cols desktop
   - Cards com estado visual (completo/pendente/hoje)
   - Ícones por tipo de treino
   - Badges informativos
```

**Componentes a modificar:**
- `app/[locale]/dashboard/page.tsx` (principal)
- Criar `components/dashboard/SummaryCard.tsx` (reutilizável)
- Criar `components/dashboard/WorkoutCard.tsx` (padrão)
- Criar `components/dashboard/NextWorkoutCard.tsx` (destaque)

**Checklist:**
- [ ] Substituir cards de resumo (grid 2x2 → 4x1)
- [ ] Aplicar gradientes por estado
- [ ] Adicionar ícones inteligentes
- [ ] Implementar grid responsivo para treinos
- [ ] Testar mobile, tablet, desktop
- [ ] Deploy e validação

**Resultado Esperado:**
- ✅ Visual 100% igual ao plano
- ✅ Mobile-first funcional
- ✅ User satisfaction +40%

---

### 1.2 Perfil (`/perfil`) - 3 horas

**Alterações:**

```tsx
// Tabs (navegação)
✅ ANTES: Tabs básicas
✅ DEPOIS: Tabs com visual moderno
   - Border bottom animada
   - Active state laranja
   - Grid responsivo (2 cols mobile, 4 desktop)

// Cards de Informação
✅ ANTES: Dados em texto simples
✅ DEPOIS: Cards organizados com:
   - Títulos grandes (H3)
   - Valores destacados (text-2xl)
   - Badges para stats (km/semana, PR, etc)
   - Ícones contextuais

// Corridas Alvo
✅ ANTES: Lista básica
✅ DEPOIS: Cards com estado visual:
   - Corrida A: Gradiente amarelo (🏆 META)
   - Corrida B: Gradiente laranja
   - Corrida C: Gradiente azul
   - Badges de data e distância
```

**Componentes a modificar:**
- `app/[locale]/perfil/page.tsx` (principal)
- `components/perfil/ProfileCard.tsx` (dados pessoais)
- `components/perfil/RaceCard.tsx` (corridas)
- `components/perfil/StatsCard.tsx` (estatísticas)

**Checklist:**
- [ ] Redesign das tabs com estado visual
- [ ] Cards de informação com gradientes
- [ ] Badges para todos os stats
- [ ] Grid responsivo
- [ ] Testar edição de dados
- [ ] Deploy e validação

**Resultado Esperado:**
- ✅ Perfil profissional e organizado
- ✅ Dados fáceis de escanear
- ✅ Mobile perfeito

---

## 🎯 Sprint 2 - Onboarding (Semana 2)

**Objetivo:** Primeira impressão perfeita  
**Prioridade:** 🔴 ALTA  
**Tempo:** 5 horas (~1 dia)

### 2.1 Onboarding (`/onboarding`) - 5 horas

**Alterações:**

```tsx
// Progress Bar (topo)
✅ ANTES: Barra simples
✅ DEPOIS: Barra visual com:
   - Gradiente laranja
   - Steps numerados
   - Animação de preenchimento
   - Label: "Etapa X de 7"

// Step Cards
✅ ANTES: Campos soltos
✅ DEPOIS: Cards organizados com:
   - Seções com títulos
   - Ícones por categoria
   - Hints visuais (💡)
   - Campos obrigatórios marcados (*)

// Buttons
✅ ANTES: Buttons inconsistentes
✅ DEPOIS: Buttons padronizados:
   - Voltar: outline gray
   - Próximo: solid laranja
   - Loading states
   - Disabled states claros
```

**Componentes a modificar:**
- `app/[locale]/onboarding/page.tsx` (wrapper)
- Todos os 7 steps (`components/onboarding/v1.3.0/Step*.tsx`)
- `components/onboarding/ProgressBar.tsx` (criar)
- `components/onboarding/StepCard.tsx` (wrapper padrão)

**Checklist:**
- [ ] Progress bar visual com gradiente
- [ ] Cards por seção com ícones
- [ ] Buttons Next/Prev padronizados
- [ ] Loading states no Step 7
- [ ] Validação visual (bordas vermelhas)
- [ ] Mobile friendly (campos grandes)
- [ ] Deploy e testar fluxo completo

**Resultado Esperado:**
- ✅ Taxa de conclusão +20%
- ✅ Tempo de onboarding -15%
- ✅ Visual profissional

---

## 🎯 Sprint 3 - Tracking & Calculator (Semana 3)

**Objetivo:** Features secundárias importantes  
**Prioridade:** 🟡 MÉDIA  
**Tempo:** 5 horas

### 3.1 Tracking (`/tracking`) - 3 horas

**Alterações:**

```tsx
// Timeline
✅ ANTES: Lista simples
✅ DEPOIS: Timeline visual com:
   - Border left colorido por status
   - Cards com gradientes
   - Ícones de treino
   - Badges de stats
   - Hover states

// Filtros
✅ ANTES: Dropdowns simples
✅ DEPOIS: Pills clicáveis com:
   - Active state laranja
   - Ícones por categoria
   - Count badges
```

**Checklist:**
- [ ] Timeline com estados visuais
- [ ] Cards de atividade padronizados
- [ ] Filtros como pills
- [ ] Grid responsivo
- [ ] Deploy e validação

---

### 3.2 Calculator (`/calculator`) - 2 horas

**Alterações:**

```tsx
// Input Cards
✅ ANTES: Inputs soltos
✅ DEPOIS: Cards organizados com:
   - Labels grandes
   - Units destacados
   - Ícones contextuais

// Results
✅ ANTES: Texto simples
✅ DEPOIS: Cards com gradiente:
   - Valores grandes (text-3xl)
   - Legendas pequenas
   - Badges explicativos
   - CTA button laranja
```

**Checklist:**
- [ ] Input cards com visual limpo
- [ ] Results cards com gradientes
- [ ] CTA buttons consistentes
- [ ] Mobile friendly
- [ ] Deploy e validação

---

## 🎯 Sprint 4 - Páginas Restantes (Semana 4)

**Objetivo:** Completar sistema  
**Prioridade:** ⚪ BAIXA  
**Tempo:** 8 horas

### 4.1 Nutrition, Prevention, Glossary - 8 horas

**Alterações:**

```tsx
// Seguir mesmo padrão:
- Cards com gradientes suaves
- Ícones contextuais
- Badges informativos
- Grid responsivo
- Typography consistente
```

**Checklist:**
- [ ] Nutrition (2h)
- [ ] Prevention (2h)
- [ ] Glossary (2h)
- [ ] Overtraining (1h)
- [ ] Admin (1h - se necessário)

---

## 🎯 Sprint 5 - Componentes Globais (Paralelo)

**Objetivo:** Consistência total  
**Prioridade:** 🟡 MÉDIA  
**Tempo:** 3 horas (paralelo aos sprints)

### 5.1 Header - 1 hora

```tsx
// Header
✅ ANTES: Básico
✅ DEPOIS: Profissional com:
   - Shadow sutil
   - Logo com hover
   - Navigation pills
   - User dropdown com ícones
   - Responsive (hamburguer mobile)
```

### 5.2 Footer - 1 hora

```tsx
// Footer
✅ ANTES: Simples
✅ DEPOIS: Organizado com:
   - Background gradiente inverso
   - Links em grid
   - Social icons consistentes
   - Newsletter card
```

### 5.3 Modals/Dialogs - 1 hora

```tsx
// Modals
✅ ANTES: Básicos
✅ DEPOIS: Polidos com:
   - Overlay backdrop-blur
   - Content com shadow grande
   - Buttons padronizados
   - Close X no canto
   - Animations (fade-in)
```

---

## 📅 Timeline Visual

```
Semana 1: Dashboard + Perfil
│ ████████░░░░░░░░░░░░░░░░░░ 28%
│
├─ Dia 1-2: Dashboard (4h)
│  └─ SummaryCards, NextWorkout, WorkoutCards
│
└─ Dia 3: Perfil (3h)
   └─ Tabs, ProfileCards, RaceCards

Semana 2: Onboarding
│ ████████████████░░░░░░░░░░ 48%
│
└─ Dia 1-2: Onboarding (5h)
   └─ ProgressBar, 7 Steps, Buttons

Semana 3: Tracking + Calculator
│ ████████████████████░░░░░░ 68%
│
├─ Dia 1: Tracking (3h)
│  └─ Timeline, ActivityCards, Filters
│
└─ Dia 2: Calculator (2h)
   └─ InputCards, ResultCards

Semana 4: Páginas Restantes
│ ████████████████████████░░ 88%
│
└─ Dia 1-3: Nutrition, Prevention, etc (8h)

Sprint 5: Componentes Globais (Paralelo)
│ ████████████████████████░░ 100%
│
└─ Header, Footer, Modals (3h)

TOTAL: 3-4 semanas | ~25 horas
```

---

## 📊 Tracking de Progresso

### Status por Página

| Página | Status | Sprint | Horas | Dev | Prioridade |
|--------|--------|--------|-------|-----|------------|
| Plano | ✅ 100% | - | - | ✅ | Referência |
| Dashboard | ⏳ 0% | S1 | 4h | - | 🔴 Crítica |
| Perfil | ⏳ 0% | S1 | 3h | - | 🔴 Alta |
| Onboarding | ⏳ 0% | S2 | 5h | - | 🔴 Alta |
| Tracking | ⏳ 0% | S3 | 3h | - | 🟡 Média |
| Calculator | ⏳ 0% | S3 | 2h | - | 🟡 Média |
| Nutrition | ⏳ 0% | S4 | 2h | - | ⚪ Baixa |
| Prevention | ⏳ 0% | S4 | 2h | - | ⚪ Baixa |
| Glossary | ⏳ 0% | S4 | 2h | - | ⚪ Baixa |
| **TOTAL** | **14%** | - | **25h** | - | - |

### Legenda de Status
- ✅ Completo (100%)
- 🟢 Em progresso (1-99%)
- ⏳ Aguardando (0%)
- ❌ Bloqueado

---

## 🎯 Critérios de Aceitação

### Para cada página/sprint

**Obrigatório (Must Have):**
- [ ] Visual idêntico ao padrão do plano
- [ ] Cards com gradientes apropriados
- [ ] Ícones inteligentes funcionando
- [ ] Badges com cores semânticas
- [ ] Grid responsivo (mobile/tablet/desktop)
- [ ] Typography consistente
- [ ] Build passando sem erros
- [ ] Deploy em produção OK

**Desejável (Should Have):**
- [ ] Animações suaves (transitions)
- [ ] Hover states polidos
- [ ] Loading states implementados
- [ ] Skeleton loaders
- [ ] Error states visuais

**Opcional (Nice to Have):**
- [ ] Micro-interactions
- [ ] Easter eggs visuais
- [ ] Dark mode preparation

---

## 📈 Métricas de Sucesso

### Por Sprint

**Sprint 1 (Dashboard + Perfil):**
- ✅ User satisfaction: +25%
- ✅ Session duration: +15%
- ✅ Bounce rate: -10%

**Sprint 2 (Onboarding):**
- ✅ Completion rate: +20%
- ✅ Time to complete: -15%
- ✅ Drop-off rate: -30%

**Sprint 3 (Tracking + Calc):**
- ✅ Feature usage: +35%
- ✅ Return visits: +20%

**Sprint 4 + 5 (Restante):**
- ✅ Overall consistency: 100%
- ✅ Support tickets: -50%

---

## 🚀 Quick Start

### Para começar HOJE:

```bash
# 1. Revisar documentação
cat DESIGN_SYSTEM_v1.8.x.md        # Guia completo
cat DESIGN_SYSTEM_SUMMARY.md       # Resumo visual

# 2. Começar pelo Dashboard
cd app/[locale]/dashboard
code page.tsx

# 3. Seguir checklist Sprint 1.1
# 4. Testar em mobile, tablet, desktop
# 5. Deploy e validar

# 6. Commit seguindo padrão:
git commit -m "feat(dashboard): apply design system v1.8.x

- Summary cards with gradients
- Next workout card with orange highlight  
- Workout grid responsive (1-3 cols)
- Smart icons by workout type
- Badges for distance, pace, duration

Impact: +25% user satisfaction expected"
```

---

## 📞 Suporte

**Dúvidas?**
- 📖 Documentação: `DESIGN_SYSTEM_v1.8.x.md`
- 📋 Resumo: `DESIGN_SYSTEM_SUMMARY.md`
- 🗺️ Roadmap: Este arquivo
- 💬 Perguntas: Abra issue no GitHub

**Recursos:**
- Componentes: `/components/ui/`
- Exemplos: Ver página `/plano` (referência)
- Tailwind: `tailwind.config.ts`

---

## ✅ Próxima Ação Imediata

1. ✅ Revisar Design System completo (30 min)
2. ✅ Estudar página `/plano` como referência (20 min)
3. 🎯 Começar Sprint 1.1 - Dashboard (4h)
   - [ ] Summary cards (1h)
   - [ ] Next workout card (1h)
   - [ ] Workout grid (1.5h)
   - [ ] Deploy e validação (0.5h)

**Status:** 🟢 Pronto para iniciar  
**Próximo:** Sprint 1.1 - Dashboard  
**Prazo:** Semana 1

---

**Roadmap criado por:** Athera Team  
**Data:** 10 de Novembro de 2025  
**Versão:** 1.0  
**Status:** 🟢 Ativo
