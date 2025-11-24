# 🎯 PLANO DE EXECUÇÃO - Transparência IA Completa

**Data:** 24/11/2025  
**Objetivo:** Implementar 100% da transparência IA em todo o sistema  
**Abordagem:** MVP Incremental (recomendado)

---

## 📋 ESCOLHA: OPÇÃO 2 - MVP INCREMENTAL

**Por quê?**
- ✅ Entrega valor rápido (2 semanas)
- ✅ Valida conceito com usuários reais
- ✅ Menor risco técnico
- ✅ Pode expandir depois se funcionar

**Fases priorizadas:**
1. **Semana 1:** Ícones em TODO o sistema (50 campos)
2. **Semana 2:** Semáforo básico (🟢 verde e 🔴 vermelho apenas)

---

## 📅 CRONOGRAMA DETALHADO

### SEMANA 1: Ícones em Todo Sistema

#### Dia 1 (Segunda) - Perfil: BasicData + Health
**Tempo estimado:** 6-8 horas

**Arquivos a modificar:**
```bash
✏️ components/profile/v1.3.0/BasicDataTab.tsx
✏️ components/profile/v1.3.0/HealthTab.tsx
```

**Campos a adicionar (total: 15):**

**BasicDataTab (5 campos):**
1. Idade
2. Gênero  
3. Peso
4. Altura
5. FC em repouso

**HealthTab (10 campos):**
1. Qualidade do sono
2. Horas de sono médias
3. Nível de estresse
4. Lesões ativas
5. Histórico de lesões
6. Data última lesão
7. Status recuperação
8. Tracking ciclo menstrual (mulheres)
9. Duração do ciclo
10. Data último período

**Código padrão:**
```typescript
import AIFieldIcon from '@/components/ai-transparency/AIFieldIcon';

<label className="flex items-center gap-2">
  {label}
  <AIFieldIcon
    label="Nome do Campo"
    importance="critical" | "high" | "medium" | "low"
    impact="O que este dado afeta"
    howUsed="Como a IA usa especificamente"
  />
</label>
```

---

#### Dia 2 (Terça) - Perfil: Performance + Goals
**Tempo estimado:** 6-8 horas

**Arquivos a modificar:**
```bash
✏️ components/profile/v1.3.0/PerformanceTab.tsx
✏️ components/profile/v1.3.0/GoalsTab.tsx
```

**Campos a adicionar (total: 12):**

**PerformanceTab (7 campos):**
1. VDOT
2. Melhores tempos (5K, 10K, 21K, 42K)
3. Volume semanal atual
4. Maior corrida já feita
5. Anos de experiência
6. Nível atual
7. Outros esportes praticados

**GoalsTab (5 campos):**
1. Distância da meta
2. Data da prova
3. Tempo alvo
4. Motivação primária
5. Motivações secundárias

---

#### Dia 3 (Quarta) - Perfil: Availability + Dashboard
**Tempo estimado:** 6-8 horas

**Arquivos a modificar:**
```bash
✏️ components/profile/v1.3.0/AvailabilityTab.tsx
✏️ app/[locale]/dashboard/page.tsx
```

**Campos a adicionar (total: 18):**

**AvailabilityTab (13 campos):**
1. Dias disponíveis (7 checkboxes)
2. Dia do longão
3. Academia disponível
4. Piscina disponível
5. Pista disponível
6. Atividades customizadas

**Dashboard (5 indicadores):**
1. Meta atual (distância + data)
2. Volume semanal planejado
3. Próximo treino (gerado pela IA)
4. Progressão atual
5. VDOT atual

---

#### Dia 4 (Quinta) - Página do Plano
**Tempo estimado:** 6-8 horas

**Arquivos a modificar:**
```bash
✏️ app/[locale]/plano/page.tsx
✏️ components/workout-details.tsx
```

**Elementos a adicionar (total: 10):**

**Header do Plano (3):**
1. Distância da meta
2. Data da prova
3. Semanas totais

