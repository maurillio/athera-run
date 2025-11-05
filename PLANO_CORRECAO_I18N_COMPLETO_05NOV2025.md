# PLANO DE CORREÇÃO COMPLETO - i18n E PROBLEMAS GERAIS
**Data**: 05/11/2025
**Status**: PREPARAÇÃO PARA EXECUÇÃO

## 🎯 RESUMO EXECUTIVO

Identificamos 6 problemas críticos que afetam a experiência do usuário:

1. **Interpolação de variáveis quebrada** - {name}, {distance}, etc. aparecem literais
2. **Datas em inglês** nos planos em português
3. **Rotas i18n quebradas** - /pt-BR/tracking retorna 404
4. **Inconsistência nas rotas** - algumas com /locale/, outras sem
5. **Build falhando no Vercel** - conflito de .env e estrutura
6. **Coluna `locale` faltando** no banco de dados - erro no Google OAuth

---

## 📋 ANÁLISE DETALHADA DOS PROBLEMAS

### PROBLEMA 1: Interpolação de Variáveis

**Sintoma**: 
```
Olá, {Maurillio Oliveira}! 👋
📍 {3.5} km • Pace: {1:34 min/km}
PHASES.BASE AERÓBICA
```

**Causa Raiz**:
- As traduções usam `{{name}}` (sintaxe Handlebars)
- O código de interpolação suporta ambas as sintaxes
- Problema: valores não estão sendo passados corretamente nas chamadas `t()`

**Localização**:
- Dashboard: `/nextjs_space/app/[locale]/dashboard/page.tsx` linha 226
- Plano: `/nextjs_space/app/[locale]/plano/page.tsx`
- Workout cards: componentes que exibem distância, pace, etc.

**Exemplo do Problema**:
```typescript
// ❌ ERRADO - não está passando os valores
<div>{t('welcome')}</div>

// ✅ CORRETO
<div>{t('welcome', { name: session.user.name })}</div>
```

### PROBLEMA 2: Datas em Inglês

**Sintoma**: 
```
"Tuesday, 4 de November" (mistura inglês/português)
```

**Causa Raiz**:
- dayjs está configurado mas pode não estar aplicando o locale corretamente
- Formatação de datas pode estar usando funções que não respeitam o locale

**Localização**:
- `/nextjs_space/lib/utils/date-formatter.ts`
- Componentes que exibem datas (workout cards, plano, dashboard)

### PROBLEMA 3: Rotas i18n Quebradas

**Sintoma**:
- `/tracking` funciona
- `/pt-BR/tracking` retorna 404
- Inconsistência na aplicação

**Causa Raiz**:
- Algumas páginas não estão na estrutura `app/[locale]/`
- Middleware i18n pode não estar redirecionando corretamente

**Páginas Afetadas**:
- `/tracking`
- Possivelmente outras páginas antigas

### PROBLEMA 4: Build no Vercel

**Sintomas**:
- Erro: "cd: nextjs_space: No such file or directory"
- Conflito entre .env no root e nextjs_space/.env

**Causa Raiz**:
- `.vercelignore` pode estar excluindo incorretamente
- Estrutura de pastas confusa (há um `nextjs_space/nextjs_space/` que foi ignorado)
- Dois arquivos .env conflitantes

### PROBLEMA 5: Coluna `locale` Faltando

**Sintoma**:
```
The column `users.locale` does not exist in the current database
```

**Causa Raiz**:
- Migration não foi aplicada no banco de produção
- Prisma schema tem a coluna, mas banco não

---

## 🔧 PLANO DE CORREÇÃO - OPÇÃO A (6 HORAS)

### FASE 1: PREPARAÇÃO E AUDITORIA (45min)

**1.1 Auditoria Completa de i18n**
```bash
# Buscar todos os usos de t() sem interpolação adequada
grep -r "t('.*'" nextjs_space/app --include="*.tsx" 
grep -r "t(\".*\"" nextjs_space/app --include="*.tsx"

# Buscar formatações de data
grep -r "formatLocalizedDate\|formatShortDate\|dayjs" nextjs_space --include="*.tsx"

# Verificar estrutura de rotas
find nextjs_space/app -type d -name "[locale]"
find nextjs_space/app -maxdepth 2 -type f -name "page.tsx"
```

**1.2 Verificar Traduções**
- Padronizar sintaxe: usar `{{variable}}` em todos os arquivos JSON
- Verificar completude: todas as chaves têm tradução em pt-BR, en, es

**1.3 Mapear Rotas**
- Listar todas as páginas que NÃO estão em `[locale]/`
- Verificar quais precisam de i18n

### FASE 2: CORREÇÕES CRÍTICAS (2h 30min)

**2.1 Corrigir Interpolação de Variáveis (1h)**

