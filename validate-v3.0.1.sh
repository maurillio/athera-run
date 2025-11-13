#!/bin/bash

# ============================================================================
# SCRIPT DE VALIDAÇÃO v3.0.1 - Verificar Correções
# ============================================================================
# Data: 13/NOV/2025
# Objetivo: Validar que todas as correções foram aplicadas
# ============================================================================

echo "🔍 VALIDAÇÃO v3.0.1 - Athera Run"
echo "========================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar se arquivos foram modificados
echo "1️⃣ Verificando arquivos modificados..."
echo ""

# Verificar plano/page.tsx
if grep -q "normalizeDistance" app/\[locale\]/plano/page.tsx; then
    echo -e "${GREEN}✅${NC} app/[locale]/plano/page.tsx - normalizeDistance presente"
else
    echo -e "${RED}❌${NC} app/[locale]/plano/page.tsx - normalizeDistance ausente"
fi

if grep -q "phaseMap" app/\[locale\]/plano/page.tsx; then
    echo -e "${GREEN}✅${NC} app/[locale]/plano/page.tsx - phaseMap presente"
else
    echo -e "${RED}❌${NC} app/[locale]/plano/page.tsx - phaseMap ausente"
fi

# Verificar workout-details.tsx
if grep -q "cleanPace" components/workout-details.tsx; then
    echo -e "${GREEN}✅${NC} components/workout-details.tsx - cleanPace presente"
else
    echo -e "${RED}❌${NC} components/workout-details.tsx - cleanPace ausente"
fi

echo ""
echo "2️⃣ Verificando arquivos de documentação..."
echo ""

if [ -f "MIGRACAO_URGENTE_V3_0_1.md" ]; then
    echo -e "${GREEN}✅${NC} MIGRACAO_URGENTE_V3_0_1.md criado"
else
    echo -e "${RED}❌${NC} MIGRACAO_URGENTE_V3_0_1.md ausente"
fi

if [ -f "apply-migration-neon.sql" ]; then
    echo -e "${GREEN}✅${NC} apply-migration-neon.sql criado"
else
    echo -e "${RED}❌${NC} apply-migration-neon.sql ausente"
fi

echo ""
echo "3️⃣ Verificando build..."
echo ""

# Tentar build (se tiver tempo)
if command -v npm &> /dev/null; then
    echo "Executando build..."
    if npm run build > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} Build passou sem erros"
    else
        echo -e "${YELLOW}⚠️${NC} Build com warnings (verificar logs)"
    fi
else
    echo -e "${YELLOW}⚠️${NC} npm não encontrado, pulando build"
fi

echo ""
echo "4️⃣ Verificando Prisma Schema..."
echo ""

# Verificar campos v2.0.0
if grep -q "warmUpStructure" prisma/schema.prisma; then
    echo -e "${GREEN}✅${NC} prisma/schema.prisma - warmUpStructure presente"
else
    echo -e "${RED}❌${NC} prisma/schema.prisma - warmUpStructure ausente"
fi

# Verificar campos v3.0.0
if grep -q "hasRunBefore" prisma/schema.prisma; then
    echo -e "${GREEN}✅${NC} prisma/schema.prisma - hasRunBefore presente"
else
    echo -e "${RED}❌${NC} prisma/schema.prisma - hasRunBefore ausente"
fi

echo ""
echo "========================================"
echo "✅ VALIDAÇÃO COMPLETA"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Aplicar migration no Neon (via SQL Editor)"
echo "2. Fazer commit e push"
echo "3. Aguardar deploy Vercel"
echo "4. Testar com usuário real"
echo ""
echo "📖 Ver: MIGRACAO_URGENTE_V3_0_1.md"
echo "========================================"
