# 🎨 Design System Implementation - v1.9.0

**Data:** 10 de Novembro de 2025  
**Versão:** 1.9.0  
**Status:** 🚀 Em Implementação

---

## 📋 Objetivo

Aplicar o Design System padrão (baseado no calendário do plano v1.8.3) em **TODAS** as páginas do sistema, garantindo:

- ✅ **100% Consistência Visual**
- ✅ **Mobile-First em todo sistema**
- ✅ **Mesmo padrão de cards, badges, cores**
- ✅ **Interatividade uniforme**

---

## 🎯 Design System Padrão (Referência)

### Core Principles
```typescript
// 1. Container padrão
<div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
  <div className="container mx-auto px-4 py-8 max-w-6xl">
    {/* Conteúdo */}
  </div>
</div>

// 2. Cards de resumo (2 cols mobile, 4 cols desktop)
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground">Label</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">Valor</div>
      <p className="text-xs text-muted-foreground mt-1">Legenda</p>
    </CardContent>
  </Card>
</div>

// 3. Estados visuais
- Verde: Sucesso/Completo (bg-gradient-to-br from-green-100 to-green-50 border-green-500)
- Laranja: Hoje/Ação (bg-gradient-to-br from-orange-100 to-orange-50 border-orange-500)
- Vermelho: Alerta (bg-gradient-to-br from-red-100 to-red-50 border-red-500)
- Amarelo: Meta (bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-500)

// 4. Badges informativos
<Badge className="bg-blue-100 text-blue-700">📏 8 km</Badge>
<Badge className="bg-green-100 text-green-700">⏱️ 5:30/km</Badge>
<Badge className="bg-purple-100 text-purple-700">⏰ 45 min</Badge>

// 5. Cards expansíveis
- Hover: shadow-md + translateY(-2px)
- Click: expande in-place
- Transition: 0.2-0.3s ease
```

---

## 📊 Páginas para Implementar

### ✅ Já Implementadas (v1.8.x)
- [x] `/plano` - Calendário semanal redesenhado

### 🚀 Fase 1 - Páginas Críticas (Prioridade Alta)
- [ ] `/dashboard` - Página principal após login
- [ ] `/perfil` - Dados do usuário
- [ ] `/tracking` - Acompanhamento de atividades
- [ ] `/onboarding` - Primeira experiência

### 🚀 Fase 2 - Páginas Secundárias (Prioridade Média)
- [ ] `/calculator` - Calculadora de pace
- [ ] `/nutrition` - Nutrição
- [ ] `/prevention` - Prevenção de lesões
- [ ] `/overtraining` - Overtraining

### 🚀 Fase 3 - Páginas de Suporte (Prioridade Baixa)
- [ ] `/chat` - Chat com IA
- [ ] `/glossary` - Glossário
- [ ] `/training` - Treinos
- [ ] `/pricing` - Preços
- [ ] `/` (home) - Landing page
- [ ] `/login` - Login
- [ ] `/signup` - Cadastro
- [ ] `/subscription` - Assinatura
- [ ] `/admin` - Admin

---

## 🔧 Checklist por Página

### Para cada página, verificar:

#### 1. Layout Base
- [ ] Container com `max-w-6xl`
- [ ] Background `bg-gradient-to-br from-orange-50 via-white to-blue-50`
- [ ] Padding `px-4 py-8`
- [ ] Título da página com H1 `text-3xl md:text-4xl font-bold`

#### 2. Cards e Componentes
- [ ] Cards usando `<Card>` do shadcn/ui
- [ ] CardHeader com `pb-3`
- [ ] CardTitle com tamanho correto
- [ ] Badges com cores significativas
- [ ] Ícones do lucide-react

#### 3. Grid Responsivo
- [ ] Grid adapta de 1 a 4 colunas
- [ ] Gap adequado (`gap-3 lg:gap-4`)
- [ ] Mobile-first (grid-cols-1 → md:grid-cols-2 → lg:grid-cols-4)

#### 4. Estados Visuais
- [ ] Verde para sucesso
- [ ] Laranja para ação/hoje
- [ ] Vermelho para alerta
- [ ] Gradientes suaves aplicados

#### 5. Interatividade
- [ ] Hover states (shadow-md, translateY)
- [ ] Transitions (0.2-0.3s ease)
- [ ] Click feedback visual
- [ ] Loading states

#### 6. Responsividade
- [ ] Testado em mobile (< 768px)
- [ ] Testado em tablet (768-1024px)
- [ ] Testado em desktop (> 1024px)

---

## 📝 Implementação Detalhada

### Fase 1.1 - Dashboard (`/dashboard`)

**Objetivo:** Página principal consistente com o plano

**Mudanças:**

1. **Header Section**
```tsx
<div className="mb-8">
  <h1 className="text-3xl md:text-4xl font-bold mb-2">
    Bem-vindo, {userName}! 👋
  </h1>
  <p className="text-muted-foreground text-lg">
    {currentDate}
  </p>
</div>
```

2. **Quick Stats (2 cols mobile, 4 cols desktop)**
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        Treinos esta semana
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{weekWorkouts}/7</div>
      <p className="text-xs text-muted-foreground mt-1">
        {completionPercent}% completo
      </p>
    </CardContent>
  </Card>
  {/* ... mais 3 cards similares ... */}
