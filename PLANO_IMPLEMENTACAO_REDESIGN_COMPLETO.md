# Plano de Implementação Completo - Athletic Performance Design System
## Athera Run v4.0.0 - Redesign Total

---

## 🎯 Objetivo
Implementar a paleta **Athletic Performance** em 100% do sistema Athera Run, removendo todos os emojis e criando uma identidade visual profissional e moderna.

---

## 📋 Escopo Total

### Paleta Athletic Performance
```
Primary: #E64A19 (Deep Orange)
Secondary: #1E293B (Slate 800)
Accent: #10B981 (Emerald)
Background: #FFFFFF / #F8FAFC
Text: #0F172A / #64748B
Border: #E2E8F0
```

### Princípios
- ❌ Zero emojis em toda aplicação
- ✅ Ícones Lucide profissionais
- ✅ Tipografia hierárquica clara
- ✅ Espaçamento consistente
- ✅ Mobile-first design

---

## 📦 FASE 1: FUNDAÇÃO DO DESIGN SYSTEM (Sessão 1)

### 1.1 Atualizar Configuração Base
**Arquivos:**
- `tailwind.config.ts`
- `app/globals.css`
- `lib/design-tokens.ts` (criar)

**Tarefas:**
1. Definir cores Athletic Performance no Tailwind
2. Criar elevation system (sombras)
3. Configurar tipografia Inter + Poppins
4. Definir border radius system
5. Criar utility classes customizadas
6. Atualizar CSS variables

**Código a implementar:**
```typescript
// tailwind.config.ts - Nova paleta completa
colors: {
  brand: {
    primary: '#E64A19',
    'primary-dark': '#D94216',
    'primary-light': '#FF6E40',
    secondary: '#1E293B',
    'secondary-dark': '#0F172A',
    'secondary-light': '#334155',
    accent: '#10B981',
    'accent-dark': '#059669',
    'accent-light': '#34D399',
  },
  // Slate scale completa
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  // Emerald scale
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  // Orange scale
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
  },
  // Semantic colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
}

// Sombras elevation
boxShadow: {
  'elevation-1': '0 1px 3px rgba(0, 0, 0, 0.05)',
  'elevation-2': '0 4px 6px rgba(0, 0, 0, 0.07)',
  'elevation-3': '0 10px 15px rgba(0, 0, 0, 0.1)',
  'elevation-4': '0 20px 25px rgba(0, 0, 0, 0.15)',
}

// Tipografia
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  display: ['Poppins', 'Inter', 'sans-serif'],
}
```

**Critério de Sucesso:**
- [ ] Build sem erros
- [ ] Cores acessíveis via Tailwind
- [ ] CSS variables atualizadas

---

## 📦 FASE 2: COMPONENTES UI BASE (Sessão 1-2)

### 2.1 Componentes shadcn/ui Redesenhados
**Arquivos:** `components/ui/*`

#### 2.1.1 Button (`components/ui/button.tsx`)
**Mudanças:**
- Variant `default`: bg-brand-primary hover:bg-brand-primary-dark
- Variant `secondary`: bg-slate-100 hover:bg-slate-200 text-slate-900
- Variant `outline`: border-slate-300 hover:bg-slate-50
- Variant `ghost`: hover:bg-slate-100
- Tamanhos: sm(h-9), default(h-11), lg(h-12)
- Border radius: rounded-lg (12px)
- Font weight: 600

**Remover:**
- Qualquer emoji em labels
- Cores antigas azul/primary padrão

#### 2.1.2 Card (`components/ui/card.tsx`)
**Mudanças:**
- Shadow: shadow-elevation-2
- Border: border-slate-200
- Radius: rounded-xl (16px)
- CardTitle: text-slate-900 font-semibold
- CardDescription: text-slate-600

