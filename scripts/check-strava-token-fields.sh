#!/bin/bash
# Script para verificar se todos os campos de token Strava estão corretos
# Deve ser executado antes de cada deploy

set -e

echo "🔍 Verificando campos de token Strava..."

# Campo correto no schema
CORRECT_FIELD="stravaTokenExpiry"
WRONG_FIELD="stravaTokenExpiresAt"

# Verificar no código
WRONG_USAGE=$(grep -r "$WRONG_FIELD" app/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -n "$WRONG_USAGE" ]; then
    echo "❌ ERRO: Campo errado '$WRONG_FIELD' encontrado!"
    echo ""
    echo "Arquivos com problema:"
    echo "$WRONG_USAGE"
    echo ""
    echo "✅ Campo correto deve ser: '$CORRECT_FIELD'"
    echo ""
    echo "Execute: sed -i 's/$WRONG_FIELD/$CORRECT_FIELD/g' <arquivo>"
    exit 1
fi

# Verificar se o campo correto existe no schema
if ! grep -q "$CORRECT_FIELD" prisma/schema.prisma; then
    echo "❌ ERRO: Campo '$CORRECT_FIELD' não encontrado no schema!"
    exit 1
fi

echo "✅ Todos os campos de token Strava estão corretos!"
echo "   Schema: $CORRECT_FIELD ✓"
echo "   Código: Nenhum uso de $WRONG_FIELD ✓"
exit 0
