# 🧪 TESTES E2E RECOMENDADOS - v1.6.2

**Data:** 07/Novembro/2025 19:50 UTC  
**Versão:** 1.6.2  
**Ambiente:** Produção (https://atherarun.com)  
**Tempo estimado:** 1-2 horas

---

## 🎯 OBJETIVO DOS TESTES

Validar que as **melhorias visuais v1.6.2** funcionam corretamente em produção e que a **convergência 100%** foi alcançada.

---

## 📋 CENÁRIO 1: Novo Usuário Completo

### Setup
1. Abrir navegador em modo privado
2. Acessar https://atherarun.com
3. Criar nova conta teste (ex: teste_v162@teste.com)

### Onboarding (7 Steps)

#### Step 1 - Dados Básicos
- [ ] Preencher: nome, email, idade, peso, altura, FC repouso
- [ ] Verificar auto-save funcionando (aguardar 500ms)
- [ ] Avançar para Step 2

#### Step 2 - Experiência
- [ ] Selecionar nível: Intermediário
- [ ] Anos correndo: 3
- [ ] Volume semanal: 30 km
- [ ] Longão mais longo: 18 km
- [ ] Outros esportes: "Natação e ciclismo há 5 anos"
- [ ] Verificar auto-save
- [ ] Avançar para Step 3

#### Step 3 - Performance
- [ ] Adicionar tempo: 10km em 50:00
- [ ] Verificar VDOT calculado
- [ ] Verificar auto-save
- [ ] Avançar para Step 4

#### Step 4 - Saúde
- [ ] Sono: 4/5
- [ ] Estresse: 3/5
- [ ] Sem lesões
- [ ] Verificar auto-save
- [ ] Avançar para Step 5

#### Step 5 - Objetivos
- [ ] Objetivo: Melhorar tempo
- [ ] Distância: 10km
- [ ] Data da prova: 30/Nov/2025
- [ ] Tempo alvo: 45:00
- [ ] Verificar auto-save
- [ ] Avançar para Step 6

#### Step 6 - Disponibilidade
- [ ] Selecionar dias: Segunda, Quarta, Sexta
- [ ] **LONGÃO: Sábado** (CRÍTICO)
- [ ] Academia: SIM
- [ ] Piscina: NÃO
- [ ] Pista: NÃO
- [ ] Verificar auto-save
- [ ] Avançar para Step 7

#### Step 7 - Review ✨ **VALIDAÇÃO CRÍTICA**
- [ ] **Verificar card âmbar do longão:**
  ```
  🏃‍♂️ Longão: Sábado
  Seu treino mais longo da semana será sempre neste dia
  ```
- [ ] Verificar resumo mostra:
  - 30 anos, 70kg, 175cm
  - 3 anos correndo
  - 30 km/semana
  - Longão de 18km
  - Outros esportes: Natação e ciclismo
  - 10km em 50:00
  - Academia disponível
- [ ] Clicar em "Finalizar e Criar Plano"

### Geração de Plano
- [ ] Aguardar geração (1-2 minutos)
- [ ] Verificar redirecionamento para dashboard
- [ ] Verificar plano foi criado

---

## 📋 CENÁRIO 2: Validação do Perfil

### Acesso ao Perfil
1. No dashboard, clicar em "Perfil" no menu

### PerformanceTab ✨ **NOVA FUNCIONALIDADE**

#### Resumo Visual de Experiência
- [ ] **Verificar card verde no topo:**
  ```
  🏃 Sua Experiência de Corrida
  ┌──────────────┬──────────────┐
  │ 🟡 Intermediário │ 3 anos   │
  ├──────────────┼──────────────┤
  │ 30 km/semana │ 18 km longão │
  └──────────────┴──────────────┘
  🎾 Outros Esportes: Natação e ciclismo há 5 anos
  ```

- [ ] Verificar nível mostra ícone correto:
  - Iniciante: 🟢
  - Intermediário: 🟡
  - Avançado: 🔴

- [ ] Verificar dados correspondem ao onboarding:
  - Anos: 3 ✅
  - Volume: 30 km ✅
  - Longão: 18 km ✅
  - Outros esportes: visível ✅

#### Melhores Tempos
- [ ] Verificar 10km em 50:00 aparece
- [ ] Verificar VDOT calculado
- [ ] Adicionar novo tempo: 5km em 23:00
- [ ] Salvar e verificar atualização

### AvailabilityTab

#### Resumo Visual
- [ ] Verificar dias de corrida em badges verdes:
  ```
  🏃 Dias de Corrida:
  [Segunda] [Quarta] [Sexta]
  ```

- [ ] **Verificar card âmbar do longão:**
  ```
  🏃‍♂️ Dia do Longão: Sábado
  Seu treino mais longo da semana será sempre neste dia
  ```

- [ ] Verificar infraestrutura:
  ```
  💪 Academia: ✅ Disponível
  🏊 Piscina: ❌ Não disponível
  🏃 Pista: ❌ Não disponível
  ```

#### Edição
- [ ] Mudar longRunDay para Domingo
- [ ] Salvar
- [ ] Verificar auto-ajuste do plano
- [ ] Verificar card atualizado: "Dia do Longão: Domingo"

### PreferencesTab

- [ ] Verificar seletor de idioma presente
- [ ] Mudar para English
- [ ] Verificar página recarrega em inglês
- [ ] Voltar para pt-BR
- [ ] Verificar unidades (métrico/imperial)

### BasicDataTab, HealthTab, GoalsTab
- [ ] Verificar todos os dados aparecem corretamente
- [ ] Fazer pequena edição e salvar
- [ ] Verificar atualização

---

## 📋 CENÁRIO 3: Convergência Total

### Objetivo
Validar que **100% dos dados** coletados no onboarding **aparecem no perfil**.

### Checklist de Dados

#### Dados Pessoais (BasicDataTab)
- [ ] Idade: 30 ✅
- [ ] Gênero: Masculino ✅
- [ ] Peso: 70kg ✅
- [ ] Altura: 175cm ✅
- [ ] FC Repouso: 60 bpm ✅

#### Experiência (PerformanceTab) ✨ NOVO
- [ ] Nível: Intermediário ✅
- [ ] Anos: 3 ✅
- [ ] Volume: 30 km/semana ✅
- [ ] Longão: 18 km ✅
- [ ] Outros esportes: Natação e ciclismo ✅

#### Performance (PerformanceTab)
- [ ] 10km: 50:00 ✅
- [ ] 5km: 23:00 (adicionado no teste) ✅
- [ ] VDOT: calculado ✅

#### Saúde (HealthTab)
- [ ] Sono: 4/5 ✅
- [ ] Estresse: 3/5 ✅
- [ ] Lesões: nenhuma ✅

#### Objetivos (GoalsTab)
- [ ] Objetivo: Melhorar tempo ✅
- [ ] Distância: 10km ✅
- [ ] Data: 30/Nov/2025 ✅
- [ ] Tempo alvo: 45:00 ✅

#### Disponibilidade (AvailabilityTab)
- [ ] Dias: Segunda, Quarta, Sexta ✅
- [ ] **longRunDay: Sábado → Domingo** ✅
- [ ] Academia: SIM ✅
- [ ] Piscina: NÃO ✅
- [ ] Pista: NÃO ✅

### Resultado Esperado
- [ ] **CONVERGÊNCIA: 100%** (todos os dados visíveis)
- [ ] Zero gaps entre onboarding e perfil
- [ ] Zero duplicidades
- [ ] Zero incongruências

---

## 📋 CENÁRIO 4: Geração e Plano

### Validação do Plano Gerado

#### Dashboard
- [ ] Acessar dashboard
- [ ] Verificar plano está ativo
- [ ] Verificar semana atual mostra treinos

#### Treino da Semana
- [ ] **Verificar longRunDay (Domingo) tem o treino mais longo**
- [ ] Verificar outros dias (Seg, Qua, Sex) têm treinos
- [ ] Verificar intensidades variadas
- [ ] Verificar descrições dos treinos

#### Auto-Ajuste
- [ ] Voltar ao perfil
- [ ] Mudar disponibilidade (ex: adicionar Terça)
- [ ] Verificar alerta de auto-ajuste
- [ ] Aceitar auto-ajuste
- [ ] Verificar plano foi ajustado

---

## 📋 CENÁRIO 5: Responsividade

### Desktop (1920x1080)
- [ ] PerformanceTab: cards lado a lado ✅
- [ ] AvailabilityTab: grid 3 colunas ✅
- [ ] Step7: layout compacto ✅

### Tablet (768x1024)
- [ ] PerformanceTab: cards empilhados ✅
- [ ] AvailabilityTab: grid 2 colunas ✅
- [ ] Navegação funcional ✅

### Mobile (375x667)
- [ ] PerformanceTab: cards verticais ✅
- [ ] AvailabilityTab: grid 1 coluna ✅
- [ ] Todos os dados visíveis ✅
- [ ] Sem overflow horizontal ✅

---

## 📋 CENÁRIO 6: Regressões

### Funcionalidades Existentes
- [ ] Login/Logout funciona
- [ ] Strava connect funciona
- [ ] Dashboard carrega
- [ ] Training log funciona
- [ ] Race goals funciona
- [ ] Subscription funciona
- [ ] Admin panel funciona (se admin)

### Performance
- [ ] Tempo de carregamento < 3s
- [ ] Sem erros no console
- [ ] Sem warnings críticos
- [ ] Build size aceitável

---

## ✅ CRITÉRIOS DE SUCESSO

### Obrigatório (Bloqueante se falhar)
- [ ] ✅ PerformanceTab mostra resumo de experiência
- [ ] ✅ Step7Review destaca longRunDay
- [ ] ✅ Convergência 100% validada
- [ ] ✅ Zero regressões
- [ ] ✅ Auto-save funciona em todos os steps
- [ ] ✅ longRunDay coletado, salvo, mostrado e usado

### Importante (Corrigir se falhar)
- [ ] Responsividade em todos os dispositivos
- [ ] Performance aceitável
- [ ] Zero erros no console
- [ ] Mudança de idioma funciona

### Nice to Have (Pode deixar para depois)
- [ ] Animações suaves
- [ ] Tooltips explicativos
- [ ] Loading states bonitos

---

## 📊 RELATÓRIO DE TESTES

### Template

```markdown
# Relatório de Testes E2E - v1.6.2

**Data:** __/__/2025
**Testador:** _______
**Ambiente:** Produção
**Navegador:** Chrome/Firefox/Safari

## Resultados

### Cenário 1: Novo Usuário
- Status: ✅ PASSOU / ❌ FALHOU
- Notas: _______

### Cenário 2: Validação do Perfil
- Status: ✅ PASSOU / ❌ FALHOU
- PerformanceTab visual: ✅ / ❌
- Notas: _______

### Cenário 3: Convergência Total
- Status: ✅ PASSOU / ❌ FALHOU
- Dados visíveis: __/__ (100%)
- Notas: _______

### Cenário 4: Geração e Plano
- Status: ✅ PASSOU / ❌ FALHOU
- longRunDay respeitado: ✅ / ❌
- Notas: _______

### Cenário 5: Responsividade
- Desktop: ✅ / ❌
- Tablet: ✅ / ❌
- Mobile: ✅ / ❌

### Cenário 6: Regressões
- Funcionalidades: ✅ / ❌
- Performance: ✅ / ❌

## Bugs Encontrados

1. [Descrição do bug]
   - Severidade: CRÍTICO / ALTO / MÉDIO / BAIXO
   - Reprodução: [passos]

## Conclusão

- [ ] ✅ APROVADO PARA PRODUÇÃO
- [ ] 🟡 APROVADO COM RESSALVAS
- [ ] ❌ REPROVADO - CORREÇÕES NECESSÁRIAS

**Comentários finais:**
_______
```

---

## 🚀 PRÓXIMOS PASSOS APÓS TESTES

### Se APROVADO ✅
1. Marcar v1.6.2 como stable
2. Atualizar CHANGELOG.md
3. Comunicar melhorias aos usuários
4. Monitorar métricas de uso

### Se APROVADO COM RESSALVAS 🟡
1. Criar issues para correções
2. Priorizar fixes
3. Planejar v1.6.3
4. Manter v1.6.2 em produção

### Se REPROVADO ❌
1. Identificar problemas críticos
2. Rollback se necessário
3. Corrigir bugs
4. Re-testar
5. Deploy novamente

---

## 📞 SUPORTE

**Em caso de problemas:**
1. Verificar logs do Vercel
2. Verificar logs do Neon
3. Verificar console do navegador
4. Criar issue no GitHub
5. Documentar para análise

---

*Testes E2E recomendados para v1.6.2*  
*Tempo estimado: 1-2 horas*  
*Objetivo: Validar convergência 100% em produção*