#### 2.1.3 Badge (`components/ui/badge.tsx`)
**Mudanças:**
- Variant `default`: bg-brand-primary/10 text-brand-primary
- Variant `secondary`: bg-slate-100 text-slate-700
- Variant `success`: bg-emerald-50 text-emerald-700
- Variant `warning`: bg-orange-50 text-orange-700
- Variant `error`: bg-red-50 text-red-700
- Radius: rounded-md (8px)
- Padding: px-2.5 py-1
- Font: text-xs font-semibold

**Remover:**
- Todos os emojis de badges

#### 2.1.4 Alert (`components/ui/alert.tsx`)
**Mudanças:**
- Variant `default`: border-slate-200 bg-slate-50
- Variant `destructive`: border-red-200 bg-red-50 text-red-800
- Variant `success`: border-emerald-200 bg-emerald-50 text-emerald-800
- Usar ícones Lucide (AlertCircle, CheckCircle2, Info)

#### 2.1.5 Input (`components/ui/input.tsx`)
**Mudanças:**
- Border: border-slate-300 focus:border-brand-primary
- Ring: focus:ring-2 focus:ring-brand-primary/20
- Height: h-11
- Radius: rounded-lg

#### 2.1.6 Select, Textarea, Checkbox, Radio
- Seguir mesmo padrão de cores
- Focus state com brand-primary
- Border slate-300

**Componentes completos:**
- [ ] Button
- [ ] Card
- [ ] Badge
- [ ] Alert
- [ ] Input
- [ ] Select
- [ ] Textarea
- [ ] Checkbox
- [ ] Radio
- [ ] Switch
- [ ] Slider
- [ ] Progress
- [ ] Tabs
- [ ] Dialog
- [ ] Sheet
- [ ] Dropdown Menu
- [ ] Popover
- [ ] Tooltip
- [ ] Calendar
- [ ] Table

---

## 📦 FASE 3: HEADER E NAVEGAÇÃO (Sessão 2)

