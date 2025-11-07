# ✅ CHECKLIST MASTER - CONVERGÊNCIA TOTAL

**Início:** 07/Nov/2025 16:25 UTC  
**Versão:** 1.5.5 → 1.6.0  
**Objetivo:** 100% Convergência Onboarding → Perfil → Planos  
**Tempo Total:** 22-28 horas (3-4 dias)

---

## 📊 PROGRESSO GERAL

```
FASE 1: Correções Críticas     [X] 3/5  (12-14h) ████████████░░ 60%
FASE 2: Geração de Planos       [ ] 0/3  (4-6h)
FASE 3: Testes e Validação      [ ] 0/3  (6-8h)

TOTAL: [X] 3/11 sprints completados (27%)
```

---

## 🚀 FASE 1: CORREÇÕES CRÍTICAS (12-14h)

### Sprint 1.1: PerformanceTab Completo ✅ CONCLUÍDO
**Status:** [X] CONCLUÍDO  
**Tempo:** 3 horas  
**Prioridade:** 🔴 CRÍTICA

**Checklist:**
- [X] Backup do arquivo original
- [X] Adicionar estados de experiência (runningLevel, years, km, etc)
- [X] Criar seção "Experiência de Corrida"
- [X] Manter seção "Melhores Tempos" existente
- [X] Atualizar handleSave
- [X] Adicionar traduções pt-BR
- [X] Adicionar traduções en
- [X] Adicionar traduções es
- [X] Build passa sem erros
- [X] Testar carregamento de dados
- [X] Testar salvamento
- [X] Validar que todos campos aparecem
- [X] Commit: "feat(profile): expand PerformanceTab with experience data"
- [X] Push para main

**Arquivos modificados:**
- `/components/profile/v1.3.0/PerformanceTab.tsx`
- `/lib/i18n/translations/pt-BR.json`
- `/lib/i18n/translations/en.json`
- `/lib/i18n/translations/es.json`

**Resultado:** ✅ PerformanceTab agora mostra 100% dos dados de experiência!

---

### Sprint 1.2: Coletar longRunDay no Onboarding ✅ CONCLUÍDO
**Status:** [X] CONCLUÍDO  
**Tempo:** 2 horas  
**Prioridade:** 🔴 CRÍTICA

**Checklist:**
- [X] Backup do Step6Availability.tsx
- [X] Adicionar estado longRunDay
- [X] Adicionar campo select após dias de corrida
- [X] Validar: só mostrar dias disponíveis
- [X] Incluir no onUpdate
- [X] Adicionar no handleNext
- [X] Adicionar traduções (pt-BR, en, es)
- [X] Build passa
- [X] Testar seleção de dia
- [X] Testar salvamento no banco
- [X] Validar que campo longRunDay foi salvo
- [X] Commit: "feat(onboarding): add long run day selection in Step 6"
- [X] Push para main

**Arquivos modificados:**
- `/components/onboarding/v1.3.0/Step6Availability.tsx`
- `/app/[locale]/onboarding/page.tsx` (verificar mapeamento)
- `/lib/i18n/translations/*.json`

**Resultado:** ✅ Usuário agora pode escolher dia do longão no onboarding!

---

### Sprint 1.3: AvailabilityTab Melhorado ⏳ PRÓXIMO
**Status:** [ ] AGUARDANDO Sprint 1.2 ✅  
**Tempo:** 3 horas  
**Prioridade:** 🔴 CRÍTICA

**Checklist:**
- [ ] Backup do AvailabilityTab.tsx
- [ ] Adicionar resumo visual no topo
- [ ] Mostrar dias de corrida claramente
- [ ] Mostrar dia do longão (se existir)
- [ ] Mostrar outras atividades (gym, yoga, etc)
- [ ] Adicionar cards de infraestrutura (gym/pool/track)
- [ ] Aplicar estilos visuais
- [ ] Build passa
- [ ] Testar visualização com diferentes configs
- [ ] Testar que longRunDay aparece
- [ ] Testar edição de infraestrutura
- [ ] Commit: "feat(profile): improve AvailabilityTab with visual summary"
- [ ] Push para main

**Arquivos modificados:**
- `/components/profile/v1.3.0/AvailabilityTab.tsx`

---

### Sprint 1.4: PreferencesTab com Idioma ⏳ PRÓXIMO
**Status:** [ ] AGUARDANDO Sprint 1.3 ✅  
**Tempo:** 2 horas  
**Prioridade:** 🟠 ALTA

