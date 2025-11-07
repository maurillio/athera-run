# 🧪 TESTE E2E - CONVERGÊNCIA TOTAL 100%

**Data:** 07/Novembro/2025 18:50 UTC  
**Versão:** 1.6.1  
**Ambiente:** Produção (Vercel + Neon)  
**Objetivo:** Validar convergência total Onboarding → Perfil → Geração

---

## 📋 CHECKLIST DE TESTES

### ✅ PARTE 1: ONBOARDING COMPLETO

#### Teste 1.1: Auto-Save Funcionando
**URL:** `https://atherarun.com/[locale]/onboarding`

**Steps a validar:**
- [ ] **Step 1 - Basic Data**
  - Preencher idade: 30
  - Selecionar gênero: Masculino
  - Peso: 70kg
  - Altura: 175cm
  - FC Repouso: 60 bpm
  - ✅ **Avançar e voltar - dados devem estar salvos**
  
- [ ] **Step 2 - Sport Background**
  - Nível: Intermediário
  - Anos correndo: 3
  - Volume semanal: 30km
  - Longão mais longo: 21km
  - Pace usual: 5:30/km
  - ✅ **Avançar e voltar - dados devem estar salvos**
  
- [ ] **Step 3 - Performance**
  - Adicionar PR 10k: 50:00
  - VDOT deve calcular automaticamente
  - ✅ **Avançar e voltar - dados devem estar salvos**
  
- [ ] **Step 4 - Health**
  - Qualidade sono: 4/5
  - Nível stress: 3/5
  - Sem lesões
  - ✅ **Avançar e voltar - dados devem estar salvos**
  
- [ ] **Step 5 - Goals**
  - Objetivo: Correr primeira meia
  - Distância: 21km
  - Data alvo: 6 meses no futuro
  - Tempo alvo: 2:00:00
  - ✅ **Dados devem salvar**
  
- [ ] **Step 6 - Availability**
  - Dias corrida: Segunda, Quarta, Sábado (0, 2, 6)
  - **🔴 DIA DO LONGÃO: Sábado (6)**
  - Academia: SIM
  - Piscina: NÃO
  - Pista: NÃO
  - ✅ **Avançar e voltar - LONGÃO deve estar salvo**
  
- [ ] **Step 7 - Review**
  - ✅ Mostra idade: 30
  - ✅ Mostra peso: 70kg
  - ✅ Mostra altura: 175cm
  - ✅ Mostra FC repouso: 60
  - ✅ Mostra nível: Intermediário
  - ✅ Mostra anos: 3
  - ✅ Mostra volume: 30km
  - ✅ Mostra longão: 21km
  - ✅ Mostra PR 10k: 50:00
  - ✅ Mostra VDOT calculado
  - ✅ Mostra objetivo: 21km
  - ✅ Mostra data alvo
  - ✅ Mostra tempo alvo: 2:00:00
  - ✅ Mostra dias: Segunda, Quarta, Sábado
  - ✅ **Mostra LONGÃO: Sábado (CRÍTICO)**
  - ✅ Mostra academia: SIM
  - ✅ Mostra piscina: NÃO
  - ✅ Mostra pista: NÃO

**Ação:** Clicar em "Finalizar e Criar Plano"

**Resultado Esperado:**
- ✅ Perfil criado com sucesso
- ✅ Redirecionado para Dashboard
- ✅ Mensagem: "Gerando seu plano personalizado..."

---

### ✅ PARTE 2: PERFIL - VALIDAÇÃO VISUAL 100%

#### Teste 2.1: BasicDataTab
**URL:** `https://atherarun.com/[locale]/perfil` (Tab: Dados Básicos)

**Validar campos exibidos:**
- [ ] ✅ Nome/Email correto
- [ ] ✅ Idade: 30 anos
- [ ] ✅ Gênero: Masculino (ícone 👨)
- [ ] ✅ Peso: 70 kg
- [ ] ✅ Altura: 175 cm
- [ ] ✅ IMC calculado
- [ ] ✅ FC Repouso: 60 bpm
- [ ] ✅ Qualidade sono: 4/5 (estrelas)
- [ ] ✅ Nível stress: 3/5 (emoji)

**Ação:** Editar peso para 72kg e salvar
**Resultado:** ✅ Salvo com sucesso, reload mostra 72kg

---

#### Teste 2.2: PerformanceTab - CRÍTICO 🔴
**URL:** `https://atherarun.com/[locale]/perfil` (Tab: Performance)

**Seção 1: Experiência de Corrida**
- [ ] ✅ **Mostra Nível:** Intermediário (🟡 ícone)
- [ ] ✅ **Mostra Anos correndo:** 3 anos
- [ ] ✅ **Mostra Volume semanal:** 30 km/semana
- [ ] ✅ **Mostra Longão mais longo:** 21 km
- [ ] ✅ **Mostra Pace usual:** 5:30/km (se coletado)
- [ ] ✅ **Mostra Outros esportes:** (se preenchido)

