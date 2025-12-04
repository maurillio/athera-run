# Correção Crítica v1.5.3 - Onboarding e Segurança do Banco de Dados

**Data:** 07/11/2025
**Versão:** v1.5.3
**Status:** ✅ Implementado e Documentado

---

## 🚨 Problema Identificado

### 1. Falha no Onboarding
**Erro:** `Argument 'goalDistance' is missing`
**Impacto:** Usuários não conseguiam completar o onboarding
**Causa Raiz:** Campo `goalDistance` obrigatório no modelo `CustomTrainingPlan`, mas opcional no fluxo de onboarding

### 2. Exposição de Credenciais do Banco
**Alerta:** GitHub GitGuardian detectou exposição de credenciais PostgreSQL no repositório
**Risco:** Acesso não autorizado ao banco de dados
**Causa:** .gitignore insuficiente

---

## 🎯 Análise do Problema

### Contexto Histórico

**v1.3.0 (Funcionava):**
- Onboarding incluía seleção de corrida obrigatória no Step5
- Campo `goalDistance` sempre preenchido
- Plano gerado automaticamente após onboarding

**v1.4.0 (Multilinguagem - Quebrou):**
- Refatoração dos componentes de onboarding
- `goalDistance` tornou-se opcional no Step5 para flexibilidade
- Schema do banco manteve campo obrigatório em `CustomTrainingPlan`
- **Inconsistência:** Frontend permitia null, Backend exigia valor

### Fluxo do Erro

```
1. Usuário completa onboarding SEM selecionar corrida
   └─> goalDistance = null (permitido no frontend)

2. POST /api/profile/create cria perfil
   └─> goalDistance: null (permitido no schema AthleteProfile)

3. Sistema tenta gerar plano automático (opcional)
   └─> CustomTrainingPlan exige goalDistance
   └─> ❌ ERRO: "Argument 'goalDistance' is missing"

4. Rollback da transação
   └─> Perfil não é criado
   └─> Usuário fica travado no onboarding
```

### Log do Erro (Console Frontend)

```javascript
📊 Dados do onboarding: {
  formData: {
    email: "teste89@teste.com",
    name: "Teste89",
    goalDistance: "",  // ❌ String vazia = undefined
    longRunDay: null,
    // ... outros campos
  },
  trainingActivities: [],
  availableDays: undefined
}

📡 Resposta da API: {
  ok: false,
  status: 500,
  data: {
    success: false,
    error: 'Erro ao criar perfil',
    details: 'Argument `goalDistance` is missing.'
  }
}
```

---

## ✅ Solução Implementada

### 1. Correção do Schema (v1.5.3)

#### prisma/schema.prisma
```prisma
model CustomTrainingPlan {
  id                Int             @id @default(autoincrement())
- goalDistance      String          // Era obrigatório
+ goalDistance      String?         // Agora opcional
  runningLevel      String
- targetRaceDate    DateTime        // Era obrigatório
+ targetRaceDate    DateTime?       // Agora opcional
  startDate         DateTime
  // ... resto igual
}
```

#### Migration SQL
```sql
-- prisma/migrations/20251107_make_training_plan_fields_optional_v1_5_3/migration.sql

ALTER TABLE "custom_training_plans" 
  ALTER COLUMN "goalDistance" DROP NOT NULL;

ALTER TABLE "custom_training_plans" 
  ALTER COLUMN "targetRaceDate" DROP NOT NULL;
```

### 2. Segurança - .gitignore Completo

```gitignore
# Environment variables - NUNCA COMMITAR
/.env
/.env.local
/.env.*.local
/.env.development.local
/.env.test.local
/.env.production.local
.env
.env.local
.env.*.local
.vercel/.env.*.local

# Credenciais e segredos
**/secrets.json
**/*credentials*.json
**/*.pem
**/*.key
**/*-key.json

# Database URLs e configurações sensíveis
.env*
!.env.example
!.env.template

# Vercel
.vercel
.vercel/*
*.vercel

# Build e cache
node_modules/
.next/
*.log

# IDE e OS
.vscode/
.idea/
.DS_Store
Thumbs.db
```

### 3. Migração do Banco PostgreSQL para Neon

**Antes:** PostgreSQL self-hosted em 45.232.21.67:5432
**Depois:** Neon Database (serverless PostgreSQL)

**Benefícios:**
- ✅ Gerenciamento automático de backups
- ✅ Escalabilidade automática
- ✅ Menor latência (região: us-east-1)
- ✅ Segurança aprimorada (conexões SSL)
- ✅ Branch database para desenvolvimento

**Configuração Vercel:**
```bash
DATABASE_URL="postgresql://neondb_owner:***@ep-xxx-pooler.us-east-1.aws.neon.tech/maratona?sslmode=require&channel_binding=require"
```

---

## 🔍 Comparação v1.3.0 vs v1.4.0 vs v1.5.3

### Step5 (Metas) - Evolução

#### v1.3.0 (Funcionava)
```typescript
// Step5Goals.tsx - SEMPRE exigia goalDistance
const handleNext = () => {
  if (!goal || !goalDistance) {
    alert('Selecione um objetivo E uma distância');
    return;
  }
  onUpdate({ primaryGoal: goal, goalDistance, ... });
  onNext();
};
```

#### v1.4.0 (Quebrou)
```typescript
// Step5Goals.tsx - goalDistance OPCIONAL
const handleNext = () => {
  if (!goal) { // ❌ Não valida goalDistance
    alert('Selecione um objetivo');
    return;
  }
  onUpdate({ 
    primaryGoal: goal, 
    goalDistance: goalDistance || undefined // ❌ Pode ser undefined
  });
  onNext();
};
```