**Cards de Semana (4):**
1. Volume semanal
2. Intensidade média
3. Dias de treino
4. Fase do plano (Base/Build/Peak/Taper)

**Detalhes de Treino (3):**
1. Por que este ritmo?
2. Por que esta distância?
3. Por que hoje? (distribuição semanal)

---

#### Dia 5 (Sexta) - Review & Testing
**Tempo estimado:** 6-8 horas

**Atividades:**
1. ✅ Verificar todos os 50 campos
2. ✅ Testar tooltips em todas as páginas
3. ✅ Validar textos de cada tooltip
4. ✅ Performance check (< 3s load)
5. ✅ Mobile responsivo
6. ✅ Build passando
7. ✅ Deploy para staging

**Checklist completo:**
```
□ Onboarding: 15 campos com ícones
□ Perfil: 35 campos com ícones  
□ Dashboard: 5 indicadores com ícones
□ Plano: 10 elementos com ícones
□ TOTAL: 65 ícones implementados
```

---

### SEMANA 2: Semáforo Básico (Verde/Vermelho)

#### Dia 6-7 (Segunda-Terça) - Backend Tracking
**Tempo estimado:** 12-16 horas

**Tarefas:**

**1. Criar tabela de tracking (2h)**
```sql
-- prisma/migrations/XXX_add_ai_field_tracking.sql

CREATE TABLE ai_field_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES custom_training_plans(id),
  user_id UUID REFERENCES users(id),
  field_name VARCHAR(100) NOT NULL,
  field_value TEXT,
  was_used BOOLEAN DEFAULT false,
  importance VARCHAR(20),
  how_used TEXT,
  impact TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_field_usage_plan ON ai_field_usage(plan_id);
CREATE INDEX idx_ai_field_usage_user ON ai_field_usage(user_id);
```

**2. Atualizar API de geração de planos (4h)**
```bash
✏️ app/api/plan/generate/route.ts
```

Adicionar tracking de campos usados:
```typescript
// Após gerar plano, salvar quais campos foram usados
const fieldsUsed = [
  { field: 'age', value: profile.age, wasUsed: true, importance: 'critical' },
  { field: 'weight', value: profile.weight, wasUsed: true, importance: 'high' },
  // ... todos os campos
];

await prisma.aiFieldUsage.createMany({
  data: fieldsUsed.map(f => ({
    planId: plan.id,
    userId: user.id,
    ...f
  }))
});
```

**3. Criar API de análise funcional (6h)**
```bash
✏️ app/api/ai/field-analysis/route.ts (NOVO)
```

```typescript
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session.user.id;
  
  // Buscar plano ativo
  const plan = await prisma.customTrainingPlan.findFirst({
    where: { userId, active: true }
  });
  
  // Buscar tracking de campos
  const fieldUsage = await prisma.aiFieldUsage.findMany({
    where: { planId: plan.id }
  });
  
  // Buscar perfil atual
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId }
  });
  
  // Comparar: O que foi usado vs O que está disponível
  const analysis = {
    fieldsUsed: fieldUsage.filter(f => f.wasUsed),
    fieldsMissing: identifyMissingFields(profile, fieldUsage),
    completeness: calculateCompleteness(profile, fieldUsage)
  };
  
  return NextResponse.json({ analysis });
}
```

---

#### Dia 8-9 (Quarta-Quinta) - Frontend Semáforos
**Tempo estimado:** 12-16 horas

**Tarefas:**

**1. Criar componente AIFieldStatus (4h)**
```bash
🆕 components/ai-transparency/AIFieldStatus.tsx
```

