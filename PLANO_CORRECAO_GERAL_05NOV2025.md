# PLANO DE CORREÇÃO GERAL - ATHERA RUN
**Data**: 05 de Novembro de 2025
**Versão**: 1.0.0
**Status**: 🔴 CRÍTICO - Múltiplos problemas identificados

---

## 🚨 PROBLEMAS IDENTIFICADOS

### 1. **BUILD FAILURE** (CRÍTICO)
- **Erro**: `cd: nextjs_space: No such file or directory`
- **Causa**: Vercel tentando acessar diretório duplicado que foi removido pelo `.vercelignore`
- **Impacto**: Deploy completamente quebrado

### 2. **INTERPOLAÇÃO DE VARIÁVEIS** (CRÍTICO)
- **Sintoma**: `{Maurillio Oliveira}`, `{3.5}`, `{45}`, `{Maratona}` aparecem como texto
- **Locais afetados**:
  - Dashboard (`/dashboard`)
  - Plano (`/plano`)
  - Tracking page
- **Causa**: Uso incorreto de sintaxe de interpolação React

### 3. **DATAS EM INGLÊS** (ALTA)
- **Sintoma**: "Tuesday, 4 de November" (mistura português-inglês)
- **Locais**: Planos datados
- **Causa**: `date-fns` não configurado com locale correto

### 4. **ROTAS i18n QUEBRADAS** (ALTA)
- **Sintoma**: `/pt-BR/tracking` retorna 404
- **Causa**: Middleware i18n não configurado corretamente para todas as rotas

### 5. **CHAVES DE TRADUÇÃO EXPOSTAS** (ALTA)
- **Sintoma**: `PHASES.BASE AERÓBICA`, `phases.Construção`
- **Causa**: Sistema de tradução retornando chaves ao invés de valores

### 6. **ERROS DYNAMIC SERVER USAGE** (MÉDIA)
- **Rotas afetadas**:
  - `/api/admin/users`
  - `/api/profile/auto-adjust-settings`
  - `/api/profile/medical`
  - `/api/subscription/status`
- **Causa**: Routes API usando `headers()` sem marcar como dinâmicas

### 7. **STRAVA API COMPLIANCE** (ALTA)
- **Compromisso assumido**: Não usar dados do Strava para treinar IA
- **Status**: Precisa ser documentado e garantido no código

---

## 📋 PLANO DE EXECUÇÃO

### ⚡ FASE 0: EMERGÊNCIA - Fix Build (30min)
**Objetivo**: Fazer deploy funcionar novamente

1. **Corrigir vercel.json**
   - Remover `cd nextjs_space` dos comandos
   - Ajustar paths para estrutura correta

2. **Ajustar .vercelignore**
   - Não ignorar arquivos essenciais do build

3. **Testar deploy**
   - Fazer commit e verificar build no Vercel

---

### 🔥 FASE 1: CORREÇÃO CRÍTICA (2h)
**Objetivo**: Resolver interpolação e traduções

#### 1.1 Interpolação de Variáveis
**Arquivos afetados**:
- `app/[locale]/dashboard/page.tsx`
- `app/[locale]/plano/page.tsx`
- `components/WeekCard.tsx`
- `components/WeekOverview.tsx`

**Mudanças**:
```tsx
// ❌ ERRADO
<h1>Olá, {user.name}!</h1>

// ✅ CORRETO
<h1>Olá, {user?.name || 'Atleta'}!</h1>
```

#### 1.2 Chaves de Tradução
**Arquivos**:
- `i18n/locales/pt-BR.json`
- `i18n/locales/en.json`
- `i18n/locales/es.json`

**Verificar**:
- Todas as chaves `PHASES.*` existem
- Todas as chaves `phases.*` existem (lowercase)
- Sistema case-sensitive funcionando

#### 1.3 Datas Localizadas
**Arquivos**:
- `lib/date-utils.ts` (criar se não existir)
- Todos os componentes que formatam datas

**Implementação**:
```typescript
import { format } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';

export function formatDate(date: Date, locale: string) {
  const locales = { 'pt-BR': ptBR, 'en': enUS, 'es': es };
  return format(date, "EEEE, dd 'de' MMMM", { 
    locale: locales[locale] || ptBR 
  });
}
```

---

### 🛠️ FASE 2: ROTAS E MIDDLEWARE (1h)
**Objetivo**: Corrigir sistema i18n completamente

#### 2.1 Middleware i18n
**Arquivo**: `middleware.ts`

**Verificar**:
- Todas as rotas protegidas estão na lista
- `/tracking`, `/plano`, `/dashboard` incluídos
- Redirecionamento automático para locale funciona

#### 2.2 Layout de Rotas
**Estrutura esperada**:
```
app/
  [locale]/
    dashboard/
      page.tsx
    plano/
      page.tsx  
    tracking/
      page.tsx
    layout.tsx
```

