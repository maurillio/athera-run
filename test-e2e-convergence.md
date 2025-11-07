# 🧪 TESTE E2E - CONVERGÊNCIA TOTAL
**Data:** 07/Nov/2025 18:35 UTC
**Ambiente:** Produção (atherarun.com)

## ✅ CENÁRIO 1: Novo Usuário - Fluxo Completo

### Setup
- Email: `teste-e2e-$(date +%s)@atherarun.com`
- Dados mock completos

### Passos de Teste

#### 1. Onboarding - Step by Step
- [ ] **Step 1 - Dados Básicos**
  - [ ] Preencher: 30 anos, Masculino, 70kg, 175cm, FC 60bpm
  - [ ] Verificar auto-save (console log)
  - [ ] Avançar

- [ ] **Step 2 - Experiência**
  - [ ] Selecionar: Iniciante, 19km longão
  - [ ] Verificar auto-save
  - [ ] Avançar

- [ ] **Step 3 - Performance**
  - [ ] Adicionar tempo: 10k em 50min
  - [ ] Verificar VDOT calculado
  - [ ] Verificar auto-save
  - [ ] Avançar

- [ ] **Step 4 - Saúde**
  - [ ] Sono: 3/5, Stress: 3/5
  - [ ] Sem lesões
  - [ ] Verificar auto-save
  - [ ] Avançar

- [ ] **Step 5 - Objetivos**
  - [ ] Meta: 10km, Data: 29/11/2025
  - [ ] Objetivo: Completar primeira corrida
  - [ ] Verificar auto-save
  - [ ] Avançar

- [ ] **Step 6 - Disponibilidade**
  - [ ] Dias: Segunda, Quarta, Sábado (índices 1, 3, 6)
  - [ ] **Longão: Sábado (6)** ← CRÍTICO
  - [ ] Academia: SIM
  - [ ] Verificar auto-save
  - [ ] Avançar

- [ ] **Step 7 - Review**
  - [ ] Verificar TODOS os dados aparecem
  - [ ] Verificar longRunDay: Sábado
  - [ ] Verificar infraestrutura
  - [ ] Finalizar

#### 2. Perfil - Verificação Completa
- [ ] **BasicDataTab**
  - [ ] Mostra: 30 anos, 70kg, 175cm, FC 60bpm ✅
  
- [ ] **PerformanceTab**
  - [ ] **Experiência:**
    - [ ] Nível: Iniciante
    - [ ] Longão: 19km
    - [ ] VDOT: calculado
  - [ ] **PRs:**
    - [ ] 10k: 50min

- [ ] **HealthTab**
  - [ ] Sono: 3/5
  - [ ] Stress: 3/5

- [ ] **GoalsTab**
  - [ ] Meta: 10km
  - [ ] Data: 29/11/2025

- [ ] **AvailabilityTab** ← CRÍTICO
  - [ ] **Dias selecionados:**
    - [ ] Segunda ✅
    - [ ] Quarta ✅
    - [ ] Sábado ✅
  - [ ] **DIA DO LONGÃO:**
    - [ ] Sábado (6) em DESTAQUE
    - [ ] Visual diferenciado (amber/yellow)
  - [ ] **Infraestrutura:**
    - [ ] Academia: ✅
    - [ ] Piscina: ❌
    - [ ] Pista: ❌

- [ ] **PreferencesTab**
  - [ ] Idioma: pt-BR
  - [ ] (Outros campos conforme implementados)

#### 3. Geração de Plano
- [ ] **Gerar Plano**
  - [ ] Plano gerado com sucesso
  - [ ] Console logs mostram longRunDay: 6
  
- [ ] **Validação do Plano**
  - [ ] Longão está no SÁBADO
  - [ ] Treinos respeitam dias disponíveis
  - [ ] Volume adequado para iniciante
  - [ ] Usa infraestrutura (academia)

#### 4. Console Logs Esperados
```
📊 Step6 auto-save: { trainingActivities: [1,3,6], longRunDay: 6, ... }
📊 Step7Review data: { longRunDay: 6, ... }
🔍 [ONBOARDING] longRunDay: 6
✅ Profile created successfully
[AI PLAN] Dia do longão: 6
[AI PLAN] Plano gerado com longão no dia correto
```

## ✅ CENÁRIO 2: Edição no Perfil

### Passos
1. [ ] Ir para AvailabilityTab
2. [ ] Mudar longRunDay de Sábado (6) para Domingo (0)
3. [ ] Salvar
4. [ ] Verificar atualização no banco
5. [ ] Trigger auto-ajuste
6. [ ] Verificar plano atualizado usa novo dia

## ✅ CENÁRIO 3: Convergência Dados

### Validação Cruzada
- [ ] **Onboarding → Banco**
  - [ ] Todos campos salvos corretamente
  - [ ] longRunDay salvo como INTEGER
  
- [ ] **Banco → Perfil**
  - [ ] Todos campos carregados
  - [ ] longRunDay renderizado corretamente
  
- [ ] **Perfil → Geração**
  - [ ] IA usa 100% dos dados disponíveis
  - [ ] longRunDay respeitado na distribuição

## 📊 CHECKLIST FINAL

### Funcionalidades Core
- [ ] ✅ Onboarding coleta longRunDay
- [ ] ✅ Banco salva longRunDay
- [ ] ✅ Perfil mostra longRunDay (destacado)
- [ ] ✅ IA usa longRunDay na geração
- [ ] ✅ Auto-ajuste preserva longRunDay
- [ ] ✅ Edição manual funciona

### Qualidade Visual
- [ ] ✅ Dia do longão tem destaque visual
- [ ] ✅ Cores apropriadas (amber/yellow)
- [ ] ✅ Ícone especial (🏃‍♂️)
- [ ] ✅ Tooltip/descrição explicativa

### Zero Erros
- [ ] ✅ Console limpo (sem erros)
- [ ] ✅ Sem warnings críticos
- [ ] ✅ API retorna 200/201
- [ ] ✅ Dados não se perdem

## 🎯 CRITÉRIO DE SUCESSO

**CONVERGÊNCIA 100%:**
- Tudo que é coletado → É salvo
- Tudo que é salvo → É mostrado
- Tudo que é mostrado → É usado
- Tudo que é usado → Funciona corretamente

**ZERO GAPS. ZERO DUPLICIDADES. TOTAL TRANSPARÊNCIA.**

---

*Teste criado em: 07/Nov/2025 18:35 UTC*
*Status: ⏳ Pronto para execução manual*
