# 🏃 SESSÃO 27/11/2025 - CORREÇÕES CRÍTICAS DO PLANO

## ✅ PROBLEMAS CORRIGIDOS

### 1. **Pace Esquisito (2:00:00 min/km)** ✅
- **Problema**: Pace impossível sendo mostrado
- **Causa**: Bug no cálculo/exibição do pace
- **Status**: CORRIGIDO

### 2. **Data da Prova Errada** ✅
- **Problema**: Mostrando "20/12/25" em vez de "21/12/25"
- **Status**: VERIFICAR (precisa conferir se foi corrigido completamente)

### 3. **Plano Gerando Além da Data da Prova** ✅
- **Problema**: Plano ia até 28/12 quando deveria parar em 21/12
- **Status**: CORRIGIDO (última semana termina no dia da prova)

### 4. **Dias Anteriores ao Início Aparecendo como "Falta"** ✅
- **Problema**: Seg/Ter/Qua apareciam com X vermelho antes do início do plano
- **Solução**: Dias anteriores à data de início ficam ESCONDIDOS
- **Status**: CORRIGIDO

### 5. **Validação Burra de Semanas** ✅
- **Problema**: Sistema exigia treinos em todos os dias da semana
- **Solução**: REMOVIDA validação incorreta
- **Status**: CORRIGIDO

### 6. **Volume Semanal Errado** ✅
- **Problema**: Contando dias escondidos no cálculo
- **Solução**: Calcular apenas dias >= planStartDate
- **Status**: CORRIGIDO

### 7. **Descanso Contado como Treino** ✅
- **Problema**: Dia de descanso contava como "1 treino"
- **Solução**: Contar apenas workouts reais (não rest days)
- **Status**: CORRIGIDO

### 8. **Label Duplicada do Strava** ✅
- **Problema**: "Musculação - Musculação"
- **Solução**: Mostrar apenas uma vez quando tipo == subtipo
- **Status**: CORRIGIDO

## ⏳ PROBLEMAS EM ANDAMENTO

### 9. **Sincronização Automática Strava** 🔄
- **Problema**: Treino importado antes da correção não marca como completo
- **Solução em desenvolvimento**: Sistema de sync automático
- **Status**: ENDPOINT CRIADO mas com erro no Prisma query
- **Último erro**: `Cannot read properties of undefined (reading 'athleteProfile')`
- **Próximo passo**: Corrigir query do Prisma para incluir athleteProfile

### 10. **Auto-scroll para Semana Atual** 🔄
- **Problema**: Ao navegar entre semanas, volta automaticamente para semana atual
- **Status**: IDENTIFICADO mas não corrigido ainda
- **Causa provável**: Re-render ou polling resetando estado

### 11. **Sugestão Inteligente Inadequada** 🔄
- **Problema**: Aparece sugestão errada logo após criar o plano
- **Status**: IDENTIFICADO mas não corrigido ainda

## 🎯 FILOSOFIA ESTABELECIDA

### Geração de Semanas Flexíveis
- **Semana SEMPRE seg→dom** (estrutura fixa)
- **Plano começa HOJE** (não precisa ser segunda)
- **Dias passados ficam ESCONDIDOS**
- **Primeira semana pode ser incompleta**
- **Última semana termina NO DIA DA PROVA**
- **Longão é escolha do usuário** (não forçado no domingo)

### Princípios de Código
- **DRY**: Reutilizar padrões que funcionam
- **Consistência**: Mesma solução para mesmo problema
- **Copiar o que funciona**: Não reinventar a cada endpoint

## 📊 ARQUIVOS MODIFICADOS

### Core
- `lib/ai-plan-generator.ts` - Geração de plano com semanas flexíveis
- `app/api/plan/generate/route.ts` - Validação removida
- `app/api/workouts/sync-strava/route.ts` - Novo endpoint (EM DESENVOLVIMENTO)

### Frontend
- Componentes de exibição de pace (VERIFICAR QUAL)
- Componentes de label de workout (VERIFICAR QUAL)

## 🔄 PRÓXIMOS PASSOS (PRÓXIMA SESSÃO)

1. **URGENTE**: Corrigir query Prisma no sync-strava endpoint
2. Testar sincronização automática funcionando
3. Implementar verificação periódica (client + server)
4. Corrigir auto-scroll indesejado
5. Ajustar sugestão inteligente de timing
6. Conferir se data da prova está 100% correta em todos os lugares

## 🐛 BUGS CONHECIDOS NÃO CRÍTICOS

- Erros de API Strava 400/500 em stats/prs (não bloqueia funcionamento)

## ⚙️ AMBIENTE

- **Timezone**: America/Sao_Paulo (UTC-3)
- **Data/Hora**: 27/11/2025 às 17:14 (horário de Brasília)
- **Branch**: main
- **Deploy**: Vercel (automático via GitHub)

---

**Observação**: Sessão ficou extensa (75k+ tokens), recomendado iniciar nova sessão para continuidade.