Arquivos a Corrigir:
1. `/nextjs_space/app/[locale]/dashboard/page.tsx`
2. `/nextjs_space/app/[locale]/plano/page.tsx`
3. `/nextjs_space/components/workout-card.tsx` (se existir)
4. Todos os componentes que exibem dados dinâmicos

Padrão de Correção:
```typescript
// ANTES
<div>{t('welcome')}</div>
<div>{t('workoutDistance')}</div>

// DEPOIS
<div>{t('welcome', { name: session.user?.name || 'Corredor' })}</div>
<div>{t('workoutDistance', { distance: workout.distance, pace: workout.pace })}</div>
```

**2.2 Corrigir Formatação de Datas (45min)**

Criar/atualizar `/nextjs_space/lib/utils/date-formatter.ts`:
```typescript
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import 'dayjs/locale/en';
import 'dayjs/locale/es';

export function formatLocalizedDate(date: string | Date, locale: string, format = 'LL'): string {
  const dayjsLocale = locale === 'pt-BR' ? 'pt-br' : locale === 'es' ? 'es' : 'en';
  return dayjs(date).locale(dayjsLocale).format(format);
}

export function formatShortDate(date: string | Date, locale: string): string {
  const dayjsLocale = locale === 'pt-BR' ? 'pt-br' : locale === 'es' ? 'es' : 'en';
  return dayjs(date).locale(dayjsLocale).format('ddd, DD/MM');
}

export function formatWeekRange(startDate: string, endDate: string, locale: string): string {
  const dayjsLocale = locale === 'pt-BR' ? 'pt-br' : locale === 'es' ? 'es' : 'en';
  const start = dayjs(startDate).locale(dayjsLocale);
  const end = dayjs(endDate).locale(dayjsLocale);
  
  return `${start.format('DD/MM')} - ${end.format('DD/MM')}`;
}
```

Aplicar em TODOS os componentes que exibem datas.

**2.3 Corrigir Traduções de Fases (15min)**

Problema: `PHASES.BASE AERÓBICA` e `phases.Construção`

Solução:
```typescript
// Em plano/page.tsx e dashboard/page.tsx
const getPhaseLabel = (phase: string) => {
  const phaseKey = phase.toLowerCase().replace(/\s+/g, '');
  return tPlano(`phases.${phaseKey}`, phase);
};

// No arquivo de tradução pt-BR.json
"plano": {
  "phases": {
    "baseaerobia": "Base Aeróbica",
    "construcao": "Construção",
    "pico": "Pico",
    "taper": "Taper"
  }
}
```

**2.4 Migrar Páginas para [locale] (30min)**

Páginas que precisam migração:
- `/tracking` → `/[locale]/tracking`
- Verificar outras páginas antigas

### FASE 3: CORREÇÕES DE INFRAESTRUTURA (1h 30min)

**3.1 Resolver Conflito de .env (15min)**

```bash
# Remover .env do root (se existir)
rm /root/athera-run/.env

# Garantir que apenas nextjs_space/.env existe
# Atualizar .gitignore para garantir isso
```

Atualizar `.vercelignore`:
```
# Ignore .env files in root (Prisma should only use nextjs_space/.env)
.env
.env.*
!nextjs_space/.env

# Ignore nested duplicates
nextjs_space/nextjs_space/

# Ignore docs (keep markdown organized)
AUDITORIA_*.md
DIAGNOSTICO_*.md
... (resto do arquivo)
```

**3.2 Adicionar Migration da Coluna locale (15min)**

Criar migration:
```sql
-- nextjs_space/prisma/migrations/YYYYMMDDHHMMSS_add_user_locale/migration.sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locale" TEXT NOT NULL DEFAULT 'pt-BR';
```

Atualizar schema.prisma (se não tiver):
```prisma
model User {
  // ... outros campos
  locale            String        @default("pt-BR")
}
```

Aplicar migration:
```bash
cd nextjs_space
npx prisma migrate deploy
```

**3.3 Atualizar Build Config (15min)**

Atualizar `vercel.json`:
```json
{
  "version": 2,
  "buildCommand": "cd nextjs_space && npx prisma generate && npx prisma migrate deploy && npm run build",
  "framework": "nextjs",
  "installCommand": "cd nextjs_space && npm install --force",
  "env": {
    "PRISMA_SCHEMA_PATH": "./prisma/schema.prisma"
  }
}
```

**3.4 Configurar Google OAuth Corretamente (30min)**

No Google Cloud Console:
1. Adicionar TODAS as URIs de redirecionamento:
```
https://atherarun.com/api/auth/callback/google
https://atherarun.com/pt-BR/api/auth/callback/google
https://atherarun.com/en/api/auth/callback/google
https://atherarun.com/es/api/auth/callback/google
```

