# 🚀 GUIA DE DEPLOY - v3.1.0

**Versão:** 3.1.0 - Convergência Total de Dados  
**Data:** 24 de Novembro de 2025  
**Status:** ✅ Pronto para Deploy

---

## ✅ PRÉ-REQUISITOS

Antes de fazer o deploy, verifique:

- [x] Build passou: `npm run build` ✅
- [x] Testes E2E passaram: `./test-convergence-v3.1.0.sh` ✅ (31/31)
- [x] Zero erros TypeScript ✅
- [x] Database Neon operacional ✅
- [x] Variáveis de ambiente configuradas ✅

---

## 📋 PASSO A PASSO

### 1️⃣ Revisar Mudanças

```bash
# Ver arquivos modificados
git status

# Ver diff das mudanças
git diff components/profile/v1.3.0/
```

**Arquivos modificados (6):**
- `components/profile/v1.3.0/HealthTab.tsx` (+300 linhas)
- `components/profile/v1.3.0/PerformanceTab.tsx` (+180 linhas)
- `components/profile/v1.3.0/GoalsTab.tsx` (+150 linhas)
- `components/profile/v1.3.0/AvailabilityTab.tsx` (+180 linhas)
- `prisma/migrations/20251124_convergence_v3_1_0/migration.sql` (+93 linhas)
- `lib/ai-plan-generator.ts` (+17 linhas tracking)

---

### 2️⃣ Aplicar Migration (IMPORTANTE!)

**⚠️ CRITICAL:** Execute a migration ANTES do deploy do código

```bash
# Conectar ao Neon
npx prisma migrate deploy

# Verificar que migration foi aplicada
npx prisma migrate status
```

**O que a migration faz:**
- ✅ Migra `goalDistance/targetRaceDate/targetTime` → `race_goals`
- ✅ Marca 7 campos como DEPRECATED
- ✅ Cria índices de performance
- ✅ Valida integridade dos dados

**Tempo estimado:** 1-2 minutos

---

### 3️⃣ Testar Localmente (Opcional mas Recomendado)

```bash
# Rodar em desenvolvimento
npm run dev

# Acessar
open http://localhost:3000/pt-BR/perfil
```

**O que testar:**
1. Abrir cada aba do perfil:
   - ✅ Dados Básicos (sem duplicação de dados fisiológicos)
   - ✅ Saúde (14 novos campos visíveis)
   - ✅ Performance (VDOT, paces, experiência)
   - ✅ Objetivos (motivação completa)
   - ✅ Disponibilidade (100% editável)

2. Testar edição:
   - ✅ Adicionar atividade em um dia
   - ✅ Remover atividade
   - ✅ Editar campos novos
   - ✅ Salvar mudanças

3. Verificar dados salvos:
   - ✅ Campos persistem após reload
   - ✅ Sem erros no console
   - ✅ API responses OK

**Tempo estimado:** 10-15 minutos

---

### 4️⃣ Commit e Push

```bash
# Adicionar todos os arquivos
git add .

# Commit com mensagem descritiva
git commit -m "feat: v3.1.0 convergência total de dados

- Adiciona 17 campos v3.0.0 no perfil
- Disponibilidade 100% editável
- Performance transparente (VDOT, paces)
- Motivação completa (primary + secondary + goals)
- AI tracking conectado ao banco
- Migration para consolidar race goals
- Zero duplicações de dados fisiológicos

Resolve 9/15 problemas críticos (60%)
+920 linhas, 6 arquivos modificados
Testes: 31/31 passados ✅"

# Push para main (Vercel deploy automático)
git push origin main
```

---

### 5️⃣ Monitorar Deploy no Vercel

```bash
# Acompanhar logs
vercel logs --follow
```

**O que verificar:**
1. ✅ Build sucesso no Vercel
2. ✅ Sem erros de runtime
3. ✅ Database connections OK
4. ✅ API endpoints respondendo

**Tempo de deploy:** 3-5 minutos

---

### 6️⃣ Validação Pós-Deploy

```bash
# Testar em produção
open https://atherarun.com/pt-BR/perfil
```

**Checklist de validação:**

#### 6.1 Perfil - Aba Saúde
- [ ] Novos campos médicos visíveis (condições, medicamentos, restrições)
- [ ] Perfil de corredor v3.0.0 (hasRunBefore, currentlyInjured, etc)
- [ ] Ciclo menstrual (se feminino)
- [ ] Link para "Dados Básicos" (dados fisiológicos)

#### 6.2 Perfil - Aba Performance
- [ ] VDOT exibido (se existir)
- [ ] Paces exibidos (Easy, Marathon, Threshold, etc)
- [ ] Experiência detalhada editável
- [ ] Anos em outros esportes