**Checklist:**
- [ ] Backup do PreferencesTab.tsx
- [ ] Adicionar estado locale
- [ ] Adicionar select de idioma (pt-BR, en, es)
- [ ] Adicionar select de unidades (metric/imperial)
- [ ] Criar API /api/user/preferences
- [ ] Implementar atualização de User.locale
- [ ] Redirecionar para novo locale
- [ ] Build passa
- [ ] Testar mudança de idioma
- [ ] Verificar que interface muda
- [ ] Testar persistência
- [ ] Commit: "feat(profile): add language selection in PreferencesTab"
- [ ] Push para main

**Arquivos modificados:**
- `/components/profile/v1.3.0/PreferencesTab.tsx`
- `/app/api/user/preferences/route.ts` (NOVO)

---

### Sprint 1.5: Step7Review Completo
**Status:** [ ] AGUARDANDO Sprint 1.4  
**Tempo:** 2 horas  
**Prioridade:** 🟠 ALTA

**Checklist:**
- [ ] Backup do Step7Review.tsx
- [ ] Adicionar seção "Experiência Completa"
- [ ] Adicionar seção "Melhores Tempos"
- [ ] Adicionar seção "Disponibilidade" (com longão)
- [ ] Adicionar seção "Infraestrutura"
- [ ] Melhorar formatação visual
- [ ] Build passa
- [ ] Testar que mostra 100% dos dados
- [ ] Testar navegação entre steps
- [ ] Validar que tudo está correto
- [ ] Commit: "feat(onboarding): complete Step 7 Review with all data"
- [ ] Push para main

**Arquivos modificados:**
- `/components/onboarding/v1.3.0/Step7Review.tsx`

---

## 🎯 FASE 2: GERAÇÃO DE PLANOS (4-6h)

### Sprint 2.1: Auditoria do Gerador
**Status:** [ ] AGUARDANDO FASE 1  
**Tempo:** 2 horas  
**Prioridade:** 🟠 ALTA

**Checklist:**
- [ ] Ler código completo de /api/plan/generate/route.ts
- [ ] Documentar campos que USA
- [ ] Documentar campos que NÃO USA
- [ ] Verificar uso de longRunDay
- [ ] Verificar uso de hasGymAccess
- [ ] Verificar uso de hasPoolAccess
- [ ] Verificar uso de hasTrackAccess
- [ ] Verificar uso de injuryDetails
- [ ] Criar documento AUDITORIA_GERADOR.md
- [ ] Identificar gaps de utilização
- [ ] Commit: "docs: audit plan generator data usage"
- [ ] Push para main

**Arquivos criados:**
- `/docs/AUDITORIA_GERADOR.md`

---

### Sprint 2.2: Garantir Uso de longRunDay
**Status:** [ ] AGUARDANDO Sprint 2.1  
**Tempo:** 2 horas  
**Prioridade:** 🔴 CRÍTICA

**Checklist:**
- [ ] Backup de route.ts
- [ ] Adicionar longRunDay no planConfig
- [ ] Incluir no prompt para IA
- [ ] Helper getDayName(dayIndex)
- [ ] Garantir default (domingo se null)
- [ ] Build passa
- [ ] Testar geração com longRunDay definido
- [ ] Validar que plano respeita dia escolhido
- [ ] Verificar nos workout days
- [ ] Commit: "feat(plan): use longRunDay in plan generation"
- [ ] Push para main

**Arquivos modificados:**
- `/app/api/plan/generate/route.ts`

---

### Sprint 2.3: Usar Infraestrutura na Geração
**Status:** [ ] AGUARDANDO Sprint 2.2  
**Tempo:** 2 horas  
**Prioridade:** 🟡 MÉDIA

**Checklist:**
- [ ] Adicionar infrastructure no planConfig
- [ ] Incluir gym/pool/track no prompt
- [ ] Adaptar geração para incluir cross-training
- [ ] Build passa
- [ ] Testar com gym=true
- [ ] Testar com pool=true
- [ ] Testar com track=true
- [ ] Validar que plano inclui atividades adequadas
- [ ] Commit: "feat(plan): use infrastructure in generation"
- [ ] Push para main

**Arquivos modificados:**
- `/app/api/plan/generate/route.ts`

---

## ✅ FASE 3: TESTES E VALIDAÇÃO (6-8h)

### Sprint 3.1: Testes End-to-End
**Status:** [ ] AGUARDANDO FASE 2  
**Tempo:** 4 horas  
**Prioridade:** 🔴 CRÍTICA

