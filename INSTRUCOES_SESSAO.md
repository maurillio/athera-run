# 📋 Instruções de Sessão - Athera Run

**Versão:** v3.2.8 (Connection Pooling Ativo)  
**Atualizado em:** 28/Nov/2025  
**Para usar:** Copie e cole no início de cada nova sessão com IA

---

## 🎯 Contexto do Projeto

### Ambiente de Produção
- **URL:** https://atherarun.com
- **Hospedagem:** Vercel (deploy automático via GitHub)
- **Database:** Neon PostgreSQL + pgBouncer (connection pooling ativo)
- **Ambiente Local:** NÃO USADO (tudo acontece em produção)

### Documentação Essencial
Sempre consulte estes arquivos antes de qualquer mudança:
1. **CONTEXTO.md** - Estado atual completo do sistema
2. **CHANGELOG.md** - Histórico de todas as mudanças (v1.0.0 até atual)
3. **README.md** - Informações gerais e setup
4. **CONFIRMACAO_v3_2_8_POOLING.md** - Última implementação (pooling)

---

## 🔒 Segurança e Credenciais

### Regras Absolutas
❌ **NUNCA** commitar:
- Credenciais completas (passwords, tokens, API keys)
- URLs completas de banco de dados
- Secrets de qualquer tipo
- Arquivos `.env` ou `.env.local`

✅ **SEMPRE** proteger:
- Variáveis sensíveis no `.gitignore`
- Configurações críticas apenas no Vercel
- Passwords mascarados em documentação (`******`)

### Variáveis de Ambiente
- **Localização:** Vercel Dashboard → Settings → Environment Variables
- **NÃO estão no código** (apenas referências como `env("DATABASE_URL")`)
- **Mudanças:** Sempre adicionar/editar diretamente no Vercel
- **Documentar:** Mencionar nome da variável (sem valor) quando criar/modificar

---

## 📝 Documentação Obrigatória

### Após QUALQUER mudança, atualizar:

#### 1. CHANGELOG.md
```markdown
## [vX.X.X] - DD/MM/YYYY

### 🔧 Tipo de Mudança (Fix/Feature/Refactor)

**Descrição clara do que foi feito**

#### Implementado
- Item 1
- Item 2

#### Arquivos Modificados
- arquivo1.ts
- arquivo2.tsx

**Status:** ✅ TESTADO/VALIDADO
```

#### 2. CONTEXTO.md
Atualizar seção relevante:
- Versão atual
- Status do sistema
- Mudanças em arquitetura
- Novos fluxos/integrações

#### 3. README.md (se aplicável)
- Versão e data
- Próximos passos
- Instruções de setup (se mudou)

---

## 🎯 Metodologia de Trabalho

### Princípios

1. **Poucas Mudanças por Vez**
   - Máximo 2-3 arquivos por commit
   - Mudanças cirúrgicas e precisas
   - Foco em uma funcionalidade por vez

2. **Documentação Primeiro**
   - Entender contexto ANTES de modificar
   - Documentar DURANTE a implementação
   - Validar documentação APÓS conclusão

3. **Nunca Dizer "Perfeito" ou "Completo"**
   - Sempre há melhorias possíveis
   - Revisar criticamente cada mudança
   - Mencionar limitações conhecidas

4. **Testes em Produção**
   - Sistema roda 100% no Vercel
   - Validar após cada deploy
   - Rollback preparado sempre

---

## 🗄️ Mudanças no Banco de Dados

### Processo Obrigatório

Quando migrations são necessárias:

#### 1. Criar Query SQL Manual
```sql
-- MIGRATION: [Nome descritivo]
-- Data: DD/MM/YYYY
-- Versão: vX.X.X
-- Descrição: O que esta migration faz

-- Verificação (executar ANTES da migration)
SELECT COUNT(*) FROM tabela_afetada;

-- Migration (executar COM CUIDADO)
ALTER TABLE tabela ADD COLUMN nova_coluna VARCHAR(255);

-- Validação (executar APÓS a migration)
SELECT * FROM tabela LIMIT 5;

-- Rollback (se necessário)
ALTER TABLE tabela DROP COLUMN nova_coluna;
```

#### 2. Entregar ao Usuário
- Arquivo `.sql` separado
- Instruções claras de execução
- Queries de validação incluídas
- Rollback preparado

#### 3. Usuário Executa Manualmente
- Via Neon Console SQL Editor
- Usuário tem controle total
- Pode verificar antes de aplicar

**NUNCA executar migrations automaticamente!**

---

## 🔄 Workflow de Deploy

### Processo Padrão