#### 6.3 Perfil - Aba Objetivos
- [ ] Motivação primária selecionável (6 opções)
- [ ] Motivações secundárias (multi-select)
- [ ] Objetivos específicos (8 opções)
- [ ] Notas pessoais

#### 6.4 Perfil - Aba Disponibilidade
- [ ] Botão "+ Adicionar Atividade" em cada dia
- [ ] 10 atividades predefinidas
- [ ] Campo para atividade customizada
- [ ] Botão "×" para remover (hover)
- [ ] Salvar funciona

#### 6.5 Geração de Planos
- [ ] Criar novo plano funciona
- [ ] AI tracking funciona (verificar logs)
- [ ] Plano usa novos campos

---

### 7️⃣ Monitoramento 24h

**Primeiras 24 horas após deploy:**

#### Métricas para acompanhar:
- 📊 Taxa de erro (deve permanecer < 1%)
- 📊 Performance de API (deve permanecer < 500ms)
- 📊 Completude de perfis (deve aumentar)
- 📊 Satisfação de usuários (feedback qualitativo)

#### Verificar:
```bash
# Logs de erros
vercel logs --filter="error" --since=24h

# Métricas de uso
vercel analytics
```

#### Se houver problemas:
```bash
# Rollback rápido
git revert HEAD
git push origin main
```

---

## 🎯 CRITÉRIOS DE SUCESSO

Deploy é considerado **SUCESSO** se:

✅ Build Vercel passou sem erros  
✅ Migration aplicada sem problemas  
✅ 17 novos campos visíveis no perfil  
✅ Disponibilidade 100% editável funcionando  
✅ Nenhum erro crítico nos logs (primeiras 2h)  
✅ Taxa de erro < 1% (primeiras 24h)  
✅ Feedback positivo de usuários

---

## ⚠️ TROUBLESHOOTING

### Problema: Migration falhou

**Solução:**
```bash
# Verificar status
npx prisma migrate status

# Se stuck, forçar reset (APENAS em dev!)
npx prisma migrate reset

# Reaplicar
npx prisma migrate deploy
```

### Problema: Campos não aparecem

**Verificar:**
1. Limpar cache do browser (Ctrl+Shift+R)
2. Verificar se migration foi aplicada
3. Checar console do browser por erros
4. Verificar API `/api/profile` retorna dados

### Problema: Edição não salva

**Verificar:**
1. Console do browser por erros
2. Network tab - request POST falhou?
3. Logs do servidor - erro de validação?
4. Database - campos existem?

### Problema: Build falhou no Vercel

**Verificar:**
```bash
# Testar build local primeiro
npm run build

# Se passar local mas falhar Vercel:
# - Verificar variáveis de ambiente
# - Verificar versão Node.js
# - Verificar limites de memória
```

---

## 📞 SUPORTE

Se encontrar problemas durante o deploy:

1. **Verificar documentação:**
   - `RESUMO_IMPLEMENTACAO_COMPLETO_v3_1_0.md`
   - `STATUS_IMPLEMENTACAO_v3_1_0.md`
   - `CHANGELOG_v3_1_0_CONVERGENCE.md`

2. **Verificar logs:**
   ```bash
   vercel logs --follow
   ```

3. **Rollback se necessário:**
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## ✅ CHECKLIST FINAL

Antes de considerar deploy completo:

- [ ] Migration aplicada ✅
- [ ] Código deployado no Vercel ✅
- [ ] Build passou ✅
- [ ] Validação pós-deploy OK ✅
- [ ] 17 novos campos funcionando ✅
- [ ] Disponibilidade editável OK ✅
- [ ] Nenhum erro crítico ✅
- [ ] Monitoramento 24h iniciado ✅
- [ ] Documentação atualizada ✅
- [ ] Equipe notificada ✅

---

## 🎉 PRÓXIMOS PASSOS

Após deploy bem-sucedido:

1. **Comunicar usuários:**
   - Email anunciando melhorias
   - Post em redes sociais
   - Atualizar changelog público

2. **Coletar feedback:**
   - Monitorar tickets de suporte
   - Análise de uso dos novos campos
   - Métricas de satisfação

3. **Planejar FASES 3-5 (restantes 40%):**
   - Ver `STATUS_IMPLEMENTACAO_v3_1_0.md`
   - 6 problemas ainda pendentes
   - Estimativa: 8-12 horas

---

**Preparado por:** Sistema de Implementação Athera Run  
**Data:** 24/Nov/2025 19:00 UTC  
**Versão:** 3.1.0  

🚀 **Boa sorte com o deploy!**
