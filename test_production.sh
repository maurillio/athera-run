#!/bin/bash

echo "=========================================="
echo "🧪 TESTE DE PRODUÇÃO - ATHERA RUN"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local url=$1
    local name=$2
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" = "200" ] || [ "$status" = "307" ]; then
        echo -e "${GREEN}✓${NC} $name: $status"
        return 0
    else
        echo -e "${RED}✗${NC} $name: $status"
        return 1
    fi
}

echo "📍 Testando endpoints principais:"
echo ""
test_endpoint "https://atherarun.com" "Home Page"
test_endpoint "https://atherarun.com/login" "Login Page"
test_endpoint "https://atherarun.com/signup" "Signup Page"
test_endpoint "https://atherarun.com/dashboard" "Dashboard (redirect)"
test_endpoint "https://atherarun.com/pricing" "Pricing Page"
test_endpoint "https://atherarun.com/api/auth/session" "Auth API"

echo ""
echo "🗄️  Testando conexão com banco de dados:"
echo ""

# Testa conexão local
if PGPASSWORD='MRT2025_Secure!Pass' psql -h localhost -U maratona_user -d maratona -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1; then
    user_count=$(PGPASSWORD='MRT2025_Secure!Pass' psql -h localhost -U maratona_user -d maratona -t -c "SELECT COUNT(*) FROM users;")
    echo -e "${GREEN}✓${NC} Conexão local: OK (${user_count// /} usuários)"
else
    echo -e "${RED}✗${NC} Conexão local: FALHOU"
fi

# Testa conexão externa
if PGPASSWORD='MRT2025_Secure!Pass' psql -h 45.232.21.67 -U maratona_user -d maratona -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Conexão externa (45.232.21.67): OK"
else
    echo -e "${RED}✗${NC} Conexão externa: FALHOU"
fi

# Conta conexões ativas
active=$(PGPASSWORD='MRT2025_Secure!Pass' psql -h localhost -U maratona_user -d maratona -t -c "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'maratona';")
echo -e "${YELLOW}ℹ${NC}  Conexões ativas: ${active// /}"

echo ""
echo "🔥 Testando firewall:"
echo ""
sudo ufw status | grep 5432 | head -2

echo ""
echo "📊 Status do PostgreSQL:"
echo ""
sudo systemctl status postgresql --no-pager | head -5

echo ""
echo "=========================================="
echo "✅ TESTE CONCLUÍDO"
echo "=========================================="
