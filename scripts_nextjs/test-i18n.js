#!/usr/bin/env node

/**
 * i18n Testing Script - v1.4.0
 * Tests translation completeness, key consistency, and structure
 */

const fs = require('fs');
const path = require('path');

const TRANSLATIONS_DIR = path.join(__dirname, '../lib/i18n/translations');
const LOCALES = ['pt-BR', 'en', 'es'];

// Colors for console output
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

// Load all translation files
function loadTranslations() {
  const translations = {};
  
  for (const locale of LOCALES) {
    const filePath = path.join(TRANSLATIONS_DIR, `${locale}.json`);
    try {
      translations[locale] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      log(colors.green, '✓', `Loaded ${locale}.json`);
    } catch (error) {
      log(colors.red, '✗', `Failed to load ${locale}.json: ${error.message}`);
      process.exit(1);
    }
  }
  
  // Load API errors
  try {
    const apiErrorsPath = path.join(TRANSLATIONS_DIR, 'api-errors.json');
    translations.apiErrors = JSON.parse(fs.readFileSync(apiErrorsPath, 'utf8'));
    log(colors.green, '✓', 'Loaded api-errors.json');
  } catch (error) {
    log(colors.yellow, '⚠', `Failed to load api-errors.json: ${error.message}`);
  }
  
  return translations;
}

// Get all keys from nested object
function getAllKeys(obj, prefix = '') {
  let keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

// Count total keys in object
function countKeys(obj) {
  let count = 0;
  
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      count += countKeys(value);
    } else {
      count++;
    }
  }
  
  return count;
}

// Test 1: File existence
function testFileExistence() {
  logSection('TEST 1: File Existence');
  
  let passed = true;
  for (const locale of LOCALES) {
    const filePath = path.join(TRANSLATIONS_DIR, `${locale}.json`);
    if (fs.existsSync(filePath)) {
      log(colors.green, '✓', `${locale}.json exists`);
    } else {
      log(colors.red, '✗', `${locale}.json NOT FOUND`);
      passed = false;
    }
  }
  
  return passed;
}

// Test 2: Key consistency across languages
function testKeyConsistency(translations) {
  logSection('TEST 2: Key Consistency Across Languages');
  
  const baseKeys = getAllKeys(translations['pt-BR']);
  const enKeys = getAllKeys(translations['en']);
  const esKeys = getAllKeys(translations['es']);
  
  log(colors.blue, 'ℹ', `pt-BR: ${baseKeys.length} keys`);
  log(colors.blue, 'ℹ', `en: ${enKeys.length} keys`);
  log(colors.blue, 'ℹ', `es: ${esKeys.length} keys`);
  
  let passed = true;
  
  // Check if all locales have the same keys
  const enMissing = baseKeys.filter(key => !enKeys.includes(key));
  const esMissing = baseKeys.filter(key => !esKeys.includes(key));
  
  if (enMissing.length > 0) {
    log(colors.red, '✗', `English missing ${enMissing.length} keys:`);
    enMissing.slice(0, 5).forEach(key => console.log(`   - ${key}`));
    if (enMissing.length > 5) console.log(`   ... and ${enMissing.length - 5} more`);
    passed = false;
  } else {
    log(colors.green, '✓', 'English has all keys');
  }
  
  if (esMissing.length > 0) {
    log(colors.red, '✗', `Spanish missing ${esMissing.length} keys:`);
    esMissing.slice(0, 5).forEach(key => console.log(`   - ${key}`));
    if (esMissing.length > 5) console.log(`   ... and ${esMissing.length - 5} more`);
    passed = false;
  } else {
    log(colors.green, '✓', 'Spanish has all keys');
  }
  
  return passed;
}