2. Verificar origens JavaScript autorizadas:
```
https://atherarun.com
```

3. Atualizar nextjs_space/.env:
```
NEXTAUTH_URL=https://atherarun.com
NEXTAUTH_SECRET=<seu-secret>
```

**3.5 Resolver Erros de API Routes (15min)**

Problema: `Dynamic server usage: Route couldn't be rendered statically`

Solução - adicionar no topo de cada API route afetada:
```typescript
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
```

Arquivos a atualizar:
- `/nextjs_space/app/api/admin/users/route.ts`
- `/nextjs_space/app/api/profile/auto-adjust-settings/route.ts`
- `/nextjs_space/app/api/profile/medical/route.ts`
- `/nextjs_space/app/api/subscription/status/route.ts`

### FASE 4: TESTES E VALIDAÇÃO (1h)

**4.1 Testes Locais (30min)**

```bash
# Build local
cd nextjs_space
npm run build

# Testar servidor de produção
npm run start

# Verificar:
# - Dashboard com interpolação correta
# - Datas em português
# - Navegação i18n funcionando
# - Rotas /pt-BR/tracking, /en/tracking, /es/tracking
```

**4.2 Deploy e Testes em Produção (30min)**

```bash
git add .
git commit -m "fix(i18n): corrigir interpolação, datas e rotas completas"
git push origin main
```

Verificar em produção:
- [ ] Dashboard exibe "Olá, Maurillio!" sem chaves
- [ ] Distâncias e paces aparecem corretamente
- [ ] Datas em português (ou idioma selecionado)
- [ ] Fases do plano traduzidas corretamente
- [ ] Rotas /pt-BR/*, /en/*, /es/* funcionam
- [ ] Google OAuth funciona sem erros
- [ ] Build do Vercel completa com sucesso

### FASE 5: DOCUMENTAÇÃO E PREVENÇÃO (15min)

**5.1 Atualizar CONTEXTO.md**

Adicionar seções:
- Sistema de i18n e como usar interpolação
- Formatação de datas localizada
- Estrutura de rotas com [locale]
- Configuração do Vercel
- Configuração do Google OAuth

**5.2 Criar Checklist para Novos Componentes**

```markdown
## Checklist de i18n para Novos Componentes

- [ ] Página está em `app/[locale]/`?
- [ ] Usa `useTranslations()` para textos?
- [ ] Passa valores para interpolação quando necessário?
  - Exemplo: `t('welcome', { name: user.name })`
- [ ] Usa `formatLocalizedDate()` para datas?
- [ ] Usa `useLocale()` para obter locale atual?
- [ ] Testou em pt-BR, en e es?
```

---

## 📊 RESUMO DE TEMPO

| Fase | Tempo | Descrição |
|------|-------|-----------|
| 1 | 45min | Preparação e Auditoria |
| 2 | 2h 30min | Correções Críticas |
| 3 | 1h 30min | Infraestrutura |
| 4 | 1h | Testes e Validação |
| 5 | 15min | Documentação |
| **TOTAL** | **6h** | **Correção Completa** |

---

## 🎯 CRITÉRIOS DE SUCESSO

### Funcionalidades Corrigidas
- [x] Interpolação de variáveis funciona (sem chaves literais)
- [x] Datas aparecem no idioma correto
- [x] Todas as rotas i18n funcionam (/pt-BR/*, /en/*, /es/*)
- [x] Build do Vercel completa
- [x] Google OAuth funciona
- [x] Fases do plano traduzidas
- [x] API routes não geram erros

### Conformidade com Strava API
Garantir que:
- [x] Dados do Strava são usados APENAS para análise do plano do usuário
- [x] Não alimentam modelos de IA de terceiros
- [x] Não são compartilhados com outras plataformas
- [x] Usuário tem controle total (pode desconectar a qualquer momento)

---

## 📝 NOTAS IMPORTANTES

1. **Backup**: Fazer backup do banco antes de rodar migrations
2. **Cache**: Limpar cache do Vercel antes de testar
3. **Env Vars**: Verificar todas as env vars no Vercel dashboard
4. **Strava**: Documentar o uso correto dos dados na documentação

---

## 🚀 PRÓXIMOS PASSOS APÓS CORREÇÃO

1. Realizar auditoria completa de acessibilidade
2. Otimizar performance (lazy loading, code splitting)
3. Adicionar testes automatizados para i18n
4. Implementar preview de builds antes de deploy
5. Configurar monitoring e alertas

---

**Status**: ✅ PLANO APROVADO - PRONTO PARA EXECUÇÃO
**Início previsto**: Imediatamente após aprovação
**Conclusão prevista**: 6 horas de trabalho focado
