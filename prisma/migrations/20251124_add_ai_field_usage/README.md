# AI Field Usage Migration - v2.8.0

## Migration Created
- **Date:** 2024-11-24
- **File:** `prisma/migrations/20251124_add_ai_field_usage/migration.sql`
- **Purpose:** Track which profile fields are used by AI during plan generation

## Schema Changes

### New Table: `ai_field_usage`

Stores a record each time the AI generates a plan, tracking which fields were:
- Actually used in the generation
- Had values available
- Were missing or ignored

**Columns:**
- `id` (TEXT) - Primary key (cuid)
- `planId` (INT) - References `custom_training_plans.id`
- `userId` (TEXT) - User who owns the profile
- `fieldName` (VARCHAR) - Name of the field (e.g., "age", "weight", "vdot")
- `fieldValue` (TEXT) - Stringified value of the field
- `wasUsed` (BOOLEAN) - Whether AI actually used this field
- `importance` (VARCHAR) - critical|high|medium|low
- `howUsed` (TEXT) - Description of how AI uses it
- `impact` (TEXT) - Impact on training plan
- `createdAt`, `updatedAt` - Timestamps

**Indexes:**
- `planId` - Fast lookup by plan
- `userId` - Fast lookup by user
- `fieldName` - Analytics queries

## How to Apply

### Local Development (if you have DATABASE_URL)
```bash
npx prisma migrate deploy
```

### Neon Production
1. Copy SQL from `migration.sql`
2. Go to Neon dashboard
3. Run SQL in query editor
4. Verify with: `SELECT * FROM ai_field_usage LIMIT 1;`

## Next Steps

After migration is applied:
1. Implement tracking in `/api/plan/generate`
2. Create `/api/ai/field-analysis` endpoint
3. Build frontend semáforo components
4. Display 🟢🟡🔴 status on all fields

## Rollback

If needed:
```sql
DROP TABLE IF EXISTS "ai_field_usage";
```

## Testing

After applying migration:
```typescript
// Should work without errors
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

await prisma.aIFieldUsage.create({
  data: {
    userId: 'test',
    fieldName: 'age',
    fieldValue: '30',
    wasUsed: true,
    importance: 'critical'
  }
});
```
