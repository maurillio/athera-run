# 🚀 PLANO DE EXECUÇÃO COMPLETO - OPÇÃO A (6 horas)

## OBJETIVO
Corrigir TODOS os problemas identificados e deixar o sistema 100% funcional

## PROBLEMAS IDENTIFICADOS

### 🔴 CRÍTICOS (Bloqueia uso)
1. **Interpolação não funciona** - `{name}` aparece no lugar do nome
2. **Keys expostas** - `phases.Base Aeróbica` aparece no lugar da tradução
3. **Build Vercel quebrado** - Deploy não completa

### 🟡 ALTOS (Afeta UX)
4. **Datas em inglês** - `Tuesday, 4 de November` em vez de português
5. **Rotas inconsistentes** - `/tracking` funciona mas `/pt-BR/tracking` não
6. **OAuth com erro** - Coluna locale não existe no banco

### 🟢 MÉDIOS (Warnings)
7. **Dynamic server warnings** - APIs não marcadas como dinâmicas

## FASES DE EXECUÇÃO

### ✅ FASE 1: DIAGNÓSTICO COMPLETO (15min)
- [x] Mapear todos os problemas
- [x] Identificar causa raiz
- [x] Criar plano de ação

### 🔧 FASE 2: FIX BUILD VERCEL (45min)
- [ ] 2.1 Verificar e limpar .env duplicados
- [ ] 2.2 Adicionar path explícito do Prisma no vercel.json
- [ ] 2.3 Configurar .vercelignore corretamente  
- [ ] 2.4 Testar build local
- [ ] 2.5 Commit e verificar build Vercel

**Arquivos:**
- `vercel.json`
- `.vercelignore`

### 🔧 FASE 3: FIX INTERPOLAÇÃO (60min)
- [ ] 3.1 Verificar hook useTranslations (interpolação já existe!)
- [ ] 3.2 Identificar componentes que usam interpolação
- [ ] 3.3 Corrigir chamadas incorretas do tipo t('key', { var })
- [ ] 3.4 Padronizar uso de {{var}} nas traduções
- [ ] 3.5 Testar todas as páginas afetadas

**Páginas afetadas:**
- Dashboard: greeting/welcome
- Plano: workout details, phase names
- Tracking: stats

### 🔧 FASE 4: FIX KEYS EXPOSTAS (45min)
- [ ] 4.1 Buscar todas as ocorrências de "phases."
- [ ] 4.2 Buscar todas as ocorrências de "PHASES."
- [ ] 4.3 Corrigir referências de tradução
- [ ] 4.4 Validar JSON de traduções
- [ ] 4.5 Testar páginas do plano

**Arquivos:**
- Components do plano
- Traduções JSON (pt-BR, en, es)

### 🔧 FASE 5: FIX DATAS (30min)
- [ ] 5.1 Verificar função formatLocalizedDate
- [ ] 5.2 Garantir uso correto do dayjs.locale()
- [ ] 5.3 Criar helper para formatação consistente
- [ ] 5.4 Aplicar em todas as páginas
- [ ] 5.5 Testar com todos os locales

**Arquivos:**
- `lib/i18n/date-utils.ts` (criar se não existir)
- Components que mostram datas

### 🔧 FASE 6: FIX ROTAS (60min)
- [ ] 6.1 Auditar estrutura de rotas app/
- [ ] 6.2 Identificar rotas sem [locale]
- [ ] 6.3 Migrar rotas faltantes
- [ ] 6.4 Atualizar middleware com TODAS as rotas
- [ ] 6.5 Remover rotas duplicadas (se houver)
- [ ] 6.6 Testar navegação em todos os idiomas

**Rotas a verificar:**
- /tracking
- /training  
- /calculator
- /chat
- /subscription
- /nutrition
- /prevention
- /glossary
- /overtraining
- /pricing
- /admin

### 🔧 FASE 7: FIX OAUTH (30min)
- [ ] 7.1 Verificar schema.prisma (já tem locale!)
- [ ] 7.2 Verificar migration aplicada
- [ ] 7.3 Se necessário, aplicar migration manualmente
- [ ] 7.4 Testar login com Google
- [ ] 7.5 Verificar persistência do locale

### 🔧 FASE 8: FIX WARNINGS (15min)
- [ ] 8.1 Adicionar `export const dynamic = 'force-dynamic'` nas APIs:
  - /api/admin/users
  - /api/profile/auto-adjust-settings
  - /api/profile/medical
  - /api/subscription/status
- [ ] 8.2 Verificar build warnings desaparecem

### 🔧 FASE 9: AUDITORIA FINAL (60min)
- [ ] 9.1 Teste completo de todas as páginas (3 idiomas)
- [ ] 9.2 Verificar interpolação funcionando
- [ ] 9.3 Verificar datas em português/inglês/espanhol
- [ ] 9.4 Verificar todas as rotas com [locale]
- [ ] 9.5 Verificar OAuth Google
- [ ] 9.6 Verificar build Vercel OK
- [ ] 9.7 Deploy e teste em produção

### 📝 FASE 10: DOCUMENTAÇÃO (30min)
- [ ] 10.1 Atualizar CONTEXTO.md
- [ ] 10.2 Atualizar DOCUMENTACAO.md
- [ ] 10.3 Criar AUDITORIA_06NOV2025.md
- [ ] 10.4 Atualizar version para v1.5.2
- [ ] 10.5 Commit final com documentação

## CHECKLIST DE VALIDAÇÃO

### Build & Deploy
- [ ] Build local sem erros
- [ ] Build Vercel sem erros
- [ ] Deploy completo com sucesso
- [ ] Nenhum warning crítico

### Funcionalidade
- [ ] Interpolação funcionando (nomes, números)
- [ ] Traduções carregando corretamente
- [ ] Datas formatadas no idioma correto
- [ ] Todas as rotas funcionando com [locale]
- [ ] Google OAuth funcionando
- [ ] Migration do locale aplicada

### Qualidade
- [ ] Nenhuma key de tradução exposta
- [ ] Formatação consistente em todas as páginas
- [ ] 3 idiomas testados (pt-BR, en, es)
- [ ] Navegação fluida entre idiomas

## TEMPO ESTIMADO POR FASE

| Fase | Descrição | Tempo |
|------|-----------|-------|
| 1 | Diagnóstico | ✅ 15min |
| 2 | Build Vercel | 45min |
| 3 | Interpolação | 60min |
| 4 | Keys Expostas | 45min |
| 5 | Datas | 30min |
| 6 | Rotas | 60min |
| 7 | OAuth | 30min |
| 8 | Warnings | 15min |
| 9 | Auditoria | 60min |
| 10 | Documentação | 30min |
| **TOTAL** | | **6h 30min** |

## ESTRATÉGIA DE EXECUÇÃO

1. **Trabalhar em ordem de prioridade** (Crítico → Alto → Médio)
2. **Commit após cada fase** (facilita rollback se necessário)
3. **Testar após cada correção** (não acumular problemas)
4. **Documentar mudanças** (manter contexto atualizado)
5. **Deploy incremental** (validar em produção após cada fase)

## PRÓXIMOS PASSOS IMEDIATOS

🚀 **COMEÇAR FASE 2: FIX BUILD VERCEL**