</div>
```

3. **Próximo Treino (Destaque laranja)**
```tsx
<Card className="bg-gradient-to-br from-orange-100 to-orange-50 border-orange-500 border-2 mb-8">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      🔥 Próximo Treino
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <WorkoutIcon type={workout.type} className="h-8 w-8" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{workout.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{workout.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge className="bg-blue-100 text-blue-700">📏 {workout.distance} km</Badge>
        <Badge className="bg-green-100 text-green-700">⏱️ {workout.pace}</Badge>
        <Badge className="bg-purple-100 text-purple-700">⏰ {workout.duration}</Badge>
      </div>
      <Button className="w-full">Ver Detalhes</Button>
    </div>
  </CardContent>
</Card>
```

4. **Resumo Semanal (Grid 1-3 cols)**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards de progresso, meta, etc */}
</div>
```

---

### Fase 1.2 - Perfil (`/perfil`)

**Objetivo:** Tabs e cards consistentes

**Mudanças:**

1. **Tabs com Grid**
```tsx
<Tabs defaultValue="profile" className="space-y-6">
  <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-transparent">
    <TabsTrigger value="profile">Perfil</TabsTrigger>
    <TabsTrigger value="medical">Saúde</TabsTrigger>
    <TabsTrigger value="races">Corridas</TabsTrigger>
    <TabsTrigger value="actions">Ações</TabsTrigger>
  </TabsList>
</Tabs>
```

2. **Info Cards (Grid 2-3 cols)**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Dados Pessoais</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Idade</p>
        <p className="text-lg font-semibold">{age} anos</p>
      </div>
      {/* ... mais campos ... */}
    </div>
  </CardContent>
</Card>
```

3. **Stats com Badges**
```tsx
<div className="flex flex-wrap gap-2">
  <Badge className="bg-green-100 text-green-700">✅ {completedRaces} corridas</Badge>
  <Badge className="bg-blue-100 text-blue-700">📏 {totalKm} km totais</Badge>
  <Badge className="bg-purple-100 text-purple-700">⏱️ Melhor: {bestTime}</Badge>
</div>
```

---

### Fase 1.3 - Tracking (`/tracking`)

**Objetivo:** Timeline visual com estados claros

**Mudanças:**

1. **Timeline Cards**
```tsx
<div className="space-y-4">
  {activities.map(activity => (
    <Card 
      key={activity.id}
      className={`
        ${activity.completed ? 'bg-gradient-to-br from-green-100 to-green-50 border-green-500 border-2' : ''}
        transition-all duration-200 hover:shadow-md
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <StatusIcon status={activity.status} />
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{activity.title}</h3>
              <Badge>{activity.date}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-100 text-blue-700">📏 {activity.distance}</Badge>
              <Badge className="bg-green-100 text-green-700">⏱️ {activity.pace}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

---

### Fase 1.4 - Onboarding (`/onboarding`)

**Objetivo:** Steps com visual consistente

**Mudanças:**

1. **Progress Bar**
```tsx
<div className="mb-8">
  <div className="flex justify-between mb-2">
    <span className="text-sm font-medium">Passo {currentStep} de {totalSteps}</span>
    <span className="text-sm text-muted-foreground">{progressPercent}%</span>
  </div>
  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
    <div 
      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
      style={{ width: `${progressPercent}%` }}
    />
  </div>
</div>
```

2. **Step Cards com Hover**
```tsx
<Card 
  className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1"
  onClick={() => selectOption(option.id)}
>
  <CardContent className="p-6">
    <div className="flex items-center gap-4">
      <Icon className="h-8 w-8 text-orange-600" />
      <div>
        <h3 className="font-semibold">{option.title}</h3>
        <p className="text-sm text-muted-foreground">{option.description}</p>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 🧪 Validação

Para cada página implementada:

1. **Visual Check**
   - [ ] Container e background corretos
   - [ ] Cards com padrão uniforme
   - [ ] Cores e gradientes aplicados
   - [ ] Badges e ícones consistentes

2. **Responsivo Check**
   - [ ] Mobile (iPhone SE, 375px)
   - [ ] Tablet (iPad, 768px)
   - [ ] Desktop (1920px)

3. **Interatividade Check**
   - [ ] Hover funciona
   - [ ] Click feedback
   - [ ] Transitions suaves
   - [ ] Loading states

4. **Build Check**
   ```bash
   npm run build
   # Verificar se não quebrou nada
   ```

---

## 📈 Progresso

### Fase 1 - Críticas (0/4)
- [ ] Dashboard
- [ ] Perfil
- [ ] Tracking
- [ ] Onboarding

### Fase 2 - Secundárias (0/4)
- [ ] Calculator
- [ ] Nutrition
- [ ] Prevention
- [ ] Overtraining

### Fase 3 - Suporte (0/9)
- [ ] Chat
- [ ] Glossary
- [ ] Training
- [ ] Pricing
- [ ] Home
- [ ] Login
- [ ] Signup
- [ ] Subscription
- [ ] Admin

**Total:** 0/17 páginas implementadas

---

## 🚀 Próximos Passos

1. ✅ **Definir Roadmap** (Este documento)
2. 🔄 **Implementar Fase 1** (Dashboard, Perfil, Tracking, Onboarding)
3. ⏳ **Validar Fase 1** (Testes visuais e funcionais)
4. ⏳ **Implementar Fase 2** (Secundárias)
5. ⏳ **Implementar Fase 3** (Suporte)
6. ⏳ **Testes Finais** (Build, responsivo, funcional)
7. ⏳ **Deploy** (Vercel production)

---

**Mantido por:** Athera Team  
**Última atualização:** 10/Nov/2025  
**Status:** 🚀 Iniciando Fase 1