1. **Mudanças Locais**
   ```bash
   # Editar arquivos
   git add arquivo1.ts arquivo2.tsx
   git commit -m "tipo: descrição clara"
   ```

2. **Atualizar Documentação**
   ```bash
   git add CHANGELOG.md CONTEXTO.md README.md
   git commit -m "docs: vX.X.X implementação completa"
   ```

3. **Push para Produção**
   ```bash
   git push origin main
   # Vercel faz deploy automático (2-3 min)
   ```

4. **Validar Produção**
   - Acessar https://atherarun.com
   - Testar funcionalidade alterada
   - Verificar logs no Vercel
   - Confirmar zero erros

---

## 📊 Checklist de Sessão

Antes de começar qualquer trabalho:

### Leitura Obrigatória
- [ ] Li CONTEXTO.md (versão e status atual)
- [ ] Li CHANGELOG.md (últimas 3 versões)
- [ ] Entendi o que foi feito recentemente
- [ ] Sei qual é a versão atual (v3.2.8)

### Planejamento
- [ ] Entendi o que precisa ser feito
- [ ] Identifiquei arquivos que serão modificados
- [ ] Verifiquei se há migrations necessárias
- [ ] Preparei documentação que será atualizada

### Durante Implementação
- [ ] Mudanças mínimas e cirúrgicas
- [ ] Comentários apenas onde necessário
- [ ] Testei mentalmente o impacto
- [ ] Documentei enquanto fazia

### Após Conclusão
- [ ] CHANGELOG.md atualizado
- [ ] CONTEXTO.md atualizado
- [ ] README.md atualizado (se aplicável)
- [ ] Commit com mensagem descritiva
- [ ] Push para main
- [ ] Aguardei build (2-3 min)
- [ ] Validei em produção

---

## 🚨 Avisos Importantes

### Sobre o Sistema Atual (v3.2.8)

**✅ O que está funcionando:**
- Connection pooling ativo (pgBouncer)
- Performance otimizada (70% mais rápido)
- Zero erros em produção
- Todas features operacionais

**⚠️ Nunca mexer sem entender:**
- `prisma/schema.prisma` - Afeta toda estrutura do banco
- `lib/db.ts` - Conexão com database
- `middleware.ts` - Afeta autenticação
- Variáveis `POSTGRES_*` no Vercel

**🔄 Rollback sempre disponível:**
```bash
git revert HEAD
git push origin main
# Sistema volta à versão anterior em 3 minutos
```

---

## 📞 Em Caso de Dúvida

### Ordem de Consulta

1. **CONTEXTO.md** - Provavelmente tem a resposta
2. **CHANGELOG.md** - Ver como foi feito antes
3. **Arquivos relacionados** - Ler código existente
4. **Perguntar ao usuário** - Se ainda não souber

### Nunca Assumir

- ❌ "Deve funcionar assim"
- ❌ "Provavelmente está configurado"
- ❌ "Geralmente se faz desse jeito"

✅ **Sempre verificar e confirmar**

---

## 🎯 Objetivos de Cada Sessão

### Entregar

1. **Funcionalidade** - Que funciona 100%
2. **Documentação** - Completa e atualizada
3. **Testes** - Validados em produção
4. **Rollback** - Preparado se necessário

### NÃO Entregar

- ❌ Código "quase" funcionando
- ❌ Documentação incompleta
- ❌ Mudanças não testadas
- ❌ Features "parcialmente prontas"

---

## ✨ Filosofia do Projeto

> "Poucas mudanças cirúrgicas, muito bem documentadas, sempre validadas."

**Qualidade > Quantidade**  
**Clareza > Complexidade**  
**Documentação > Código**

---

## 📋 Template de Início de Sessão

Copie e cole para cada nova sessão:

```markdown
# Nova Sessão - [Data]

## Contexto Lido
- [x] CONTEXTO.md v3.2.8
- [x] CHANGELOG.md últimas versões
- [x] Entendi status atual

## Objetivo da Sessão
[Descrever em 1-2 linhas o que será feito]

## Arquivos que Serão Modificados
- arquivo1.ts
- arquivo2.tsx

## Documentação que Será Atualizada
- CHANGELOG.md (vX.X.X)
- CONTEXTO.md (seção Y)

## Migrations Necessárias
- [ ] Nenhuma
- [ ] Sim: [descrever]

## Rollback Preparado
- [ ] Sim, via git revert

---

Vamos começar!
```

---

**Criado em:** 28/Nov/2025  
**Versão:** 1.0  
**Uso:** Início de toda sessão com IA  
**Manter atualizado:** Sim, sempre que workflow mudar

