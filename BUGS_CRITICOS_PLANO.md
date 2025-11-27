# 🚨 BUGS CRÍTICOS NO PLANO GERADO - 27/11/2025

## Status: PLANO GEROU, MAS COM MÚLTIPLOS BUGS

---

## 🔴 BUG 1: PACE DA CORRIDA IMPOSSÍVEL
**Local:** Dia 21/12 (dia da prova)
**Problema:** Mostrando `⚡ 2:00:00 min/km`
**Esperado:** Ritmo objetivo baseado no VDOT do atleta (ex: 5:47/km para maratona)
**Causa provável:** Treino de corrida sendo criado com pace padrão errado

---

## 🔴 BUG 2: DATA DA CORRIDA ERRADA
**Local:** Card de objetivo no topo do dashboard
**Problema:** Mostrando "21km, sábado 20 de dezembro"
**Esperado:** "21km, domingo 21 de dezembro"
**Causa provável:** Cálculo de dia da semana ou formatação de data incorretos

---

## 🔴 BUG 3: PLANO ULTRAPASSA DATA DA PROVA
**Local:** Calendário de treinos
**Problema:** Plano vai até 28/12/2025
**Esperado:** Plano deve PARAR no dia 21/12/2025 (dia da prova)
**Causa provável:** Lógica de término do plano não considera a data da corrida

---

## 🔴 BUG 4: MENSAGEM DE AJUSTE ABSURDA
**Local:** Card "Sugestão Inteligente de Ajuste"
**Problema:** 
```
"A data da prova está a mais de dois anos de distância, permitindo 
tempo suficiente para ajustes e progressão adequada."
```
**Realidade:** Corrida é em 21/12/2025 (daqui 24 dias!)
**Causa provável:** Cálculo de diferença de datas completamente errado

---

## 🔴 BUG 5: APIS STRAVA FALHANDO
**Erros encontrados:**
- `/api/strava/stats` - 400 Bad Request
- `/api/strava/prs` - 400 Bad Request  
- `/api/strava/gear` - 400 Bad Request
- `/api/athlete-stats` - 500 Internal Server Error

**Causa provável:** APIs esperam stravaZones mas campo pode estar null/undefined

---

## 📋 PLANO DE CORREÇÃO

### Prioridade CRÍTICA (impede uso do plano):
1. ✅ Corrigir pace da corrida (2:00:00 → pace real)
2. ✅ Corrigir data final do plano (28/12 → 21/12)
3. ✅ Corrigir data no card de objetivo (sáb 20 → dom 21)

### Prioridade ALTA (experiência ruim):
4. ✅ Corrigir cálculo de tempo até a prova
5. ✅ Corrigir APIs do Strava (400/500 errors)

---

