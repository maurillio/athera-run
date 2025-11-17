#!/bin/bash
set -e

echo "🚀 Criando TODOS os arquivos LGPD..."

# 1. Terms of Service Page
cat > app/[locale]/terms-of-service/page.tsx << 'EOF1'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso | Athera Run',
  description: 'Termos e Condições de Uso do Serviço',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Termos de Uso</h1>
          <p className="text-sm text-gray-600 mb-8"><strong>Última atualização:</strong> 17/Nov/2025</p>
          
          <div className="space-y-8 prose max-w-none">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
              <p>Ao criar uma conta, você concorda com estes Termos e nossa Política de Privacidade.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Descrição do Serviço</h2>
              <p>Plataforma de geração de planos de treino personalizados com IA.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Suas Responsabilidades</h2>
              <ul className="list-disc pl-6">
                <li>Consultar médico antes de treinar</li>
                <li>Fornecer dados verdadeiros</li>
                <li>Não usar para fins ilegais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Nossas Responsabilidades</h2>
              <ul className="list-disc pl-6">
                <li>Não somos médicos ou personal trainers</li>
                <li>Planos são orientativos</li>
                <li>Não garantimos resultados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Contato</h2>
              <p><strong>Email:</strong> suporte@atherarun.com</p>
              <p><strong>DPO:</strong> dpo@atherarun.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF1

echo "✅ 1/15 - Terms of Service criado"

# 2. Migration - User Consents
cat > prisma/migrations/20251117_consent_tracking/migration.sql << 'EOF2'
-- CreateTable: user_consents
CREATE TABLE IF NOT EXISTS user_consents (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  consent_type VARCHAR NOT NULL,
  consented_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR,
  user_agent TEXT,
  version VARCHAR NOT NULL DEFAULT '1.0',
  revoked_at TIMESTAMP,
  
  CONSTRAINT user_consents_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT user_consents_user_id_consent_type_version_key 
    UNIQUE(user_id, consent_type, version)
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON user_consents(consent_type);

-- CreateTable: audit_logs (Fase 3 - já preparando)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  action VARCHAR NOT NULL,
  entity_type VARCHAR,
  entity_id INT,
  ip_address VARCHAR,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
EOF2

echo "✅ 2/15 - Migration criada"

# 3. API - Record Consent
cat > app/api/consent/record/route.ts << 'EOF3'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { consentType, version = '1.0' } = await req.json();
    
    if (!consentType) {
      return NextResponse.json({ error: 'consentType é obrigatório' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const consent = await prisma.$executeRaw`
      INSERT INTO user_consents (user_id, consent_type, version, ip_address, user_agent, consented_at)
      VALUES (${session.user.id}, ${consentType}, ${version}, ${ipAddress}, ${userAgent}, NOW())
      ON CONFLICT (user_id, consent_type, version) DO NOTHING
    `;

    return NextResponse.json({ 
      success: true,
      message: 'Consentimento registrado com sucesso' 
    });
  } catch (error) {
    console.error('[CONSENT] Erro ao registrar:', error);
    return NextResponse.json({ 
      error: 'Erro ao registrar consentimento' 
    }, { status: 500 });
  }
}
EOF3

echo "✅ 3/15 - API Record Consent criada"

# 4. API - My Data (visualizar)
cat > app/api/privacy/my-data/route.ts << 'EOF4'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar TODOS os dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        athleteProfile: {
          include: {
            raceGoals: true,
            completedWorkouts: true,
            customPlan: {
              include: {
                weeks: {
                  include: {
                    workouts: true
                  }
                }
              }
            }
          }
        },
        subscription: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar consentimentos
    const consents = await prisma.$queryRaw`
      SELECT * FROM user_consents 
      WHERE user_id = ${session.user.id} 
      ORDER BY consented_at DESC
    `;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        locale: user.locale
      },
      profile: user.athleteProfile,
      subscription: user.subscription,
      consents,
      stats: {
        totalRaceGoals: user.athleteProfile?.raceGoals?.length || 0,
        totalWorkouts: user.athleteProfile?.completedWorkouts?.length || 0,
        hasActivePlan: !!user.athleteProfile?.customPlan
      }
    });
  } catch (error) {
    console.error('[MY DATA] Erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}
EOF4

echo "✅ 4/15 - API My Data criada"

# 5. API - Export (portabilidade)
cat > app/api/privacy/export/route.ts << 'EOF5'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar TODOS os dados (igual my-data)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        athleteProfile: {
          include: {
            raceGoals: true,
            completedWorkouts: true,
            trainingLogs: true,
            aiAnalyses: true,
            customPlan: {
              include: {
                weeks: {
                  include: {
                    workouts: true
                  }
                }
              }
            }
          }
        },
        subscription: true,
        accounts: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const consents = await prisma.$queryRaw`
      SELECT * FROM user_consents 
      WHERE user_id = ${session.user.id}
    `;

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      lgpd_version: '1.0',
      data: {
        user,
        consents
      }
    };

    // Remover campos sensíveis
    if (exportData.data.user.password) {
      delete exportData.data.user.password;
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="athera-run-dados-${session.user.id}-${Date.now()}.json"`
      }
    });
  } catch (error) {
    console.error('[EXPORT] Erro:', error);
    return NextResponse.json({ error: 'Erro ao exportar dados' }, { status: 500 });
  }
}
EOF5

echo "✅ 5/15 - API Export criada"

# 6. API - Revoke Consent
cat > app/api/privacy/revoke-consent/route.ts << 'EOF6'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { consentType } = await req.json();
    
    if (!consentType) {
      return NextResponse.json({ error: 'consentType é obrigatório' }, { status: 400 });
    }

    // Marcar consentimento como revogado
    await prisma.$executeRaw`
      UPDATE user_consents 
      SET revoked_at = NOW() 
      WHERE user_id = ${session.user.id} 
      AND consent_type = ${consentType}
      AND revoked_at IS NULL
    `;

    // Se for dados de saúde, apagar campos sensíveis
    if (consentType === 'health_data') {
      const profile = await prisma.athleteProfile.findUnique({
        where: { userId: session.user.id }
      });

      if (profile) {
        await prisma.athleteProfile.update({
          where: { id: profile.id },
          data: {
            injuries: null,
            medicalConditions: null,
            medications: null,
            injuryDetails: null,
            tracksMenstrualCycle: false,
            lastPeriodDate: null,
            avgCycleLength: null
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Consentimento revogado com sucesso' 
    });
  } catch (error) {
    console.error('[REVOKE] Erro:', error);
    return NextResponse.json({ error: 'Erro ao revogar consentimento' }, { status: 500 });
  }
}
EOF6

echo "✅ 6/15 - API Revoke Consent criada"

# 7. API - List Consents
cat > app/api/privacy/consents/route.ts << 'EOF7'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const consents = await prisma.$queryRaw`
      SELECT 
        id,
        consent_type as "consentType",
        version,
        consented_at as "consentedAt",
        revoked_at as "revokedAt",
        ip_address as "ipAddress"
      FROM user_consents 
      WHERE user_id = ${session.user.id}
      ORDER BY consented_at DESC
    `;

    return NextResponse.json({ consents });
  } catch (error) {
    console.error('[CONSENTS] Erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar consentimentos' }, { status: 500 });
  }
}
EOF7

echo "✅ 7/15 - API List Consents criada"

echo ""
echo "🎉 Criados 7 arquivos principais!"
echo "Continuando com páginas e componentes..."
