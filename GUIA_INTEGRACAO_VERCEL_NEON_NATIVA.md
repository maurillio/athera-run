# 🔗 Guia: Integração Nativa Vercel-Neon

**Data:** 28 de Novembro de 2025  
**Versão Base:** v3.2.7  
**Objetivo:** Implementar integração nativa entre Vercel e Neon para melhor performance e gestão de ambientes

---

## 📋 O Que é a Integração Nativa?

A integração nativa Vercel-Neon permite:
- ✅ **Connection Pooling automático** via Neon
- ✅ **Database Branches** por ambiente (prod/preview/dev)
- ✅ **Variáveis injetadas automaticamente** no Vercel
- ✅ **Performance otimizada** entre Vercel Edge e Neon
- ✅ **Melhor gerenciamento** de conexões serverless

---

## 🎯 Benefícios Concretos

### Antes (Situação Atual)
```
DATABASE_URL=postgresql://user:pass@host/db
└── Conexão direta (sem pooling otimizado)
└── Mesma URL para todos os ambientes
└── Configuração manual no Vercel
```

### Depois (Com Integração Nativa)
```
POSTGRES_PRISMA_URL=postgresql://...      (Com pooling - usar no Prisma)
POSTGRES_URL_NON_POOLING=postgresql://... (Para migrations)
POSTGRES_URL=postgresql://...              (URL original)
└── Pooling automático otimizado
└── Branch automático por preview deploy
└── Configuração automática no Vercel
```

---

## 🚀 Passo a Passo

### FASE 1: Preparação (5 min)

