# 🔄 EXECUTAR MIGRATION DO PRISMA

## Comando a executar:

```bash
cd /root/athera-run/nextjs_space
npx prisma db push
```

Ou se preferir criar uma migration formal:

```bash
cd /root/athera-run/nextjs_space
npx prisma migrate dev --name add_subscription_model
```

## O que isso faz:

- Cria a tabela `subscriptions` no banco de dados
- Adiciona os enums `SubscriptionStatus` e `SubscriptionPlan`
- Atualiza o relacionamento com a tabela `users`

## Após executar:

Execute também:

```bash
npx prisma generate
```

Isso irá regenerar o Prisma Client com os novos tipos.

## ✅ Como saber se funcionou:

Execute:

```bash
npx prisma studio
```

E verifique se a tabela `subscriptions` aparece no Prisma Studio.
