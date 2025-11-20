# Integração com Strava - Athera Run

## Visão Geral

A integração com o Strava permite que usuários **Premium** sincronizem automaticamente seus dados de treino, incluindo estatísticas, recordes pessoais, equipamentos e zonas de frequência cardíaca.

## Status da Implementação

### ✅ FASE 1: Database Schema
- **Status**: Completo
- **Tabelas criadas no Neon**:
  - `strava_stats` - Estatísticas gerais do atleta
  - `strava_personal_records` - Recordes pessoais (5k, 10k, meia, maratona)
  - `strava_gear` - Equipamentos (tênis, bikes)
  - `strava_training_zones` - Zonas de FC e pace
  - `strava_activities` - Histórico detalhado de atividades
  - `strava_webhooks` - Sincronização em tempo real
- **Models Prisma**: Todos os models criados e sincronizados

### ✅ FASE 2: API de Sincronização
- **Endpoints criados**:
  - `POST /api/strava/import-stats` - Importa estatísticas do Strava
  - `POST /api/strava/import-prs` - Importa recordes pessoais
  - `POST /api/strava/import-gear` - Importa equipamentos
  - `POST /api/strava/import-zones` - Importa zonas de treino
  - `POST /api/strava/sync-all` - Sincroniza todos os dados de uma vez
  - `GET /api/strava/*` - Endpoints de leitura
- **Validações**: Todos endpoints validam se usuário é Premium e está conectado

### ✅ FASE 3: Frontend Integration
- **Componentes existentes**:
  - `DashboardStravaWidget` - Widget compacto no dashboard
  - `StravaDataSection` - Seção completa no perfil
  - `StravaStats` - Estatísticas detalhadas
  - `StravaPersonalRecords` - Recordes pessoais
  - `StravaGear` - Gerenciamento de equipamentos
- **Integração**: Componentes já estão integrados nas páginas

### ⏳ FASE 4: Melhorias UX (Em Progresso)
- [ ] Loading states otimizados
- [ ] Error handling aprimorado
- [ ] Feedback visual nas sincronizações
- [ ] Animações suaves
- [ ] Toast notifications

### 📋 FASE 5: Webhooks (Planejado)
- [ ] Configurar webhook do Strava
- [ ] Endpoint para receber eventos
- [ ] Sincronização automática em tempo real
- [ ] Notificações de novas atividades

### 📋 FASE 6: Analytics e Insights (Planejado)
- [ ] Gráficos de progressão
- [ ] Análise de tendências
- [ ] Comparação de períodos
- [ ] Insights automatizados com IA

## Arquitetura

### Fluxo de Dados

```
Strava API → Backend API Routes → Prisma → Neon Database
                    ↓
            Frontend Components
```

### Permissões

- **Free Users**: Podem ver componentes mas não sincronizar
- **Premium Users**: Acesso completo a sincronização e dados

### Sincronização

1. **Manual**: Usuário clica em "Sincronizar"
2. **Webhook** (futuro): Automática quando nova atividade é registrada
3. **Scheduled** (futuro): Sincronização diária automática

## Dados Armazenados

### Estatísticas (`strava_stats`)
- Total histórico de corridas
- Últimas 4 semanas
- Estatísticas do ano atual
- Frequência semanal/mensal
- Pace médio, distância média

### Recordes Pessoais (`strava_personal_records`)
- 5km, 10km, Meia Maratona, Maratona
- Tempo, pace, data, FC média
- Link para atividade no Strava

### Equipamentos (`strava_gear`)
- Tênis e bikes
- Quilometragem total
- Status (ativo/aposentado)
- Marca, modelo

### Zonas de Treino (`strava_training_zones`)
- FC máxima e repouso
- 5 zonas de FC
- Zonas de pace
- Calculadas pelo Strava ou manual

### Atividades (`strava_activities`)
- Histórico completo
- Detalhes por atividade
- Splits, FC, pace
- Elevação, mapa

## API Endpoints

### POST /api/strava/sync-all
Sincroniza todos os dados de uma vez.

**Requer**: Premium + Strava conectado

**Response**:
```json
{
  "success": true,
  "synced": {
    "stats": true,
    "prs": true,
    "gear": true,
    "zones": true
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### GET /api/strava/import-stats
Retorna estatísticas armazenadas.

**Response**:
```json
{
  "stats": {
    "allRunsTotals": { ... },
    "recentRunsTotals": { ... },
    "ytdRunsTotals": { ... },
    "avgDistance": 8.5,
    "avgPace": "5:30",
    "weeklyFrequency": 4,
    "lastSyncAt": "..."
  }
}
```

## Componentes Frontend

### DashboardStravaWidget
Widget compacto para o dashboard.

```tsx
<DashboardStravaWidget compact={true} />
```

### StravaDataSection
Seção completa com tabs para perfil.

```tsx
<StravaDataSection />
```

**Tabs**:
- Estatísticas
- Records Pessoais
- Equipamentos
- Zonas de Treino

## Tratamento de Erros

### Usuário não Premium
```typescript
if (!isPremium) {
  return NextResponse.json(
    { error: 'Recurso disponível apenas para usuários Premium' },
    { status: 403 }
  );
}
```

### Strava não conectado
```typescript
if (!profile.stravaConnected) {
  return NextResponse.json(
    { error: 'Conecte sua conta Strava primeiro' },
    { status: 400 }
  );
}
```

### Token expirado
```typescript
// Refresh token automaticamente
if (isTokenExpired(profile.stravaTokenExpiry)) {
  await refreshStravaToken(profile.stravaRefreshToken);
}
```

## Segurança

1. **Tokens**: Armazenados criptografados no banco
2. **Refresh**: Tokens são renovados automaticamente
3. **Validação**: Todos endpoints validam permissões
4. **Rate Limiting**: Respeita limites da API Strava

## Próximos Passos

1. ✅ Concluir FASE 4 (UX)
2. Implementar FASE 5 (Webhooks)
3. Implementar FASE 6 (Analytics)
4. Adicionar testes automatizados
5. Documentar API completa
6. Criar guia de troubleshooting

## Changelog

### 2024-11-20
- ✅ FASE 1: Database schema implementado
- ✅ FASE 2: API endpoints criados
- ✅ FASE 3: Frontend components integrados
- ⏳ FASE 4: Melhorias UX em progresso
