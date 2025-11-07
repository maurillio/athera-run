#!/bin/bash

# Script para verificar configuração do Strava no Vercel
# Data: 07/11/2025

echo "🔍 VERIFICANDO CONFIGURAÇÃO DO STRAVA NO VERCEL"
echo "================================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar Vercel CLI
echo "📦 Verificando Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI não instalado${NC}"
    echo "   Instalar com: npm i -g vercel"
    exit 1
else
    echo -e "${GREEN}✅ Vercel CLI instalado${NC}"
fi
echo ""

# 2. Verificar variáveis locais
echo "🔍 Verificando variáveis locais (.env.local)..."
if [ -f .env.local ]; then
    echo -e "${BLUE}📄 Arquivo .env.local encontrado${NC}"
    
    if grep -q "STRAVA_CLIENT_ID" .env.local 2>/dev/null; then
        echo -e "${GREEN}✅ STRAVA_CLIENT_ID presente${NC}"
    else
        echo -e "${YELLOW}⚠️  STRAVA_CLIENT_ID não encontrado${NC}"
    fi
    
    if grep -q "STRAVA_CLIENT_SECRET" .env.local 2>/dev/null; then
        echo -e "${GREEN}✅ STRAVA_CLIENT_SECRET presente${NC}"
    else
        echo -e "${YELLOW}⚠️  STRAVA_CLIENT_SECRET não encontrado${NC}"
    fi
    
    if grep -q "STRAVA_REDIRECT_URI" .env.local 2>/dev/null; then
        echo -e "${GREEN}✅ STRAVA_REDIRECT_URI presente${NC}"
    else
        echo -e "${YELLOW}⚠️  STRAVA_REDIRECT_URI não encontrado${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Arquivo .env.local não encontrado${NC}"
fi
echo ""

# 3. Verificar variáveis no Vercel
echo "☁️  Verificando variáveis no Vercel..."
echo "   (pode demorar alguns segundos...)"
echo ""

VERCEL_ENV_OUTPUT=$(vercel env ls 2>&1)

if echo "$VERCEL_ENV_OUTPUT" | grep -q "STRAVA_CLIENT_ID"; then
    echo -e "${GREEN}✅ STRAVA_CLIENT_ID configurado no Vercel${NC}"
    echo "$VERCEL_ENV_OUTPUT" | grep "STRAVA_CLIENT_ID"
else
    echo -e "${RED}❌ STRAVA_CLIENT_ID NÃO configurado no Vercel${NC}"
fi

if echo "$VERCEL_ENV_OUTPUT" | grep -q "STRAVA_CLIENT_SECRET"; then
    echo -e "${GREEN}✅ STRAVA_CLIENT_SECRET configurado no Vercel${NC}"
    echo "$VERCEL_ENV_OUTPUT" | grep "STRAVA_CLIENT_SECRET"
else
    echo -e "${RED}❌ STRAVA_CLIENT_SECRET NÃO configurado no Vercel${NC}"
fi

if echo "$VERCEL_ENV_OUTPUT" | grep -q "STRAVA_REDIRECT_URI"; then
    echo -e "${GREEN}✅ STRAVA_REDIRECT_URI configurado no Vercel${NC}"
    echo "$VERCEL_ENV_OUTPUT" | grep "STRAVA_REDIRECT_URI"
else
    echo -e "${RED}❌ STRAVA_REDIRECT_URI NÃO configurado no Vercel${NC}"
fi
echo ""

# 4. Testar endpoint em produção
echo "🌐 Testando endpoint em produção..."
RESPONSE=$(curl -s -I https://atherarun.com/api/strava/auth 2>&1 | head -n 1)

if echo "$RESPONSE" | grep -q "307\|302"; then
    echo -e "${GREEN}✅ Endpoint respondendo com redirect (OAuth funcionando)${NC}"
    echo "   $RESPONSE"
else
    echo -e "${RED}❌ Endpoint com problema${NC}"
    echo "   $RESPONSE"
    
    # Tentar pegar o corpo da resposta
    echo ""
    echo "   Detalhes do erro:"
    curl -s https://atherarun.com/api/strava/auth | head -n 5
fi
echo ""

# 5. Resumo e próximos passos
echo "📊 RESUMO"
echo "========="

MISSING=0

if ! echo "$VERCEL_ENV_OUTPUT" | grep -q "STRAVA_CLIENT_ID"; then
    echo -e "${RED}❌ Falta: STRAVA_CLIENT_ID${NC}"
    MISSING=$((MISSING + 1))
fi

if ! echo "$VERCEL_ENV_OUTPUT" | grep -q "STRAVA_CLIENT_SECRET"; then
    echo -e "${RED}❌ Falta: STRAVA_CLIENT_SECRET${NC}"
    MISSING=$((MISSING + 1))
fi

if ! echo "$VERCEL_ENV_OUTPUT" | grep -q "STRAVA_REDIRECT_URI"; then
    echo -e "${RED}❌ Falta: STRAVA_REDIRECT_URI${NC}"
    MISSING=$((MISSING + 1))
fi

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✅ Todas as variáveis configuradas!${NC}"
    echo ""
    echo "🎯 Próximo passo: Testar integração"
    echo "   1. Abrir: https://atherarun.com/perfil"
    echo "   2. Clicar em 'Conectar Strava'"
    echo "   3. Autorizar aplicação"
else
    echo ""
    echo "🔧 Ações necessárias ($MISSING variáveis faltando):"
    echo ""
    echo "   MÉTODO 1 - Via Web (Recomendado):"
    echo "   1. https://vercel.com/dashboard"
    echo "   2. Selecionar projeto 'atherarun'"
    echo "   3. Settings → Environment Variables"
    echo "   4. Adicionar variáveis faltantes"
    echo "   5. Redeploy"
    echo ""
    echo "   MÉTODO 2 - Via CLI:"
    echo "   $ vercel env add STRAVA_CLIENT_ID production"
    echo "   $ vercel env add STRAVA_CLIENT_SECRET production"
    echo "   $ vercel env add STRAVA_REDIRECT_URI production"
    echo "   $ vercel --prod"
    echo ""
    echo "   📖 Guia completo: GUIA_CONFIGURACAO_STRAVA_VERCEL.md"
fi
echo ""

exit $MISSING
