/**
 * ═══════════════════════════════════════════════════════════════
 * ATHERA RUN - HEALTH CHECK
 * ═══════════════════════════════════════════════════════════════
 * 
 * Quick health check (30 seconds):
 * - Database connection
 * - Environment variables
 * - Critical dependencies
 * 
 * Uso:
 *   npm run test:health
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const prisma = new PrismaClient();

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
}

async function checkDatabase(): Promise<HealthCheck> {
  try {
    await prisma.$connect();
    const count = await prisma.user.count();
    return {
      name: 'Database',
      status: 'pass',
      message: 'Connected successfully',
      details: { userCount: count }
    };
  } catch (error: any) {
    return {
      name: 'Database',
      status: 'fail',
      message: `Connection failed: ${error.message}`
    };
  }
}

function checkEnvironment(): HealthCheck {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'OPENAI_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    return {
      name: 'Environment',
      status: 'fail',
      message: `Missing required variables: ${missing.join(', ')}`
    };
  }
  
  return {
    name: 'Environment',
    status: 'pass',
    message: 'All required variables present',
    details: { checked: required.length }
  };
}

async function checkSchema(): Promise<HealthCheck> {
  try {
    const profile = await prisma.athleteProfile.findFirst();
    
    const requiredFields = [
      'age', 'gender', 'weight', 'runningLevel',
      'goalDistance', 'longRunDay'
    ];
    
    if (profile) {
      const missing = requiredFields.filter(field => 
        !(field in profile) || (profile as any)[field] === undefined
      );
      
      if (missing.length > 0) {
        return {
          name: 'Schema',
          status: 'warn',
          message: `Some fields missing in sample profile: ${missing.join(', ')}`
        };
      }
    }
    
    return {
      name: 'Schema',
      status: 'pass',
      message: 'Schema structure valid',
      details: { sampleProfileFound: !!profile }
    };
  } catch (error: any) {
    return {
      name: 'Schema',
      status: 'warn',
      message: `Could not verify schema: ${error.message}`
    };
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║              ATHERA RUN - HEALTH CHECK                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  const checks: HealthCheck[] = [];
  
  console.log('🔍 Running health checks...\n');
  
  checks.push(checkEnvironment());
  checks.push(await checkDatabase());
  checks.push(await checkSchema());
  
  checks.forEach(check => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.message}`);
    if (check.details) {
      console.log(`   Details: ${JSON.stringify(check.details)}`);
    }
  });
  
  const hasFailures = checks.some(c => c.status === 'fail');
  const hasWarnings = checks.some(c => c.status === 'warn');
  
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  if (!hasFailures && !hasWarnings) {
    console.log('║  ✅ ALL CHECKS PASSED - System is healthy!                   ║');
  } else if (hasFailures) {
    console.log('║  ❌ CRITICAL FAILURES - System needs attention!              ║');
  } else {
    console.log('║  ⚠️  WARNINGS - System functional but has issues            ║');
  }
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  await prisma.$disconnect();
  process.exit(hasFailures ? 1 : 0);
}

main().catch(console.error);