```typescript
interface AIFieldStatusProps {
  field: string;
  value: any;
  status: 'used' | 'missing'; // 🟢 ou 🔴 apenas (sem amarelo no MVP)
  importance: 'critical' | 'high' | 'medium' | 'low';
  howUsed?: string;
  impact?: string;
}

export function AIFieldStatus({ ... }: AIFieldStatusProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Ícone IA */}
      <AIFieldIcon ... />
      
      {/* Status badge */}
      {status === 'used' ? (
        <Badge className="bg-green-100 text-green-800">
          🟢 Usado pela IA
        </Badge>
      ) : (
        <Badge className="bg-red-100 text-red-800">
          🔴 Não fornecido
        </Badge>
      )}
      
      {/* Tooltip com detalhes */}
      {status === 'used' && (
        <Tooltip content={`IA usou este campo para: ${howUsed}`} />
      )}
      
      {status === 'missing' && (
        <Tooltip content={`Complete este campo para melhorar seu plano`} />
      )}
    </div>
  );
}
```

**2. Integrar em todos os campos (6h)**
```bash
✏️ Todos os arquivos modificados na Semana 1
```

Substituir `AIFieldIcon` por `AIFieldStatus`:
```typescript
// ANTES
<AIFieldIcon label="Peso" importance="high" ... />

// DEPOIS
<AIFieldStatus
  field="weight"
  value={profile.weight}
  status={profile.weight ? 'used' : 'missing'}
  importance="high"
  howUsed="Cálculo de zonas FC e ajuste de intensidade"
/>
```

**3. Fetch de status no mount (2h)**
```bash
✏️ app/[locale]/perfil/page.tsx
✏️ app/[locale]/dashboard/page.tsx
```

```typescript
const [fieldAnalysis, setFieldAnalysis] = useState(null);

useEffect(() => {
  fetch('/api/ai/field-analysis')
    .then(res => res.json())
    .then(data => setFieldAnalysis(data.analysis));
}, []);

// Passar para componentes filhos
<BasicDataTab 
  data={profile} 
  fieldAnalysis={fieldAnalysis} 
/>
```

---

#### Dia 10 (Sexta) - Testing & Deploy
**Tempo estimado:** 6-8 horas

**Atividades:**

**1. Testes Manuais (3h)**
```
✅ Criar novo usuário
✅ Completar onboarding
✅ Gerar plano
✅ Verificar perfil:
   - Campos preenchidos: 🟢 verde
   - Campos vazios: 🔴 vermelho
✅ Editar perfil (adicionar campo faltante)
✅ Regenerar plano
✅ Verificar status atualizado
```

**2. Performance & UX (2h)**
```
✅ Lazy loading de semáforos
✅ Animações suaves
✅ Mobile perfeito
✅ < 3s load time
```

**3. Deploy Produção (1h)**
```bash
# Commit
git add .
git commit -m "feat(v2.8.0): Complete AI transparency - icons + traffic lights"

# Push (auto-deploy Vercel)
git push origin main

# Validar
- Build passou
- Migration aplicada
- APIs funcionais
- Frontend renderizando
```

---

## 🎯 ENTREGÁVEIS FINAIS

### Semana 1 (Fim de Sexta)
- ✅ 65 ícones implementados em todo sistema
- ✅ Tooltips explicativos em todos os campos
- ✅ Build passando
- ✅ Documentação atualizada

### Semana 2 (Fim de Sexta)
- ✅ Semáforos 🟢🔴 em todos os campos
- ✅ Backend rastreando uso de campos
- ✅ API /field-analysis funcional
- ✅ Frontend mostrando status real
- ✅ Sistema completo em produção

---

## 🧪 CRITÉRIOS DE ACEITE

### MVP Completo Quando:

**Funcionalidade:**
- [ ] Usuário vê ícone IA em TODOS os campos relevantes (65)
- [ ] Tooltips explicam como IA usa cada campo
- [ ] Após gerar plano, campos mostram 🟢 (usado) ou 🔴 (não fornecido)
- [ ] Status é preciso (campos usados = verde, vazios = vermelho)

**Performance:**
- [ ] Página carrega em < 3 segundos
- [ ] Ícones não deixam UI lenta
- [ ] Semáforos carregam sem delay perceptível

**UX:**
- [ ] Interface não fica poluída
- [ ] Ícones são discretos mas visíveis
- [ ] Tooltips aparecem on-hover suavemente
- [ ] Mobile responsivo perfeito

