# 🧪 PLANO DE TESTES - SPRINT 2.3

**Data:** 07/Nov/2025 17:01 UTC  
**Objetivo:** Validar geração de planos end-to-end

---

## 🎯 ESTRATÉGIA

Vamos testar 3 perfis diferentes para validar:
1. ✅ Dados são salvos corretamente
2. ✅ Plano é gerado sem erros
3. ✅ Qualidade do plano é alta
4. ✅ Personalização funciona

---

## 📊 CASOS DE TESTE

### Teste 1: Iniciante - Primeiro 5K
**Perfil:**
- Idade: 25 anos
- Peso: 65kg, Altura: 165cm
- Nível: Iniciante (< 6 meses)
- Longão: 5km
- Objetivo: 5K em 8 semanas
- Dias: 3x/semana (Seg, Qua, Sáb)
- Longão: Sábado
- Sono: 4/5 (bom)
- Estresse: 2/5 (baixo)
- Infraestrutura: Nenhuma

**Esperado:**
- Volume inicial baixo (~15-20km/semana)
- Progressão gradual
- Treinos simples (easy, intervals básicos)
- Respeitar dias escolhidos
- Longão no sábado

---

### Teste 2: Intermediário - 10K com Gym
**Perfil:**
- Idade: 35 anos
- Peso: 75kg, Altura: 178cm
- Nível: Intermediário (1-2 anos)
- Longão: 15km
- FC Repouso: 55 bpm
- Objetivo: 10K em 12 semanas
- Dias: 4x/semana (Ter, Qui, Sáb, Dom)
- Longão: Domingo
- Sono: 3/5 (médio)
- Estresse: 4/5 (alto)
- Infraestrutura: Academia
- Outros esportes: Ciclismo (2 anos)

**Esperado:**
- Volume moderado (~35-45km/semana)
- Musculação 2x/semana
- Treinos variados (tempo runs, intervals)
- AJUSTE por estresse alto (volume reduzido 10-15%)
- Cross-training (bike) considerado
- Longão no domingo

---

### Teste 3: Avançado - Meia Maratona
**Perfil:**
- Idade: 30 anos
- Peso: 68kg, Altura: 172cm
- Nível: Avançado (3+ anos)
- Longão: 25km
- FC Repouso: 48 bpm
- Best times: 5K em 20:00, 10K em 42:00
- Objetivo: Meia Maratona em 16 semanas
- Dias: 5x/semana (Seg, Ter, Qui, Sáb, Dom)
- Longão: Domingo
- Sono: 5/5 (ótimo)
- Estresse: 1/5 (mínimo)
- Infraestrutura: Gym + Pool + Track
- Outros esportes: Natação (1 ano)
- Motivação: Performance

**Esperado:**
- Volume alto (~60-75km/semana)
- Treinos avançados (threshold, VO2max, longões longos)
- Musculação específica para corrida
- Natação como recuperação ativa
- Treinos na pista (intervals precisos)
- Progressão agressiva mas segura
- Longão no domingo

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Para cada teste:
- [ ] Onboarding completo sem erros
- [ ] Perfil salvo no banco
- [ ] Plano gerado em < 60s
- [ ] JSON do plano válido
- [ ] Número de semanas correto
- [ ] Dias respeitados
- [ ] Longão no dia certo
- [ ] Infraestrutura considerada
- [ ] Volume adequado ao nível
- [ ] Qualidade dos treinos (descrições claras)
- [ ] Paces/zonas corretas
- [ ] Motivação personalizada

---

## 📈 MÉTRICAS DE SUCESSO

- ✅ 100% dos testes passam
- ✅ Tempo de geração < 60s
- ✅ 0 erros de validação
- ✅ Qualidade subjetiva: 8/10+

---

**Status:** ⏳ INICIANDO
