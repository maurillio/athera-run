# 🔍 DIAGNÓSTICO COMPLETO DO SISTEMA - 05 NOV 2025

## 📋 PROBLEMAS IDENTIFICADOS

### 1. ❌ STRAVA API - COMPLIANCE PENDENTE
**Status:** 🔴 CRÍTICO - Aguardando aprovação  
**Impacto:** Integração bloqueada até resposta completa

**Questões do Strava:**
1. Se o projeto usa IA/ML
2. Como dados da API serão usados
3. Medidas de conformidade com termos de serviço
4. Se terceiros terão acesso aos dados

**Ação Necessária:** Responder formulário com detalhes sobre:
- Uso de IA apenas para análise personalizada
- ZERO treinamento de modelos com dados Strava
- Dados usados exclusivamente para melhorar plano do atleta
- Nenhum terceiro tem acesso

---

### 2. ❌ GOOGLE OAUTH - Erro de Autenticação
**Status:** 🟡 RESOLVIDO PARCIALMENTE  
**Problema:** Coluna `users.locale` não existe no banco

**Erro:**
```
PrismaClientKnownRequestError: The column `users.locale` does not exist in the current database.
```

**Causa Raiz:**
- Migration `20251104215000_add_user_locale` não foi aplicada no banco de produção
- Build do Vercel executa migrations, mas banco já tinha schema antigo

**Solução Implementada:**
- ✅ Migration existe: `nextjs_space/prisma/migrations/20251104215000_add_user_locale/`
- ⚠️ PENDENTE: Aplicar migration manualmente no banco

---

### 3. ❌ VERCEL BUILD - Erro de Prisma Schema
**Status:** 🔴 CRÍTICO - Build falhando  
**Erro:**
```
Error: Could not find Prisma Schema
Error: There is a conflict between env vars in ../.env and .env
Conflicting env vars:
  STRAVA_CLIENT_ID
  GOOGLE_CLIENT_ID
```

**Causa Raiz:**
1. **Diretório duplicado:** `nextjs_space/nextjs_space/.env` (criado acidentalmente)
2. **Schema path:** Prisma não encontra `schema.prisma`
3. **Build command:** Não especifica caminho do schema

**Solução:**
```bash
# Remover diretório duplicado
rm -rf nextjs_space/nextjs_space/

# Atualizar build command no Vercel
cd nextjs_space && npm install --force && npx prisma generate --schema=./prisma/schema.prisma && npx prisma migrate deploy && npm run build
```

---

### 4. ❌ INTERNACIONALIZAÇÃO - Problemas de Formato
**Status:** 🟡 PARCIAL - Interpolação funcionando, datas em inglês

#### 4.1 Datas em Inglês
**Problema:** "Tuesday, 4 de November" (mistura inglês/português)  
**Onde:** `/plano` e `/dashboard`  
**Causa:** `formatLocalizedDate()` usando locale errado

**Arquivos Afetados:**
- `app/[locale]/plano/page.tsx`
- `app/[locale]/dashboard/page.tsx`

#### 4.2 Chaves de Tradução Visíveis
**Problema:** Exibindo `{Maurillio Oliveira}` ao invés de "Maurillio Oliveira"  
**Onde:** Dashboard, Plano  
**Causa:** Interpolação não funcionando corretamente

**Exemplo:**
```tsx
// Aparece: Olá, {Maurillio Oliveira}! 👋
// Deveria: Olá, Maurillio Oliveira! 👋

// Aparece: 📍 {3.5} km • Pace: {1:34 min/km}
// Deveria: 📍 3.5 km • Pace: 1:34 min/km
```

#### 4.3 Chaves Literais (PHASES.BASE AERÓBICA)
**Problema:** Exibindo chave literal ao invés da tradução  
**Onde:** `/plano` (cards de treino)  
**Exemplo:**
```
PHASES.BASE AERÓBICA  // ❌ Errado
phases.Base Aeróbica  // ❌ Errado (outro local)
```

**Deveria:** "Base Aeróbica" (traduzido)

---

### 5. ❌ ROTAS i18n - /pt-BR/tracking Não Funciona
**Status:** 🟡 CONFIGURAÇÃO INCORRETA  
**Problema:** Rota com locale retorna 404

**Comportamento:**
- `https://atherarun.com/tracking` ✅ Funciona
- `https://atherarun.com/pt-BR/tracking` ❌ 404
- `https://atherarun.com/en/tracking` ❌ 404

**Causa:** Middleware não está incluindo `/tracking` nas rotas i18n

---

