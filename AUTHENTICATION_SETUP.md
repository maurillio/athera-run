# Configuração de Autenticação - Athera Run

Este documento descreve como configurar a autenticação com Google e Strava no servidor.

## Variáveis de Ambiente Necessárias

No servidor `45.232.21.67`, você precisa configurar as seguintes variáveis de ambiente no arquivo `.env`:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=<gerar_com: openssl rand -base64 32>
NEXTAUTH_URL=http://45.232.21.67:3000

# Google OAuth
GOOGLE_CLIENT_ID=<seu_google_client_id>
GOOGLE_CLIENT_SECRET=<seu_google_client_secret>

# Strava OAuth
STRAVA_CLIENT_ID=<seu_strava_client_id>
STRAVA_CLIENT_SECRET=<seu_strava_client_secret>
```

## Como Obter as Credenciais

### 1. Google OAuth

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá em "APIs & Services" > "Credentials"
4. Clique em "Create Credentials" > "OAuth client ID"
5. Escolha "Web application"
6. Configure:
   - **Authorized JavaScript origins**:
     - `http://45.232.21.67:3000`
     - `http://localhost:3000` (para desenvolvimento)
   - **Authorized redirect URIs**:
     - `http://45.232.21.67:3000/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google` (para desenvolvimento)
7. Copie o **Client ID** e **Client Secret**

### 2. Strava OAuth

1. Acesse: https://www.strava.com/settings/api
2. Crie uma nova aplicação ou edite uma existente
3. Configure:
   - **Authorization Callback Domain**: `45.232.21.67`
   - **Authorization Callback URL**: `http://45.232.21.67:3000/api/auth/callback/strava`
4. Copie o **Client ID** e **Client Secret**

## Configuração no Servidor

### Passo 1: Conectar ao servidor

```bash
ssh root@45.232.21.67
```

### Passo 2: Navegar para o diretório do projeto

```bash
cd /root/athera-run/nextjs_space
```

### Passo 3: Editar o arquivo .env

```bash
nano .env
```

### Passo 4: Adicionar/Atualizar as variáveis

Cole as variáveis de ambiente listadas acima com os valores corretos.

### Passo 5: Gerar NEXTAUTH_SECRET (se ainda não tiver)

```bash
openssl rand -base64 32
```

Copie o resultado e adicione ao `.env` como `NEXTAUTH_SECRET`.

### Passo 6: Salvar e sair

Pressione `Ctrl+X`, depois `Y`, depois `Enter`.

## Deploy das Correções

Após configurar as variáveis de ambiente, faça o deploy das correções:

```bash
# Voltar para o diretório raiz
cd /root/athera-run

# Pull das mudanças
git pull origin claude/implement-application-011CUXjqYRAFMdfsj85sXHia

# Instalar dependências e fazer rebuild
cd nextjs_space
npm install
npm run build

# Reiniciar a aplicação
pm2 restart athera-run

# Verificar logs
pm2 logs athera-run --lines 100
```

## Verificação

### 1. Testar autenticação

1. Acesse: `http://45.232.21.67:3000/login`
2. Tente fazer login com:
   - Google
   - Strava
   - Email/senha (se já tiver uma conta)

### 2. Verificar logs

Os logs agora incluem informações detalhadas de autenticação:

```bash
pm2 logs athera-run --lines 50 | grep "\[AUTH\]"
```

Você deve ver mensagens como:
- `[AUTH] SignIn attempt:`
- `[AUTH] User signed in:`
- `[AUTH] Redirect:`
- `[AUTH] Processing Strava connection:`

### 3. Problemas comuns

#### "Missing required parameter: 'messages'"
✅ Este erro já foi corrigido! O problema era que `resilientLLMCall` estava sendo chamado incorretamente.

#### "Error: NEXTAUTH_URL is not set"
Configure a variável `NEXTAUTH_URL=http://45.232.21.67:3000` no .env

#### "OAuthCallback error"
Verifique se as URLs de callback estão configuradas corretamente no Google Console e Strava API.

#### "OAuthAccountNotLinked"
Este erro ocorre quando você tenta fazer login com um provedor OAuth diferente usando o mesmo email de uma conta existente. Solução:
1. Faça login com o método original
2. Ou crie uma nova conta com um email diferente

## Ambiente de Desenvolvimento

Se você também quer testar localmente:

1. Adicione as mesmas credenciais ao `.env.local`:

```bash
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<mesmo_do_servidor>
GOOGLE_CLIENT_SECRET=<mesmo_do_servidor>
STRAVA_CLIENT_ID=<mesmo_do_servidor>
STRAVA_CLIENT_SECRET=<mesmo_do_servidor>
NEXTAUTH_SECRET=<mesmo_do_servidor>
```

2. Configure os callbacks no Google e Strava para incluir `localhost:3000`

## Correções Implementadas

### 1. Callback Redirect Melhorado
- Agora sempre redireciona para `/dashboard` após login OAuth
- O dashboard verifica se o usuário precisa completar o onboarding

### 2. Tratamento de Email do Strava
- Se o usuário do Strava não tiver email público, geramos um email fake: `{athlete_id}@strava.user`
- Isso evita erros de conta sem email

### 3. Logs e Debug
- Adicionado logs detalhados para facilitar diagnóstico
- Debug mode ativo em ambiente de desenvolvimento

### 4. Melhor Tratamento de Erros
- Página de login agora captura e exibe erros específicos do OAuth
- Mensagens de erro mais amigáveis para o usuário

### 5. Sessão Otimizada
- Sessão JWT com duração de 30 dias
- Melhor handling de tokens do Strava no perfil do atleta

## Suporte

Se encontrar problemas:

1. Verifique os logs: `pm2 logs athera-run --lines 100`
2. Verifique se as variáveis de ambiente estão corretas: `cat .env | grep -E "GOOGLE|STRAVA|NEXTAUTH"`
3. Reinicie a aplicação: `pm2 restart athera-run`
4. Verifique se as URLs de callback estão corretas no Google Console e Strava API

---

**Última atualização**: 2025-01-29
**Branch**: `claude/implement-application-011CUXjqYRAFMdfsj85sXHia`
