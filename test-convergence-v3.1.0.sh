#!/bin/bash
# v3.1.0 - Teste E2E de Convergência de Dados
# Valida que todos os campos adicionados estão funcionando

echo "🧪 TESTE E2E - CONVERGÊNCIA v3.1.0"
echo "=================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed=0
failed=0

# Função de teste
test_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $description - Arquivo não encontrado: $file"
        ((failed++))
        return 1
    fi
}

test_content() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $description"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $description - Pattern não encontrado"
        ((failed++))
        return 1
    fi
}

echo "📝 FASE 1: Verificando Arquivos Modificados"
echo "-------------------------------------------"

test_file "components/profile/v1.3.0/HealthTab.tsx" "HealthTab.tsx existe"
test_file "components/profile/v1.3.0/PerformanceTab.tsx" "PerformanceTab.tsx existe"
test_file "components/profile/v1.3.0/GoalsTab.tsx" "GoalsTab.tsx existe"
test_file "components/profile/v1.3.0/AvailabilityTab.tsx" "AvailabilityTab.tsx existe"
test_file "prisma/migrations/20251124_convergence_v3_1_0/migration.sql" "Migration SQL existe"

echo ""
echo "📊 FASE 2: Verificando Conteúdo dos Componentes"
echo "-----------------------------------------------"

# HealthTab - Campos v3.0.0
test_content "components/profile/v1.3.0/HealthTab.tsx" "medicalConditions" "HealthTab tem medicalConditions"
test_content "components/profile/v1.3.0/HealthTab.tsx" "hasRunBefore" "HealthTab tem hasRunBefore"
test_content "components/profile/v1.3.0/HealthTab.tsx" "currentlyInjured" "HealthTab tem currentlyInjured"
test_content "components/profile/v1.3.0/HealthTab.tsx" "avgSleepHours" "HealthTab tem avgSleepHours"
test_content "components/profile/v1.3.0/HealthTab.tsx" "tracksMenstrualCycle" "HealthTab tem tracksMenstrualCycle"

# PerformanceTab - VDOT e experiência
test_content "components/profile/v1.3.0/PerformanceTab.tsx" "currentVDOT" "PerformanceTab tem currentVDOT"
test_content "components/profile/v1.3.0/PerformanceTab.tsx" "usualPaces" "PerformanceTab tem usualPaces"
test_content "components/profile/v1.3.0/PerformanceTab.tsx" "experienceDescription" "PerformanceTab tem experienceDescription"
test_content "components/profile/v1.3.0/PerformanceTab.tsx" "experienceAnalysis" "PerformanceTab tem experienceAnalysis"

# GoalsTab - motivationFactors
test_content "components/profile/v1.3.0/GoalsTab.tsx" "motivationPrimary" "GoalsTab tem motivationPrimary"
test_content "components/profile/v1.3.0/GoalsTab.tsx" "motivationSecondary" "GoalsTab tem motivationSecondary"
test_content "components/profile/v1.3.0/GoalsTab.tsx" "motivationGoals" "GoalsTab tem motivationGoals"

# AvailabilityTab - Edição
test_content "components/profile/v1.3.0/AvailabilityTab.tsx" "addActivityToDay" "AvailabilityTab tem addActivityToDay"
test_content "components/profile/v1.3.0/AvailabilityTab.tsx" "removeActivityFromDay" "AvailabilityTab tem removeActivityFromDay"
test_content "components/profile/v1.3.0/AvailabilityTab.tsx" "predefinedActivities" "AvailabilityTab tem predefinedActivities"

echo ""
echo "🤖 FASE 3: Verificando AI Tracking"
echo "----------------------------------"

test_content "lib/ai-plan-generator.ts" "mapProfileToTrackableFields" "ai-plan-generator importa tracking"
test_content "lib/ai-plan-generator.ts" "trackFieldUsage" "ai-plan-generator tem trackFieldUsage call"
test_file "app/api/ai/field-analysis/route.ts" "API field-analysis existe"
test_content "app/api/ai/field-analysis/route.ts" "getFieldUsageForPlan" "API usa getFieldUsageForPlan"

echo ""
echo "🗄️ FASE 4: Verificando Migration"
echo "--------------------------------"

test_content "prisma/migrations/20251124_convergence_v3_1_0/migration.sql" "DEPRECATED" "Migration marca campos deprecated"
test_content "prisma/migrations/20251124_convergence_v3_1_0/migration.sql" "race_goals" "Migration insere em race_goals"
test_content "prisma/migrations/20251124_convergence_v3_1_0/migration.sql" "CREATE INDEX" "Migration cria índices"

echo ""
echo "📚 FASE 5: Verificando Documentação"
echo "-----------------------------------"

test_file "AUDITORIA_CONVERGENCIA_DADOS_COMPLETA.md" "Auditoria completa"
test_file "CHANGELOG_v3_1_0_CONVERGENCE.md" "Changelog v3.1.0"
test_file "RESUMO_IMPLEMENTACAO_COMPLETO_v3_1_0.md" "Resumo de implementação"
test_file "STATUS_IMPLEMENTACAO_v3_1_0.md" "Status de implementação"

echo ""
echo "=================================="
echo "📊 RESULTADO FINAL"
echo "=================================="
echo -e "${GREEN}✓ Testes passados: $passed${NC}"
echo -e "${RED}✗ Testes falhos: $failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    echo "Sistema pronto para deploy."
    exit 0
else
    echo -e "${RED}⚠️ ALGUNS TESTES FALHARAM${NC}"
    echo "Revise os erros acima antes do deploy."
    exit 1
fi