### 3.1 Header Principal (`components/header.tsx`)
**Mudanças:**
1. **Logo:**
   - Remover emoji "AR"
   - Criar logo gradient: linear-gradient(135deg, #E64A19, #2563EB)
   - Icon: Activity ou Zap do Lucide
   - Text gradient matching

2. **Background:**
   - bg-white border-b border-slate-200
   - shadow-elevation-1

3. **Navigation Items:**
   - Active: bg-orange-50 text-brand-primary font-semibold
   - Hover: hover:bg-slate-50
   - Icons: Activity, Calendar, Target (Lucide)

4. **User Dropdown:**
   - Sem emoji no avatar
   - Usar iniciais ou foto
   - Items com ícones Lucide

**Arquivo:** `components/header.tsx`

### 3.2 User Dropdown (`components/user-dropdown.tsx`)
**Mudanças:**
- Items com ícones: User, Settings, LogOut
- Hover: hover:bg-slate-50
- Dividers: border-slate-200

### 3.3 Mobile Navigation
**Mudanças:**
- Sheet/Drawer com cores novas
- Items grandes (min-h-12) para touch
- Icons coloridos com brand-primary

**Critério de Sucesso:**
- [ ] Header sem emojis
- [ ] Logo profissional
- [ ] Navegação responsiva
- [ ] Estados hover/active funcionais

---

## 📦 FASE 4: LANDING PAGE (Sessão 3)

### 4.1 Home/Landing (`app/[locale]/page.tsx`)
**Mudanças:**

1. **Hero Section:**
   - Gradient background: from-orange-50 via-white to-slate-50
   - Heading: text-5xl md:text-7xl font-bold
   - Gradient text: from-brand-primary via-orange-600 to-slate-900
   - CTA button: bg-gradient-to-r from-brand-primary to-orange-600
   - Remover todos os emojis

2. **Features Section:**
   - Cards com shadow-elevation-2
   - Icons Lucide: Target, Activity, TrendingUp, Award
   - Hover: hover:shadow-elevation-3 hover:-translate-y-1

3. **Pricing (se houver):**
   - Cards destacados
   - Badge "Mais Popular" com brand-primary

4. **CTA Final:**
   - Background: bg-gradient-to-r from-brand-primary to-orange-600
   - Text: white
   - Button: bg-white text-brand-primary

**Arquivos:**
- `app/[locale]/page.tsx`
- `app/[locale]/login/page.tsx`
- `app/[locale]/signup/page.tsx`

**Critério de Sucesso:**
- [ ] Hero impactante sem emojis
- [ ] Features profissionais
- [ ] CTAs destacados
- [ ] Responsive perfect

---

## 📦 FASE 5: DASHBOARD (Sessão 3-4)

### 5.1 Dashboard Principal (`app/[locale]/dashboard/page.tsx`)
**Mudanças:**

1. **Stats Cards:**
   - Grid responsivo
   - Icons: TrendingUp, Activity, Target, Award
   - Números: text-3xl font-bold text-brand-primary
   - Labels: text-sm text-slate-600 uppercase
   - Shadow: shadow-elevation-2

2. **Quick Actions:**
   - Buttons com icons
   - Remover emojis
   - Icons: Play, Calendar, FileText

3. **Progress Indicators:**
   - Progress bars: bg-brand-primary
   - Background: bg-slate-100
   - Percentage: text-brand-primary font-semibold

4. **Upcoming Workouts:**
   - Timeline vertical
   - Dots coloridos por tipo
   - Hover: hover:bg-slate-50

**Remover:**
- Todos os emojis (🎯, 🏃, 📊, 🏆, etc.)
- Substituir por ícones Lucide

**Mapeamento de Ícones:**
```
🎯 → Target
🏃 → Activity
📊 → TrendingUp
🏆 → Award
⚡ → Zap
📅 → Calendar
💪 → Dumbbell
📈 → LineChart
❤️ → Heart
⏱️ → Clock
✓ → CheckCircle2
⚠️ → AlertCircle
ℹ️ → Info
```

**Critério de Sucesso:**
- [ ] Zero emojis
- [ ] Ícones profissionais
- [ ] Layout moderno
- [ ] Cores consistentes

---

## 📦 FASE 6: PLANO DE TREINO (Sessão 4-5)

### 6.1 Página de Plano (`app/[locale]/plano/page.tsx`)
**Mudanças:**

1. **Weekly Timeline:**
   - Cards por dia
   - Border-left colorido por tipo de treino:
     - Intervalado: border-l-4 border-brand-primary
     - Longo: border-l-4 border-emerald-600
     - Recuperação: border-l-4 border-slate-400
     - Descanso: border-l-4 border-slate-200

2. **Workout Cards:**
   - Title: text-lg font-semibold text-slate-900
   - Description: text-sm text-slate-600
   - Badges sem emojis
   - Icons por tipo

3. **Filtros:**
   - Tabs modernos
   - Active: bg-brand-primary text-white
   - Inactive: bg-slate-100 text-slate-600

4. **Status Indicators:**
   - Completed: CheckCircle2 + emerald
   - Pending: Clock + slate
   - Skipped: XCircle + red

**Arquivos:**
- `app/[locale]/plano/page.tsx`

**Critério de Sucesso:**
- [ ] Timeline visual clara
- [ ] Cards profissionais
- [ ] Badges sem emojis
- [ ] Filtros funcionais

---

## 📦 FASE 7: TRACKING E HISTÓRICO (Sessão 5)

### 7.1 Tracking Page (`app/[locale]/tracking/page.tsx`)
**Mudanças:**
- Form inputs com novo estilo
- Calendar com cores novas
- Stats cards modernos
- Gráficos com paleta consistente

### 7.2 Workout Details (`components/workout-details.tsx`)
**Mudanças:**
- Estrutura visual clara
- Sections bem definidas
- Icons descritivos
- Remover emojis

### 7.3 Workout History (`components/workout-history.tsx`)
**Mudanças:**
- Table moderna
- Status badges
- Hover states

**Arquivos:**
- `app/[locale]/tracking/page.tsx`
- `components/workout-details.tsx`
- `components/workout-history.tsx`
- `components/workout-log-form.tsx`
- `components/workout-log-form-improved.tsx`

---

## 📦 FASE 8: COMPONENTES ESPECÍFICOS (Sessão 6)

### 8.1 Race Management (`components/race-management.tsx`)
**Mudanças:**
- Remover todos os emojis
- Icons: Trophy, Calendar, Target, MapPin
- Cards com novo estilo
- Countdown visual

### 8.2 Strava Connect (`components/strava-connect.tsx`)
**Mudanças:**
- Button com logo Strava
- Status indicator profissional
- Sync icon animado

### 8.3 AI Analysis (`components/ai-analysis-section.tsx`)
**Mudanças:**
- Card destaque
- Icon: Sparkles ou Brain
- Loading state elegante

### 8.4 Progress Charts (`components/weekly-progress-chart.tsx`)
**Mudanças:**
- Cores da paleta
- Legend consistente
- Tooltips estilizados

### 8.5 Training Chat (`components/training-chat.tsx`)
**Mudanças:**
- Messages bubbles
- User: bg-brand-primary text-white
- AI: bg-slate-100 text-slate-900
- Input moderno

**Arquivos:**
- `components/race-management.tsx`
- `components/strava-connect.tsx`
- `components/strava-notifications.tsx`
- `components/ai-analysis-section.tsx`
- `components/auto-adjust-card.tsx`
- `components/weekly-progress-chart.tsx`
- `components/periodization-dashboard.tsx`
- `components/training-chat.tsx`
- `components/vdot-calculator.tsx`
- `components/macro-calculator.tsx`

---

## 📦 FASE 9: ONBOARDING (Sessão 7)

### 9.1 Onboarding Flow (`components/onboarding/v1.3.0/`)
**Mudanças em TODOS os steps:**

1. **Step Indicator:**
   - Active: bg-brand-primary
   - Completed: bg-emerald-500
   - Inactive: bg-slate-200

2. **Form Inputs:**
   - Novo estilo consistente
   - Focus brand-primary

3. **Buttons:**
   - Primary: bg-brand-primary
   - Secondary: bg-slate-100

4. **Cards de Seleção:**
   - Border: border-2 border-slate-200
   - Selected: border-brand-primary bg-orange-50
   - Hover: hover:border-slate-300

**Remover emojis de:**
- Títulos de perguntas
- Opções de seleção
- Feedback messages

**Arquivos (7 steps):**
- `OnboardingV130.tsx`
- `Step1BasicData.tsx`
- `Step2SportBackground.tsx`
- `Step3Performance.tsx`
- `Step4Health.tsx`
- `Step5Goals.tsx`
- `Step6Availability.tsx`
- `Step7Review.tsx`
- `PlanGenerationLoading.tsx`

**Critério de Sucesso:**
- [ ] Flow completo sem emojis
- [ ] Visual profissional
- [ ] Estados visuais claros
- [ ] Mobile perfeito

---

## 📦 FASE 10: PROFILE (Sessão 8)

### 10.1 Profile Page (`app/[locale]/perfil/page.tsx`)
**Mudanças:**
- Tabs modernas
- Avatar sem emoji
- Stats cards
- Edit forms

### 10.2 Profile Tabs (`components/profile/v1.3.0/`)
**Mudanças em todas as 6 tabs:**
- Consistent form styling
- Icons descritivos
- Sections bem divididas

**Arquivos:**
- `ProfileTabs.tsx`
- `BasicDataTab.tsx`
- `PerformanceTab.tsx`
- `HealthTab.tsx`
- `GoalsTab.tsx`
- `AvailabilityTab.tsx`
- `PreferencesTab.tsx`

---

## 📦 FASE 11: PÁGINAS SECUNDÁRIAS (Sessão 8-9)

### 11.1 Páginas de Conteúdo
**Arquivos a atualizar:**
- `app/[locale]/calculator/page.tsx`
- `app/[locale]/nutrition/page.tsx`
- `app/[locale]/training/page.tsx`
- `app/[locale]/overtraining/page.tsx`
- `app/[locale]/prevention/page.tsx`
- `app/[locale]/glossary/page.tsx`
- `app/[locale]/chat/page.tsx`

**Mudanças padrão:**
- Headers sem emojis
- Cards consistentes
- Icons Lucide
- Cores da paleta

### 11.2 Páginas Administrativas
- `app/[locale]/admin/page.tsx`
- `app/[locale]/pricing/page.tsx`
- `app/[locale]/subscription/page.tsx`

### 11.3 Páginas Legais
- `app/[locale]/privacy-policy/page.tsx`
- `app/[locale]/terms-of-service/page.tsx`

---

## 📦 FASE 12: SUBSCRIPTION COMPONENTS (Sessão 9)

### 12.1 Subscription UI
**Arquivos:**
- `components/subscription/premium-badge.tsx`
- `components/subscription/paywall-modal.tsx`
- `components/subscription/subscription-status-card.tsx`
- `components/subscription/upgrade-banner.tsx`

**Mudanças:**
- Premium badge: bg-gradient-to-r from-brand-primary to-orange-600
- Crown icon: Crown (Lucide)
- Modal profissional
- Pricing cards com destaque

---

## 📦 FASE 13: MODAIS E DIALOGS (Sessão 10)

### 13.1 Training Dialogs
**Arquivos:**
- `components/training-log-dialog.tsx`
- `components/dashboard/workout-log-dialog.tsx`

**Mudanças:**
- Header com ícone
- Form inputs estilizados
- Buttons consistentes
- Close button moderno

---

## 📦 FASE 14: IDIOMAS E I18N (Sessão 10)

### 14.1 Language Switcher
**Arquivo:** `components/i18n/LanguageSwitcher.tsx`

**Mudanças:**
- Dropdown moderno
- Flags profissionais (ou text only)
- Active state: text-brand-primary

### 14.2 Traduções
**Verificar em todos os locales:**
- `lib/i18n/locales/pt-BR.json`
- `lib/i18n/locales/en.json`
- `lib/i18n/locales/es.json`

**Remover:**
- Emojis em todas as strings
- Substituir por texto claro

---

## 📦 FASE 15: LOADING E ERROR STATES (Sessão 11)

### 15.1 Loading States
**Criar componente:** `components/ui/loading.tsx`

```tsx
// Spinner com brand-primary
// Skeleton com slate-200
// Progressive loading
```

### 15.2 Error Pages
**Arquivos:**
- `app/[locale]/error.tsx`
- `app/[locale]/not-found.tsx`

**Mudanças:**
- Illustrations ou icons
- Messages claras
- CTAs para voltar

---

## 📦 FASE 16: DARK MODE (Opcional - Sessão 12)

### 16.1 Dark Mode Colors
**Adicionar ao globals.css:**
```css
.dark {
  --background: 15 23 42; /* slate-900 */
  --foreground: 248 250 252; /* slate-50 */
  --primary: 230 74 25; /* brand-primary */
  --card: 30 41 59; /* slate-800 */
  /* ... */
}
```

### 16.2 Toggle
- Moon/Sun icons
- Transition suave
- Persist preference

---

## 📦 FASE 17: TESTES E VALIDAÇÃO (Sessão 12-13)

### 17.1 Visual Testing
**Checklist por página:**
- [ ] Landing page
- [ ] Login/Signup
- [ ] Dashboard
- [ ] Plano de treino
- [ ] Tracking
- [ ] Profile
- [ ] Onboarding (7 steps)
- [ ] Calculator
- [ ] Nutrition
- [ ] Chat
- [ ] Admin
- [ ] Pricing
- [ ] Todas as modais

### 17.2 Responsive Testing
**Breakpoints:**
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px)
- [ ] Large (1440px)

