# 🚨 HOTFIX: Correção Criação de Usuários OAuth

## Problema Identificado
- Usuários fazendo login via Google/Strava não eram criados no banco de dados
- Erro de foreign key ao tentar criar subscription: `subscriptions_userId_fkey`
- Usuário mmaurillio2@gmail.com não conseguia acessar a página de treinos

## Causa Raiz
No arquivo `lib/auth.ts`, o PrismaAdapter estava **desabilitado em produção**:
```typescript
...(process.env.NODE_ENV === 'production' 
  ? {} 
  : { adapter: PrismaAdapter(prisma) }
),
```

Isso significa que:
- ❌ Em produção: JWT apenas, sem criar usuário no banco
- ✅ Em dev: PrismaAdapter cria usuário automaticamente

## Solução Aplicada
✅ Habilitado PrismaAdapter permanentemente:
```typescript
adapter: PrismaAdapter(prisma),
```

Agora **todos os usuários OAuth são criados automaticamente** no banco, em qualquer ambiente.

## Arquivos Alterados
- `lib/auth.ts` - Habilitado PrismaAdapter em produção

## Status
✅ Correção deployada
⏳ Aguardando propagação do Vercel
📝 Próxima ação: Usuário mmaurillio2@gmail.com precisa fazer **logout e login novamente**

## Impacto
- ✅ Novos logins OAuth funcionarão corretamente
- ✅ Usuários serão criados no banco automaticamente
- ⚠️ Usuários que já fizeram login precisam refazer o login para serem criados no banco

## Como Testar
1. Fazer logout completo
2. Fazer login novamente via Google ou Strava
3. Verificar que o usuário foi criado: `SELECT * FROM users WHERE email = 'seu@email.com'`
4. Verificar que subscription foi criada automaticamente
5. Acessar página de treinos normalmente

---
**Deploy ID:** 4776ff94
**Data:** 2025-11-19 18:50 UTC
