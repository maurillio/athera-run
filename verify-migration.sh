#!/bin/bash

# Script de Verificação de Migration v3.1.0
# Uso: ./verify-migration.sh

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║       🔍 VERIFICAÇÃO MIGRATION v3.1.0 - NEON DB 🔍          ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Data: $(date '+%d/%m/%Y %H:%M:%S')"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SUCCESS=0
WARNINGS=0
ERRORS=0

# Função para verificar resultado
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        SUCCESS=$((SUCCESS + 1))
    else
        echo -e "${RED}❌ $2${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

# 1. Verificar Prisma Status
echo "1️⃣  Verificando Prisma Migration Status..."
echo ""

if command -v npx &> /dev/null; then
    MIGRATION_STATUS=$(npx prisma migrate status 2>&1)
    
    if echo "$MIGRATION_STATUS" | grep -q "20251124_convergence_v3_1_0"; then
        if echo "$MIGRATION_STATUS" | grep -q "applied"; then
            echo -e "${GREEN}✅ Migration 20251124_convergence_v3_1_0 APLICADA${NC}"
            SUCCESS=$((SUCCESS + 1))
        else
            echo -e "${YELLOW}⚠️  Migration encontrada mas não aplicada${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${RED}❌ Migration 20251124_convergence_v3_1_0 NÃO encontrada${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    echo ""
    echo "Status completo:"
    echo "$MIGRATION_STATUS"
else
    echo -e "${RED}❌ npx não disponível${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 2. Verificar Build
echo "2️⃣  Verificando Build Local..."
echo ""

if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✅ Build local OK${NC}"
    SUCCESS=$((SUCCESS + 1))
else
    echo -e "${RED}❌ Build local FALHOU${NC}"
    echo "Ver detalhes em: /tmp/build.log"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 3. Verificar arquivos
echo "3️⃣  Verificando Arquivos de Migration..."
echo ""

MIGRATION_FILE="prisma/migrations/20251124_convergence_v3_1_0/migration.sql"

if [ -f "$MIGRATION_FILE" ]; then
    echo -e "${GREEN}✅ Arquivo migration.sql encontrado${NC}"
    SUCCESS=$((SUCCESS + 1))
    
    LINES=$(wc -l < "$MIGRATION_FILE")
    echo "   Linhas: $LINES"
    
    # Verificar conteúdo
    if grep -q "DEPRECATED" "$MIGRATION_FILE"; then
        echo -e "${GREEN}   ✅ Contém marcações DEPRECATED${NC}"
    fi
    
    if grep -q "race_goals" "$MIGRATION_FILE"; then
        echo -e "${GREEN}   ✅ Contém migração race_goals${NC}"
    fi
    
    if grep -q "CREATE INDEX" "$MIGRATION_FILE"; then
        echo -e "${GREEN}   ✅ Contém criação de índices${NC}"
    fi
else
    echo -e "${RED}❌ Arquivo migration.sql NÃO encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 4. Verificar componentes modificados
echo "4️⃣  Verificando Componentes React..."
echo ""

COMPONENTS=(
    "components/profile/v1.3.0/HealthTab.tsx"
    "components/profile/v1.3.0/PerformanceTab.tsx"
    "components/profile/v1.3.0/GoalsTab.tsx"
    "components/profile/v1.3.0/AvailabilityTab.tsx"
)

for comp in "${COMPONENTS[@]}"; do
    if [ -f "$comp" ]; then
        if grep -q "v3.1.0" "$comp"; then
            echo -e "${GREEN}✅ $(basename $comp) - Atualizado v3.1.0${NC}"
            SUCCESS=$((SUCCESS + 1))
        else
            echo -e "${YELLOW}⚠️  $(basename $comp) - Sem tag v3.1.0${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${RED}❌ $(basename $comp) - NÃO encontrado${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 5. Verificar documentação
echo "5️⃣  Verificando Documentação..."
echo ""

DOCS=(
    "DEPLOY_v3_1_0_CONCLUIDO.txt"
    "VERIFICACAO_AUDITORIA_v3_1_0.md"
    "VERIFICAR_MIGRATION_NEON.md"
    "CHANGELOG_v3_1_0_CONVERGENCE.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✅ $doc${NC}"
        SUCCESS=$((SUCCESS + 1))
    else
        echo -e "${YELLOW}⚠️  $doc não encontrado${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 6. Resumo
echo "📊 RESUMO DA VERIFICAÇÃO"
echo ""
echo -e "${GREEN}✅ Sucessos:  $SUCCESS${NC}"
echo -e "${YELLOW}⚠️  Avisos:    $WARNINGS${NC}"
echo -e "${RED}❌ Erros:     $ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${GREEN}✅ VERIFICAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Ver: VERIFICAR_MIGRATION_NEON.md"
    echo "2. Acessar Neon Dashboard para confirmar no banco"
    echo "3. Executar queries de verificação"
    echo ""
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${RED}❌ VERIFICAÇÃO COM ERROS!${NC}"
    echo ""
    echo "Ver documentação: VERIFICAR_MIGRATION_NEON.md"
    echo ""
fi

exit $ERRORS