### 17.3 Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### 17.4 Accessibility
- [ ] Contraste WCAG AA
- [ ] Keyboard navigation
- [ ] Screen reader
- [ ] Focus states

---

## 📦 FASE 18: DOCUMENTAÇÃO (Sessão 13)

### 18.1 Design System Docs
**Criar:** `docs/design-system.md`

Conteúdo:
- Paleta completa
- Typography scale
- Component usage
- Spacing system
- Elevation system
- Icon guidelines

### 18.2 Component Library
**Criar:** `docs/components.md`

- Todos os componentes UI
- Props e variants
- Usage examples
- Do's and Don'ts

---

## 📦 FASE 19: PERFORMANCE (Sessão 14)

### 19.1 Otimizações
- [ ] Font optimization (preload Inter/Poppins)
- [ ] Image optimization (WebP)
- [ ] CSS purge
- [ ] Bundle size check
- [ ] Lighthouse score

### 19.2 Animations
- [ ] Micro-interactions
- [ ] Page transitions
- [ ] Hover states
- [ ] Loading animations

---

## 📦 FASE 20: DEPLOY (Sessão 14)

### 20.1 Pre-Deploy Checklist
- [ ] Build sem errors
- [ ] Todos os testes passando
- [ ] Performance OK
- [ ] Accessibility OK
- [ ] Visual review completo