**Seção 2: Melhores Tempos**
- [ ] ✅ Mostra PR 10k: 50:00
- [ ] ✅ Mostra VDOT: (calculado)
- [ ] ✅ Interpretação VDOT visível

**Status:**
- ❌ SE NÃO MOSTRAR EXPERIÊNCIA = FALHOU
- ✅ SE MOSTRAR TUDO = PASSOU

---

#### Teste 2.3: HealthTab
**URL:** `https://atherarun.com/[locale]/perfil` (Tab: Saúde)

**Validar:**
- [ ] ✅ Histórico lesões (se tiver)
- [ ] ✅ Qualidade sono: 4/5
- [ ] ✅ Nível stress: 3/5
- [ ] ✅ Clearance médico: SIM

---

#### Teste 2.4: GoalsTab
**URL:** `https://atherarun.com/[locale]/perfil` (Tab: Objetivos)

**Validar:**
- [ ] ✅ Objetivo principal: Correr primeira meia
- [ ] ✅ Distância meta: 21km
- [ ] ✅ Data alvo: (data escolhida)
- [ ] ✅ Tempo alvo: 2:00:00
- [ ] ✅ Countdown para prova

---

#### Teste 2.5: AvailabilityTab - SUPER CRÍTICO 🔴🔴
**URL:** `https://atherarun.com/[locale]/perfil` (Tab: Disponibilidade)

**Seção 1: Resumo Visual (deve estar no TOPO)**
- [ ] ✅ **Header:** "📅 Seus Dias de Treino"
- [ ] ✅ **Dias corrida listados:** Segunda, Quarta, Sábado
- [ ] ✅ **DIA DO LONGÃO DESTACADO:**
  - Deve ter box especial (fundo amarelo/âmbar)
  - Texto: "🏃‍♂️ Treino Longo: Sábado"
  - Descrição: "Seu treino mais longo da semana"
- [ ] ✅ **Outras atividades:** (se tiver - gym, yoga, etc)

**Seção 2: Infraestrutura Visual**
- [ ] ✅ **Cards de infraestrutura (3 cards lado a lado):**
  
  **Card Academia:**
  - [ ] ✅ Ícone: 💪
  - [ ] ✅ Texto: "Academia"
  - [ ] ✅ Status: ✅ Disponível (fundo verde)
  
  **Card Piscina:**
  - [ ] ✅ Ícone: 🏊
  - [ ] ✅ Texto: "Piscina"
  - [ ] ✅ Status: ❌ Não disponível (fundo cinza)
  
  **Card Pista:**
  - [ ] ✅ Ícone: 🏃
  - [ ] ✅ Texto: "Pista"
  - [ ] ✅ Status: ❌ Não disponível (fundo cinza)

**Seção 3: Formulário de Edição**
- [ ] ✅ Checkboxes para editar dias
- [ ] ✅ Select para mudar longRunDay
- [ ] ✅ Toggles para infraestrutura

**Ação:** Mudar longRunDay de Sábado para Domingo
**Resultado:** ✅ Salvo, resumo visual atualiza para "Domingo"

**Status Final:**
- ❌ SE NÃO MOSTRAR RESUMO VISUAL = FALHOU CRÍTICO
- ❌ SE NÃO DESTACAR LONGÃO = FALHOU CRÍTICO  
- ❌ SE NÃO MOSTRAR INFRAESTRUTURA = FALHOU CRÍTICO
- ✅ SE MOSTRAR TUDO CLARAMENTE = PASSOU

---

#### Teste 2.6: PreferencesTab
**URL:** `https://atherarun.com/[locale]/perfil` (Tab: Preferências)

**Validar:**
- [ ] ✅ **Seletor de Idioma:**
  - Opções: 🇧🇷 Português, 🇺🇸 English, 🇪🇸 Español
  - Valor atual correto
  
- [ ] ⚠️ **Seletor de Unidades** (se implementado):
  - Métrico (km, kg) / Imperial (mi, lb)
  
- [ ] ⚠️ **Seletor de Tema** (se implementado):
  - ☀️ Claro / 🌙 Escuro / 🔄 Auto
  
- [ ] ✅ **Auto-ajuste:** ON/OFF toggle

**Ação:** Mudar idioma de PT para EN e salvar
**Resultado:** ✅ Página recarrega em inglês

---

### ✅ PARTE 3: GERAÇÃO DE PLANO - CONVERGÊNCIA 100%

#### Teste 3.1: Gerar Plano Inicial
**URL:** `https://atherarun.com/[locale]/dashboard`

**Ação:** Clicar em "Gerar Novo Plano" (se não gerou automaticamente)

