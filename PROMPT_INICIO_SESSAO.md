# 🚀 PROMPT DE INÍCIO DE SESSÃO

**Versão:** v3.2.8  
**Copiar e colar no início de cada sessão com IA**

---

## 📋 Contexto do Projeto Athera Run

### Ambiente de Produção
- **Sistema em produção:** https://atherarun.com
- **Hospedagem:** Vercel (deploy automático via GitHub main branch)
- **Database:** Neon PostgreSQL + pgBouncer (connection pooling ativo)
- **Versão atual:** v3.2.8 - Connection Pooling Implementado
- **Ambiente local:** NÃO USADO - tudo acontece em produção no Vercel

### Documentação Essencial
**Leia SEMPRE antes de qualquer mudança:**
1. `CONTEXTO.md` - Estado completo do sistema (versão, features, arquitetura)
2. `CHANGELOG.md` - Histórico detalhado de mudanças (v1.0 até atual)
3. `README.md` - Overview e informações gerais
4. `CONFIRMACAO_v3_2_8_POOLING.md` - Última implementação concluída

---

## 🔒 Segurança e Credenciais

### Regras CRÍTICAS
❌ **NUNCA commitar:**
- Credenciais completas (passwords, tokens, API keys)
- URLs de banco com credenciais visíveis
- Secrets ou chaves privadas
- Arquivos `.env`, `.env.local` ou similares

✅ **Variáveis de ambiente:**
- **Localização:** Vercel Dashboard → Settings → Environment Variables
- **Modificações:** Adicionar/editar SEMPRE diretamente no Vercel
- **Documentação:** Mencionar apenas nome da variável (sem valor real)
- **Proteção:** Todas variáveis sensíveis no `.gitignore`

---

## 📝 Documentação OBRIGATÓRIA

**Após QUALQUER mudança, atualizar:**

### 1. CHANGELOG.md
- Adicionar nova versão com data
- Tipo de mudança (Fix/Feature/Refactor/Hotfix)
- Lista de implementações
- Arquivos modificados
- Status de validação

### 2. CONTEXTO.md
- Atualizar versão e data
- Mudanças em arquitetura
- Novos fluxos ou integrações
- Status de features

### 3. README.md (se aplicável)
- Versão e última atualização
- Mudanças em setup/instalação

---

## 🎯 Metodologia de Trabalho

### Princípios Fundamentais

1. **Mudanças Cirúrgicas e Mínimas**
   - Máximo 2-3 arquivos por commit
   - Foco em uma funcionalidade por vez
   - Evitar refatorações desnecessárias

2. **Documentar TUDO**
   - Nenhuma mudança sem documentação
   - Contexto preservado para futuras sessões
   - Rastreabilidade total

3. **Nunca Assumir Perfeição**
   - Sempre revisar criticamente
   - Mencionar limitações conhecidas
   - Nunca dizer "está perfeito" ou "100% completo"

4. **Validação em Produção**
   - Sistema roda 100% no Vercel
   - Testar após cada deploy
   - Rollback sempre preparado

---

## 🗄️ Migrations de Banco de Dados

### Processo OBRIGATÓRIO

**Quando migrations forem necessárias:**

1. **Criar arquivo SQL separado**
   - Nome descritivo: `MIGRATION_[funcionalidade]_vX.X.X.sql`
   - Incluir queries de validação ANTES e DEPOIS
   - Incluir query de rollback

2. **Estrutura do arquivo SQL:**
```sql
-- MIGRATION: [Nome Descritivo]
-- Data: DD/MM/YYYY
-- Versão: vX.X.X
-- Descrição: [O que esta migration faz]

-- 1. VERIFICAÇÃO PRÉ-MIGRATION (executar ANTES)
SELECT COUNT(*) FROM tabela_afetada;

-- 2. MIGRATION (executar COM CUIDADO)
ALTER TABLE tabela ADD COLUMN nova_coluna VARCHAR(255);

-- 3. VALIDAÇÃO PÓS-MIGRATION (executar APÓS)
SELECT * FROM tabela LIMIT 5;

-- 4. ROLLBACK (se necessário)
ALTER TABLE tabela DROP COLUMN nova_coluna;
```

3. **Entregar ao usuário**
   - Arquivo `.sql` pronto para executar
   - Instruções claras passo a passo
   - Usuário executa manualmente no Neon Console

**⚠️ NUNCA executar migrations automaticamente via código!**

---

## 🔄 Workflow de Desenvolvimento

### Processo Padrão

