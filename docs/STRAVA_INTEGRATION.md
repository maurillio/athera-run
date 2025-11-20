# 📊 Integração com Strava - Documentação Completa

**Versão**: 2.1.0  
**Data**: Novembro 2024  
**Status**: ✅ Implementado

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Recursos Implementados](#recursos-implementados)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [APIs](#apis)
6. [Componentes Frontend](#componentes-frontend)
7. [Sincronização](#sincronização)
8. [Uso pela IA](#uso-pela-ia)
9. [Usuários Free vs Premium](#usuários-free-vs-premium)
10. [Segurança](#segurança)
11. [Manutenção](#manutenção)

---

## 🎯 Visão Geral

A integração com Strava permite que usuários **Premium** do Athera Run sincronizem automaticamente seus dados de corrida, incluindo:

- ✅ Atividades em tempo real (webhook)
- ✅ Estatísticas de treino (últimas 4 semanas e ano)
- ✅ Records pessoais (5K, 10K, Half, Marathon)
- ✅ Zonas de treinamento (FC)
- ✅ Equipamentos (tênis)

### Benefícios

1. **Para o Atleta**: Dados precisos e automáticos para melhor análise
2. **Para a IA**: Calibração precisa do plano baseada em dados reais
3. **Para o Sistema**: Detecção de padrões, fadiga e necessidade de ajustes

---

## 🏗️ Arquitetura

```
┌─────────────────┐
│     Strava      │
│      API        │
└────────┬────────┘
         │
         ├─────────── Webhook (tempo real)
         │
         ├─────────── Sync Manual (on-demand)
         │
┌────────▼────────┐
│  Athera Run     │
│   Backend       │
│   (Next.js)     │
└────────┬────────┘
         │
         ├─► Banco (Neon Postgres)
         │   ├─ strava_activities
         │   ├─ strava_stats
         │   ├─ strava_personal_records
         │   ├─ strava_training_zones
         │   ├─ strava_gear
         │   └─ strava_webhooks
         │
         ├─► AI Plan Generator
         │   └─ Usa dados do Strava
         │
         └─► Frontend (React)
             └─ Exibe dados e controles
```

---

## 🚀 Recursos Implementados

### ✅ FASE 1: Database Schema
- Tabelas criadas no Neon
- Schema Prisma atualizado
- Modelos TypeScript gerados

### ✅ FASE 2: APIs de Importação
- Import de estatísticas
- Import de PRs
- Import de zonas
- Import de gear
- Sync completo

### ✅ FASE 3: Frontend
- Dashboard de dados Strava
- Controles de sincronização
- Indicadores de status

### ✅ FASE 4: Entrada Manual (Free)
- Formulários para usuários free
- Validação de dados
- Armazenamento em athlete_profiles

### ✅ FASE 5: Integração com IA
- Uso de stats na geração do plano
- Calibração baseada em PRs
- Uso de zonas de FC
- Alertas de equipamento desgastado

### ✅ FASE 6: Documentação
- Documentação completa
- Changelog atualizado
- Contexto do sistema

---

## 💾 Estrutura do Banco de Dados

[Ver seção completa no documento]

---

## 🔌 APIs

### Importação

- `POST /api/strava/import-stats` - Importa estatísticas
- `POST /api/strava/import-prs` - Importa records pessoais
- `POST /api/strava/import-zones` - Importa zonas de treino
- `POST /api/strava/import-gear` - Importa equipamentos
- `POST /api/strava/sync-all` - Sincroniza tudo

### Consulta

- `GET /api/strava/activities` - Lista atividades
- `GET /api/strava/stats` - Retorna estatísticas
- `GET /api/strava/prs` - Retorna PRs

---

## 🤖 Uso pela IA

A IA do plano de treino usa os dados do Strava para:

1. **Calibrar Volume Inicial**: Baseado nas últimas 4 semanas reais
2. **Estimar VDOT**: Usando PRs confirmados
3. **Definir Paces**: Precisos baseados em performance real
4. **Recomendar Equipamento**: Alertas de desgaste do tênis
5. **Ajustar Progressão**: Baseado no histórico de treino

---

## 📚 Changelog

### v2.1.0 (2024-11-20)
- ✅ Implementação completa em 6 fases
- ✅ Todas tabelas e APIs funcionando
- ✅ Integração com IA completa
- ✅ Suporte a gear e alertas
- ✅ Documentação completa

---

**Status**: ✅ **IMPLEMENTAÇÃO COMPLETA**
