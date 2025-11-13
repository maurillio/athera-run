# 🚨 INSTRUÇÕES CRÍTICAS - Aplicar Migração v3.0.1 no Neon

## ❌ PROBLEMA ATUAL
```
ERROR: relation "custom_workouts" does not exist (SQLSTATE 42P01)
```

**Causa**: O banco Neon não tem as colunas v2.0.0 e v3.0.0, mesmo o schema.prisma estando correto.

---

## ✅ SOLUÇÃO - Aplicar Migration Manual no Neon

### 📋 PASSO A PASSO (5 minutos)

#### 1️⃣ Acessar Neon Console
```
https://console.neon.tech/
```

#### 2️⃣ Navegar até SQL Editor
- Selecione o projeto **"Athera Run"**
- Clique em **"SQL Editor"** no menu lateral

#### 3️⃣ Executar Script de Migração
- Abra o arquivo: `neon-migration-v3.0.1-SAFE.sql`
- **COPIE TODO O CONTEÚDO** (Ctrl+A, Ctrl+C)
- **COLE** no SQL Editor do Neon
- Clique em **"Run"** ou pressione **Ctrl+Enter**

#### 4️⃣ Verificar Sucesso
O script retorna 2 tabelas ao final:

**Tabela 1: custom_workouts** (deve mostrar 13 colunas)
- warmUpStructure
- mainWorkoutStruct
- coolDownStructure
- objective
- scientificBasis
- tips
- commonMistakes
- successCriteria
- intensityLevel
- expectedRPE
- heartRateZones
- intervals
- expectedDuration

**Tabela 2: athlete_profiles** (deve mostrar 8 colunas)
- hasRunBefore
- currentlyInjured
- avgSleepHours
- tracksMenstrualCycle
- avgCycleLength
- lastPeriodDate
- workDemand
- familyDemand

#### 5️⃣ Regenerar Prisma Client (Vercel)
Após aplicar no Neon, fazer novo deploy:

```bash
git add .
git commit -m "chore: database schema v3.0.1 applied"
git push origin main
```

---

## 🛡️ SEGURANÇA DO SCRIPT

✅ **Usa IF NOT EXISTS** - Não falha se coluna já existe
✅ **Usa DO $$ blocks** - Execução segura em transação
✅ **Sem DROP** - Não apaga dados
✅ **Com NOTICES** - Mostra o que foi adicionado
✅ **Com Verificação** - Mostra resultado final

---

## 📊 O QUE O SCRIPT FAZ

### Parte 1: custom_workouts (v2.0.0)
- Adiciona 13 colunas para estrutura detalhada de treinos
- Adiciona enriquecimento educacional (objetivo, dicas, etc.)
- Adiciona métricas avançadas (intensidade, RPE, FC)

### Parte 2: athlete_profiles (v3.0.0)
- Adiciona 8 colunas para perfil multi-dimensional
- hasRunBefore (crítico!)
- currentlyInjured (importante!)
- avgSleepHours (desejável)
- Campos menstruais (opcional)
- workDemand/familyDemand (opcional)

### Parte 3: Índices
- Cria 3 índices para melhorar performance de queries

### Parte 4: Verificação
- Retorna lista de colunas criadas

---

## 🎯 RESULTADO ESPERADO

Após executar:

```sql
✅ 13 NOTICEs de colunas adicionadas em custom_workouts
✅ 8 NOTICEs de colunas adicionadas em athlete_profiles
✅ 3 NOTICEs de índices criados
✅ 2 tabelas de verificação com dados
```

---

## ⚠️ SE DER ERRO

### Erro: "permission denied"
**Causa**: Usuário sem permissão
**Solução**: Use o usuário owner do projeto

### Erro: "column already exists"
**Causa**: Script já foi executado parcialmente
**Solução**: Está OK! O script pula colunas existentes

### Erro: "table does not exist"
**Causa**: Banco errado ou projeto errado
**Solução**: Verifique se está no banco correto do Athera Run

---

## 📞 SUPORTE

Se precisar de ajuda:
1. Copie a mensagem de erro COMPLETA
2. Tire print da tela do Neon
3. Me informe qual parte do script falhou

---

## ✅ CHECKLIST FINAL

Após aplicar a migration:

- [ ] Script executou sem erros
- [ ] Tabela 1 retornou 13 linhas
- [ ] Tabela 2 retornou 8 linhas  
- [ ] Deploy no Vercel feito
- [ ] Novo plano gerado com sucesso
- [ ] Campos aparecem no plano

---

**Arquivo gerado**: `neon-migration-v3.0.1-SAFE.sql`
**Versão**: v3.0.1
**Data**: 13/NOV/2025
