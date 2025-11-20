# Strava API Reference - Athera Run

## Visão Geral

A integração Strava do Athera Run permite importar dados de treino, recordes pessoais, estatísticas, equipamentos e zonas de treino do Strava para enriquecer a análise da IA e personalizar os planos de treino.

## Autenticação

Todas as APIs requerem autenticação via NextAuth session.

```typescript
headers: {
  'Content-Type': 'application/json'
}
// Session automática via cookie
```

## Endpoints

### 1. Importar Estatísticas

Importa estatísticas agregadas de corrida do Strava.

**Endpoint:** `POST /api/strava/import-stats`

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "totalRuns": 127,
    "totalDistance": 1250.5,
    "totalElevationGain": 8500,
    "longestRun": 32.5,
    "totalAchievements": 45,
    "syncedAt": "2025-11-20T17:00:00.000Z"
  }
}
```

**Dados Salvos:**
- Total de corridas
- Distância total (km)
- Elevação total (m)
- Maior corrida (km)
- Total de conquistas
- Data da sincronização

---

### 2. Importar Recordes Pessoais (PRs)

Importa melhores tempos por distância do Strava.

**Endpoint:** `POST /api/strava/import-prs`

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "pr5k": "00:22:30",
    "pr10k": "00:48:15",
    "prHalfMarathon": "01:45:30",
    "prMarathon": "03:35:20",
    "syncedAt": "2025-11-20T17:00:00.000Z"
  }
}
```

**Formatos Suportados:**
- Tempo no formato `HH:MM:SS` ou `MM:SS`
- Distâncias: 5K, 10K, Half Marathon, Marathon

---

### 3. Importar Equipamentos (Gear)

Importa tênis e equipamentos de corrida do Strava.

**Endpoint:** `POST /api/strava/import-gear`

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": [
    {
      "id": "g123456",
      "name": "Nike Pegasus 40",
      "type": "shoes",
      "brand": "Nike",
      "model": "Pegasus 40",
      "distance": 450.5,
      "isPrimary": true,
      "isRetired": false,
      "syncedAt": "2025-11-20T17:00:00.000Z"
    }
  ]
}
```

**Campos:**
- `id`: ID único do Strava
- `name`: Nome do equipamento
- `type`: Tipo (shoes, bike, etc)
- `brand`: Marca
- `model`: Modelo
- `distance`: Quilometragem total
- `isPrimary`: Se é o equipamento principal
- `isRetired`: Se está aposentado

---

### 4. Importar Zonas de Treino

Importa zonas cardíacas e de pace personalizadas do Strava.

**Endpoint:** `POST /api/strava/import-zones`

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "heartRateZones": [
      {
        "zone": 1,
        "name": "Recovery",
        "min": 120,
        "max": 140
      },
      {
        "zone": 2,
        "name": "Aerobic",
        "min": 140,
        "max": 155
      }
    ],
    "paceZones": [
      {
        "zone": 1,
        "name": "Easy",
        "minPace": "6:00",
        "maxPace": "5:30"
      }
    ],
    "syncedAt": "2025-11-20T17:00:00.000Z"
  }
}
```

**Zonas Importadas:**
- Zonas cardíacas (bpm)
- Zonas de pace (min/km)
- Configurações personalizadas

---

### 5. Sincronizar Tudo

Executa todas as importações de uma vez.

**Endpoint:** `POST /api/strava/sync-all`

**Resposta de Sucesso:**
```json
{
  "success": true,
  "results": {
    "stats": { "success": true, "data": {...} },
    "prs": { "success": true, "data": {...} },
    "gear": { "success": true, "data": {...} },
    "zones": { "success": true, "data": {...} }
  },
  "summary": {
    "successful": 4,
    "failed": 0,
    "total": 4
  }
}
```

**Comportamento:**
- Executa todas as importações em paralelo
- Continua mesmo se alguma falhar
- Retorna resumo completo

---

## Respostas de Erro

### Erro 401 - Não Autorizado
```json
{
  "error": "Não autorizado"
}
```

### Erro 403 - Strava Não Conectado
```json
{
  "error": "Strava não conectado. Conecte sua conta primeiro."
}
```

### Erro 500 - Erro no Strava
```json
{
  "error": "Erro ao buscar dados do Strava",
  "details": "Token expired"
}
```

### Erro 500 - Erro no Banco
```json
{
  "error": "Erro ao salvar dados",
  "details": "Database connection failed"
}
```

---

## Refresh de Token

Todas as APIs automaticamente:
1. Verificam se o token expirou
2. Fazem refresh se necessário
3. Atualizam o token no banco
4. Executam a requisição

**Não é necessário gerenciar tokens manualmente.**

---

## Rate Limits

**Strava API Limits:**
- 100 requisições por 15 minutos
- 1000 requisições por dia

**Recomendações:**
- Use `sync-all` para sincronizar tudo de uma vez
- Não sincronize mais de 1x por hora
- Atividades são sincronizadas automaticamente via webhook

---

## Dados no Banco

### Tabela: `strava_stats`
```sql
- userId (FK)
- totalRuns
- totalDistance
- totalElevationGain
- longestRun
- totalAchievements
- syncedAt
```

### Tabela: `strava_personal_records`
```sql
- userId (FK)
- distance (5k, 10k, half_marathon, marathon)
- timeSeconds
- pacePerKm
- activityId
- achievedAt
- syncedAt
```

### Tabela: `strava_gear`
```sql
- userId (FK)
- stravaGearId
- name
- type
- brand
- model
- distance
- isPrimary
- isRetired
- syncedAt
```

### Tabela: `strava_training_zones`
```sql
- userId (FK)
- zoneType (heart_rate, pace, power)
- zones (JSON)
- syncedAt
```

---

## Uso no Frontend

### Sincronizar Tudo
```typescript
const handleSync = async () => {
  const response = await fetch('/api/strava/sync-all', {
    method: 'POST'
  });
  const data = await response.json();
  
  if (data.success) {
    console.log('Sincronizado!', data.summary);
  }
};
```

### Sincronizar Individual
```typescript
const syncStats = async () => {
  const response = await fetch('/api/strava/import-stats', {
    method: 'POST'
  });
  const data = await response.json();
  
  if (data.success) {
    console.log('Stats:', data.data);
  }
};
```

---

## Integração com IA

Os dados importados são automaticamente utilizados pela IA para:

1. **PRs** - Calibrar paces de treino
2. **Stats** - Entender volume e consistência
3. **Gear** - Alertar sobre troca de tênis
4. **Zones** - Personalizar intensidades

Exemplo de prompt enriquecido:
```
Atleta com PR de 10K em 48:15, já correu 127 vezes 
totalizando 1.250km. Maior corrida: 32km. 
Usa Nike Pegasus com 450km (perto de trocar).
Zona aeróbica: 140-155 bpm.
```

---

## Troubleshooting

### Token Expirado
- Verificado automaticamente
- Refresh automático
- Se falhar, desconectar e reconectar Strava

### Dados Não Aparecem
- Verificar se usuário é Premium
- Verificar se Strava está conectado
- Ver logs no console do navegador

### 404 nas APIs
- Aguardar deploy do Vercel (1-2 min)
- Limpar cache do navegador
- Verificar logs do Vercel

---

## Changelog

### v2.1.0 - 2025-11-20
- ✅ Importação de Stats
- ✅ Importação de PRs
- ✅ Importação de Gear
- ✅ Importação de Zones
- ✅ Sincronização completa
- ✅ Integração com IA
- ✅ Formulários manuais para free users