### 20.2 Staging
- [ ] Deploy para staging
- [ ] QA completo
- [ ] Client approval

### 20.3 Production
- [ ] Deploy gradual
- [ ] Monitor errors
- [ ] Performance monitoring

---

## 📊 CHECKLIST GERAL

### Arquivos Principais (Lista Completa)

#### Config & Base (3 arquivos)
- [ ] `tailwind.config.ts`
- [ ] `app/globals.css`
- [ ] `lib/design-tokens.ts` (criar)

#### UI Components (30+ arquivos)
- [ ] `components/ui/button.tsx`
- [ ] `components/ui/card.tsx`
- [ ] `components/ui/badge.tsx`
- [ ] `components/ui/alert.tsx`
- [ ] `components/ui/input.tsx`
- [ ] `components/ui/textarea.tsx`
- [ ] `components/ui/select.tsx`
- [ ] `components/ui/checkbox.tsx`
- [ ] `components/ui/radio-group.tsx`
- [ ] `components/ui/switch.tsx`
- [ ] `components/ui/slider.tsx`
- [ ] `components/ui/progress.tsx`
- [ ] `components/ui/tabs.tsx`
- [ ] `components/ui/dialog.tsx`
- [ ] `components/ui/sheet.tsx`
- [ ] `components/ui/dropdown-menu.tsx`
- [ ] `components/ui/popover.tsx`
- [ ] `components/ui/tooltip.tsx`
- [ ] `components/ui/calendar.tsx`
- [ ] `components/ui/table.tsx`
- [ ] `components/ui/form.tsx`
- [ ] `components/ui/skeleton.tsx`
- [ ] `components/ui/avatar.tsx`
- [ ] `components/ui/separator.tsx`
- [ ] `components/ui/accordion.tsx`
- [ ] `components/ui/collapsible.tsx`
- [ ] `components/ui/command.tsx`
- [ ] `components/ui/navigation-menu.tsx`
- [ ] `components/ui/breadcrumb.tsx`
- [ ] `components/ui/pagination.tsx`

