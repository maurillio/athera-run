const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUserSubscription() {
  try {
    console.log('🔧 Corrigindo dados da subscription do usuário...\n');
    
    const email = 'mmaurillio2@gmail.com';
    
    // 1. Buscar dados atuais
    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    
    console.log('📊 Dados atuais:');
    console.log('- isPremium:', user.isPremium);
    console.log('- Subscription Status:', user.subscription?.status);
    console.log('- Plan:', user.subscription?.plan);
    console.log('- Current Period End:', user.subscription?.stripeCurrentPeriodEnd);
    
    // 2. Buscar no Stripe a subscription real
    if (user.subscription?.stripeSubscriptionId) {
      console.log('\n🔍 Buscando dados no Stripe...');
      console.log('Subscription ID:', user.subscription.stripeSubscriptionId);
      console.log('\n⚠️  Você precisa verificar no Stripe Dashboard:');
      console.log('1. https://dashboard.stripe.com/test/subscriptions/' + user.subscription.stripeSubscriptionId);
      console.log('2. Ver a data "Current period end"');
      console.log('3. Copiar a data e atualizar no banco');
    }
    
    // 3. Atualizar subscription com data de exemplo (1 ano a partir de hoje)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    console.log('\n🔧 Atualizando subscription...');
    
    const updated = await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        stripeCurrentPeriodEnd: oneYearFromNow,
        status: 'ACTIVE',
        plan: 'PREMIUM_ANNUAL'
      }
    });
    
    // 4. Garantir que isPremium está true
    await prisma.user.update({
      where: { id: user.id },
      data: { isPremium: true }
    });
    
    console.log('✅ Subscription atualizada!');
    console.log('- Current Period End:', updated.stripeCurrentPeriodEnd);
    console.log('- Status:', updated.status);
    console.log('- Plan:', updated.plan);
    
    console.log('\n✅ USUÁRIO CORRIGIDO COM SUCESSO!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Usuário deve fazer logout');
    console.log('2. Fazer login novamente');
    console.log('3. Verificar se aparece Premium Badge');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserSubscription();