#### 1.1 Verificar Status Atual
No console do Neon (https://console.neon.tech):
- ✅ Confirmar projeto existe
- ✅ Anotar nome do projeto
- ✅ Verificar database atual funcionando

#### 1.2 Backup de Segurança
```sql
-- Execute no Neon Console SQL Editor
-- Para ter referência dos dados críticos

SELECT 
  (SELECT COUNT(*) FROM "User") as total_users,
  (SELECT COUNT(*) FROM "Profile") as total_profiles,
  (SELECT COUNT(*) FROM "TrainingPlan") as total_plans,
  (SELECT COUNT(*) FROM "StravaProfile") as total_strava;
```

**Salve o resultado antes de prosseguir!**

---

### FASE 2: Ativar Integração no Vercel (3 min)

#### 2.1 Acessar Vercel Dashboard
1. Ir para https://vercel.com/dashboard
2. Selecionar projeto `athera-run`
3. Ir em **Integrations** (menu lateral)

#### 2.2 Instalar Integração Neon
1. Buscar "Neon" nas integrações
2. Clicar em **Add Integration**
3. Selecionar o projeto `athera-run`
4. **Autorizar** conexão com Neon

#### 2.3 Configurar Integração
A integração vai perguntar:
- **Neon Project**: Selecionar seu projeto Neon atual
- **Database**: Selecionar o database em uso (geralmente `neondb`)
- **Create preview branches**: ✅ **Ativar** (importante!)

---

### FASE 3: Verificar Variáveis Criadas (2 min)

#### 3.1 Checar Novas Variáveis
No Vercel → **Settings** → **Environment Variables**

Você deve ver as novas variáveis criadas automaticamente:
```bash
POSTGRES_URL                  # URL original (equivalente à DATABASE_URL)
POSTGRES_PRISMA_URL          # URL com pooling (usar no Prisma)
POSTGRES_URL_NON_POOLING     # URL sem pooling (usar em migrations)

# Variáveis adicionais
POSTGRES_USER                 # Username
POSTGRES_PASSWORD             # Password (sensível)
POSTGRES_DATABASE             # Nome do database
POSTGRES_HOST                 # Host do Neon
```

⚠️ **IMPORTANTE:** As variáveis antigas permanecem intactas!
- `DATABASE_URL` continua existindo
- Não apague nada ainda

---

### FASE 4: Atualizar Código (5 min)

#### 4.1 Atualizar `prisma/schema.prisma`

**ANTES:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**DEPOIS:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

**Explicação:**
- `url`: Usado pelo Prisma Client (queries normais) → **com pooling**
- `directUrl`: Usado para migrations → **sem pooling** (conexão direta)

#### 4.2 Atualizar `lib/db.ts` (Opcional - Melhoria)

**ATUAL:**
```typescript
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'minimal',
})
```

**MELHORADO (com pooling otimizado):**
```typescript
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'minimal',
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
    },
  },
})
```

---

### FASE 5: Deploy e Testes (10 min)

#### 5.1 Commit e Push
```bash
git add prisma/schema.prisma lib/db.ts
git commit -m "feat: integração nativa Vercel-Neon com connection pooling

- Atualizado schema.prisma para usar POSTGRES_PRISMA_URL
- Adicionado directUrl para migrations
- Otimizado lib/db.ts para fallback
- Preparado para database branches por ambiente

Ref: GUIA_INTEGRACAO_VERCEL_NEON_NATIVA.md"

git push origin main
```

#### 5.2 Aguardar Deploy
- Vercel vai fazer build automático (2-3 min)
- **NÃO INTERROMPER** o deploy

#### 5.3 Verificar Build
No Vercel Dashboard:
- ✅ Build deve passar sem erros
- ✅ Deployment deve ser successful
- ✅ Logs devem mostrar conexão normal

#### 5.4 Testar Produção
Acessar https://atherarun.com e validar:

**Checklist de Testes:**
```
✅ Login funciona
✅ Dashboard carrega
✅ Perfil exibe dados
✅ Criar novo treino funciona
✅ Strava sync funciona
✅ Sem erros 500 no console
```

---

### FASE 6: Validação Completa (5 min)

#### 6.1 Verificar Logs Vercel
```bash
# Verificar logs em tempo real
# Vercel Dashboard → Deployments → Latest → Logs

# Procurar por:
✅ "Prisma Client connected"
✅ Query logs (se habilitado)
❌ "Database connection failed"
❌ "Connection timeout"
```

#### 6.2 Verificar Performance
No Neon Console:
- **Monitoring** → Ver conexões ativas
- Deve mostrar:
  - ✅ Conexões via pooling
  - ✅ Response times < 50ms
  - ✅ Zero connection errors

#### 6.3 Query de Validação
Execute no console Neon:
```sql
-- Deve retornar dados normalmente
SELECT 
  u.email,
  p.trainingLevel,
  p.experienceLevel,
  COUNT(tp.id) as total_plans
FROM "User" u
LEFT JOIN "Profile" p ON p.userId = u.id
LEFT JOIN "TrainingPlan" tp ON tp.userId = u.id
GROUP BY u.id, u.email, p.trainingLevel, p.experienceLevel
LIMIT 5;
```

---

## 🎯 Próximos Passos (Futuro)

### 1. Ambiente de Dev Separado (v3.2.8)
Com a integração nativa, criar branch `develop`:
```bash
# No Neon Console:
# Database Branches → Create Branch
# Nome: develop
# Parent: main

# No Vercel:
# Configure branch develop → usar POSTGRES_PRISMA_URL do branch develop
```

### 2. Preview Branches Automáticos
Cada Pull Request vai:
- ✅ Criar database branch temporário no Neon
- ✅ Deploy preview com dados isolados
- ✅ Destruir branch ao fazer merge

### 3. Prisma Accelerate (Opcional)
Se precisar mais performance:
- ✅ Habilitar Prisma Accelerate no Neon
- ✅ Global caching de queries
- ✅ Response times < 10ms

---

## 🔧 Troubleshooting

### Erro: "Can't reach database server"
**Causa:** Variáveis não configuradas corretamente  
**Solução:**
1. Verificar `POSTGRES_PRISMA_URL` existe no Vercel
2. Re-instalar integração Neon se necessário
3. Forçar novo deploy

### Erro: "Migration failed"
**Causa:** `directUrl` não configurada  
**Solução:**
1. Adicionar `directUrl = env("POSTGRES_URL_NON_POOLING")` no schema
2. Rodar `npx prisma generate`
3. Commit e deploy

### Erro: "Too many connections"
**Causa:** Connection pooling não ativado  
**Solução:**
1. Verificar usando `POSTGRES_PRISMA_URL` (não `DATABASE_URL`)
2. Verificar `directUrl` só é usada em migrations
3. Checar logs do Neon para confirmar pooling

---

## 📊 Monitoramento Pós-Integração

### Métricas a Observar (Primeiros 7 dias)

#### No Neon Console
- **Connections**: Deve ser < 10 (com pooling)
- **Query Duration**: Deve ser < 50ms (95th percentile)
- **Errors**: Deve ser 0

#### No Vercel
- **Function Duration**: Deve ser similar ou melhor
- **Cold Starts**: Pode melhorar ligeiramente
- **Errors 500**: Deve ser 0

#### Alertas Configurar
1. Neon: Alert se conexões > 20
2. Vercel: Alert se error rate > 1%
3. Uptime monitoring: https://atherarun.com

---

## 📝 Rollback (Se Necessário)

**Se algo der errado:**

### Rollback Imediato (< 2 min)
```bash
# 1. Reverter schema.prisma
git revert HEAD

# 2. Push
git push origin main

# 3. Vercel vai fazer redeploy automático
```

### Rollback Manual (< 5 min)
```bash
# 1. Editar schema.prisma manualmente
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  # Voltar para DATABASE_URL
}

# 2. Commit e push
git add prisma/schema.prisma
git commit -m "rollback: reverter integração Neon nativa"
git push origin main
```

### Verificar Rollback
- ✅ Build passa
- ✅ Sistema funciona
- ✅ DATABASE_URL continua no Vercel

---

## ✅ Checklist Final

Antes de considerar COMPLETO:

### Pré-Implementação
- [ ] Backup de contadores feito no Neon
- [ ] Variáveis atuais anotadas
- [ ] Time de deploy estimado comunicado

### Implementação
- [ ] Integração Neon instalada no Vercel
- [ ] Variáveis `POSTGRES_*` criadas automaticamente
- [ ] `schema.prisma` atualizado
- [ ] `lib/db.ts` atualizado (opcional)
- [ ] Commit feito com mensagem descritiva

### Pós-Implementação
- [ ] Build passou sem erros
- [ ] Deploy successful
- [ ] Testes de login/dashboard OK
- [ ] Logs sem erros de conexão
- [ ] Performance similar ou melhor
- [ ] Documentação atualizada

### Documentação
- [ ] `CHANGELOG.md` atualizado
- [ ] `CONTEXTO.md` atualizado
- [ ] `README.md` atualizado (se necessário)

---

## 📚 Arquivos a Atualizar Após Conclusão

### Após Deploy Bem-Sucedido

1. **CHANGELOG.md**
```markdown
## [v3.2.8] - DD/MM/2025

### 🔗 Integração Nativa Vercel-Neon

#### Implementado
- Integração nativa Vercel-Neon ativada
- Connection pooling automático via `POSTGRES_PRISMA_URL`
- Direct URL para migrations via `POSTGRES_URL_NON_POOLING`
- Schema Prisma atualizado com `directUrl`
- Preparação para database branches por ambiente

#### Performance
- Conexões otimizadas para serverless
- Response times mantidos ou melhorados
- Zero erros de conexão

#### Arquivos Modificados
- `prisma/schema.prisma` - Adicionado directUrl
- `lib/db.ts` - Otimizado datasources (opcional)
- `GUIA_INTEGRACAO_VERCEL_NEON_NATIVA.md` - Criado

**Ref:** GUIA_INTEGRACAO_VERCEL_NEON_NATIVA.md
```

2. **CONTEXTO.md** (Seção Database)
```markdown
### Database - Neon PostgreSQL

**Conexão:** Integração Nativa Vercel-Neon ✅
- `POSTGRES_PRISMA_URL`: Queries com pooling
- `POSTGRES_URL_NON_POOLING`: Migrations diretas
- Connection pooling automático
- Database branches preparados para dev/preview
```

3. **README.md** (Seção Setup)
```markdown
### Database Configuration

O projeto usa **Neon PostgreSQL** com integração nativa Vercel.

**Variáveis configuradas automaticamente:**
- `POSTGRES_PRISMA_URL` - Queries (com pooling)
- `POSTGRES_URL_NON_POOLING` - Migrations (sem pooling)

Não é necessário configurar manualmente!
```

---

## 🎓 Conceitos Importantes

### Connection Pooling
**O que é:** Reutilização de conexões ao banco para evitar overhead de abrir/fechar conexões a cada query.

**Por que é crítico em Serverless:**
- Vercel Functions são efêmeras (desligam após request)
- Sem pooling: cada request abre nova conexão → lento
- Com pooling: Neon mantém pool permanente → rápido

### Database Branches
**O que é:** Cópias do banco de dados para diferentes ambientes/features.

**Benefícios:**
- Dev/preview isolados de produção
- Testes seguros sem afetar dados reais
- Destruição automática após merge

### Direct URL vs Pooled URL
**Pooled URL (POSTGRES_PRISMA_URL):**
- Passa por connection pooler do Neon
- Ideal para queries da aplicação
- Limite alto de conexões simultâneas

**Direct URL (POSTGRES_URL_NON_POOLING):**
- Conexão direta ao Postgres
- Necessário para migrations (precisam de acesso direto)
- Limite menor de conexões

---

## 🔒 Segurança

### Variáveis Sensíveis
As seguintes variáveis são **CRÍTICAS** e já estão no `.env.local` (ignorado pelo git):
- `POSTGRES_PASSWORD`
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

**NUNCA commitar:**
- URLs completas de conexão
- Passwords
- Tokens de acesso

### Verificar .gitignore
```bash
# Deve conter:
.env*.local
.env
```

---

## 📞 Suporte

### Se algo não funcionar:

1. **Primeiro:** Verificar logs Vercel em tempo real
2. **Segundo:** Checar Neon Console → Monitoring
3. **Terceiro:** Consultar este guia na seção Troubleshooting
4. **Último recurso:** Fazer rollback e documentar erro

### Recursos Úteis
- [Documentação Vercel-Neon](https://vercel.com/integrations/neon)
- [Prisma Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Neon Branches](https://neon.tech/docs/introduction/branching)

---

## ✨ Conclusão

Esta integração é:
- ✅ **Segura** (rollback simples)
- ✅ **Não-destrutiva** (variáveis antigas permanecem)
- ✅ **Reversível** (pode voltar atrás a qualquer momento)
- ✅ **Benéfica** (melhor performance e gestão)

**Tempo total estimado:** 30 minutos  
**Risco:** Baixo (com rollback preparado)  
**Benefício:** Alto (foundation para ambientes separados)

---

**Criado em:** 28/Nov/2025  
**Última atualização:** 28/Nov/2025  
**Status:** 📋 Aguardando execução  
**Próximo passo:** Executar FASE 1 quando estiver pronto