**Validar logs do console (abrir DevTools):**
```javascript
// Deve aparecer:
[PLAN GENERATION] Using athlete data:
{
  age: 30,
  weight: 72,
  gender: 'male',
  runningLevel: 'intermediate',
  currentWeeklyKm: 30,
  longestRun: 21,
  currentVDOT: XX.X,
  goalDistance: '21k',
  targetRaceDate: '...',
  targetTime: '2:00:00',
  trainingDays: [0, 2, 6], // Seg, Qua, Sáb
  longRunDay: 6, // 🔴 CRÍTICO - deve mostrar 6 (Sábado)
  hasGymAccess: true,
  hasPoolAccess: false,
  hasTrackAccess: false
}
```

**Resultado do Plano Gerado:**
- [ ] ✅ Plano tem duração correta (até data alvo)
- [ ] ✅ Volume semanal começa próximo a 30km
- [ ] ✅ Progressão gradual até pico
- [ ] ✅ **LONGÃO sempre no Sábado (dia 6)** 🔴 CRÍTICO
- [ ] ✅ Treinos de força incluídos (tem academia)
- [ ] ✅ SEM treinos de natação (não tem piscina)
- [ ] ✅ SEM treinos de pista (não tem pista)

**Verificar detalhes de uma semana:**
```
Semana X:
- Segunda (0): Treino Fácil (5-7km)
- Terça (1): -
- Quarta (2): Treino Intervalado (8km)
- Quinta (3): -
- Sexta (4): -
- Sábado (6): LONGÃO (15km) 🔴 DEVE ESTAR AQUI
- Domingo (7): -
```

**Status:**
- ❌ SE LONGÃO NÃO ESTÁ NO SÁBADO = FALHOU CRÍTICO
- ❌ SE INCLUIU NATAÇÃO (não tem piscina) = FALHOU
- ✅ SE TUDO CORRETO = PASSOU

---

#### Teste 3.2: Auto-Ajuste Detecta Mudanças
**URL:** `https://atherarun.com/[locale]/perfil` → AvailabilityTab

**Ação 1:** Mudar longRunDay de Sábado (6) para Domingo (0)
**Resultado:**
- [ ] ✅ Sistema salva nova preferência
- [ ] ✅ Auto-ajuste detecta mudança (ícone na dashboard)
- [ ] ✅ Clicar em "Aplicar Auto-Ajuste"
- [ ] ✅ **Plano atualizado com longão no Domingo**

**Ação 2:** Adicionar acesso à Piscina
**Resultado:**
- [ ] ✅ Auto-ajuste detecta
- [ ] ✅ Aplicar auto-ajuste
- [ ] ✅ **Plano inclui treinos de natação opcionais**

**Ação 3:** Editar peso no BasicDataTab
**Resultado:**
- [ ] ✅ Auto-ajuste detecta
- [ ] ✅ Recalcula paces
- [ ] ✅ Ajusta intensidades

---

### ✅ PARTE 4: TESTES DE REGRESSÃO

#### Teste 4.1: Funcionalidades Existentes
- [ ] ✅ Login funciona
- [ ] ✅ Logout funciona
- [ ] ✅ Dashboard carrega sem erros
- [ ] ✅ Strava sync funciona (se conectado)
- [ ] ✅ Training log funciona
- [ ] ✅ Race goals CRUD funciona
- [ ] ✅ Ajuste manual de treinos funciona
- [ ] ✅ Exportar plano funciona

#### Teste 4.2: Erros no Console
**Abrir DevTools → Console**
- [ ] ✅ Zero erros vermelhos
- [ ] ✅ Zero warnings críticos
- [ ] ⚠️ Warnings normais de Next.js/React são OK

#### Teste 4.3: Performance
- [ ] ✅ Onboarding carrega < 2s
- [ ] ✅ Perfil carrega < 2s
- [ ] ✅ Dashboard carrega < 2s
- [ ] ✅ Geração de plano < 30s

---

## 📊 MATRIZ DE VALIDAÇÃO FINAL

### Convergência de Dados

