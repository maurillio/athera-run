# 🎨 ATHERA FLEX - FASE 2: UI COMPONENTS - ROADMAP

**Data Início:** 02/DEZ/2025 14:24 UTC  
**Status:** 🚀 **EM ANDAMENTO**  
**Objetivo:** Interface visual completa para o sistema de flexibilidade

---

## 🎯 OBJETIVOS DA FASE 2

### Entregar
✅ Modal de sugestões interativo  
✅ Badge de matches no calendário  
✅ Painel de histórico de ajustes  
✅ Painel de configurações Premium  
✅ Notificações toast  
✅ Integração com calendário existente  
✅ Email templates  

### Resultado Final
- Usuário **VÊ** sugestões de matches
- Usuário **INTERAGE** com sistema (aplicar/rejeitar)
- Usuário **CONFIGURA** preferências
- Usuário **ACOMPANHA** histórico
- Sistema **NOTIFICA** via toast e email

---

## 📋 COMPONENTES A CRIAR

### 1. WorkoutAdjustmentModal.tsx ⭐ PRIORITÁRIO
**Descrição:** Modal principal que mostra sugestões de matches

**Features:**
- Visual de confidence (progress bar 0-100)
- Comparação lado a lado (planejado vs executado)
- Explicação detalhada do match (reasons)
- Botões: Aplicar | Rejeitar | Ver Mais Detalhes
- Badge Premium para auto-adjust
- Loading states
- Error handling

**Estimativa:** 4-6 horas

**Dependências:**
- `useWorkoutMatcher` hook ✅
- API `/detect-matches` ✅
- API `/apply-adjustment` ✅
- API `/reject-suggestion` ✅

---

### 2. SuggestionBadge.tsx
**Descrição:** Badge visual que aparece no calendário quando há match

**Features:**
- Badge com número de matches disponíveis
- Click abre o modal
- Animação de pulse
- Tooltip com preview
- Estado de loading

**Estimativa:** 2-3 horas

**Integração:**
- Calendário em `/app/[locale]/plano/page.tsx`

---

### 3. AdjustmentHistoryPanel.tsx
**Descrição:** Painel que mostra histórico de ajustes aplicados

**Features:**
- Lista de ajustes (últimos 30 dias)
- Filtros: tipo, data, confidence
- Botão "Desfazer" (7 dias)
- Paginação
- Empty state
- Export CSV (futuro)

**Estimativa:** 3-4 horas

**API necessária:**
- `GET /api/athera-flex/history` (criar)

---

### 4. FlexSettingsPanel.tsx 🔒 PREMIUM
**Descrição:** Painel de configurações do Athera Flex

**Features:**
- Toggle: Auto-adjust enabled (Premium)
- Slider: Threshold 60-100
- Input: Flexibility window (1-7 dias)
- Checkboxes: Notificações
- Paywall para features Premium
- Save button
- Reset to defaults

**Estimativa:** 3-4 horas

**API:**
- `GET/PUT /api/athera-flex/settings` ✅

---

### 5. MatchDetailsDrawer.tsx
**Descrição:** Drawer lateral com detalhes completos do match

**Features:**
- Scores detalhados (date, type, volume, intensity)
- Gráfico visual dos scores
- Sugestões da IA
- Histórico de decisões similares (ML)
- Timeline comparativa

**Estimativa:** 4-5 horas

---

### 6. FlexNotifications.tsx (Toast)
**Descrição:** Sistema de notificações in-app

**Features:**
- Toast quando novo match é detectado
- Toast quando ajuste é aplicado
- Toast quando auto-adjust acontece
- Undo action direto no toast (7 dias)
- Queue de notificações

**Estimativa:** 2-3 horas

**Biblioteca:** `sonner` ou `react-hot-toast`

---

## 🎨 DESIGN SYSTEM

### Cores
```typescript
// Match Confidence
confidence >= 90: 'bg-green-500' (Alta)
confidence >= 75: 'bg-blue-500' (Boa)
confidence >= 60: 'bg-yellow-500' (Média)
confidence < 60:  'bg-gray-400' (Baixa)

// Premium Badge
'bg-gradient-to-r from-purple-500 to-pink-500'

// States
success: 'bg-green-500'
error: 'bg-red-500'
warning: 'bg-yellow-500'
info: 'bg-blue-500'
```