1. **Entender contexto** (ler documentação)
2. **Planejar mudanças** (arquivos, impacto)
3. **Implementar** (mudanças mínimas)
4. **Testar mentalmente** (simular fluxo)
5. **Documentar** (atualizar CHANGELOG, CONTEXTO)
6. **Commit** (mensagem descritiva)
7. **Push** (deploy automático Vercel)
8. **Validar** (testar em atherarun.com)

### Formato de Commits
```bash
tipo: descrição curta e clara

- Mudança 1
- Mudança 2

Ref: ARQUIVO_DOCUMENTACAO.md
```

**Tipos:** `feat`, `fix`, `docs`, `refactor`, `hotfix`, `chore`

---

## ✅ Checklist de Sessão

**Antes de começar:**
- [ ] Li `CONTEXTO.md` (versão atual v3.2.8)
- [ ] Li `CHANGELOG.md` (últimas 3 versões)
- [ ] Entendi o que precisa ser feito
- [ ] Identifiquei arquivos a modificar
- [ ] Verifiquei se migrations são necessárias

**Durante implementação:**
- [ ] Mudanças cirúrgicas e mínimas
- [ ] Documentando enquanto codifico
- [ ] Testando fluxo mentalmente

**Após implementação:**
- [ ] `CHANGELOG.md` atualizado
- [ ] `CONTEXTO.md` atualizado
- [ ] `README.md` atualizado (se necessário)
- [ ] Commit com mensagem descritiva
- [ ] Push para main
- [ ] Aguardei deploy Vercel (2-3 min)
- [ ] Validei em https://atherarun.com

---

## 🚨 Avisos Importantes

### Status Atual do Sistema (v3.2.8)

**✅ Funcionando:**
- Connection pooling ativo (pgBouncer)
- Performance 70% melhor que v3.2.7
- Zero erros em produção
- Todas features operacionais

**⚠️ Arquivos críticos (cuidado extra):**
- `prisma/schema.prisma` - Estrutura do banco
- `lib/db.ts` - Conexão database
- `middleware.ts` - Autenticação
- Variáveis `POSTGRES_*` no Vercel

**🔄 Rollback disponível:**
```bash
git revert HEAD
git push origin main
# Sistema volta em ~3 minutos
```

---

## 🎯 Objetivo de Cada Sessão

### Sempre entregar:
1. ✅ Funcionalidade que funciona 100%
2. ✅ Documentação completa e atualizada
3. ✅ Código testado em produção
4. ✅ Rollback preparado

### NUNCA entregar:
1. ❌ Código "quase funcionando"
2. ❌ Documentação incompleta
3. ❌ Mudanças não testadas
4. ❌ Features parcialmente implementadas

---

## 💬 Como Responder ao Usuário

### Boas práticas:
- ✅ Ser direto e conciso
- ✅ Explicar o que está fazendo
- ✅ Mencionar impactos e riscos
- ✅ Oferecer opções quando aplicável
- ✅ Confirmar entendimento antes de executar

### Evitar:
- ❌ Assumir coisas não documentadas
- ❌ Dizer "está perfeito" ou "100% completo"
- ❌ Fazer mudanças sem explicar
- ❌ Omitir limitações conhecidas

---

## 📋 Template para Iniciar

```markdown
# Sessão [Data]

## Contexto Verificado
- [x] CONTEXTO.md v3.2.8 lido
- [x] CHANGELOG.md revisado
- [x] Status atual compreendido

## Objetivo
[Descrever em 1-2 linhas]

## Arquivos que Serão Modificados
- `arquivo1.ts`
- `arquivo2.tsx`

## Documentação que Será Atualizada
- CHANGELOG.md (vX.X.X)
- CONTEXTO.md (seção relevante)

## Migrations Necessárias
- [ ] Nenhuma
- [ ] Sim: [descrever e criar arquivo SQL]

## Rollback Preparado
- [ ] Sim, via `git revert`

---
Pronto para começar!
```

---

## ✨ Filosofia do Projeto

> **"Poucas mudanças cirúrgicas, muito bem documentadas, sempre validadas."**

**Qualidade > Quantidade**  
**Clareza > Complexidade**  
**Documentação > Código**  
**Segurança > Velocidade**

---

**Arquivo criado em:** 28/Nov/2025  
**Para uso em:** Início de toda sessão com IA  
**Versão do sistema:** v3.2.8 - Connection Pooling Ativo  
**Manter sincronizado com:** CONTEXTO.md e CHANGELOG.md