### 6. ⚠️ ERROS DE LOG - Dynamic Server Usage
**Status:** 🟢 COMPORTAMENTO ESPERADO (mas logs poluídos)  
**Erro:**
```
Dynamic server usage: Route /api/admin/users couldn't be rendered statically 
because it used `headers`.
```

**Rotas Afetadas:**
- `/api/admin/users`
- `/api/profile/auto-adjust-settings`
- `/api/profile/medical`
- `/api/subscription/status`

**Explicação:** Next.js 14 tenta renderizar rotas estaticamente por padrão. Quando uma rota usa `headers()` (para autenticação), ela se torna dinâmica. O erro é apenas um **warning**, não impede funcionamento.

**Solução:** Adicionar `export const dynamic = 'force-dynamic'` em cada rota

---

## 🎯 PLANO DE CORREÇÃO COMPLETO

### FASE A - CRÍTICO (Deploy Bloqueado) ⏱️ 2h

#### A1. Corrigir Build Vercel
```bash
# 1. Remover diretório duplicado
rm -rf nextjs_space/nextjs_space/

# 2. Atualizar .vercelignore
echo "nextjs_space/nextjs_space/.env" >> .vercelignore

# 3. Atualizar build command no Vercel Dashboard
cd nextjs_space && npm install --force && npx prisma generate --schema=./prisma/schema.prisma && npx prisma migrate deploy && npm run build
```

#### A2. Aplicar Migration de Locale
```bash
# No servidor do banco de dados
cd /root/athera-run/nextjs_space
npx prisma migrate deploy
```

#### A3. Testar Build
```bash
cd nextjs_space
npm run build
```

---

### FASE B - INTERNACIONALIZAÇÃO ⏱️ 3h

#### B1. Corrigir Formatação de Datas
**Arquivo:** `lib/utils/date-formatter.ts`

```typescript
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

export function formatLocalizedDate(date: Date | string, locale: string): string {
  const dayjsLocale = locale === 'pt-BR' ? 'pt-br' : locale === 'es' ? 'es' : 'en';
  return dayjs(date).locale(dayjsLocale).format('dddd, D [de] MMMM');
}
```

#### B2. Corrigir Interpolação em Traduções
**Problema:** Hooks de tradução não estão substituindo variáveis

**Arquivos a verificar:**
- `lib/i18n/hooks.ts` (hook useTranslations)
- `app/[locale]/dashboard/page.tsx`
- `app/[locale]/plano/page.tsx`

**Solução:** Garantir que o hook suporte tanto `{key}` quanto `{{key}}`

#### B3. Corrigir Namespace de Fases
**Problema:** `PHASES.BASE AERÓBICA` ao invés de tradução

**Verificar:**
- Arquivo de tradução: `lib/i18n/locales/pt-BR/phases.json`
- Componente usando: buscar por "PHASES." no código

---

### FASE C - ROTAS i18n ⏱️ 1h

#### C1. Verificar Middleware
**Arquivo:** `middleware.ts`

Garantir que TODAS as 17 rotas estão incluídas:
```typescript
const i18nRoutes = [
  '/', '/login', '/signup', '/onboarding', '/dashboard',
  '/plano', '/perfil', '/tracking', '/training', '/calculator',
  '/chat', '/subscription', '/nutrition', '/prevention',
  '/glossary', '/overtraining', '/pricing', '/admin'
];
```

#### C2. Verificar Estrutura de Pastas
```bash
# Deve existir:
app/[locale]/tracking/page.tsx
```

---

### FASE D - POLISH ⏱️ 30min

#### D1. Silenciar Warnings de Dynamic Server
Adicionar em cada API route afetada:
```typescript
export const dynamic = 'force-dynamic';
```

**Arquivos:**
- `app/api/admin/users/route.ts`
- `app/api/profile/auto-adjust-settings/route.ts`
- `app/api/profile/medical/route.ts`
- `app/api/subscription/status/route.ts`

---

### FASE E - STRAVA API COMPLIANCE ⏱️ 1h

#### E1. Preparar Resposta Detalhada

**Documento:** `RESPOSTA_STRAVA_API_05NOV2025.md`

**Conteúdo:**
1. **Uso de IA:**
   - Sim, usamos IA (OpenAI GPT-4o)
   - Apenas para análise personalizada dos dados do atleta
   - ZERO treinamento de modelos com dados Strava

2. **Como usamos dados da API:**
   - Sincronização de atividades (distância, pace, FC)
   - Associação com treinos planejados
   - Análise de progresso individual
   - Sugestões de ajuste de plano

