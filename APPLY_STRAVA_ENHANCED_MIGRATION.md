# 🚀 Aplicar Migration Strava Enhanced v2.6.0

## ✅ Status
- **Migration criada**: `/prisma/migrations/20251120143000_add_strava_enhanced_fields/migration.sql`
- **Schema atualizado**: `prisma/schema.prisma`

## 📋 O que será adicionado

### Novos Campos no AthleteProfile:
1. **stravaProfileData** (JSONB) - Dados brutos do perfil Strava
2. **stravaStatsData** (JSONB) - Estatísticas completas
3. **stravaLastSync** (DateTime) - Última sincronização
4. **personalRecords** (JSONB) - Recordes pessoais
5. **trainingZones** (JSONB) - Zonas de treino
6. **shoeRotation** (JSONB) - Rotação de tênis
7. **preferredRoutes** (JSONB) - Rotas favoritas
8. **trainingPrefs** (JSONB) - Preferências de treino

### Índices Criados:
- `athlete_profile_strava_last_sync_idx`
- `athlete_profile_strava_connected_idx`

## 🔧 Como Aplicar

### Opção 1: Via Prisma (Recomendado)
```bash
npx prisma db push
```

### Opção 2: Via SQL Direto no Neon
1. Acesse o Neon Dashboard
2. Vá em SQL Editor
3. Execute o conteúdo de: `prisma/migrations/20251120143000_add_strava_enhanced_fields/migration.sql`

### Opção 3: Via CLI do Neon
```bash
# Se tiver o CLI do Neon instalado
neon sql < prisma/migrations/20251120143000_add_strava_enhanced_fields/migration.sql
```

## ✅ Verificação Pós-Migration

Execute este SQL para verificar:
```sql
-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'athlete_profiles'
AND column_name IN (
  'strava_profile_data',
  'strava_stats_data', 
  'strava_last_sync',
  'personal_records',
  'training_zones',
  'shoe_rotation',
  'preferred_routes',
  'training_preferences'
)
ORDER BY column_name;

-- Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'athlete_profiles'
AND indexname LIKE '%strava%';
```

## 🎯 Próximos Passos Após Migration

1. ✅ Aplicar migration no Neon
2. 🔄 Deploy do código atualizado (já está pronto)
3. 🧪 Testar sincronização Strava
4. 📊 Validar importação de dados

## 🔒 Segurança

- ✅ Todos os campos são opcionais (nullable)
- ✅ Usa JSONB para flexibilidade
- ✅ Índices para performance
- ✅ Backward compatible (não quebra nada existente)

## 📝 Notas

- Esta migration é **SEGURA** - apenas adiciona colunas
- Não altera dados existentes
- Pode ser aplicada em produção sem downtime
- Todos os campos novos são opcionais
