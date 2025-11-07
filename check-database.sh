#!/bin/bash
echo "🔍 VERIFICANDO DADOS NO BANCO"
echo ""
echo "📊 Últimos 5 perfis criados:"
echo ""

# Load env
export $(cat .env.local | grep DATABASE_URL)

# Query usando psql
psql "$DATABASE_URL" -c "
SELECT 
  ap.id,
  u.email,
  ap.\"runningLevel\",
  ap.\"goalDistance\",
  ap.\"longRunDay\",
  ap.\"hasGymAccess\",
  ap.\"sleepQuality\",
  ap.\"stressLevel\",
  ap.\"otherSportsExperience\",
  ap.\"createdAt\"
FROM \"AthleteProfile\" ap
JOIN \"User\" u ON ap.\"userId\" = u.id
ORDER BY ap.\"createdAt\" DESC
LIMIT 5;
" 2>&1

echo ""
echo "✅ Verificação concluída!"
