# 🔧 Integração Neon - Manual (Alternativa)

**Data:** 28/Nov/2025  
**Motivo:** Erro ao conectar via integração automática

---

## ⚠️ Erro Encontrado

```
Connection failed
Failed to set env vars in please make sure that all required env vars are set
env_vars: "[PGHOST PGUSER PGDATABASE PGPASSWORD DATABASE_URL]"
```

**Causa:** Vercel já tem variáveis `PG*` configuradas ou há conflito de permissões.

---

## ✅ Solução: Integração Manual

### Passo 1: Obter Connection String com Pooling (2 min)

1. Ir para **Neon Console**: https://console.neon.tech
2. Selecionar seu projeto `athera-run`
3. Clicar em **Connection Details**
4. **IMPORTANTE:** Selecionar **"Pooled connection"** (não Direct)
5. Copiar a URL completa que aparece

Deve ter este formato:
```
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
```

Note o `pgbouncer=true` na URL - isso indica pooling ativo!

---

### Passo 2: Criar Variáveis no Vercel (3 min)

No Vercel Dashboard → Settings → Environment Variables:

#### 2.1 POSTGRES_PRISMA_URL (com pooling)
- **Name:** `POSTGRES_PRISMA_URL`
- **Value:** Cole a URL **pooled** que você copiou
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### 2.2 POSTGRES_URL_NON_POOLING (sem pooling)
1. Voltar ao Neon Console
2. Mudar para **"Direct connection"** (sem pooling)
3. Copiar a nova URL (NÃO tem `pgbouncer=true`)
4. No Vercel:
   - **Name:** `POSTGRES_URL_NON_POOLING`
   - **Value:** Cole a URL **direct**
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### 2.3 Verificar DATABASE_URL (já existe)
- **NÃO APAGAR** a variável `DATABASE_URL` existente
- Ela continua funcionando como fallback

---

### Passo 3: Atualizar schema.prisma (2 min)

Editar arquivo `prisma/schema.prisma`:

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

---

### Passo 4: Atualizar lib/db.ts (Opcional - Segurança)

Editar `lib/db.ts`:

**Adicionar fallback:**
```typescript
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'minimal',
  datasources: {
    db: {
      // Prioriza POSTGRES_PRISMA_URL, fallback para DATABASE_URL
      url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
    },
  },
})
```

**Por que?** Se algo der errado, continua funcionando com `DATABASE_URL`.

---

### Passo 5: Commit e Deploy (5 min)

```bash
git add prisma/schema.prisma lib/db.ts
git commit -m "feat: integração manual Vercel-Neon com pooling

- Adicionado POSTGRES_PRISMA_URL (pooled connection)
- Adicionado POSTGRES_URL_NON_POOLING (direct para migrations)
- Schema Prisma atualizado com directUrl
- Fallback para DATABASE_URL em lib/db.ts

Ref: INTEGRACAO_NEON_MANUAL.md"

git push origin main
```

---

### Passo 6: Validar Deploy (5 min)

#### 6.1 Aguardar Build
- Vercel vai fazer build (2-3 minutos)
- **NÃO INTERROMPER**

#### 6.2 Verificar Build Passou
No Vercel Dashboard → Deployments → Latest:
- ✅ Status: Ready
- ✅ Build logs sem erros
- ✅ "Deployment Completed"

#### 6.3 Testar Produção
Acessar https://atherarun.com:

**Checklist:**
```
✅ Login funciona
✅ Dashboard carrega
✅ Perfil exibe dados
✅ Strava sync funciona
✅ Sem erros 500 no console
```

---

### Passo 7: Validar Pooling Ativo (5 min)

#### No Neon Console:
1. Ir em **Monitoring** → **Connection Pooling**
2. Deve mostrar conexões ativas via pgBouncer
3. Número de conexões deve ser baixo (2-5)

#### Executar Query de Teste:
No Neon SQL Editor:
```sql
-- Deve retornar dados normalmente
SELECT 
  (SELECT COUNT(*) FROM "User") as users,
  (SELECT COUNT(*) FROM "Profile") as profiles,
  (SELECT COUNT(*) FROM "TrainingPlan") as plans;
```

✅ Se retornar números, está funcionando!

---

## 🔄 Rollback (Se Necessário)

**Se algo der errado:**