// Test 3: Empty translations
function testEmptyTranslations(translations) {
  logSection('TEST 3: Empty Translations');
  
  let passed = true;
  
  for (const locale of LOCALES) {
    const keys = getAllKeys(translations[locale]);
    const emptyKeys = [];
    
    for (const key of keys) {
      const parts = key.split('.');
      let value = translations[locale];
      for (const part of parts) {
        value = value[part];
      }
      
      if (!value || value.trim() === '') {
        emptyKeys.push(key);
      }
    }
    
    if (emptyKeys.length > 0) {
      log(colors.yellow, '⚠', `${locale}: ${emptyKeys.length} empty translations found`);
      emptyKeys.slice(0, 3).forEach(key => console.log(`   - ${key}`));
      if (emptyKeys.length > 3) console.log(`   ... and ${emptyKeys.length - 3} more`);
      passed = false;
    } else {
      log(colors.green, '✓', `${locale}: No empty translations`);
    }
  }
  
  return passed;
}

// Test 4: Structure validation
function testStructure(translations) {
  logSection('TEST 4: Structure Validation');
  
  const requiredSections = [
    'common',
    'auth',
    'onboarding',
    'dashboard',
    'plan',
    'perfil',
    'header',
    'footer',
    'errors',
  ];
  
  let passed = true;
  
  for (const locale of LOCALES) {
    const missingSections = requiredSections.filter(
      section => !translations[locale][section]
    );
    
    if (missingSections.length > 0) {
      log(colors.red, '✗', `${locale}: Missing sections: ${missingSections.join(', ')}`);
      passed = false;
    } else {
      log(colors.green, '✓', `${locale}: All required sections present`);
    }
  }
  
  return passed;
}

// Test 5: API errors validation
function testApiErrors(translations) {
  logSection('TEST 5: API Errors Validation');
  
  if (!translations.apiErrors) {
    log(colors.yellow, '⚠', 'api-errors.json not loaded, skipping...');
    return true;
  }
  
  let passed = true;
  
  for (const locale of LOCALES) {
    if (!translations.apiErrors[locale]) {
      log(colors.red, '✗', `${locale}: Not found in api-errors.json`);
      passed = false;
      continue;
    }
    
    const errorCount = countKeys(translations.apiErrors[locale].api?.errors || {});
    const successCount = countKeys(translations.apiErrors[locale].api?.success || {});
    
    if (errorCount === 0 && successCount === 0) {
      log(colors.red, '✗', `${locale}: No API messages found`);
      passed = false;
    } else {
      log(colors.green, '✓', `${locale}: ${errorCount} errors + ${successCount} success messages`);
    }
  }
  
  return passed;
}

// Summary
function printSummary(translations) {
  logSection('SUMMARY');
  
  console.log('Translation Files:');
  for (const locale of LOCALES) {
    const keyCount = getAllKeys(translations[locale]).length;
    const sections = Object.keys(translations[locale]).length;
    console.log(`  ${locale}:`);
    console.log(`    - ${sections} sections`);
    console.log(`    - ${keyCount} total keys`);
  }
  
  if (translations.apiErrors) {
    console.log('\nAPI Errors:');
    for (const locale of LOCALES) {
      const errorCount = countKeys(translations.apiErrors[locale]?.api?.errors || {});
      const successCount = countKeys(translations.apiErrors[locale]?.api?.success || {});
      console.log(`  ${locale}: ${errorCount} errors + ${successCount} success = ${errorCount + successCount} messages`);
    }
  }
  
  console.log('');
}

// Main test runner
function main() {
  console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║           i18n Testing Suite - v1.4.0                      ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  const translations = loadTranslations();
  
  const tests = [
    { name: 'File Existence', fn: testFileExistence },
    { name: 'Key Consistency', fn: () => testKeyConsistency(translations) },
    { name: 'Empty Translations', fn: () => testEmptyTranslations(translations) },
    { name: 'Structure Validation', fn: () => testStructure(translations) },
    { name: 'API Errors', fn: () => testApiErrors(translations) },
  ];
  
  const results = tests.map(test => ({
    name: test.name,
    passed: test.fn(),
  }));
  
  printSummary(translations);
  
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
    log(colors.green, '✓', `All tests passed! (${passedCount}/${totalCount})`);
    process.exit(0);
  } else {
    log(colors.red, '✗', `Some tests failed: ${passedCount}/${totalCount} passed`);
    process.exit(1);
  }
}

main();
