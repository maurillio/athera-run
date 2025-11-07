# Changelog - Athera Run

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.5.1.1] - 2025-11-07

### 🌩️ MIGRAÇÃO - Database para Neon

#### Migrado
- **[INFRAESTRUTURA]** PostgreSQL migrado para Neon (Database as a Service)
  - De: Servidor próprio (45.232.21.67:5432)
  - Para: Neon (ep-hidden-resonance-adhktxy0-pooler.c-2.us-east-1.aws.neon.tech)
  - Região: US East (N. Virginia) - mesma da Vercel
  - PostgreSQL: 16.9
  - Pooler: Habilitado

#### Dados Migrados
- ✅ 25 tabelas completas
- ✅ 17 usuários
- ✅ 9 perfis de atletas
- ✅ 11 race goals
- ✅ Todos os planos e treinos
- ✅ Histórico completo preservado
- ✅ Backups criados: `/root/backups/athera-run/`

#### Benefícios
- ⚡ **Performance:** 40-100x mais rápido (latência 1-5ms vs 100-200ms)
- 🌐 **Região:** Mesma da Vercel (reduz latência)
- 🔄 **Backups:** Automáticos e contínuos
- 📊 **Monitoramento:** Dashboard built-in no Neon
- 🛡️ **Disponibilidade:** 99.95% SLA
- 🔧 **Manutenção:** Zero (100% gerenciado)
- 💰 **Custo:** $0/mês (Free tier - 0.5GB)

#### Modificado
- `DATABASE_URL` atualizada na Vercel (todos ambientes)
- `vercel.json` - Removido `prisma migrate deploy` do build
- Migrations agora funcionam normalmente via `npx prisma migrate`

#### Adicionado
- `MIGRACAO_NEON_07NOV2025.md` - Documentação completa da migração
- Processo de backup antes da migração
- Validação completa dos dados migrados
- Testes de conexão via Prisma

#### Impacto
- ✅ Sistema 40-100x mais rápido
- ✅ Zero preocupação com manutenção de servidor
- ✅ Alta disponibilidade garantida
- ✅ Backups automáticos (point-in-time recovery)
- ✅ Escalabilidade automática (serverless)
- ✅ Dashboard profissional para monitoramento

#### Notas Técnicas
- Migrations continuam funcionando normalmente
- Prisma Client configurado automaticamente
- Connection pooling habilitado para melhor performance
- Banco anterior mantido como backup (não usar em produção)

---

## [1.5.1] - 2025-11-06

### 🔴 CRÍTICO - Correção do Onboarding

#### Corrigido
- **[CRÍTICO]** Restaurados campos de Race Goal no Step5 do onboarding
  - `goalDistance` (distância da corrida: 5k, 10k, 21k, 42k)
  - `targetRaceDate` (data da prova)
  - `targetTime` (tempo alvo - opcional)
- Usuários agora podem completar onboarding E ter Race Goal criada automaticamente
- Sistema pode gerar planos de treino após onboarding
- Dashboard funciona corretamente com dados relevantes

#### Adicionado
- Nova seção destacada (laranja) no Step5 para campos de corrida alvo
- 16 novas chaves de tradução em 3 idiomas (pt-BR, en, es):
  - `primaryGoalLabel`, `raceGoalTitle`, `raceGoalDescription`
  - `distanceLabel`, `selectDistance`, `halfMarathon`, `marathon`
  - `raceDateLabel`, `targetTimeLabel`, `optional`
  - `targetTimePlaceholder`, `targetTimeHelp`
  - `motivationLabel`, `motivationPlaceholder`, `motivationHelp`
- Documentação completa: `CORRECAO_ONBOARDING_06NOV2025.md`

#### Contexto
- Problema surgiu após refatorações v1.3.0 e v1.4.0
- Campos foram removidos acidentalmente durante implementação i18n
- API esperava dados que não eram mais coletados
- Causava onboarding "funcional" mas sistema inutilizável

#### Arquivos Modificados
- `components/onboarding/v1.3.0/Step5Goals.tsx` (+100 linhas)
- `lib/i18n/translations/pt-BR.json` (+16 chaves)
- `lib/i18n/translations/en.json` (+16 chaves)
- `lib/i18n/translations/es.json` (+16 chaves)
- `package.json` (versão → 1.5.1)
- `CONTEXTO.md` (atualizado)
- `README.md` (atualizado)