#### v1.5.3 (Corrigido)
```typescript
// Step5Goals.tsx - Mantém flexibilidade + valida schema
const handleNext = () => {
  if (!goal) {
    alert('Selecione um objetivo');
    return;
  }
  
  // ✅ Avisa se distância sem data
  if (goalDistance && !targetRaceDate) {
    if (!confirm('Você selecionou distância mas sem data. Continuar?')) {
      return;
    }
  }
  
  onUpdate({ 
    primaryGoal: goal, 
    goalDistance: goalDistance || undefined,
    targetRaceDate: targetRaceDate || undefined,
  });
  onNext();
};
```

**Mudança no Schema:**
```diff
// CustomTrainingPlan agora aceita null
model CustomTrainingPlan {
-  goalDistance   String    // Obrigatório
+  goalDistance   String?   // Opcional
-  targetRaceDate DateTime  // Obrigatório
+  targetRaceDate DateTime? // Opcional
}
```

---

## 📊 Impacto das Mudanças

### Fluxo de Onboarding Agora

```
1. Usuário preenche dados básicos (Steps 1-4)
   ✅ Validações internas funcionam

2. Step5 - Metas
   ├─> Opção A: Seleciona corrida + data
   │   └─> goalDistance + targetRaceDate preenchidos
   │   └─> RaceGoal criada automaticamente
   │   └─> CustomPlan pode ser gerado
   │
   └─> Opção B: Não seleciona corrida
       └─> goalDistance = null (permitido)
       └─> RaceGoal não criada
       └─> CustomPlan NÃO gerado (opcional)

3. Profile criado com sucesso ✅
   └─> Usuário pode adicionar corrida depois
   └─> Dashboard funciona normalmente
```

### Compatibilidade

**Dados Existentes:** ✅ Mantidos
- Perfis com `goalDistance` populado: sem mudanças
- CustomPlans existentes: continuam funcionando

**Novos Usuários:** ✅ Flexibilidade
- Podem completar onboarding sem corrida
- Podem adicionar corrida depois no dashboard

---

## 🔐 Segurança Implementada

### 1. Proteção de Credenciais

**Antes:**
- .gitignore básico
- Risco de commit acidental de .env
- DATABASE_URL exposta no histórico do Git

**Depois:**
- .gitignore robusto com múltiplos padrões
- Exclusão explícita de arquivos sensíveis
- Verificação de padrões de credenciais

### 2. Migração para Neon

**Motivação:**
- Self-hosted PostgreSQL = responsabilidade de segurança
- Credenciais hardcoded = risco GitGuardian
- Backup manual = risco de perda de dados

**Benefícios do Neon:**
```
✅ SSL obrigatório (sslmode=require)
✅ Channel binding (channel_binding=require)
✅ Conexões pooled (pooler)
✅ Isolamento de ambiente
✅ Logs de auditoria
✅ Backup automático point-in-time
```

### 3. Rotação de Credenciais

**Ação Necessária:**
1. ❌ Credenciais antigas (45.232.21.67) devem ser revogadas
2. ✅ Novas credenciais (Neon) configuradas no Vercel
3. ✅ Histórico do Git limpo (credenciais removidas)

---

## 📝 Checklist de Deploy

### Pré-Deploy
- [x] Schema atualizado (goalDistance opcional)
- [x] Migration criada e testada
- [x] .gitignore atualizado
- [x] Documentação completa

### Deploy Vercel
- [ ] Executar migration no Neon:
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Verificar variável DATABASE_URL
- [ ] Testar onboarding completo
- [ ] Verificar criação de perfil sem corrida
- [ ] Verificar criação de perfil COM corrida

### Pós-Deploy
- [ ] Monitorar logs de erro
- [ ] Validar GitGuardian (nenhum alerta)
- [ ] Testar fluxo em produção
- [ ] Documentar lições aprendidas

---

## 🎓 Lições Aprendidas

### 1. Consistência Frontend ↔ Backend
**Problema:** Frontend permitia null, Backend exigia valor
**Solução:** Schemas devem refletir validações de UI
**Prevenção:** Testes end-to-end de onboarding

### 2. Migrations Incrementais
**Problema:** Schema rígido bloqueou evolução do produto
**Solução:** Campos opcionais para flexibilidade
**Prevenção:** Review de schema em PRs

### 3. Segurança desde o Início
**Problema:** .gitignore insuficiente permitiu exposição
**Solução:** .gitignore robusto + Neon gerenciado
**Prevenção:** GitGuardian + Pre-commit hooks

### 4. Documentação em Tempo Real
**Problema:** Mudanças v1.3.0 → v1.4.0 não documentadas
**Solução:** Este documento mantém histórico completo
**Prevenção:** Changelog obrigatório em cada versão

---

## 🔗 Referências

- [MIGRACAO_NEON_07NOV2025.md](./MIGRACAO_NEON_07NOV2025.md)
- [CONTEXTO.md](./CONTEXTO.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Neon Database Docs](https://neon.tech/docs/introduction)

---

## 📌 Próximos Passos

### Curto Prazo
1. Monitorar onboarding em produção
2. Adicionar analytics de conversão
3. Feedback de usuários sobre novo fluxo

### Médio Prazo
1. Implementar testes E2E para onboarding
2. Adicionar validação de schema no CI/CD
3. Criar environment de staging

### Longo Prazo
1. Sistema de "onboarding progressivo"
2. Wizard inteligente com IA
3. Integração Strava no onboarding

---

**Autor:** Sistema de Correção Automatizada
**Revisão:** Manual
**Aprovação:** Pendente teste em produção
