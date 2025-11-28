# 🚨 HOTFIX v3.2.8 - Correção URL Pooling

**Data:** 28/Nov/2025 13:55 UTC  
**Duração Incidente:** ~10 minutos  
**Severidade:** CRÍTICA (sistema fora do ar)  
**Status:** ✅ RESOLVIDO

---

## 🔥 Problema

### Sintoma
```
Can't reach database server at 
ep-hidden-resonance-adhktxy0-pooler.us-east-1.aws.neon.tech:5432
```

Todos os endpoints retornando **500 Internal Server Error**:
- `/api/plan/current`
- `/api/workouts/sync-strava`
- `/api/training-log`
- `/api/subscription/status`

### Causa Raiz
Variável `POSTGRES_PRISMA_URL` no Vercel estava com URL **incompleta** ou **incorreta**.

Faltava sufixos críticos:
- `.c-2` na região
- `&channel_binding=require` no query string

---

## ✅ Solução

### URL Correta (Pooled)
```
postgresql://neondb_owner:*********@ep-hidden-resonance-adhktxy0-pooler.c-2.us-east-1.aws.neon.tech/maratona?sslmode=require&channel_binding=require
```

**Elementos críticos:**
1. `-pooler` no hostname (indica pgBouncer)
2. `.c-2.us-east-1` (região específica)
3. `?sslmode=require` (SSL obrigatório)
4. `&channel_binding=require` (segurança adicional)

### Passos da Correção
1. Acessar Vercel → Settings → Environment Variables
2. Localizar `POSTGRES_PRISMA_URL`
3. Copiar URL pooled **COMPLETA** do Neon Console
4. Colar e salvar
5. Redeploy automático do Vercel
6. ✅ Sistema voltou em ~2 minutos

---

## 📊 Impacto

### Timeline
- **13:45 UTC** - Sistema caiu (primeiras requisições com erro)
- **13:50 UTC** - Problema identificado (URL incorreta)
- **13:53 UTC** - URL corrigida no Vercel
- **13:55 UTC** - Sistema 100% operacional

**Downtime total:** ~10 minutos

### Usuários Afetados
- Todos os usuários (sistema totalmente fora do ar)
- Nenhum dado perdido
- Autenticação continuou funcionando

---

## 🎓 Lições Aprendidas

### O Que Deu Errado
1. **URL copiada manualmente** - possível erro de cópia/cola
2. **Sem validação prévia** - não testamos a URL antes do deploy
3. **Sufixos não óbvios** - `.c-2` e `channel_binding` não eram esperados

### Prevenção Futura

#### 1. Checklist de URL Neon
Sempre verificar que a URL tenha:
- [ ] `-pooler` no hostname (para pooling)
- [ ] `.c-2.us-east-1` (ou região específica)
- [ ] `?sslmode=require` no final
- [ ] `&channel_binding=require` no final

#### 2. Validação Pré-Deploy
Antes de mudanças em variáveis de DB:
```bash
# Testar conexão localmente
psql "POSTGRES_PRISMA_URL_AQUI" -c "SELECT 1"
```

#### 3. Deploy Gradual
Para mudanças críticas de DB:
1. Atualizar variável no Vercel
2. **NÃO** fazer redeploy imediato
3. Testar com preview deploy primeiro
4. Só então fazer deploy em produção

---

## 🔧 Validação Pós-Fix

### Testes Realizados
```
✅ Login funciona
✅ Dashboard carrega
✅ Perfil exibe dados
✅ Planos carregam
✅ Strava sync funciona
✅ Training logs carregam
✅ Subscription status OK
✅ Zero erros 500
```

### Monitoramento
- Logs Vercel: Zero erros desde 13:55 UTC
- Neon Console: Conexões via pgBouncer normais
- Response times: < 100ms (normal)

---

## 📝 Ações Tomadas

### Código
- ❌ Nenhuma mudança de código necessária
- ✅ Problema era apenas configuração

### Variáveis Vercel (Corretas Agora)
```bash
POSTGRES_PRISMA_URL          # ✅ URL pooled COMPLETA
POSTGRES_URL_NON_POOLING     # ✅ URL direct (já estava OK)
DATABASE_URL                  # ✅ Mantida como fallback
```

### Documentação
- ✅ Este arquivo (HOTFIX_v3_2_8_URL_POOLING.md)
- 🔜 Atualizar CHANGELOG.md
- 🔜 Atualizar CONTEXTO.md com nota

---

## 💡 Nota Importante

### Por Que a URL é Tão Específica?

**Neon usa diferentes endpoints:**
1. **Pooled** (com `-pooler`): Para queries da aplicação
2. **Direct** (sem `-pooler`): Para migrations

**Sufixos obrigatórios:**
- `.c-2`: Compute node específico (alta disponibilidade)
- `sslmode=require`: Conexão criptografada obrigatória
- `channel_binding=require`: Previne man-in-the-middle attacks

**Se faltar QUALQUER parte:** Conexão falha!

---

## ✅ Status Final

- **Sistema:** ✅ 100% OPERACIONAL
- **Performance:** ✅ Normal (pooling ativo)
- **Usuários:** ✅ Nenhum impacto permanente
- **Dados:** ✅ Zero perda

**v3.2.8 está estável novamente!**

---

**Registrado em:** 28/Nov/2025 13:58 UTC  
**Incidente:** #001 - URL Pooling Incorreta  
**Resolução:** Manual (configuração Vercel)  
**Próxima ação:** Adicionar validação de URL em CI/CD