#### Layout Components (3 arquivos)
- [ ] `components/header.tsx`
- [ ] `components/user-dropdown.tsx`
- [ ] `app/[locale]/layout.tsx`

#### Pages - Public (3 arquivos)
- [ ] `app/[locale]/page.tsx` (landing)
- [ ] `app/[locale]/login/page.tsx`
- [ ] `app/[locale]/signup/page.tsx`

#### Pages - Main (8 arquivos)
- [ ] `app/[locale]/dashboard/page.tsx`
- [ ] `app/[locale]/plano/page.tsx`
- [ ] `app/[locale]/tracking/page.tsx`
- [ ] `app/[locale]/perfil/page.tsx`
- [ ] `app/[locale]/calculator/page.tsx`
- [ ] `app/[locale]/nutrition/page.tsx`
- [ ] `app/[locale]/training/page.tsx`
- [ ] `app/[locale]/chat/page.tsx`

#### Pages - Secondary (7 arquivos)
- [ ] `app/[locale]/overtraining/page.tsx`
- [ ] `app/[locale]/prevention/page.tsx`
- [ ] `app/[locale]/glossary/page.tsx`
- [ ] `app/[locale]/admin/page.tsx`
- [ ] `app/[locale]/pricing/page.tsx`
- [ ] `app/[locale]/subscription/page.tsx`
- [ ] `app/[locale]/privacy-policy/page.tsx`
- [ ] `app/[locale]/terms-of-service/page.tsx`

