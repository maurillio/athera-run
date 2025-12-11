# 🧪 Athera Run - Automated Testing Suite

Sistema completo de testes automatizados para validar convergência de dados e saúde do sistema.

## 📋 Índice

- [Quick Start](#quick-start)
- [Tipos de Testes](#tipos-de-testes)
- [Como Rodar](#como-rodar)
- [Interpretando Resultados](#interpretando-resultados)
- [CI/CD Integration](#cicd-integration)

---

## 🚀 Quick Start

```bash
# 1. Health Check Rápido (30 segundos)
npm run test:health

# 2. Convergência Completa (2-3 minutos)
npm run test:convergence

# 3. Todos os Testes (5 minutos)
npm run test:all
```

---

## 📊 Tipos de Testes

### 1. **Health Check** (`test:health`)

**Duração:** ~30 segundos  
**Quando usar:** Antes de iniciar desenvolvimento, após deploy, troubleshooting

**Valida:**
- ✅ Conexão com banco de dados
- ✅ Variáveis de ambiente obrigatórias
- ✅ Schema do Prisma correto
- ✅ Dependências críticas instaladas

**Output Esperado:**
```
╔═══════════════════════════════════════════════════════════════╗
║              ATHERA RUN - HEALTH CHECK                        ║
╚═══════════════════════════════════════════════════════════════╝

🔍 Running health checks...

✅ Environment: All required variables present
   Details: {"checked":4}
✅ Database: Connected successfully
   Details: {"userCount":127}
✅ Schema: Schema structure valid
   Details: {"sampleProfileFound":true}

╔═══════════════════════════════════════════════════════════════╗
║  ✅ ALL CHECKS PASSED - System is healthy!                   ║
╚═══════════════════════════════════════════════════════════════╝
```

---

### 2. **Convergence Validator** (`test:convergence`)

**Duração:** ~2-3 minutos  
**Quando usar:** Após mudanças no onboarding, perfil ou geração de planos

**Valida:**
- ✅ **Onboarding → Database:** Todos os campos salvos?
- ✅ **Database → Profile:** Todos os campos acessíveis?
- ✅ **Profile → Plan:** Dados usados corretamente na IA?
- ✅ **longRunDay:** Respeitado no plano gerado?
- ✅ **Infraestrutura:** Academia/piscina usada corretamente?
- ✅ **Taxa de Convergência:** Target >85%

**Perfis Testados:**
1. **beginner_5k:** Iniciante, 3 dias/semana, sem experiência
2. **intermediate_half:** Intermediário, 4 dias/semana, com Strava
3. **advanced_marathon:** Avançado, 6 dias/semana, experiência completa

**Output Esperado:**
```
╔═══════════════════════════════════════════════════════════════╗
║         ATHERA RUN - CONVERGENCE VALIDATION SUITE            ║
╚═══════════════════════════════════════════════════════════════╝

🧪 TESTING PROFILE: BEGINNER_5K
═══════════════════════════════════════════════════════════════

1️⃣  Creating test user...
   ✅ User created: test-convergence-beginner_5k@atherarun.test

2️⃣  Creating athlete profile...
   ✅ Profile created: ID 12345

3️⃣  Validating database persistence...
   ✅ Database Persistence
   📊 DETAILS: {
     "profileId": 12345,
     "savedFields": 47,
     "populatedFields": 42,
     "convergenceRate": "89.4%"
   }

4️⃣  Validating data convergence...
   ✅ Data Convergence
   📊 DETAILS: {
     "totalFields": 47,
     "populatedFields": 42,
     "convergenceRate": "89.4%",
     "target": "85%",
     "status": "PASS"
   }

╔═══════════════════════════════════════════════════════════════╗
║                      FINAL SUMMARY                            ║
╚═══════════════════════════════════════════════════════════════╝

   ✅ beginner_5k
   ✅ intermediate_half

   📊 Success Rate: 100.0% (2/2)

   🎉 ALL TESTS PASSED! System is 100% convergent!
```

---

## 🎯 Como Rodar

### Localmente (Desenvolvimento)

```bash
# 1. Certifique-se que o .env.local está configurado
cat .env.local | grep DATABASE_URL

# 2. Rode health check
npm run test:health

# 3. Se passou, rode convergência
npm run test:convergence
```

### Em Produção (Vercel)

```bash
# Rode remotamente via SSH ou Vercel CLI
vercel env pull .env.local
npm run test:health
```

### CI/CD (GitHub Actions)

Veja seção [CI/CD Integration](#cicd-integration) abaixo.

---

## 📖 Interpretando Resultados

### ✅ **PASSOU (Success Rate: 100%)**

**O que significa:**
- Todos os campos são salvos no banco ✅
- Todos os campos são exibidos no perfil ✅
- Todos os campos são usados na geração do plano ✅
- longRunDay está no dia correto ✅
- Infraestrutura respeitada ✅

**O que fazer:**
- Nada! Sistema 100% convergente 🎉
- Pode fazer deploy com confiança

---

### ⚠️ **WARNINGS (Success Rate: 100% mas com avisos)**

**Exemplo de Warnings:**
```
⚠️  WARNINGS:
    - Null critical fields: otherSportsExperience, bestTimes
    - Low convergence rate: 78.3%
```

**O que significa:**
- Sistema funciona, mas alguns campos opcionais estão vazios
- Taxa de convergência abaixo do ideal (<85%)

**O que fazer:**
- Revisar se campos opcionais deveriam ser obrigatórios
- Verificar se há duplicação de dados
- Considerar ajustar coleta no onboarding

---

### ❌ **FALHOU (Success Rate: <100%)**

**Exemplo de Erros:**
```
❌ ERRORS:
    - Field 'longRunDay': expected 6, got null
    - Plan includes swimming but user has no pool access
```

**O que significa:**
- Dados críticos não estão sendo salvos/usados corretamente
- Lógica de negócio violada (ex: natação sem piscina)

**O que fazer:**
1. Revisar código do onboarding (salvamento)
2. Revisar API de criação de perfil
3. Revisar lógica de geração de planos
4. **NÃO fazer deploy até corrigir**

---

## 🤖 CI/CD Integration

### GitHub Actions

Crie `.github/workflows/tests.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Health Check
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: npm run test:health
        
      - name: Convergence Tests
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: npm run test:convergence
```

### Vercel Deploy Hook

Adicione check antes de deploy:

```json
{
  "scripts": {
    "predeploy": "npm run test:health && npm run test:convergence",
    "deploy": "vercel --prod"
  }
}
```

---

## 🛠️ Troubleshooting

### "Cannot connect to database"

```bash
# Verifique a variável
echo $DATABASE_URL

# Teste conexão manual
npx prisma db push --preview-feature
```

### "Missing required variables"

```bash
# Liste variáveis necessárias
cat tests/e2e/health-check.ts | grep "required = \["

# Configure as que faltam
cp .env.example .env.local
# Edite .env.local
```

### "Schema structure invalid"

```bash
# Regenere Prisma Client
npx prisma generate

# Rode migrations
npx prisma db push
```

---

## 📈 Métricas de Sucesso

| Métrica | Target | Crítico |
|---------|--------|---------|
| **Health Check Pass Rate** | 100% | Sim |
| **Convergência Total** | 100% | Sim |
| **Convergence Rate** | ≥85% | Não |
| **Campos Críticos Preenchidos** | 100% | Sim |
| **longRunDay Respeitado** | 100% | Sim |

---

## 🎓 Boas Práticas

1. **✅ Rode health check SEMPRE antes de começar a trabalhar**
2. **✅ Rode convergência APÓS mudanças no onboarding/perfil**
3. **✅ Rode todos os testes ANTES de fazer PR**
4. **✅ Adicione ao CI/CD para prevenir quebras**
5. **❌ NUNCA faça deploy com testes falhando**

---

## 📞 Suporte

- **Documentação:** [/docs](/docs)
- **Issues:** GitHub Issues
- **Logs:** Vercel Dashboard → Logs

---

*Última atualização: 09/Dez/2025*