```bash
# 1. Reverter mudanças
git revert HEAD

# 2. Push
git push origin main

# 3. No Vercel (se necessário):
# Remover POSTGRES_PRISMA_URL e POSTGRES_URL_NON_POOLING
# Sistema volta a usar DATABASE_URL
```

---

## 🎯 Diferenças: Automático vs Manual

### Integração Automática (Não funcionou)
- ❌ Cria 7+ variáveis automaticamente
- ❌ Pode conflitar com variáveis existentes
- ❌ Menos controle sobre o processo

### Integração Manual (Esta)
- ✅ Cria apenas 2 variáveis necessárias
- ✅ Não conflita com variáveis existentes
- ✅ Total controle e compreensão
- ✅ Mesmo resultado final (pooling ativo)

---

## 📊 Verificar Se Está Funcionando

### Sinais de Sucesso

**No Vercel:**
- Build passa sem erros
- Logs mostram "Prisma Client connected"
- Zero erros 500

**No Neon:**
- Conexões via pooling (pgBouncer)
- Query latency < 50ms
- Zero connection errors

**No Site:**
- Tudo funciona normalmente
- Sem lentidão perceptível
- Possível melhoria de velocidade

---

## ✅ Checklist Final

Antes de considerar completo:

### Preparação
- [ ] Copiou URL pooled do Neon
- [ ] Copiou URL direct do Neon
- [ ] Anotou URLs em lugar seguro

### Configuração Vercel
- [ ] POSTGRES_PRISMA_URL criada
- [ ] POSTGRES_URL_NON_POOLING criada
- [ ] DATABASE_URL mantida (NÃO apagada)
- [ ] Todas nas 3 environments

### Código
- [ ] schema.prisma atualizado
- [ ] lib/db.ts atualizado (opcional)
- [ ] Commit com mensagem descritiva
- [ ] Push para main

### Validação
- [ ] Build passou
- [ ] Deploy successful
- [ ] Site funciona
- [ ] Pooling ativo no Neon
- [ ] Query teste passou

### Documentação
- [ ] CHANGELOG.md atualizado
- [ ] CONTEXTO.md atualizado
- [ ] Este arquivo marcado como EXECUTADO

---

## 🔒 Segurança

### Nunca Commitar
- ❌ POSTGRES_PRISMA_URL completa
- ❌ POSTGRES_URL_NON_POOLING completa
- ❌ Qualquer password
- ❌ Qualquer connection string

### Verificar .gitignore
```bash
# Deve conter:
.env
.env*.local
```

---

## 📝 Atualizar Após Conclusão

### CHANGELOG.md
```markdown
## [v3.2.8] - 28/Nov/2025

### 🔗 Integração Neon com Pooling Manual

#### Implementado
- Connection pooling via POSTGRES_PRISMA_URL
- Direct connection para migrations via POSTGRES_URL_NON_POOLING
- Schema Prisma com directUrl
- Fallback para DATABASE_URL

#### Método
- Integração manual (automática falhou com erro de env vars)
- Variáveis configuradas manualmente no Vercel
- Mesmo resultado final: pooling ativo e otimizado

#### Performance
- Conexões otimizadas via pgBouncer
- Latência reduzida (esperado 20-40%)
- Zero erros de conexão

**Ref:** INTEGRACAO_NEON_MANUAL.md
```

---

## 💡 Dicas

### Se Build Falhar
1. Verificar variáveis existem no Vercel
2. Verificar URLs estão corretas (copiar/colar)
3. Verificar `sslmode=require` está na URL

### Se Sistema Ficar Lento
1. Checar Neon Monitoring
2. Verificar pooling está ativo
3. Confirmar usando POSTGRES_PRISMA_URL (não DATABASE_URL)

### Se Erro 500
1. Logs Vercel → procurar erro específico
2. Verificar Prisma Client regenerado (`npx prisma generate`)
3. Se necessário: rollback

---

## ✨ Conclusão

**Integração manual é:**
- ✅ Mais simples que automática
- ✅ Mesmo resultado (pooling ativo)
- ✅ Mais controle e compreensão
- ✅ Menos propenso a conflitos

**Tempo total:** 15-20 minutos  
**Risco:** Baixo (rollback simples)  
**Benefício:** Performance + foundation para ambientes

---

**Criado em:** 28/Nov/2025  
**Status:** 📋 Pronto para executar  
**Próximo passo:** Seguir Passo 1