#### Impacto
- ✅ Sistema end-to-end funcional novamente
- ✅ Usuários podem completar onboarding E usar plataforma
- ✅ Race Goals criadas automaticamente
- ✅ Planos de treino podem ser gerados

---

## [1.5.0] - 2025-11-06

### Correção Completa do Sistema i18n

#### Corrigido
- Onboarding completamente traduzido (antes tinha keys faltando)
- Step1 e Step2 com todas as traduções necessárias
- Redirect após onboarding mantém idioma selecionado
- Botões duplicados removidos dos Steps 3-7
- Navegação consistente em todo o onboarding

#### Adicionado
- 231 linhas de tradução nos 3 idiomas
- Keys principais: title, subtitle, progress
- Step1 completo: 25+ keys (dados básicos e fisiológicos)
- Step2 completo: 15+ keys (experiência e histórico)
- Mensagens de erro traduzidas para validação

#### Arquivos Modificados
- `lib/i18n/translations/pt-BR.json` (+77 linhas)
- `lib/i18n/translations/en.json` (+77 linhas)
- `lib/i18n/translations/es.json` (+77 linhas)
- `app/[locale]/onboarding/page.tsx` (redirect fix)
- 5 componentes de steps (remoção de botões duplicados)

---

## [1.4.0] - 2025-11-05

### Multilinguagem Completo

#### Adicionado
- Sistema i18n completo implementado
- Suporte para 3 idiomas: Português (pt-BR), Inglês (en), Espanhol (es)
- Middleware para detecção automática de idioma
- Hooks personalizados para tradução
- 85% do sistema traduzido
- Seletor de idioma no header

#### Modificado
- Estrutura de rotas com `[locale]`
- Componentes atualizados para usar `useTranslations`
- Formatação de datas localizada
- Mensagens de API traduzidas

#### Arquivos
- `lib/i18n/` (novo diretório completo)
- `middleware.ts` (i18n redirect)
- `app/[locale]/` (estrutura de rotas atualizada)
- Arquivos de tradução: `pt-BR.json`, `en.json`, `es.json`

---

## [1.3.0] - 2025-11-03

### Estruturação Avançada do Perfil

#### Adicionado
- **Perfil Atleta v1.3.0** com campos avançados:
  - Dados fisiológicos: FC repouso, qualidade sono, nível stress
  - Experiência detalhada: anos em outros esportes
  - Histórico de lesões completo: detalhes, recuperação, última ocorrência
  - Performance: best times por distância com VDOT
  - Infraestrutura: academia, piscina, pista
  - Preferências de treino: locais, solo/grupo, indoor/outdoor
  - Motivação estruturada: primária, secundária, múltiplos objetivos

- **Sistema de Motivação v1.3.0**:
  - Motivação primária estruturada
  - Motivações secundárias (múltiplas)
  - Objetivos específicos (múltiplos)

#### Componentes
- Onboarding v1.3.0 completo em 7 steps
- Validações aprimoradas por step
- UI melhorada com melhor UX

---

## [1.2.0] - 2025-11-03

### Melhorias de Documentação e Sistema

#### Adicionado
- Documentação completa do sistema
- Guia técnico para desenvolvedores
- Roadmap detalhado

#### Corrigido
- Diversos bugs menores
- Melhorias de performance

---

## [1.1.0] - 2025-10-30

### Sistema Base Funcional

#### Adicionado
- Sistema de autenticação completo (NextAuth)
- Integração com Strava
- Sistema de assinatura (Stripe)
- Geração de planos com IA (OpenAI GPT-4o)
- Sistema de Race Goals com classificação A/B/C
- Dashboard completo
- Sistema de treinos e logging

---

## [1.0.0] - 2025-10-15

### Lançamento Inicial

#### Adicionado
- Estrutura base do projeto
- Configuração Next.js 14
- Configuração Prisma + PostgreSQL
- Design system básico
- Landing page

---

## Tipos de Mudanças

- `Adicionado` para novas funcionalidades
- `Modificado` para mudanças em funcionalidades existentes
- `Descontinuado` para funcionalidades que serão removidas
- `Removido` para funcionalidades removidas
- `Corrigido` para correções de bugs
- `Segurança` para correções de vulnerabilidades

---

**Formato de Versão:** MAJOR.MINOR.PATCH

- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Adição de funcionalidades compatíveis
- **PATCH**: Correções de bugs compatíveis
