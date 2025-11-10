# 🎨 Design System & UX Guidelines - Athera Run v1.8.x

**Data:** 10 de Novembro de 2025  
**Versão:** 1.8.3  
**Status:** ✅ Padrão Atual (Baseado no novo calendário do plano)

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Princípios de Design](#princípios-de-design)
3. [Cores e Gradientes](#cores-e-gradientes)
4. [Tipografia](#tipografia)
5. [Componentes Base](#componentes-base)
6. [Padrões de Layout](#padrões-de-layout)
7. [Cards e Containers](#cards-e-containers)
8. [Estados Visuais](#estados-visuais)
9. [Interatividade](#interatividade)
10. [Responsividade](#responsividade)
11. [Ícones e Badges](#ícones-e-badges)
12. [Animações](#animações)
13. [Checklist de Implementação](#checklist-de-implementação)

---

## 🎯 Visão Geral

Este Design System define o padrão visual e de interação de TODO o sistema Athera Run, baseado nas melhorias implementadas nas versões 1.8.0-1.8.3, especificamente no redesign do calendário do plano de treino.

### Objetivos do Design System

- ✅ **Consistência Visual**: Mesmo look & feel em todo o sistema
- ✅ **Mobile-First**: Prioritário para 80% dos usuários
- ✅ **Legibilidade**: Textos grandes, sem compressão
- ✅ **Intuitividade**: Baixa curva de aprendizado
- ✅ **Profissionalismo**: Visual moderno e confiável
- ✅ **Acessibilidade**: Contraste adequado, ícones claros

---

## 🎨 Princípios de Design

### 1. Clareza Visual
- **Hierarquia clara**: Títulos, subtítulos, corpo
- **Espaçamento generoso**: Breathing room entre elementos
- **Contraste adequado**: Legibilidade em qualquer condição
- **Ícones significativos**: Cada ícone tem propósito específico

### 2. Mobile-First
- **Touch-friendly**: Alvos de toque ≥ 44x44px
- **Scroll vertical**: Evitar scroll horizontal
- **Grid responsivo**: Adapta de 1 a 7 colunas
- **Textos legíveis**: Fontes ≥ 14px em mobile

### 3. Progressão de Informação
- **Resumo → Detalhe**: Visão geral primeiro, clique para ver mais
- **Expansão inteligente**: Expandir in-place, não redirecionar
- **Estado preservado**: Hoje sempre expandido

### 4. Feedback Visual Imediato
- **Estados claros**: Completo, pendente, hoje, futuro
- **Cores significativas**: Verde = sucesso, vermelho = alerta, laranja = ação
- **Animações sutis**: Pulse, hover, transitions suaves

---

## 🎨 Cores e Gradientes

### Paleta Principal

```typescript
// Brand Colors
orange: {
  50: '#fff7ed',
  400: '#fb923c',
  500: '#f97316',
  600: '#ea580c',
}

// Status Colors
green: {
  100: '#dcfce7',
  500: '#22c55e',
  600: '#16a34a',
}

red: {
  100: '#fee2e2',
  500: '#ef4444',
  600: '#dc2626',
}

// Neutral Colors
gray: {
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  600: '#4b5563',
  900: '#111827',
}
```

### Gradientes Padrão

```css
/* Background Principal */
background: linear-gradient(to bottom right, #fff7ed, #ffffff, #eff6ff);

/* Completo (Sucesso) */
background: linear-gradient(to bottom right, #dcfce7, #f0fdf4);
border-left: 4px solid #22c55e;

/* Hoje (Ação) */
background: linear-gradient(to bottom right, #ffedd5, #fff7ed);
border-left: 4px solid #f97316;

/* Não Realizado (Alerta) */
background: linear-gradient(to bottom right, #fee2e2, #fef2f2);
border-left: 4px solid #ef4444;

/* Futuro (Neutro) */
background: white;
border: 1px solid #e5e7eb;
```

### Uso de Cores por Contexto

**Verde** - Sucesso, Completo
- ✅ Treino concluído
- ✅ Meta atingida
- ✅ Progresso positivo

**Laranja** - Ação, Hoje, Principal
- 🔥 Treino de hoje
- 📊 CTA primário
- 🎯 Meta principal (race day)

**Vermelho** - Alerta, Não Realizado
- ❌ Treino não realizado
- ⚠️ Atrasado
- 🚨 Atenção necessária

**Roxo** - Musculação
- 💪 Treinos de força

**Azul** - Outros Esportes
- 🏊 Natação, ciclismo

---

## 📝 Tipografia

### Fontes

```typescript
// Font Family (Sistema operacional nativo)
fontFamily: {
  sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
}
```

### Hierarquia de Texto

```css
/* H1 - Títulos de Página */
.h1 {
  font-size: 2.25rem; /* 36px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}
@media (max-width: 768px) {
  .h1 { font-size: 1.875rem; } /* 30px */
}

/* H2 - Seções */
.h2 {
  font-size: 1.5rem; /* 24px */
  font-weight: 600;
  line-height: 1.3;
}

/* H3 - Cards, Subtítulos */
.h3 {
  font-size: 1.125rem; /* 18px */
  font-weight: 600;
  line-height: 1.4;
}

/* Body - Texto Normal */
.body {
  font-size: 0.875rem; /* 14px */
  font-weight: 400;
  line-height: 1.5;
}
@media (min-width: 768px) {
  .body { font-size: 1rem; } /* 16px */
}

/* Small - Legendas, Hints */
.small {
  font-size: 0.75rem; /* 12px */
  font-weight: 400;
  line-height: 1.4;
  color: #6b7280; /* gray-500 */
}
```

### Line Clamp

Para evitar quebra de layout:

```css
/* Limitar a 2 linhas */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 🧩 Componentes Base

### Card (Shadcn UI)

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Uso padrão
<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Conteúdo */}
  </CardContent>
</Card>

// Estilo padrão (já aplicado)
// - rounded-lg
// - border
// - bg-card
// - shadow-sm
// - p-6 (padding interno)
```

### Badge (Shadcn UI)

```tsx
import { Badge } from '@/components/ui/badge';

// Estados diferentes
<Badge className="bg-green-500 text-white">✅ Concluído</Badge>
<Badge className="bg-orange-500 text-white">🔥 Hoje</Badge>
<Badge className="bg-red-500 text-white">❌ Não Realizado</Badge>
<Badge className="bg-gray-200 text-gray-700">📅 Futuro</Badge>
<Badge className="bg-yellow-500 text-black">🏆 META</Badge>
```

### Button (Shadcn UI)

```tsx
import { Button } from '@/components/ui/button';

// Variantes
<Button variant="default">Primário</Button>      // Laranja
<Button variant="outline">Secundário</Button>    // Borda
<Button variant="ghost">Terciário</Button>       // Transparente
<Button variant="destructive">Deletar</Button>   // Vermelho

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="default">Médio</Button>
<Button size="lg">Grande</Button>
<Button size="icon"><Icon /></Button>            // Ícone apenas
```

---

## 📐 Padrões de Layout

### Container Principal

```tsx
// Layout padrão de página
<div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
  <div className="container mx-auto px-4 py-8 max-w-6xl">
    {/* Conteúdo */}
  </div>
</div>
```

### Grid Responsivo

```css
/* Cards de Resumo (2 em mobile, 4 em desktop) */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem; /* 12px */
}
@media (min-width: 1024px) {
  .summary-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem; /* 16px */
  }
}

/* Calendário Semanal (7 colunas) */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem; /* 8px */
}
@media (max-width: 768px) {
  .calendar-grid {
    grid-template-columns: repeat(7, minmax(60px, 1fr));
  }
}

/* Grid de Treinos (1-3 colunas) */
.workouts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem; /* 12px */
}
@media (min-width: 768px) {
  .workouts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .workouts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Espaçamento Vertical

```css
/* Padrão de margens */
mb-4   /* 16px - Entre cards pequenos */
mb-6   /* 24px - Entre seções relacionadas */
mb-8   /* 32px - Entre seções maiores */
```

---

## 🗂️ Cards e Containers

### Card de Dia (Calendário)

**Estrutura:**
```tsx
<div className={`
  rounded-lg
  border-2
  p-3
  cursor-pointer
  transition-all
  duration-200
  hover:shadow-md
  ${isCompleted ? 'bg-gradient-to-br from-green-100 to-green-50 border-green-500' : ''}
  ${isToday ? 'bg-gradient-to-br from-orange-100 to-orange-50 border-orange-500 ring-2 ring-orange-300 animate-pulse' : ''}
  ${isNotCompleted ? 'bg-gradient-to-br from-red-100 to-red-50 border-red-500' : ''}
  ${isFuture ? 'bg-white border-gray-300' : ''}
`}>
  {/* Header */}
  <div className="flex justify-between items-start mb-2">
    <div>
      <div className="text-xs font-medium text-gray-500">SEG</div>
      <div className="text-lg font-bold">10</div>
    </div>
    <StatusIcon />
  </div>
  
  {/* Content */}
  <div className="space-y-2">
    <WorkoutIcon />
    <h4 className="text-sm font-semibold line-clamp-2">Título</h4>
    <Badge>8 km</Badge>
  </div>
</div>
```

**Dimensões:**
- Desktop: `minmax(100px, 1fr)`
- Mobile: `minmax(60px, 1fr)`
- Padding: `p-3` (12px)
- Border: `border-2`

### Card de Treino (Expandido)

```tsx
<div className="bg-white rounded-lg border-2 border-gray-200 p-4">
  <div className="flex items-start gap-3">
    <WorkoutIcon />
    <div className="flex-1 space-y-2">
      <h4 className="font-semibold text-sm">{title}</h4>
      <p className="text-xs text-gray-600 line-clamp-3">{description}</p>
      <div className="flex flex-wrap gap-2">
        <Badge>📏 {distance} km</Badge>
        <Badge>⏱️ {pace}</Badge>
        <Badge>⏰ {duration}</Badge>
      </div>
    </div>
  </div>
</div>
```

### Card de Resumo (Summary)

```tsx
<Card>
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Meta
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">42 km</div>
    <p className="text-xs text-muted-foreground mt-1">28/12/2025</p>
  </CardContent>
</Card>
```

**Dimensões:**
- Header padding: `pb-3`
- Content padding: `pt-0` (remove padding-top)
- Título valor: `text-2xl` (24px)
- Legenda: `text-xs` (12px)

---

## 🎭 Estados Visuais

### Completo (Verde)

```tsx
className="bg-gradient-to-br from-green-100 to-green-50 border-green-500 border-2"

// Ícone de status
<CheckCircle2 className="h-5 w-5 text-green-600" />

// Badge
<Badge className="bg-green-500 text-white">✅ Concluído</Badge>
```

### Hoje (Laranja)

```tsx
className="bg-gradient-to-br from-orange-100 to-orange-50 border-orange-500 border-2 ring-2 ring-orange-300 animate-pulse"

// Ícone de status
<Activity className="h-5 w-5 text-orange-600" />

// Badge
<Badge className="bg-orange-500 text-white">🔥 HOJE</Badge>
```

### Não Realizado (Vermelho)

```tsx
className="bg-gradient-to-br from-red-100 to-red-50 border-red-500 border-2"

// Ícone de status
<XCircle className="h-5 w-5 text-red-600" />

// Badge
<Badge className="bg-red-500 text-white">❌ Não Realizado</Badge>
```

### Futuro (Neutro)

```tsx
className="bg-white border-gray-300 border-2"

// Ícone de status
<Calendar className="h-5 w-5 text-gray-400" />

// Badge
<Badge className="bg-gray-200 text-gray-700">📅 Futuro</Badge>
```

### Meta / Corrida Alvo (Amarelo)

```tsx
className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-500 border-2"

// Ícone especial
<Trophy className="h-6 w-6 text-yellow-600" />

// Badge especial
<Badge className="bg-yellow-500 text-black font-bold">🏆 META</Badge>
```

---

## 🖱️ Interatividade

### Hover States

```css
/* Card clicável */
.card-interactive {
  cursor: pointer;
  transition: all 0.2s ease;
}
.card-interactive:hover {
  shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Button hover */
.button:hover {
  opacity: 0.9;
  transform: scale(1.02);
}
```

### Click Feedback

```tsx
// Expansão de card
const [expanded, setExpanded] = useState(false);

<div 
  onClick={() => setExpanded(!expanded)}
  className="cursor-pointer transition-all duration-300"
>
  {expanded ? <ExpandedContent /> : <CompactContent />}
</div>
```

### Animações de Entrada

```tsx
// Fade in ao carregar
<div className="animate-in fade-in duration-500">
  {content}
</div>

// Slide up ao aparecer
<div className="animate-in slide-in-from-bottom duration-300">
  {content}
</div>
```

---

## 📱 Responsividade

### Breakpoints Padrão (Tailwind)

```typescript
sm: '640px',   // Smartphone grande
md: '768px',   // Tablet
lg: '1024px',  // Desktop pequeno
xl: '1280px',  // Desktop grande
2xl: '1536px', // Desktop muito grande
```

### Estratégia Mobile-First

**Mobile (< 768px):**
- Grid de 1 coluna para conteúdo principal
- Cards ocupam largura total quando expandidos
- Fonte base: 14px
- Padding reduzido: `p-3` ao invés de `p-6`
- Calendário: 7 colunas compactas (60px mínimo)

**Tablet (768px - 1024px):**
- Grid de 2 colunas para treinos
- Cards podem ter mais padding: `p-4`
- Fonte base: 16px
- Calendário: 7 colunas mais largas

**Desktop (> 1024px):**
- Grid de 3-4 colunas para treinos
- Layout espaçoso com `max-w-6xl`
- Card expandido ocupa largura total (7 colunas)
- Padding máximo: `p-6`

### Exemplos de Classes Responsivas

```tsx
// Texto responsivo
<h1 className="text-3xl md:text-4xl font-bold">Título</h1>

// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Padding responsivo
<div className="p-3 md:p-4 lg:p-6">

// Card expandido em largura total
<div className={`
  ${expanded ? 'md:col-span-7' : 'col-span-1'}
`}>
```

---

## 🎨 Ícones e Badges

### Sistema de Ícones Inteligentes

```tsx
import { 
  Trophy,     // 🏆 Corrida Alvo
  Mountain,   // ⛰️ Longão
  Activity,   // ⚡ Intervalos
  Clock,      // ⏱️ Tempo
  Heart,      // ❤️ Regenerativo
  Droplets,   // 💧 Descanso
  Dumbbell,   // 💪 Musculação
} from 'lucide-react';

// Função helper para detectar tipo
const getWorkoutIcon = (title: string, type: string) => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('corrida alvo') || lowerTitle.includes('race day')) {
    return <Trophy className="h-5 w-5 text-yellow-600" />;
  }
  if (lowerTitle.includes('longão') || lowerTitle.includes('long run')) {
    return <Mountain className="h-5 w-5 text-blue-600" />;
  }
  if (lowerTitle.includes('intervalo') || lowerTitle.includes('tiro')) {
    return <Activity className="h-5 w-5 text-red-600" />;
  }
  if (lowerTitle.includes('tempo') || lowerTitle.includes('threshold')) {
    return <Clock className="h-5 w-5 text-orange-600" />;
  }
  if (lowerTitle.includes('regenerativo') || lowerTitle.includes('easy')) {
    return <Heart className="h-5 w-5 text-pink-600" />;
  }
  if (type === 'rest' || lowerTitle.includes('descanso')) {
    return <Droplets className="h-5 w-5 text-blue-400" />;
  }
  if (lowerTitle.includes('muscula') || lowerTitle.includes('força')) {
    return <Dumbbell className="h-5 w-5 text-purple-600" />;
  }
  
  return <Activity className="h-5 w-5 text-gray-600" />;
};
```

### Badges Padrão

```tsx
// Distância
<Badge className="bg-blue-100 text-blue-700">
  📏 {distance} km
</Badge>

// Pace
<Badge className="bg-green-100 text-green-700">
  ⏱️ {pace} /km
</Badge>

// Duração
<Badge className="bg-purple-100 text-purple-700">
  ⏰ {duration} min
</Badge>

// Status
<Badge className="bg-orange-500 text-white">
  🔥 HOJE
</Badge>

// Meta especial
<Badge className="bg-yellow-500 text-black font-bold">
  🏆 META
</Badge>

// Contador de atividades
<Badge className="bg-gray-200 text-gray-700">
  3 atividades
</Badge>
```

### Tamanhos de Ícones

```tsx
// Ícone pequeno (dentro de badge)
<Icon className="h-3 w-3" />

// Ícone médio (padrão)
<Icon className="h-5 w-5" />

// Ícone grande (destaque)
<Icon className="h-6 w-6" />

// Ícone extra grande (hero)
<Icon className="h-8 w-8" />
```

---

## 🎬 Animações

### Pulse (Hoje)

```tsx
<div className="animate-pulse">
  {/* Card de hoje */}
</div>
```

### Transitions

```css
/* Padrão de transição */
.transition-all {
  transition: all 0.2s ease;
}

/* Transição longa (expansão) */
.transition-slow {
  transition: all 0.3s ease;
}

/* Hover com transform */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.hover\:-translate-y-1:hover {
  transform: translateY(-4px);
}
```

### Skeleton Loading

```tsx
// Enquanto carrega
<div className="animate-pulse">
  <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
  <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
  <div className="h-24 bg-gray-200 rounded-lg"></div>
</div>
```

---

## ✅ Checklist de Implementação

### Ao criar nova página/feature

- [ ] **Layout Base**
  - [ ] Container com `max-w-6xl`
  - [ ] Background gradiente padrão
  - [ ] Padding responsivo (`px-4 py-8`)

- [ ] **Cores e Estados**
  - [ ] Verde para sucesso/completo
  - [ ] Laranja para ação/hoje
  - [ ] Vermelho para alerta/erro
  - [ ] Gradientes suaves aplicados

- [ ] **Tipografia**
  - [ ] H1 para título da página
  - [ ] H2 para seções
  - [ ] Body text legível (≥14px mobile)
  - [ ] Line-clamp onde necessário

- [ ] **Componentes**
  - [ ] Cards com Shadow-UI base
  - [ ] Badges com cores significativas
  - [ ] Buttons com variantes corretas
  - [ ] Ícones de lucide-react

- [ ] **Responsividade**
  - [ ] Mobile testado (< 768px)
  - [ ] Tablet testado (768-1024px)
  - [ ] Desktop testado (> 1024px)
  - [ ] Grid adapta corretamente

- [ ] **Interatividade**
  - [ ] Hover states em elementos clicáveis
  - [ ] Loading states implementados
  - [ ] Feedback visual ao clicar
  - [ ] Transitions suaves (0.2-0.3s)

- [ ] **Acessibilidade**
  - [ ] Contraste adequado (WCAG AA)
  - [ ] Ícones com significado claro
  - [ ] Touch targets ≥ 44px
  - [ ] Keyboard navigation funcional

---

## 📊 Exemplos Práticos

### Página de Plano (v1.8.3)

```tsx
// Layout principal
<div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
  <div className="container mx-auto px-4 py-8 max-w-6xl">
    
    {/* Header */}
    <h1 className="text-4xl font-bold mb-2">Seu Plano</h1>
    <p className="text-muted-foreground text-lg mb-8">
      Maratona - 42 km
    </p>
    
    {/* Summary Cards - 2 cols mobile, 4 cols desktop */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Meta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">42 km</div>
        </CardContent>
      </Card>
      {/* ... mais 3 cards ... */}
    </div>
    
    {/* Weekly Calendar - 7 cols */}
    <div className="grid grid-cols-7 gap-2 mb-8">
      {days.map((day) => (
        <div
          key={day.date}
          onClick={() => toggleDay(day.date)}
          className={`
            rounded-lg border-2 p-3 cursor-pointer
            transition-all duration-200 hover:shadow-md
            ${day.isCompleted ? 'bg-gradient-to-br from-green-100 to-green-50 border-green-500' : ''}
            ${day.isToday ? 'bg-gradient-to-br from-orange-100 to-orange-50 border-orange-500 ring-2 ring-orange-300' : ''}
            ${day.isExpanded ? 'md:col-span-7' : 'col-span-1'}
          `}
        >
          {/* Day header */}
          <div className="flex justify-between mb-2">
            <div>
              <div className="text-xs font-medium text-gray-500">
                {day.dayName}
              </div>
              <div className="text-lg font-bold">{day.dayNumber}</div>
            </div>
            <StatusIcon status={day.status} />
          </div>
          
          {/* Compact or Expanded content */}
          {day.isExpanded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {day.workouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          ) : (
            <div>
              <WorkoutIcon type={day.mainWorkout.type} />
              <h4 className="text-sm font-semibold line-clamp-2 mt-2">
                {day.mainWorkout.title}
              </h4>
              {day.workouts.length > 1 && (
                <Badge className="mt-2">+ {day.workouts.length - 1} mais</Badge>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
</div>
```

### Dashboard (Aplicar mesmo padrão)

```tsx
// Usar mesmos cards de resumo
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <Card>...</Card>
</div>

// Próximos treinos com mesmo visual
<Card className="bg-gradient-to-br from-orange-100 to-orange-50 border-orange-500">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      🔥 Próximo Treino
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      <WorkoutIcon />
      <h3 className="font-semibold">{workout.title}</h3>
      <div className="flex gap-2">
        <Badge>📏 {workout.distance} km</Badge>
        <Badge>⏱️ {workout.pace}</Badge>
      </div>
    </div>
  </CardContent>
</Card>
```

### Perfil (Aplicar mesmo padrão)

```tsx
// Tabs com visual consistente
<Tabs defaultValue="profile">
  <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
    <TabsTrigger value="profile">Perfil</TabsTrigger>
    <TabsTrigger value="medical">Saúde</TabsTrigger>
    <TabsTrigger value="races">Corridas</TabsTrigger>
    <TabsTrigger value="actions">Ações</TabsTrigger>
  </TabsList>
  
  <TabsContent value="profile">
    {/* Cards com mesmo padrão */}
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Dados Pessoais</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Info cards */}
        </div>
      </CardContent>
    </Card>
  </TabsContent>
</Tabs>
```

---

## 🔄 Aplicação em Todo Sistema

### Páginas que precisam atualização

1. **Dashboard** (`/dashboard`)
   - ✅ Aplicar cards de resumo iguais ao plano
   - ✅ Card "Próximo Treino" com gradiente laranja
   - ✅ Quick stats com mesmo layout
   
2. **Perfil** (`/perfil`)
   - ✅ Tabs com visual consistente
   - ✅ Cards de informação com gradientes suaves
   - ✅ Badges para stats
   
3. **Onboarding** (`/onboarding`)
   - ✅ Progress bar com cores consistentes
   - ✅ Cards de seleção com hover states
   - ✅ Botões Next/Prev padronizados
   
4. **Tracking** (`/tracking`)
   - ✅ Timeline com estados visuais claros
   - ✅ Cards de atividade com ícones
   - ✅ Stats com badges
   
5. **Calculator** (`/calculator`)
   - ✅ Input cards com visual limpo
   - ✅ Results com gradientes
   - ✅ CTA buttons consistentes

### Componentes globais

1. **Header**
   - Background branco com shadow sutil
   - Logo + Navigation clean
   - User dropdown com ícones
   
2. **Footer**
   - Background gradiente inverso
   - Links organizados em grid
   - Social icons consistentes
   
3. **Modals/Dialogs**
   - Overlay com backdrop-blur
   - Content com shadow grande
   - Close button no canto
   
4. **Toasts/Notifications**
   - Verde para sucesso
   - Vermelho para erro
   - Azul para info
   - Position: top-right

---

## 🎯 Resultado Esperado

Após aplicar este Design System em todo o site:

### Benefícios Visuais
- ✅ **100% Consistente**: Mesma linguagem visual em todas as páginas
- ✅ **Profissional**: Look & feel de produto premium
- ✅ **Legível**: Textos claros, espaçamento adequado
- ✅ **Intuitivo**: Usuário sabe o que esperar

### Benefícios de UX
- ✅ **Curva de Aprendizado**: Usuário aprende uma vez, aplica em todo site
- ✅ **Confiança**: Visual consistente gera confiança
- ✅ **Performance**: Componentes reutilizáveis carregam mais rápido
- ✅ **Manutenção**: Mudanças centralizadas no design system

### Métricas de Sucesso
- 📊 **Task Completion**: +30% (mais fácil completar ações)
- ⏱️ **Time on Task**: -20% (mais rápido encontrar o que precisa)
- 😊 **User Satisfaction**: +40% (visual mais agradável)
- 📱 **Mobile Usage**: +25% (melhor experiência mobile)

---

## 📚 Referências

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Shadcn UI**: https://ui.shadcn.com
- **Lucide Icons**: https://lucide.dev
- **Radix UI**: https://www.radix-ui.com
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/

---

## 🔄 Versionamento

- **v1.8.3** (10/Nov/2025): Cards expandidos em largura total
- **v1.8.2** (10/Nov/2025): Remoção de seção redundante
- **v1.8.1** (10/Nov/2025): Cards expansíveis multi-workout
- **v1.8.0** (10/Nov/2025): Calendário semanal redesenhado (base)

---

**Documento mantido por:** Athera Team  
**Próxima revisão:** Após próxima feature de UX  
**Status:** 🟢 Ativo e em uso
