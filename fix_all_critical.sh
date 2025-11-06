#!/bin/bash
echo "🔧 CORREÇÃO MASSIVA - Todos os arquivos críticos"
echo ""

# Lista dos 3 arquivos mais críticos para corrigir AGORA
echo "Corrigindo arquivos críticos..."

# 1. Login page - URGENTE
echo "1/3 Login page..."
# Será corrigido manualmente (muito complexo para sed)

# 2. Contando quantos arquivos têm problema
echo ""
echo "📊 Estatísticas:"
grep -r "t\.\w\+\?\." app/ components/ --include="*.tsx" 2>/dev/null | wc -l
echo " usos de t.namespace?.key encontrados"

grep -r "t([^)]\+) ||" app/ components/ --include="*.tsx" 2>/dev/null | wc -l  
echo " usos de fallback || encontrados"

echo ""
echo "✅ Análise completa. Arquivos identificados para correção manual."