| Campo | Onboarding | Banco | Perfil | Plano Usa | Status |
|-------|------------|-------|--------|-----------|--------|
| age | ✅ Step1 | ✅ | ✅ Basic | ✅ | ✅ |
| weight | ✅ Step1 | ✅ | ✅ Basic | ✅ | ✅ |
| height | ✅ Step1 | ✅ | ✅ Basic | ✅ | ✅ |
| gender | ✅ Step1 | ✅ | ✅ Basic | ✅ | ✅ |
| restingHR | ✅ Step1 | ✅ | ✅ Basic | ✅ | ✅ |
| sleepQuality | ✅ Step4 | ✅ | ✅ Health | ✅ | ✅ |
| stressLevel | ✅ Step4 | ✅ | ✅ Health | ✅ | ✅ |
| **runningLevel** | ✅ Step2 | ✅ | **🔴 Perf** | ✅ | **?** |
| **runningYears** | ✅ Step2 | ✅ | **🔴 Perf** | ✅ | **?** |
| **currentWeeklyKm** | ✅ Step2 | ✅ | **🔴 Perf** | ✅ | **?** |
| **longestRun** | ✅ Step2 | ✅ | **🔴 Perf** | ✅ | **?** |
| bestTimes | ✅ Step3 | ✅ | ✅ Perf | ✅ | ✅ |
| currentVDOT | 🤖 Auto | ✅ | ✅ Perf | ✅ | ✅ |
| goalDistance | ✅ Step5 | ✅ | ✅ Goals | ✅ | ✅ |
| targetRaceDate | ✅ Step5 | ✅ | ✅ Goals | ✅ | ✅ |
| targetTime | ✅ Step5 | ✅ | ✅ Goals | ✅ | ✅ |
| **trainingDays** | ✅ Step6 | ✅ | **🔴 Avail** | ✅ | **?** |
| **longRunDay** | ✅ Step6 | ✅ | **🔴🔴 Avail** | **🔴** | **?** |
| **hasGymAccess** | ✅ Step6 | ✅ | **🔴 Avail** | **❓** | **?** |
| **hasPoolAccess** | ✅ Step6 | ✅ | **🔴 Avail** | **❓** | **?** |
| **hasTrackAccess** | ✅ Step6 | ✅ | **🔴 Avail** | **❓** | **?** |

**Legenda:**
- ✅ = Implementado e funciona
- 🔴 = Implementado mas não mostra/usa
- ❓ = Precisa validar se usa
- ? = Status a confirmar nos testes

---

## 🎯 CRITÉRIOS DE SUCESSO

### ✅ APROVADO se:
1. ✅ Auto-save funciona em todos os 7 steps
2. ✅ Step7Review mostra 100% dos dados
3. ✅ PerformanceTab mostra experiência completa
4. ✅ **AvailabilityTab mostra dias + LONGÃO DESTACADO + infraestrutura**
5. ✅ PreferencesTab permite mudar idioma
6. ✅ **Plano gerado respeita longRunDay escolhido**
7. ✅ Plano usa infraestrutura disponível
8. ✅ Auto-ajuste detecta mudanças
9. ✅ Zero erros no console
10. ✅ Convergência total: Onboarding → Perfil → Plano = 100%

### ❌ REPROVADO se:
- ❌ longRunDay não está visível no perfil
- ❌ longRunDay não é respeitado no plano
- ❌ Experiência não aparece em PerformanceTab
- ❌ Infraestrutura não aparece em AvailabilityTab
- ❌ Erros críticos no console
- ❌ Dados perdidos entre onboarding e perfil

---

## 📝 TEMPLATE DE EXECUÇÃO

```markdown
## Execução do Teste - [DATA/HORA]
**Testador:** [Nome]
**Ambiente:** Produção
**URL:** https://atherarun.com

### Parte 1: Onboarding
- [ ] Step 1: ✅ / ❌
- [ ] Step 2: ✅ / ❌
- [ ] Step 3: ✅ / ❌
- [ ] Step 4: ✅ / ❌
- [ ] Step 5: ✅ / ❌
- [ ] Step 6: ✅ / ❌
- [ ] Step 7: ✅ / ❌

### Parte 2: Perfil
- [ ] BasicDataTab: ✅ / ❌
- [ ] PerformanceTab: ✅ / ❌ (CRÍTICO)
- [ ] HealthTab: ✅ / ❌
- [ ] GoalsTab: ✅ / ❌
- [ ] AvailabilityTab: ✅ / ❌ (SUPER CRÍTICO)
- [ ] PreferencesTab: ✅ / ❌

### Parte 3: Geração de Plano
- [ ] Plano gerado: ✅ / ❌
- [ ] longRunDay respeitado: ✅ / ❌ (CRÍTICO)
- [ ] Infraestrutura usada: ✅ / ❌
- [ ] Auto-ajuste: ✅ / ❌

### Resultado Final: ✅ APROVADO / ❌ REPROVADO

**Observações:**
[Adicionar screenshots, logs, problemas encontrados]
```

---

## 🚀 PRÓXIMOS PASSOS

### Se APROVADO (✅):
1. Marcar v1.6.1 como ESTÁVEL
2. Atualizar documentação
3. Comunicar mudanças
4. Celebrar! 🎉

### Se REPROVADO (❌):
1. Documentar problemas encontrados
2. Priorizar correções
3. Implementar fixes
4. Re-executar testes

---

*Teste E2E criado em: 07/Nov/2025 18:50 UTC*  
*Versão do documento: 1.0*  
*Status: 🟢 PRONTO PARA EXECUÇÃO*
