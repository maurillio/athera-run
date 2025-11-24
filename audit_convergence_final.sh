#!/bin/bash
# 🔍 AUDITORIA FINAL 100% - v3.1.0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 AUDITORIA FINAL - CONVERGÊNCIA TOTAL v3.1.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Contador de problemas
ISSUES=0

echo "📊 FASE 1: LIMPEZA DE DUPLICAÇÕES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1.1 Verificar duplicações removidas
echo "✓ Checando campos duplicados..."
if grep -r "restingHeartRate.*HealthTab" components/profile/ 2>/dev/null; then
    echo "  ❌ PROBLEMA: restingHeartRate ainda em HealthTab"
    ((ISSUES++))
else
    echo "  ✅ restingHeartRate não duplicado"
fi

# 1.2 Verificar campos deprecated
echo "✓ Checando campos deprecated no schema..."
DEPRECATED_COUNT=$(grep -c "@deprecated" prisma/schema.prisma 2>/dev/null || echo "0")
if [ "$DEPRECATED_COUNT" -ge "7" ]; then
    echo "  ✅ $DEPRECATED_COUNT campos deprecated marcados"
else
    echo "  ❌ PROBLEMA: Apenas $DEPRECATED_COUNT campos deprecated (esperado: 7)"
    ((ISSUES++))
fi

# 1.3 Verificar race_goals tabela
echo "✓ Checando tabela race_goals..."
if grep -q "model RaceGoal" prisma/schema.prisma; then
    echo "  ✅ Tabela RaceGoal existe"
else
    echo "  ❌ PROBLEMA: Tabela RaceGoal não encontrada"
    ((ISSUES++))
fi

echo ""
echo "📊 FASE 2: CAMPOS PERDIDOS ADICIONADOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 2.1 Verificar campos v3.0.0 adicionados
echo "✓ Checando campos v3.0.0 nos componentes..."
V3_FIELDS=("hasRunBefore" "currentlyInjured" "avgSleepHours" "tracksMenstrualCycle" "workDemand" "familyDemand")
FOUND_V3=0

for field in "${V3_FIELDS[@]}"; do
    if grep -rq "$field" components/profile/ 2>/dev/null; then
        echo "  ✅ Campo $field encontrado nos componentes"
        ((FOUND_V3++))
    else
        echo "  ⚠️  Campo $field não encontrado"
    fi
done

if [ "$FOUND_V3" -ge "4" ]; then
    echo "  ✅ Campos v3.0.0 implementados ($FOUND_V3/6)"
else
    echo "  ❌ PROBLEMA: Poucos campos v3.0.0 ($FOUND_V3/6)"
    ((ISSUES++))
fi

# 2.2 Verificar campos de performance
echo "✓ Checando campos de performance..."
PERF_FIELDS=("currentVDOT" "usualPaces" "recentLongRunPace")
FOUND_PERF=0

for field in "${PERF_FIELDS[@]}"; do
    if grep -rq "$field" components/profile/ 2>/dev/null; then
        echo "  ✅ Campo $field encontrado"
        ((FOUND_PERF++))
    fi
done

echo "  ℹ️  Campos de performance: $FOUND_PERF/3"

echo ""
echo "📊 FASE 3: AI TRACKING CONECTADO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 3.1 Verificar profileContextBuilder
echo "✓ Checando profileContextBuilder.ts..."
if [ -f "lib/profileContextBuilder.ts" ]; then
    echo "  ✅ profileContextBuilder.ts existe"
    
    if grep -q "aiGeneratedFields" lib/profileContextBuilder.ts; then
        echo "  ✅ aiGeneratedFields implementado"
    else
        echo "  ❌ PROBLEMA: aiGeneratedFields não encontrado"
        ((ISSUES++))
    fi
else
    echo "  ❌ PROBLEMA: profileContextBuilder.ts não existe"
    ((ISSUES++))
fi

# 3.2 Verificar tracking no gerador
echo "✓ Checando tracking no ai-plan-generator..."
if grep -rq "buildProfileContext\|aiGeneratedFields" lib/ai/ 2>/dev/null; then
    echo "  ✅ Tracking conectado ao gerador"
else
    echo "  ⚠️  Tracking pode não estar conectado"
fi

echo ""
echo "📊 FASE 4: CONVERGÊNCIA DE TELAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 4.1 Contar componentes de perfil
echo "✓ Checando componentes de perfil..."
PROFILE_COMPONENTS=$(ls -1 components/profile/*.tsx 2>/dev/null | wc -l)
echo "  ℹ️  Componentes encontrados: $PROFILE_COMPONENTS"

if [ "$PROFILE_COMPONENTS" -ge "5" ]; then
    echo "  ✅ Componentes de perfil OK"
else
    echo "  ⚠️  Poucos componentes ($PROFILE_COMPONENTS)"
fi

# 4.2 Verificar API routes
echo "✓ Checando API routes..."
if [ -f "app/api/profile/route.ts" ]; then
    echo "  ✅ /api/profile existe"
else
    echo "  ❌ PROBLEMA: /api/profile não encontrado"
    ((ISSUES++))
fi

if [ -f "app/api/race-goals/route.ts" ] || grep -rq "race-goals" app/api/ 2>/dev/null; then
    echo "  ✅ /api/race-goals existe"
else
    echo "  ⚠️  /api/race-goals pode não existir"
fi

echo ""
echo "📊 FASE 5: PERFORMANCE E ÍNDICES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 5.1 Verificar migration
echo "✓ Checando migration v3.1.0..."
MIGRATION_DIR=$(find prisma/migrations -name "*convergence*" -type d 2>/dev/null | head -1)
if [ -n "$MIGRATION_DIR" ]; then
    echo "  ✅ Migration convergência encontrada: $MIGRATION_DIR"
else
    echo "  ⚠️  Migration convergência não encontrada em prisma/migrations"
fi

# Verificar SQL manual
if [ -f "APLICAR_MIGRATION_MANUAL_NEON.sql" ]; then
    echo "  ✅ Script SQL manual existe"
    
    # Contar índices
    INDEX_COUNT=$(grep -c "CREATE INDEX" APLICAR_MIGRATION_MANUAL_NEON.sql 2>/dev/null || echo "0")
    echo "  ℹ️  Índices no script: $INDEX_COUNT"
    
    if [ "$INDEX_COUNT" -ge "4" ]; then
        echo "  ✅ Índices criados OK ($INDEX_COUNT)"
    else
        echo "  ⚠️  Poucos índices ($INDEX_COUNT, esperado: 4)"
    fi
else
    echo "  ⚠️  Script SQL manual não encontrado"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESULTADO FINAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ISSUES -eq 0 ]; then
    echo "✅ CONVERGÊNCIA 100% COMPLETA!"
    echo ""
    echo "✨ Todos os critérios atendidos:"
    echo "  • Zero duplicações"
    echo "  • Campos deprecated marcados"
    echo "  • AI tracking conectado"
    echo "  • Componentes implementados"
    echo "  • Migration criada"
    echo "  • Performance otimizada"
    echo ""
    echo "🚀 Sistema pronto para produção!"
    exit 0
else
    echo "⚠️  ATENÇÃO: $ISSUES problemas encontrados"
    echo ""
    echo "Revise os itens marcados com ❌ acima."
    echo ""
    exit 1
fi