3. **Medidas de conformidade:**
   - Dados armazenados criptografados (AES-256)
   - Tokens Strava com refresh automático
   - Política de retenção: 90 dias após desconexão
   - LGPD compliant
   - Não compartilhamos com terceiros
   - Não vendemos dados
   - Não treinamos modelos de IA

4. **Terceiros:**
   - Nenhum terceiro tem acesso direto aos dados Strava
   - OpenAI processa apenas contexto agregado (sem PII)
   - Vercel (hosting) - SOC 2 Type II certified
   - PostgreSQL (banco próprio) - acesso restrito

#### E2. Preencher Formulário Strava
- Acessar Developer Dashboard
- Atualizar Application Settings
- Adicionar Client IDs de staging/development
- Submeter para revisão

---

## 📊 AUDITORIA GERAL DO SISTEMA

### Inconsistências Encontradas

#### 1. Documentação Desatualizada
**Problema:** CONTEXTO.md e DOCUMENTACAO.md não mencionam:
- Sistema de i18n implementado (v1.4.0)
- 17 rotas migradas para [locale]
- Novo fluxo de builds com Prisma

**Ação:** Atualizar ambos documentos

#### 2. Estrutura de Diretórios Confusa
**Problema:**
```
athera-run/
├── nextjs_space/          # Diretório principal
│   └── nextjs_space/     # ❌ Duplicado acidentalmente
│       └── .env          # ❌ Conflito
```

**Ação:** Documentar estrutura correta

#### 3. Variáveis de Ambiente
**Problema:** `.env` existe em dois lugares
**Solução:** Manter apenas em `/root/athera-run/nextjs_space/.env`

#### 4. Migrations sem Documentação
**Problema:** 20+ migrations sem explicação do que fazem

**Ação:** Criar `GUIA_MIGRATIONS.md` com:
- Lista de todas migrations
- O que cada uma faz
- Ordem de aplicação
- Como reverter

---

## 🚀 EXECUÇÃO DO PLANO

### Opção A - Completo Hoje (6h)
Fazer TODAS as fases A, B, C, D, E em sequência

### Opção B - Priorizado (3h)
Fazer apenas A, B (build + i18n crítico)

### Opção C - Mínimo Viável (1h)
Fazer apenas A (desbloquear build)

---

## 📝 CHECKLIST DE VERIFICAÇÃO

### Antes de Iniciar
- [ ] Backup do banco de dados
- [ ] Commit atual do Git
- [ ] Vercel deployment pausado (opcional)

### Durante Execução
- [ ] Testar cada fase isoladamente
- [ ] Commit incremental a cada fase
- [ ] Verificar logs do Vercel
- [ ] Testar em produção após cada deploy

### Após Conclusão
- [ ] Build passando ✅
- [ ] Datas em português correto ✅
- [ ] Interpolação funcionando ✅
- [ ] Todas rotas /[locale]/* funcionando ✅
- [ ] Google OAuth funcionando ✅
- [ ] Logs limpos (sem warnings desnecessários) ✅
- [ ] Documentação atualizada ✅
- [ ] Resposta Strava enviada ✅

---

## 🎯 RECOMENDAÇÕES PARA PREVENÇÃO

### 1. CI/CD Aprimorado
```yaml
# Adicionar ao workflow do Vercel
- Verificar migrations pendentes
- Rodar testes de i18n
- Validar todas rotas [locale]
- Lint de traduções
```

### 2. Documentação Automatizada
```bash
# Script para verificar docs atualizados
./scripts/check-docs.sh
```

### 3. Monitoring
- Sentry para erros de runtime
- Vercel Analytics para performance
- Custom logs para i18n

### 4. Testing
- Testes automatizados para interpolação
- Testes de rotas i18n
- Testes de migrations

---

## 📚 DOCUMENTAÇÃO A ATUALIZAR

1. **CONTEXTO.md**
   - Adicionar seção i18n
   - Atualizar build command
   - Mencionar Strava compliance

2. **DOCUMENTACAO.md**
   - Adicionar fluxo de i18n
   - Atualizar stack (dayjs, next-intl)

3. **GUIA_TECNICO.md**
   - Adicionar seção de i18n
   - Documentar formatação de datas
   - Guia de traduções

4. **CRIAR: GUIA_MIGRATIONS.md**
   - Listar todas migrations
   - Como aplicar/reverter
   - Troubleshooting

5. **CRIAR: RESPOSTA_STRAVA_API_05NOV2025.md**
   - Resposta completa para Strava
   - Evidências de compliance
   - Políticas de dados

---

**Preparado por:** Claude AI  
**Data:** 05 de Novembro de 2025  
**Versão:** 1.0.0
