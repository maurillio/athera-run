import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStripeCustomer() {
  try {
    console.log('\n🔍 Verificando usuários com assinaturas...\n');
    
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (subscriptions.length === 0) {
      console.log('❌ Nenhuma assinatura encontrada no banco de dados.');
      console.log('\n💡 Você precisa criar uma assinatura primeiro através da página /pricing\n');
      return;
    }

    console.log(`📊 Total de assinaturas: ${subscriptions.length}\n`);

    for (const sub of subscriptions) {
      console.log('---');
      console.log(`👤 Usuário: ${sub.user.name} (${sub.user.email})`);
      console.log(`📋 Status: ${sub.status}`);
      console.log(`💳 Plano: ${sub.plan}`);
      console.log(`🏷️  Stripe Customer ID: ${sub.stripeCustomerId || '❌ NÃO CONFIGURADO'}`);
      console.log(`🔑 Stripe Subscription ID: ${sub.stripeSubscriptionId || 'N/A'}`);
      
      if (!sub.stripeCustomerId) {
        console.log('⚠️  PROBLEMA: Este usuário não tem Stripe Customer ID!');
        console.log('   O botão "Gerenciar" não funcionará até que uma assinatura seja criada via Stripe.');
      } else {
        console.log('✅ Este usuário PODE usar o botão "Gerenciar"');
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStripeCustomer();