#### 2.3 Rotas Dinâmicas vs Estáticas
**Marcar como dinâmicas**:
```typescript
// Em cada route.ts afetada
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

---

### 📊 FASE 3: AUDITORIA COMPLETA (3h)
**Objetivo**: Varredura completa de inconsistências

#### 3.1 Auditoria de Interpolação
**Script de busca**:
```bash
grep -r "{[A-Z]" app/ components/ --include="*.tsx" --include="*.ts"
```

**Corrigir todos os matches**

#### 3.2 Auditoria de Traduções
**Verificar**:
- [ ] Todas as strings hard-coded em português
- [ ] Todas as chaves existem em todos os locales
- [ ] Case-sensitivity consistente
- [ ] Pluralização correta

#### 3.3 Auditoria de Datas
**Verificar**:
- [ ] Todas as chamadas para `format()` usam locale
- [ ] Timezone UTC configurado corretamente
- [ ] Datas relativas ("hoje", "amanhã") traduzidas

#### 3.4 Auditoria de Rotas
**Testar manualmente**:
```
✓ /pt-BR/dashboard
✓ /pt-BR/plano
✓ /pt-BR/tracking
✓ /en/dashboard
✓ /en/plan
✓ /en/tracking
✓ /es/dashboard
✓ /es/plan
✓ /es/tracking
```

---

### 🔒 FASE 4: STRAVA COMPLIANCE (1h)
**Objetivo**: Garantir conformidade com termos do Strava

#### 4.1 Documentação
**Criar**: `STRAVA_COMPLIANCE.md`

**Conteúdo**:
- Como usamos dados do Strava
- Onde os dados são armazenados
- Que dados NÃO são usados para treinar IA
- Políticas de retenção de dados

#### 4.2 Código
**Adicionar comentários**:
```typescript
/**
 * STRAVA API COMPLIANCE:
 * - Dados usados apenas para análise individual do atleta
 * - Nenhum dado enviado para treinamento de modelos de IA
 * - Dados armazenados apenas enquanto o usuário mantiver conexão
 */
```

#### 4.3 Verificação
- [ ] Nenhum dado do Strava é enviado para OpenAI API
- [ ] Dados do Strava não são usados em prompts genéricos
- [ ] Apenas metadados agregados (não PII) são usados para insights

---

## 🎯 CRONOGRAMA

### Opção A: COMPLETO HOJE (6h)
```
14:00-14:30 | Fase 0: Fix Build
14:30-16:30 | Fase 1: Correção Crítica  
16:30-17:30 | Fase 2: Rotas e Middleware
17:30-20:30 | Fase 3: Auditoria Completa
20:30-21:30 | Fase 4: Strava Compliance
21:30-22:00 | Testes finais e deploy
```

### Opção B: DIVIDIDO (3 dias)
```
Dia 1 (2h): Fases 0 + 1
Dia 2 (2h): Fase 2 + 3.1-3.2
Dia 3 (2h): Fase 3.3-3.4 + 4
```

---

## 🎬 DECISÃO NECESSÁRIA

**Escolha**:
- [ ] A) "GO!" - Começar agora com opção A (completo hoje) 🚀
- [ ] B) "DIVIDIR" - Executar em 3 dias

---

## 📊 MÉTRICAS DE SUCESSO

### Build
- [ ] Deploy no Vercel sem erros
- [ ] Build time < 5 minutos
- [ ] Zero warnings críticos

### Funcionalidade
- [ ] Todas as rotas i18n funcionando
- [ ] Zero interpolações expostas
- [ ] Datas 100% localizadas
- [ ] Traduções completas em 3 idiomas

### Performance
- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

### Compliance
- [ ] Documentação Strava aprovada
- [ ] Zero uso de dados para IA externa
- [ ] Políticas de privacidade atualizadas

---

## 📝 CHECKLIST PÓS-IMPLEMENTAÇÃO

- [ ] Atualizar CONTEXTO.md com todas as mudanças
- [ ] Atualizar DOCUMENTACAO.md com novos padrões
- [ ] Criar CHANGELOG.md com versão v1.5.2
- [ ] Commit com mensagem descritiva completa
- [ ] Tag de versão no Git
- [ ] Deploy para produção
- [ ] Teste smoke em produção
- [ ] Notificar stakeholders

---

## 🔗 ARQUIVOS RELACIONADOS

- `CONTEXTO.md` - Contexto geral do projeto
- `DOCUMENTACAO.md` - Documentação técnica
- `GUIA_TECNICO.md` - Guia de desenvolvimento
- `STRAVA_API_RESPONSE.md` - Resposta do Strava sobre integração

---

**Aguardando decisão para prosseguir...**
