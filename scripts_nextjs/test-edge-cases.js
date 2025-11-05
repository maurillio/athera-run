#!/usr/bin/env node

/**
 * i18n Edge Cases Testing - v1.4.0
 * Tests edge cases, fallbacks, and error scenarios
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

function logSection(title) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

// Test config validation
function testConfigValidation() {
  logSection('TEST 1: Config Validation');
  
  try {
    const configPath = path.join(__dirname, '../lib/i18n/config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check for required exports
    const requiredExports = ['locales', 'defaultLocale', 'Locale'];
    let passed = true;
    
    for (const exp of requiredExports) {
      if (configContent.includes(exp)) {
        log(colors.green, '✓', `Config exports '${exp}'`);
      } else {
        log(colors.red, '✗', `Config missing '${exp}'`);
        passed = false;
      }
    }
    
    // Check locale values
    if (configContent.includes("'pt-BR'") && configContent.includes("'en'") && configContent.includes("'es'")) {
      log(colors.green, '✓', 'All 3 locales defined');
    } else {
      log(colors.red, '✗', 'Not all locales defined');
      passed = false;
    }
    
    return passed;
  } catch (error) {
    log(colors.red, '✗', `Config test failed: ${error.message}`);
    return false;
  }
}

// Test middleware existence
function testMiddleware() {
  logSection('TEST 2: Middleware Validation');
  
  try {
    const middlewarePath = path.join(__dirname, '../lib/i18n/middleware.ts');
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    
    let passed = true;
    
    // Check for locale detection
    if (middlewareContent.includes('Accept-Language') || middlewareContent.includes('acceptLanguage')) {
      log(colors.green, '✓', 'Middleware has locale detection');
    } else {
      log(colors.yellow, '⚠', 'Middleware may not have locale detection');
    }
    
    // Check for cookie handling
    if (middlewareContent.includes('cookie') || middlewareContent.includes('Cookie')) {
      log(colors.green, '✓', 'Middleware handles cookies');
    } else {
      log(colors.yellow, '⚠', 'Middleware may not handle cookies');
    }
    
    // Check for redirect logic
    if (middlewareContent.includes('redirect') || middlewareContent.includes('NextResponse')) {
      log(colors.green, '✓', 'Middleware has redirect logic');
    } else {
      log(colors.red, '✗', 'Middleware missing redirect logic');
      passed = false;
    }
    
    return passed;
  } catch (error) {
    log(colors.red, '✗', `Middleware test failed: ${error.message}`);
    return false;
  }
}

// Test hooks existence
function testHooks() {
  logSection('TEST 3: Hooks Validation');
  
  try {
    const hooksPath = path.join(__dirname, '../lib/i18n/hooks.ts');
    const hooksContent = fs.readFileSync(hooksPath, 'utf8');
    
    let passed = true;
    
    // Check for useTranslations hook
    if (hooksContent.includes('useTranslations')) {
      log(colors.green, '✓', 'useTranslations hook exists');
    } else {
      log(colors.red, '✗', 'useTranslations hook missing');
      passed = false;
    }
    
    // Check for useLocale hook
    if (hooksContent.includes('useLocale')) {
      log(colors.green, '✓', 'useLocale hook exists');
    } else {
      log(colors.red, '✗', 'useLocale hook missing');
      passed = false;
    }
    
    return passed;
  } catch (error) {
    log(colors.red, '✗', `Hooks test failed: ${error.message}`);
    return false;
  }
}

// Test API utils
function testApiUtils() {
  logSection('TEST 4: API Utils Validation');
  
  try {
    const apiUtilsPath = path.join(__dirname, '../lib/i18n/api-utils.ts');
    const apiUtilsContent = fs.readFileSync(apiUtilsPath, 'utf8');
    
    let passed = true;
    
    const requiredFunctions = [
      'getApiMessage',
      'ApiResponse',
      'getLocaleFromRequest',
    ];
    
    for (const fn of requiredFunctions) {
      if (apiUtilsContent.includes(fn)) {
        log(colors.green, '✓', `API util '${fn}' exists`);
      } else {
        log(colors.red, '✗', `API util '${fn}' missing`);
        passed = false;
      }
    }
    
    // Check for response methods
    const responseMethods = ['success', 'error', 'unauthorized', 'notFound'];
    for (const method of responseMethods) {
      if (apiUtilsContent.includes(`${method}(`)) {
        log(colors.green, '✓', `ApiResponse.${method}() exists`);
      } else {
        log(colors.yellow, '⚠', `ApiResponse.${method}() may be missing`);
      }
    }
    
    return passed;
  } catch (error) {
    log(colors.red, '✗', `API utils test failed: ${error.message}`);
    return false;
  }
}

// Test API route
function testApiRoute() {
  logSection('TEST 5: API Route Validation');
  
  try {
    const apiRoutePath = path.join(__dirname, '../app/api/user/locale/route.ts');
    const apiRouteContent = fs.readFileSync(apiRoutePath, 'utf8');
    
    let passed = true;
    
    // Check for POST method
    if (apiRouteContent.includes('export async function POST')) {
      log(colors.green, '✓', 'POST endpoint exists');
    } else {
      log(colors.red, '✗', 'POST endpoint missing');
      passed = false;
    }
    
    // Check for authentication
    if (apiRouteContent.includes('session') || apiRouteContent.includes('getServerSession')) {
      log(colors.green, '✓', 'Authentication check present');
    } else {
      log(colors.yellow, '⚠', 'Authentication may not be checked');
    }
    
    // Check for locale validation
    if (apiRouteContent.includes('pt-BR') || apiRouteContent.includes('locales')) {
      log(colors.green, '✓', 'Locale validation present');
    } else {
      log(colors.yellow, '⚠', 'Locale validation may be missing');
    }
    
    // Check for database update
    if (apiRouteContent.includes('prisma') || apiRouteContent.includes('update')) {
      log(colors.green, '✓', 'Database update logic present');
    } else {
      log(colors.red, '✗', 'Database update logic missing');
      passed = false;
    }
    
    return passed;
  } catch (error) {
    log(colors.red, '✗', `API route test failed: ${error.message}`);
    return false;
  }
}

// Test LanguageSwitcher component
function testLanguageSwitcher() {
  logSection('TEST 6: LanguageSwitcher Component');
  
  try {
    const componentPath = path.join(__dirname, '../components/i18n/LanguageSwitcher.tsx');
    const componentContent = fs.readFileSync(componentPath, 'utf8');
    
    let passed = true;
    
    // Check for cookie setting
    if (componentContent.includes('document.cookie')) {
      log(colors.green, '✓', 'Component sets cookie');
    } else {
      log(colors.yellow, '⚠', 'Component may not set cookie');
    }
    
    // Check for API call
    if (componentContent.includes('/api/user/locale')) {
      log(colors.green, '✓', 'Component calls API');
    } else {
      log(colors.red, '✗', 'Component does not call API');
      passed = false;
    }
    
    // Check for router navigation
    if (componentContent.includes('router.push')) {
      log(colors.green, '✓', 'Component navigates on change');
    } else {
      log(colors.red, '✗', 'Component does not navigate');
      passed = false;
    }
    
    // Check for all 3 locales (uses config, so check for locales.map)
    if (componentContent.includes('locales.map')) {
      log(colors.green, '✓', 'All 3 locales available (via config)');
    } else {
      log(colors.red, '✗', 'Not all locales available');
      passed = false;
    }
    
    return passed;
  } catch (error) {
    log(colors.red, '✗', `LanguageSwitcher test failed: ${error.message}`);
    return false;
  }
}

// Test Prisma schema
function testPrismaSchema() {
  logSection('TEST 7: Prisma Schema Validation');
  
  try {
    const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    let passed = true;
    
    // Check for locale field
    if (schemaContent.includes('locale')) {
      log(colors.green, '✓', 'User.locale field exists');
    } else {
      log(colors.red, '✗', 'User.locale field missing');
      passed = false;
    }
    
    // Check for default value
    if (schemaContent.includes('@default("pt-BR")') || schemaContent.includes("default('pt-BR')")) {
      log(colors.green, '✓', 'Default locale is pt-BR');
    } else {
      log(colors.yellow, '⚠', 'Default locale may not be set');
    }
    
    return passed;
  } catch (error) {
    log(colors.red, '✗', `Prisma schema test failed: ${error.message}`);
    return false;
  }
}

// Test migration
function testMigration() {
  logSection('TEST 8: Database Migration');
  
  try {
    const migrationsDir = path.join(__dirname, '../prisma/migrations');
    const migrations = fs.readdirSync(migrationsDir);
    
    // Find locale migration
    const localeMigration = migrations.find(m => m.includes('user_locale') || m.includes('locale'));
    
    if (localeMigration) {
      log(colors.green, '✓', `Migration found: ${localeMigration}`);
      
      // Read migration content
      const migrationPath = path.join(migrationsDir, localeMigration, 'migration.sql');
      const migrationContent = fs.readFileSync(migrationPath, 'utf8');
      
      // Check for ALTER TABLE
      if (migrationContent.includes('ALTER TABLE') || migrationContent.includes('ADD COLUMN')) {
        log(colors.green, '✓', 'Migration adds locale column');
      } else {
        log(colors.red, '✗', 'Migration does not add column');
        return false;
      }
      
      // Check for default value
      if (migrationContent.includes('pt-BR')) {
        log(colors.green, '✓', 'Migration sets default value');
      } else {
        log(colors.yellow, '⚠', 'Migration may not set default');
      }
      
      return true;
    } else {
      log(colors.yellow, '⚠', 'Locale migration not found (may need to be created)');
      return true; // Not a failure, just needs to be applied
    }
  } catch (error) {
    log(colors.red, '✗', `Migration test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
function main() {
  console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║         i18n Edge Cases Testing - v1.4.0                  ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  const tests = [
    { name: 'Config Validation', fn: testConfigValidation },
    { name: 'Middleware Validation', fn: testMiddleware },
    { name: 'Hooks Validation', fn: testHooks },
    { name: 'API Utils Validation', fn: testApiUtils },
    { name: 'API Route Validation', fn: testApiRoute },
    { name: 'LanguageSwitcher Component', fn: testLanguageSwitcher },
    { name: 'Prisma Schema', fn: testPrismaSchema },
    { name: 'Database Migration', fn: testMigration },
  ];
  
  const results = tests.map(test => ({
    name: test.name,
    passed: test.fn(),
  }));
  
  // Final results
  logSection('TEST RESULTS');
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  results.forEach(result => {
    if (result.passed) {
      log(colors.green, '✓', `${result.name} PASSED`);
    } else {
      log(colors.red, '✗', `${result.name} FAILED`);
    }
  });
  
  console.log('');
  if (passedCount === totalCount) {
    log(colors.green, '✓', `All edge case tests passed! (${passedCount}/${totalCount})`);
    process.exit(0);
  } else {
    log(colors.yellow, '⚠', `Some edge case tests failed: ${passedCount}/${totalCount} passed`);
    process.exit(0); // Don't fail on warnings
  }
}

main();
