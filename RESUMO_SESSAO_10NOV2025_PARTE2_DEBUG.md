# 📊 Resumo Executivo - Sessão 10/Nov/2025 (Continuação)

**Horário:** 22:30 - 22:54 UTC  
**Status:** ⏳ Debug em Andamento  
**Versão:** v2.0.0-debug

---

## ❗ PROBLEMA CRÍTICO IDENTIFICADO

### 🐛 Bug: Corrida Alvo Não Aparece no Plano

**Relatado por:** Usuário (você)  
**Sintoma:** Ao gerar plano, o dia da prova mostra "Longão" em vez da corrida cadastrada

**Exemplo:**
- Usuário: `teste47474@teste.com`
- Corrida alvo: 28/12/2025
- Resultado: Plano mostra longão no dia 28/12 ❌
- Esperado: Plano deve mostrar a corrida alvo cadastrada ✅

---

## 🔧 SOLUÇÃO EM ANDAMENTO

### Fase 1: Debug Extensivo (CONCLUÍDO) ✅

**O que foi feito:**

1. **Logs Adicionados na API** (`/api/plan/generate/route.ts`)
   - Try-catch específico na geração do plano
   - Verificação automática se corrida está no plano gerado
   - Logs detalhados de cada etapa

2. **Logs no Gerador de IA** (`lib/ai-plan-generator.ts`)
   - Log das corridas recebidas no perfil
   - Verificação semana por semana
   - Debug detalhado do matching data corrida x semana
   - Log completo da criação do workout da corrida

**Commits:**
```
ff9d2a2b - debug: add extensive logging for race goal detection in plan generation
```

**Deploy:**
- ✅ Push realizado
- ✅ Vercel atualizando
- ⏳ Aguardando conclusão (1-2 minutos)

---

## 🧪 PRÓXIMO PASSO: TESTE

### O que você precisa fazer:

1. **Aguardar Deploy** (1-2 minutos)
   - Verificar em https://vercel.com se deploy finalizou

2. **Criar Novo Usuário de Teste**
   ```
   Email: teste999999@teste.com (ou qualquer outro)
   Senha: qualquer
   ```

3. **Completar Onboarding**
   - Preencher dados básicos
   - Configurar disponibilidade
   - **IMPORTANTE:** Cadastrar corrida alvo com data específica
   - Finalizar onboarding (plano será gerado automaticamente)

4. **Verificar Resultado**
   - Se deu erro 500: copiar erro completo do console (F12)
   - Se gerou plano: verificar se corrida está no dia certo

5. **Coletar Logs do Vercel**
   - Ir para https://vercel.com/maurilios-projects/athera-run
   - Aba "Logs"
   - Filtrar por `/api/plan/generate`
   - Copiar TODOS os logs com `[AI PLAN]`
   - Enviar para mim

---

## 🔍 O QUE OS LOGS VÃO REVELAR

Com os logs adicionados, conseguiremos ver:

1. ✅ Se as corridas estão no perfil quando o plano é gerado
2. ✅ Qual a data exata da corrida alvo
3. ✅ Semana por semana: início, fim, e se corrida está nela
4. ✅ O momento exato em que a corrida é (ou não é) detectada
5. ✅ Se o workout da corrida é criado corretamente
6. ✅ Se o workout está no plano final salvo no banco

### Exemplos de Logs Esperados:

**SUCESSO (corrida detectada):**
```
[AI PLAN] Corridas no perfil recebido: 1
[AI PLAN]   1. A: "Meia Maratona SP" em 2025-12-28
[AI PLAN DEBUG] Checando corrida "Meia Maratona SP":
  raceDate: 2025-12-28
  weekStart: 2025-12-22
  weekEnd: 2025-12-28
  isInWeek: true  ✅
[AI PLAN DEBUG] ✅ Corrida encontrada na semana 7!
[WORKOUT GEN] 🏁 CORRIDA A detectada!
[AI PLAN] ✅ Encontrado workout no dia da corrida: race - 🏁 Meia Maratona SP
```

**PROBLEMA (corrida NÃO detectada):**
```
[AI PLAN] Corridas no perfil recebido: 0  ❌ PROBLEMA!
```
ou
```
[AI PLAN DEBUG] isInWeek: false  ❌ PROBLEMA!
```

---

## 📋 POSSÍVEIS CAUSAS (Hipóteses)

1. **Problema de Timezone**
   - Data da corrida em UTC vs horário local
   - Normalização incorreta de datas

2. **Problema de Lógica de Semana**
   - Cálculo de início/fim de semana incorreto
   - Off-by-one error

3. **Corrida Não Salva**
   - Status incorreto (não 'active' ou 'upcoming')
   - Não vinculada ao perfil corretamente

4. **Problema na Geração pela IA**
   - IA gerando número errado de semanas
   - Data de início incorreta

---

## 🎯 PRÓXIMAS AÇÕES

### Após Receber Logs:

1. **Analisar logs completos**
   - Identificar exatamente onde a detecção falha
   - Confirmar qual das 4 hipóteses é a causa

2. **Implementar Correção Cirúrgica**
   - Corrigir APENAS o problema específico
   - Manter todo o resto do código intacto

3. **Testar Novamente**
   - Criar novo usuário
   - Validar que corrida aparece corretamente
   - Confirmar que nada mais quebrou

4. **Atualizar Documentação**
   - Adicionar correção ao changelog
   - Atualizar histórico
   - Marcar como resolvido

---

## 📁 ARQUIVOS CRIADOS

- `DEBUG_RACE_GOAL_DETECTION.md` - Guia completo de debug
- `test-plan-generation-debug.ts` - Script de teste (local)
- Logs adicionados em:
  - `app/api/plan/generate/route.ts`
  - `lib/ai-plan-generator.ts`

---

## ⏱️ ESTIMATIVA DE TEMPO

- **Debug atual:** 24 minutos ✅
- **Aguardando teste:** ~5 minutos ⏳
- **Análise de logs:** ~10 minutos (após receber logs)
- **Implementação correção:** ~15 minutos
- **Teste final:** ~5 minutos

**Total estimado:** ~60 minutos para resolução completa

---

## 📞 AGUARDANDO VOCÊ

**Status Atual:** ⏳ Deploy concluído, aguardando teste e logs

**O que preciso:**
1. Confirmar que deploy finalizou
2. Criar usuário de teste e completar onboarding
3. Copiar logs completos do Vercel
4. Reportar resultado (erro 500 ou plano gerado)

**Com essas informações, conseguirei:**
- Identificar exatamente onde está o problema
- Implementar correção cirúrgica
- Resolver o bug de vez

---

**Última Atualização:** 10/Nov/2025 22:54 UTC  
**Aguardando:** Teste e logs do usuário