#### Pages - Error (2 arquivos)
- [ ] `app/[locale]/error.tsx`
- [ ] `app/[locale]/not-found.tsx`

#### Onboarding (9 arquivos)
- [ ] `components/onboarding/v1.3.0/OnboardingV130.tsx`
- [ ] `components/onboarding/v1.3.0/Step1BasicData.tsx`
- [ ] `components/onboarding/v1.3.0/Step2SportBackground.tsx`
- [ ] `components/onboarding/v1.3.0/Step3Performance.tsx`
- [ ] `components/onboarding/v1.3.0/Step4Health.tsx`
- [ ] `components/onboarding/v1.3.0/Step5Goals.tsx`
- [ ] `components/onboarding/v1.3.0/Step6Availability.tsx`
- [ ] `components/onboarding/v1.3.0/Step7Review.tsx`
- [ ] `components/onboarding/PlanGenerationLoading.tsx`

#### Profile (7 arquivos)
- [ ] `components/profile/v1.3.0/ProfileTabs.tsx`
- [ ] `components/profile/v1.3.0/BasicDataTab.tsx`
- [ ] `components/profile/v1.3.0/PerformanceTab.tsx`
- [ ] `components/profile/v1.3.0/HealthTab.tsx`
- [ ] `components/profile/v1.3.0/GoalsTab.tsx`
- [ ] `components/profile/v1.3.0/AvailabilityTab.tsx`
- [ ] `components/profile/v1.3.0/PreferencesTab.tsx`

#### Feature Components (20+ arquivos)
- [ ] `components/race-management.tsx`
- [ ] `components/strava-connect.tsx`
- [ ] `components/strava-notifications.tsx`
- [ ] `components/ai-analysis-section.tsx`
- [ ] `components/auto-adjust-card.tsx`
- [ ] `components/weekly-progress-chart.tsx`
- [ ] `components/periodization-dashboard.tsx`
- [ ] `components/training-chat.tsx`
- [ ] `components/vdot-calculator.tsx`
- [ ] `components/macro-calculator.tsx`
- [ ] `components/workout-details.tsx`
- [ ] `components/workout-history.tsx`
- [ ] `components/workout-log-form.tsx`
- [ ] `components/workout-log-form-improved.tsx`
- [ ] `components/workout-stats.tsx`
- [ ] `components/medical-info-section.tsx`
- [ ] `components/progress-analysis-banner.tsx`
- [ ] `components/training-log-dialog.tsx`
- [ ] `components/dashboard/workout-log-dialog.tsx`
- [ ] `components/searchable-glossary.tsx`

#### Subscription (4 arquivos)
- [ ] `components/subscription/premium-badge.tsx`
- [ ] `components/subscription/paywall-modal.tsx`
- [ ] `components/subscription/subscription-status-card.tsx`
- [ ] `components/subscription/upgrade-banner.tsx`