**Checklist:**
- [ ] Criar conta de teste
- [ ] Completar onboarding 100%
- [ ] Validar que perfil mostra TUDO
- [ ] Gerar plano
- [ ] Validar que plano usa todos dados
- [ ] Testar edição no PerformanceTab
- [ ] Testar edição no AvailabilityTab
- [ ] Testar mudança de idioma
- [ ] Verificar auto-ajuste detecta mudanças
- [ ] Testar em navegadores diferentes
- [ ] Documentar bugs encontrados
- [ ] Corrigir bugs críticos
- [ ] Commit: "test: complete E2E validation"
- [ ] Push para main

**Cenários de teste:**
- Novo usuário completo
- Edição de dados existentes
- Mudança de idioma
- Geração de plano
- Auto-ajuste

---

### Sprint 3.2: Testes de Regressão
**Status:** [ ] AGUARDANDO Sprint 3.1  
**Tempo:** 2 horas  
**Prioridade:** 🟠 ALTA

**Checklist:**
- [ ] Login funciona
- [ ] Signup funciona
- [ ] Dashboard carrega
- [ ] Planos existentes não quebram
- [ ] Strava sync funciona
- [ ] Race goals funcionam
- [ ] Tracking funciona
- [ ] Nutrition funciona
- [ ] All pages carregam
- [ ] Build production passa
- [ ] Commit: "test: regression validation passed"
- [ ] Push para main

---

### Sprint 3.3: Documentação Final
**Status:** [ ] AGUARDANDO Sprint 3.2  
**Tempo:** 2 horas  
**Prioridade:** 🟡 MÉDIA

**Checklist:**
- [ ] Atualizar CONTEXTO.md
- [ ] Criar CHANGELOG.md entry (v1.6.0)
- [ ] Atualizar README.md
- [ ] Criar GUIA_CONVERGENCIA.md
- [ ] Documentar novos campos
- [ ] Documentar novos endpoints
- [ ] Screenshots do antes/depois
- [ ] Métricas de sucesso
- [ ] Commit: "docs: complete convergence documentation v1.6.0"
- [ ] Push para main
- [ ] Tag release v1.6.0

---

## 📊 MÉTRICAS DE SUCESSO

### Antes (v1.5.5)
- [ ] Campos mostrados no perfil: 43%
- [ ] longRunDay coletado: NÃO
- [ ] Review completo: NÃO
- [ ] Idioma editável: NÃO

### Depois (v1.6.0) - VALIDAR
- [ ] Campos mostrados no perfil: 100% ✅
- [ ] longRunDay coletado: SIM ✅
- [ ] Review completo: SIM ✅
- [ ] Idioma editável: SIM ✅
- [ ] Plano usa longRunDay: SIM ✅
- [ ] Plano usa infraestrutura: SIM ✅

---

## 🔄 SESSÕES DE TRABALHO

### Sessão 1 - 07/Nov/2025 16:25 UTC
**Status:** ✅ SPRINTS 1.1, 1.2, 1.3 CONCLUÍDOS  
**Objetivos:** 
- Sprint 1.1 - PerformanceTab Completo ✅
- Sprint 1.2 - longRunDay no Onboarding ✅
- Sprint 1.3 - AvailabilityTab Melhorado ✅
**Progresso:** 3/11 sprints (27%)
**Commits:** 824c1c51, 1c45fac9, c79d3d9e
**Duração:** ~1.5 horas
**Próximo:** Sprint 1.4 - PreferencesTab com Idioma

---

## 📝 NOTAS IMPORTANTES

1. **Backup sempre antes de modificar**
2. **Build deve passar SEMPRE**
3. **Testar antes de commit**
4. **Mensagens de commit descritivas**
5. **Atualizar este checklist após cada sprint**
6. **Documentar problemas encontrados**

---

## 🚨 BLOQUEIOS E ISSUES

*Nenhum bloqueio no momento*

---

## ✅ CRITÉRIO DE CONCLUSÃO

**Sistema está 100% convergente quando:**
- [X] Todos os 11 sprints completados
- [ ] Todos os testes passam
- [ ] Build production OK
- [ ] Documentação atualizada
- [ ] Deploy em produção
- [ ] Validação do usuário final

---

**Última atualização:** 07/Nov/2025 17:35 UTC  
**Próxima ação:** Sprint 1.4 - PreferencesTab com Idioma
**Status:** 3/11 sprints concluídos (27%) - FASE 1 em progresso (60%)
