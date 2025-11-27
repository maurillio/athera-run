# 📊 SESSÃO 27/11/2025 - RESUMO DE CORREÇÕES

## ✅ PROBLEMAS CORRIGIDOS:

### 1. **Geração de Plano - Semanas Flexíveis**
- ✅ Dias anteriores ao início do plano agora ficam **escondidos** (não aparecem)
- ✅ Primeira semana pode ser incompleta (ex: começa quinta, só mostra qui-dom)
- ✅ Última semana termina no **DIA DA PROVA** (não no domingo)
- ✅ Volume semanal calcula **apenas dias visíveis**
- ✅ Contagem de treinos **não inclui dias de descanso**

### 2. **Validação de Plano**
- ✅ **REMOVIDA** validação que exigia treinos em todos os dias
- ✅ Agora aceita semanas incompletas
- ✅ Flexível para qualquer disponibilidade (até 1 dia/semana)

### 3. **Labels de Treinos Strava**
- ✅ Corrigido "Musculação - subtypes.Workout" → "Musculação"
- ✅ Evita duplicação quando tipo = subtipo

### 4. **Auto-scroll em /plano**
- ✅ Problema identificado mas **NÃO CORRIGIDO AINDA**
- 🔴 Usuário navega para outra semana mas página volta sozinha

## 🔴 PROBLEMAS PENDENTES:

### 1. **Sincronização Strava → Athera** (CRÍTICO)
**Status**: Endpoint criado mas com erro 500

**Problema**: Treinos importados do Strava não marcam treinos planejados como "completos"

**Erro atual**: `Cannot read properties of undefined (reading 'athleteProfile')`
- Session OK ✅
- userId OK ✅ (`cmhck8yvh00000k8mot91yoje`)
- Query Prisma **faltando include** ❌

**O que falta**:
```typescript
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  include: { 
    athleteProfile: true  // ❌ FALTANDO ISSO!
  }
});
```

**Próximos passos**:
1. Adicionar `include: { athleteProfile: true }` na query
2. Testar sincronização manual
3. Implementar verificação automática (client-side ao carregar)
4. Implementar job periódico (server-side a cada 30min)

### 2. **Data da Prova no Card de Objetivo**
**Status**: Bug visual

**Problema**: Mostra "20/12/25" mas deveria ser "21/12/25"
- Bug está no frontend (componente de exibição)
- Provavelmente timezone ou -1 dia

### 3. **Sugestão Inteligente Absurda**
**Status**: Bug de lógica

**Mensagem errada**: 
- "Não treinou nos últimos 30 dias" (acabou de criar!)
- "Prova está a mais de 2 anos de distância" (é daqui 24 dias!)

**Causa**: Lógica não considera planos recém-criados

## 📝 ARQUIVOS MODIFICADOS:

### Backend:
- `lib/ai-plan-generator.ts` - Geração de semanas flexíveis
- `app/api/workouts/sync-strava/route.ts` - Endpoint de sincronização (INCOMPLETO)

### Frontend:
- `components/dashboard/week-view.tsx` - Ocultação de dias passados
- `app/[locale]/plano/page.tsx` - Auto-scroll issue (NÃO RESOLVIDO)

## 🎯 PRÓXIMA SESSÃO - PRIORIDADES:

1. **CORRIGIR** sincronização Strava (adicionar include no Prisma)
2. **TESTAR** sincronização manual
3. **IMPLEMENTAR** sincronização automática
4. **CORRIGIR** data do objetivo (21/12 em vez de 20/12)
5. **CORRIGIR** sugestão inteligente (ignorar planos novos)
6. **INVESTIGAR** auto-scroll em /plano

## 🔧 TECNOLOGIAS USADAS:

- **Timezone**: America/Sao_Paulo (UTC-3)
- **Estrutura de semana**: Segunda (dia 1) → Domingo (dia 0)
- **Filosofia**: Plano começa HOJE, semanas estruturais seg→dom

## 💡 LIÇÕES APRENDIDAS:

1. **Manter padrões** - Copiar queries que funcionam em outros endpoints
2. **Validações flexíveis** - Não assumir semanas completas/regulares
3. **DRY** - Reutilizar lógica que funciona
4. **Logs detalhados** - Facilitam debug (userId, session info)

---

**Autor**: Claude (Sonnet 4.5)  
**Data**: 27/11/2025 20:14 UTC  
**Commit**: Em andamento (sync endpoint incompleto)
