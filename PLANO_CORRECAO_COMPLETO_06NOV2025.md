# 🚀 PLANO DE CORREÇÃO COMPLETO - 06 NOV 2025

## 📋 PROBLEMAS IDENTIFICADOS

### 🔴 CRÍTICO - Build Vercel Falhando
- **Erro**: `nextjs_space` directory não existe mais
- **Causa**: Estrutura do projeto foi reorganizada para a raiz
- **Impacto**: Deploy no Vercel completamente quebrado

### 🟡 URGENTE - Interpolação de Variáveis
- **Sintomas**: Textos mostrando `{variavel}` ao invés de valores
- **Locais afetados**:
  - Dashboard: `Olá, {Maurillio Oliveira}!`, `{3.5} km`, `{1:34 min/km}`
  - Plano: `phases.Base Aeróbica`, `PHASES.BASE AERÓBICA`
  - Tracking: Erro 404 em rotas com i18n

### 🟠 IMPORTANTE - Rotas i18n
- **Problema**: Inconsistência nas rotas
  - `/pt-BR/tracking` → 404
  - `/tracking` → funciona (sem locale)
- **Necessário**: Padronização completa

### 🔵 MÉDIO - Datas em Inglês
- **Local**: Plano em português mostrando `Tuesday, 4 de November`
- **Esperado**: `Terça-feira, 4 de Novembro`

### ⚪ BAIXO - Warnings Next.js
- Dynamic server usage em rotas API (não crítico, mas deve ser resolvido)

---

## 🎯 ESTRATÉGIA DE SOLUÇÃO

### OPÇÃO A - COMPLETA HOJE (6h estimado)
**Resolver TODOS os problemas de uma vez**

#### FASE 1: CORREÇÃO ESTRUTURAL (1h)
1. ✅ Corrigir vercel.json
2. ✅ Atualizar .vercelignore
3. ✅ Verificar prisma schema location
4. ✅ Testar build local

#### FASE 2: CORREÇÃO I18N (2h)
1. ✅ Corrigir interpolação de variáveis nos componentes
2. ✅ Padronizar rotas com middleware i18n
3. ✅ Corrigir formatação de datas por locale
4. ✅ Resolver chaves de tradução não interpoladas

#### FASE 3: TESTES E DEPLOY (1h)
1. ✅ Testar build completo
2. ✅ Deploy no Vercel
3. ✅ Validação em produção
4. ✅ Correção de bugs encontrados

#### FASE 4: DOCUMENTAÇÃO (2h)
1. ✅ Atualizar DOCUMENTACAO.md
2. ✅ Atualizar CONTEXTO.md
3. ✅ Criar guias de troubleshooting
4. ✅ Documentar conformidade Strava API

---

## 📝 DETALHAMENTO TÉCNICO

### 1. CORREÇÃO VERCEL

**Problema Atual:**
```json
{
  "version": 2,
  "buildCommand": "npm install --force && npx prisma generate && npx prisma migrate deploy && npm run build",
  "framework": "nextjs",
  "installCommand": "npm install --force"
}
```

**Solução:**
- Remover `rootDirectory` (não existe mais)
- Ajustar paths do Prisma
- Configurar variáveis de ambiente corretamente

### 2. CORREÇÃO INTERPOLAÇÃO

**Problema:**
```tsx
// Errado - mostrando literal
<p>Olá, {userName}!</p>
// ou
<p>{t('greeting', { name })}</p> // chave não traduzida
```

**Solução:**
```tsx
// Correto
<p>{t('greeting', { name: userName })}</p>
// com tradução:
// pt-BR: "Olá, {{name}}!"
// en: "Hello, {{name}}!"
```

### 3. ROTAS I18N

**Problema Atual:**
- `/tracking` funciona
- `/pt-BR/tracking` → 404

**Solução:**
- Middleware deve redirecionar automaticamente
- Todas as rotas devem ter prefixo de locale
- Fallback para locale padrão

### 4. DATAS LOCALIZADAS

**Problema:**
```typescript
// Atual - misto
format(date, 'EEEE, d de MMMM') // Tuesday, 4 de November
```

**Solução:**
```typescript
// Correto
import { ptBR, enUS, es } from 'date-fns/locale'
format(date, 'EEEE, d de MMMM', { locale: ptBR }) // Terça-feira, 4 de Novembro
```

---

## ✅ CHECKLIST DE EXECUÇÃO

### Pre-Deploy
- [ ] Backup do código atual
- [ ] Verificar .env configurado
- [ ] Database acessível

### Build Local
- [ ] `npm install --force` sem erros
- [ ] `npx prisma generate` OK
- [ ] `npm run build` completo
- [ ] `npm run start` funciona

### Testes Funcionais
- [ ] Login Google OK
- [ ] Dashboard carrega corretamente
- [ ] Plano mostra dados interpolados
- [ ] Tracking funciona em todos os locales
- [ ] Datas em português correto

### Deploy Vercel
- [ ] Build passa sem erros
- [ ] Migrations executam
- [ ] Variáveis de ambiente OK
- [ ] Domínio funciona

### Validação Produção
- [ ] https://atherarun.com redireciona para locale
- [ ] https://atherarun.com/pt-BR/dashboard OK
- [ ] https://atherarun.com/en/dashboard OK
- [ ] https://atherarun.com/es/dashboard OK
- [ ] Strava integration OK

---

## 🎨 CONFORMIDADE STRAVA API

### Comprometimentos com Strava
1. ✅ **Uso de IA apenas para análise e personalização**
   - Dados não usados para treinar modelos
   - IA usada apenas para gerar/ajustar planos do usuário
   
2. ✅ **Privacidade e segurança**
   - Dados armazenados de forma segura
   - Acesso apenas pelo próprio usuário
   
3. ✅ **Sem compartilhamento com terceiros**
   - Dados não vendidos ou compartilhados
   - APIs de terceiros (OpenAI) processam mas não armazenam

### Documentação Necessária
- [x] Política de privacidade atualizada
- [x] Termos de uso claros sobre IA
- [x] FAQ sobre uso de dados Strava
- [ ] Adicionar na documentação técnica

---

## 📊 ESTIMATIVA DE TEMPO

| Fase | Tarefa | Tempo | Status |
|------|--------|-------|--------|
| 1 | Corrigir Vercel config | 30min | ⏳ |
| 1 | Testar build local | 30min | ⏳ |
| 2 | Corrigir interpolação | 60min | ⏳ |
| 2 | Padronizar rotas | 30min | ⏳ |
| 2 | Corrigir datas | 30min | ⏳ |
| 3 | Deploy e validação | 60min | ⏳ |
| 4 | Documentação | 120min | ⏳ |
| **TOTAL** | | **6h** | |

---

## 🚦 PRÓXIMOS PASSOS

1. **Confirmação do usuário**: Opção A escolhida ✅
2. **Início imediato**: Fase 1 - Correção Estrutural
3. **Progresso contínuo**: Atualização a cada 30min
4. **Finalização**: Validação completa em produção

---

**Status**: 🟡 AGUARDANDO CONFIRMAÇÃO PARA INICIAR
**Última atualização**: 06 NOV 2025 - 19:51 UTC