**Técnico:**
- [ ] Build passa sem erros
- [ ] Zero warnings TypeScript
- [ ] Migration aplicada com sucesso
- [ ] APIs retornam dados corretos
- [ ] Documentação completa

---

## 📊 MÉTRICAS DE SUCESSO

### Antes vs Depois (validar em 2 semanas)

| Métrica | Baseline | Meta MVP | Como Medir |
|---------|----------|----------|------------|
| **Completude de Perfis** | 45% | 60%+ | % campos preenchidos |
| **Taxa Geração Plano** | 70% | 80%+ | % usuários que geram plano |
| **Tempo Onboarding** | 8 min | 7 min | Média de tempo |
| **Tickets "Por que X?"** | 50/mês | 30/mês | Support tickets |
| **NPS Score** | 50 | 55+ | Survey mensal |

### Validação Qualitativa (entrevistas com 10 usuários)

**Perguntas:**
1. Os ícones de IA ajudam a entender o sistema?
2. Os semáforos 🟢🔴 incentivam a completar perfil?
3. Os tooltips explicam claramente?
4. A interface fica poluída ou limpa?
5. Você confia mais na IA agora?

**Decisão:**
- Se 7+ de 10 responderem positivo → Expandir para Fases 3-5
- Se 5-6 de 10 → Refinar MVP antes de expandir
- Se < 5 → Reavaliar abordagem

---

## 🚨 RISCOS & PLANO B

### Risco 1: Performance Ruim
**Se:** Ícones deixarem sistema lento  
**Plano B:** Lazy loading agressivo, ícones on-demand

### Risco 2: UX Poluída
**Se:** Usuários reclamarem de "muito ícone"  
**Plano B:** Toggle para esconder ícones, mostrar só em hover

### Risco 3: Tracking Incorreto
**Se:** Semáforos mostrarem status errado  
**Plano B:** Log detalhado, fix rápido, comunicação clara

### Risco 4: Baixo Engajamento
**Se:** Usuários não ligarem para transparência  
**Plano B:** Gamificar mais (badges, scores), incentivos

---

## 📝 DOCUMENTAÇÃO A CRIAR

Durante implementação, manter:

1. **CHANGELOG_v2.8.0.md** - Log de todas as mudanças
2. **AI_TRANSPARENCY_MVP.md** - Decisões e arquitetura
3. **TESTES_MVP.md** - Resultados dos testes
4. **FEEDBACK_USUARIOS.md** - Insights das entrevistas
5. **METRICAS_v2.8.0.md** - Antes/depois quantitativo

---

## 🎯 PRÓXIMOS PASSOS (Pós-MVP)

### Se MVP for sucesso (NPS +5, completude +15%):

**Fase 3 - Painel Explicação (Semana 3-4)**
- Dashboard "O que IA considerou"
- Score de completude visual
- Recomendações personalizadas

**Fase 4 - Chat Contextual (Semana 5-6)**
- Chat com IA sobre decisões
- Perguntas sobre plano específico
- Sugestões de ajustes

**Fase 5 - Amarelo (Conflitos) (Semana 7)**
- Adicionar 🟡 para conflitos
- Detectar dados inconsistentes
- Sugerir correções automaticamente

---

## ✅ CHECKLIST ANTES DE COMEÇAR

- [ ] Ler documento de análise completa
- [ ] Entender arquitetura atual
- [ ] Preparar ambiente de dev
- [ ] Criar branch `feature/ai-transparency-mvp`
- [ ] Comunicar com usuário sobre timeline
- [ ] Confirmar priorização com stakeholders

---

## 🚀 VAMOS COMEÇAR?

**Próxima ação:** Confirmar abordagem MVP e iniciar Dia 1

**Dúvidas antes de começar?**
1. MVP de 2 semanas está OK?
2. Escopo de 65 ícones + semáforo básico faz sentido?
3. Validação com usuários após 2 semanas está aprovado?

**Se tudo OK, vamos executar! 💪**