### Typography
```typescript
// Modal Title
'text-2xl font-bold'

// Confidence %
'text-4xl font-extrabold'

// Reasons
'text-sm text-muted-foreground'
```

### Spacing
```typescript
// Modal
'p-6 max-w-3xl'

// Cards
'p-4 rounded-lg border'

// Gaps
'gap-4' (padrão)
'gap-6' (seções)
```

---

## 📱 RESPONSIVIDADE

### Breakpoints
- **Mobile (< 768px):** Modal full-screen, stack vertical
- **Tablet (768-1024px):** Modal 80% width, lado a lado colapsado
- **Desktop (> 1024px):** Modal max-w-3xl, lado a lado completo

### Mobile First
- Todos componentes começam mobile
- Progressive enhancement para desktop

---

## 🔗 INTEGRAÇÕES

### 1. Calendário (`/plano/page.tsx`)
**Onde adicionar:**
```typescript
// Em cada card de treino completado
{completed && !wasPlanned && (
  <SuggestionBadge workoutId={workout.id} />
)}
```

### 2. Header Global
**Adicionar:**
```typescript
<FlexNotificationBell count={suggestions.length} />
```

### 3. Settings Page
**Nova seção:**
```typescript
<Tabs>
  <TabsList>
    <TabsTrigger>Perfil</TabsTrigger>
    <TabsTrigger>Notificações</TabsTrigger>
    <TabsTrigger>Athera Flex 🔒</TabsTrigger> {/* NOVO */}
  </TabsList>
</Tabs>
```

---

## 📊 MÉTRICAS DE SUCESSO

### Performance
- ✅ Modal abre em < 100ms
- ✅ Badge rendering < 50ms
- ✅ Infinite scroll smooth

### UX
- ✅ Click to action < 3 cliques
- ✅ Feedback visual imediato
- ✅ Error messages claros
- ✅ Loading states sempre visíveis

### Accessibility
- ✅ Keyboard navigation
- ✅ Screen reader friendly
- ✅ ARIA labels corretos
- ✅ Focus management

---

## 🧪 TESTING STRATEGY

### Manual Testing
1. Criar treino completado (manual ou Strava)
2. Verificar se badge aparece
3. Click no badge → Modal abre
4. Aplicar ajuste → Toast sucesso
5. Verificar no calendário → Treino marcado como feito

### User Scenarios
- ✅ Atleta antecipa treino (sábado → domingo)
- ✅ Atleta faz mais volume que planejado
- ✅ Atleta substitui tipo de treino
- ✅ Atleta rejeita sugestão
- ✅ Premium: Auto-adjust funciona

---

## 📅 CRONOGRAMA

### Sessão 1 (Hoje): Modal + Badge
**Tempo:** 6-8 horas  
**Entregável:**
- [ ] WorkoutAdjustmentModal.tsx (80% funcional)
- [ ] SuggestionBadge.tsx (completo)
- [ ] Integração básica no calendário
- [ ] Toast básico

### Sessão 2 (Amanhã): Histórico + Settings
**Tempo:** 6-8 horas  
**Entregável:**
- [ ] AdjustmentHistoryPanel.tsx
- [ ] FlexSettingsPanel.tsx
- [ ] API `/history` criada
- [ ] Paywall Premium

### Sessão 3 (Dia 3): Polish + Email
**Tempo:** 4-6 horas  
**Entregável:**
- [ ] MatchDetailsDrawer.tsx
- [ ] Email templates (sugestão + auto-applied)
- [ ] Animações e transições
- [ ] Responsiveness final

---

## 🚀 COMEÇANDO AGORA

### Prioridade 1: WorkoutAdjustmentModal
Vou criar o modal principal agora. Ele será:
- ✅ Responsivo
- ✅ Acessível
- ✅ Premium-aware
- ✅ Loading states
- ✅ Error handling
- ✅ Visual clean

**Pronto para começar?** Vou criar o componente! 🎨