#### I18n (4 arquivos)
- [ ] `components/i18n/LanguageSwitcher.tsx`
- [ ] `lib/i18n/locales/pt-BR.json`
- [ ] `lib/i18n/locales/en.json`
- [ ] `lib/i18n/locales/es.json`

#### Other (2 arquivos)
- [ ] `components/providers.tsx`
- [ ] `components/theme-provider.tsx`

---

## 📈 MÉTRICAS DE SUCESSO

### Visual
- ✅ Zero emojis em toda aplicação
- ✅ 100% ícones Lucide profissionais
- ✅ Paleta Athletic Performance consistente
- ✅ Typography scale respeitada
- ✅ Spacing system seguido

### Técnico
- ✅ Build sem warnings
- ✅ Bundle size < +10% vs anterior
- ✅ Lighthouse Performance > 90
- ✅ Lighthouse Accessibility > 95

### Qualidade
- ✅ Todas as páginas testadas em mobile
- ✅ Todas as interações funcionais
- ✅ Estados hover/active/focus corretos
- ✅ Loading states elegantes

---

## ⏱️ ESTIMATIVA DE TEMPO

### Por Fase
- Fase 1-2 (Fundação + UI Base): 2 sessões
- Fase 3 (Header): 1 sessão
- Fase 4 (Landing): 1 sessão
- Fase 5 (Dashboard): 2 sessões
- Fase 6 (Plano): 2 sessões
- Fase 7 (Tracking): 1 sessão
- Fase 8 (Components): 1 sessão
- Fase 9 (Onboarding): 2 sessões
- Fase 10 (Profile): 1 sessão
- Fase 11 (Secondary Pages): 2 sessões
- Fase 12-13 (Subscription + Dialogs): 1 sessão
- Fase 14 (I18n): 1 sessão
- Fase 15 (Loading/Error): 1 sessão
- Fase 16 (Dark Mode): 1 sessão (opcional)
- Fase 17 (Testing): 2 sessões
- Fase 18 (Docs): 1 sessão
- Fase 19 (Performance): 1 sessão
- Fase 20 (Deploy): 1 sessão

**TOTAL: 20-22 sessões de trabalho**

---

## 🚀 ORDEM DE EXECUÇÃO RECOMENDADA

### Sprint 1 (Sessões 1-5): Fundação e Core
1. Tailwind + Globals CSS + Design Tokens
2. UI Components Base (Button, Card, Badge, etc)
3. Header + Navigation
4. Landing Page
5. Dashboard Principal

### Sprint 2 (Sessões 6-10): Features
6. Plano de Treino
7. Tracking + History
8. Feature Components
9. Onboarding Flow (7 steps)
10. Profile Tabs

### Sprint 3 (Sessões 11-15): Refinamento
11. Secondary Pages
12. Subscription Components
13. Modals + Dialogs
14. I18n + Languages
15. Loading + Error States

### Sprint 4 (Sessões 16-20): Qualidade
16. Dark Mode (opcional)
17. Testing Completo
18. Documentation
19. Performance Optimization
20. Deploy Production

---

## 📝 PRÓXIMO PASSO IMEDIATO

**Aguardando confirmação para iniciar:**
1. ✅ Paleta escolhida: Athletic Performance
2. ⏳ Confirmar início pela Fase 1
3. ⏳ Criar branch `redesign/athletic-performance`

**Comando git:**
```bash
git checkout -b redesign/athletic-performance
git commit -m "feat: iniciando redesign Athletic Performance v4.0.0"
```

---

## 💡 NOTAS IMPORTANTES

1. **Commits Incrementais**: Fazer commit a cada fase completada
2. **Testes Contínuos**: Testar cada página após modificação
3. **Backup**: Branch principal intacta até aprovação final
4. **Documentação**: Atualizar docs durante implementação
5. **Feedback**: Validar visualmente a cada 2-3 sessões

---

**Documento criado em:** 19/11/2025
**Versão:** 1.0
**Status:** Aguardando aprovação para início

**Pronto para começar a implementação! 🚀**
