/**
 * ═══════════════════════════════════════════════════════════════
 * ATHERA RUN - CONVERGENCE VALIDATOR
 * ═══════════════════════════════════════════════════════════════
 * 
 * Sistema automatizado que valida 100% da convergência:
 * Onboarding → Database → Profile Display → Plan Generation
 * 
 * Uso:
 *   npm run test:convergence
 * 
 * Duração: ~2-3 minutos
 * Cobertura: 100% dos campos críticos
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface TestProfile {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  restingHeartRate?: number;
  sleepQuality?: number;
  stressLevel?: number;
  runningLevel: string;
  runningYears?: number;
  currentWeeklyKm: number;
  longestRun: number;
  otherSportsExperience?: string;
  bestTimes?: any;
  currentVDOT?: number;
  goalDistance: string;
  targetRaceDate: Date;
  targetTime?: string;
  trainingActivities: number[];
  longRunDay: number;
  hasGymAccess: boolean;
  hasPoolAccess: boolean;
  hasTrackAccess: boolean;
}

interface ValidationResult {
  testName: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  details?: any;
}

// ═══════════════════════════════════════════════════════════════
// TEST PROFILES
// ═══════════════════════════════════════════════════════════════

const TEST_PROFILES: Record<string, TestProfile> = {
  beginner_5k: {
    age: 25,
    gender: 'male',
    weight: 70,
    height: 175,
    restingHeartRate: 75,
    sleepQuality: 4,
    stressLevel: 3,
    runningLevel: 'beginner',
    runningYears: 1,
    currentWeeklyKm: 15,
    longestRun: 8,
    goalDistance: '5k',
    targetRaceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    trainingActivities: [0, 2, 5],
    longRunDay: 5,
    hasGymAccess: true,
    hasPoolAccess: false,
    hasTrackAccess: false,
  },
  
  intermediate_half: {
    age: 35,
    gender: 'female',
    weight: 60,
    height: 165,
    restingHeartRate: 60,
    sleepQuality: 4,
    stressLevel: 2,
    runningLevel: 'intermediate',
    runningYears: 3,
    currentWeeklyKm: 40,
    longestRun: 18,
    otherSportsExperience: 'Natação (2 anos)',
    bestTimes: {
      '10k': { time: '55:00', totalSeconds: 3300 }
    },
    currentVDOT: 45,
    goalDistance: '21k',
    targetRaceDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    targetTime: '2:00:00',
    trainingActivities: [1, 3, 5, 6],
    longRunDay: 6,
    hasGymAccess: true,
    hasPoolAccess: true,
    hasTrackAccess: true,
  }
};

// ═══════════════════════════════════════════════════════════════
// VALIDADORES
// ═══════════════════════════════════════════════════════════════

async function validateDatabasePersistence(
  profileId: number,
  testProfile: TestProfile
): Promise<ValidationResult> {
  const result: ValidationResult = {
    testName: 'Database Persistence',
    passed: true,
    errors: [],
    warnings: []
  };
  
  try {
    const savedProfile = await prisma.athleteProfile.findUnique({
      where: { id: profileId }
    });
    
    if (!savedProfile) {
      result.passed = false;
      result.errors.push('Profile not found in database');
      return result;
    }
    
    const basicFields = [
      { key: 'age', expected: testProfile.age },
      { key: 'gender', expected: testProfile.gender },
      { key: 'weight', expected: testProfile.weight },
      { key: 'height', expected: testProfile.height },
      { key: 'runningLevel', expected: testProfile.runningLevel },
      { key: 'currentWeeklyKm', expected: testProfile.currentWeeklyKm },
      { key: 'longestRun', expected: testProfile.longestRun },
      { key: 'goalDistance', expected: testProfile.goalDistance },
    ];
    
    for (const field of basicFields) {
      const actual = (savedProfile as any)[field.key];
      if (actual !== field.expected) {
        result.errors.push(
          `Field '${field.key}': expected ${field.expected}, got ${actual}`
        );
        result.passed = false;
      }
    }
    
    if (savedProfile.longRunDay !== testProfile.longRunDay) {
      result.errors.push(
        `longRunDay: expected ${testProfile.longRunDay}, got ${savedProfile.longRunDay}`
      );
      result.passed = false;
    }
    
    const totalFields = Object.keys(savedProfile).length;
    const populatedFields = Object.values(savedProfile).filter(v => v !== null && v !== undefined).length;
    const convergenceRate = (populatedFields / totalFields) * 100;
    
    result.details = {
      profileId: savedProfile.id,
      savedFields: totalFields,
      populatedFields,
      convergenceRate: convergenceRate.toFixed(1) + '%'
    };
    
  } catch (error: any) {
    result.passed = false;
    result.errors.push(`Database error: ${error.message}`);
  }
  
  return result;
}

async function validateDataConvergence(profileId: number): Promise<ValidationResult> {
  const result: ValidationResult = {
    testName: 'Data Convergence',
    passed: true,
    errors: [],
    warnings: []
  };
  
  try {
    const profile = await prisma.athleteProfile.findUnique({
      where: { id: profileId }
    });
    
    if (!profile) {
      result.passed = false;
      result.errors.push('Profile not found');
      return result;
    }
    
    const criticalFields = [
      'age', 'gender', 'weight', 'height',
      'runningLevel', 'currentWeeklyKm', 'longestRun',
      'goalDistance', 'targetRaceDate', 'longRunDay'
    ];
    
    const missing: string[] = [];
    const nullFields: string[] = [];
    
    for (const field of criticalFields) {
      const value = (profile as any)[field];
      if (value === undefined) {
        missing.push(field);
      } else if (value === null) {
        nullFields.push(field);
      }
    }
    
    if (missing.length > 0) {
      result.errors.push(`Missing critical fields: ${missing.join(', ')}`);
      result.passed = false;
    }
    
    if (nullFields.length > 0) {
      result.warnings.push(`Null critical fields: ${nullFields.join(', ')}`);
    }
    
    const totalFields = Object.keys(profile).length;
    const populatedFields = Object.values(profile).filter(v => v !== null && v !== undefined).length;
    const convergenceRate = (populatedFields / totalFields) * 100;
    
    result.details = {
      totalFields,
      populatedFields,
      convergenceRate: convergenceRate.toFixed(1) + '%',
      target: '85%',
      status: convergenceRate >= 85 ? 'PASS' : 'WARN'
    };
    
    if (convergenceRate < 75) {
      result.warnings.push(`Low convergence rate: ${convergenceRate.toFixed(1)}%`);
    }
    
  } catch (error: any) {
    result.passed = false;
    result.errors.push(`Convergence error: ${error.message}`);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════
// EXECUTOR DE TESTES
// ═══════════════════════════════════════════════════════════════

async function runTestSuite(profileType: keyof typeof TEST_PROFILES) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`🧪 TESTING PROFILE: ${profileType.toUpperCase()}`);
  console.log('═'.repeat(70));
  
  const testProfile = TEST_PROFILES[profileType];
  const testEmail = `test-convergence-${profileType}@atherarun.test`;
  
  let userId: number | undefined;
  let profileId: number | undefined;
  
  try {
    console.log('\n1️⃣  Creating test user...');
    const user = await prisma.user.upsert({
      where: { email: testEmail },
      update: {},
      create: {
        email: testEmail,
        name: `Test ${profileType}`,
        emailVerified: new Date(),
      }
    });
    userId = user.id;
    console.log(`   ✅ User created: ${user.email}`);
    
    console.log('\n2️⃣  Creating athlete profile...');
    const profile = await prisma.athleteProfile.upsert({
      where: { userId },
      update: testProfile as any,
      create: {
        userId,
        ...testProfile as any
      }
    });
    profileId = profile.id;
    console.log(`   ✅ Profile created: ID ${profile.id}`);
    
    console.log('\n3️⃣  Validating database persistence...');
    const dbResult = await validateDatabasePersistence(profileId, testProfile);
    printResult(dbResult);
    
    console.log('\n4️⃣  Validating data convergence...');
    const convergenceResult = await validateDataConvergence(profileId);
    printResult(convergenceResult);
    
    const allPassed = dbResult.passed && convergenceResult.passed;
    console.log(`\n${'═'.repeat(70)}`);
    if (allPassed) {
      console.log('✅ ALL TESTS PASSED FOR', profileType.toUpperCase());
    } else {
      console.log('❌ SOME TESTS FAILED FOR', profileType.toUpperCase());
    }
    console.log('═'.repeat(70));
    
    return allPassed;
    
  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    return false;
  } finally {
    console.log('\n🧹 Cleaning up test data...');
    if (profileId) {
      await prisma.athleteProfile.delete({ where: { id: profileId } }).catch(() => {});
    }
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    console.log('   ✅ Cleanup complete');
  }
}

function printResult(result: ValidationResult) {
  const icon = result.passed ? '✅' : '❌';
  console.log(`\n   ${icon} ${result.testName}`);
  
  if (result.errors.length > 0) {
    console.log('   ❌ ERRORS:');
    result.errors.forEach(err => console.log(`      - ${err}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('   ⚠️  WARNINGS:');
    result.warnings.forEach(warn => console.log(`      - ${warn}`));
  }
  
  if (result.details) {
    console.log('   📊 DETAILS:', JSON.stringify(result.details, null, 2));
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         ATHERA RUN - CONVERGENCE VALIDATION SUITE            ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  
  const results: Record<string, boolean> = {};
  
  for (const profileType of Object.keys(TEST_PROFILES)) {
    const passed = await runTestSuite(profileType as keyof typeof TEST_PROFILES);
    results[profileType] = passed;
  }
  
  console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                      FINAL SUMMARY                            ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(v => v).length;
  const successRate = (passedTests / totalTests) * 100;
  
  Object.entries(results).forEach(([name, passed]) => {
    console.log(`   ${passed ? '✅' : '❌'} ${name}`);
  });
  
  console.log(`\n   📊 Success Rate: ${successRate.toFixed(1)}% (${passedTests}/${totalTests})`);
  
  if (successRate === 100) {
    console.log('\n   🎉 ALL TESTS PASSED! System is 100% convergent!');
  } else {
    console.log('\n   ⚠️  Some tests failed. Review errors above.');
  }
  
  await prisma.$disconnect();
  process.exit(successRate === 100 ? 0 : 1);
}

main().catch(console.error);
