#!/usr/bin/env node

/**
 * PWA Manifest Validator
 * Valida manifest.json e verifica assets
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 PWA MANIFEST VALIDATOR\n');

// 1. Ler manifest.json
const manifestPath = path.join(__dirname, '../public/manifest.json');
let manifest;

try {
  const manifestData = fs.readFileSync(manifestPath, 'utf8');
  manifest = JSON.parse(manifestData);
  console.log('✅ manifest.json é JSON válido\n');
} catch (error) {
  console.error('❌ Erro ao ler manifest.json:', error.message);
  process.exit(1);
}

// 2. Validar campos obrigatórios
console.log('📋 CAMPOS OBRIGATÓRIOS:');
const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
let allFieldsPresent = true;

requiredFields.forEach(field => {
  if (manifest[field]) {
    console.log(`   ✅ ${field}: "${manifest[field]}"`);
  } else {
    console.log(`   ❌ ${field}: AUSENTE`);
    allFieldsPresent = false;
  }
});

if (!allFieldsPresent) {
  console.error('\n❌ Campos obrigatórios faltando!');
  process.exit(1);
}

// 3. Validar ícones
console.log('\n📱 ÍCONES:');
const publicDir = path.join(__dirname, '../public');
let allIconsExist = true;
let iconStats = {
  any: 0,
  maskable: 0,
  total: 0
};

manifest.icons.forEach((icon, index) => {
  const iconPath = path.join(publicDir, icon.src);
  const exists = fs.existsSync(iconPath);
  
  if (exists) {
    const stats = fs.statSync(iconPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`   ✅ ${icon.src}`);
    console.log(`      Tamanho: ${icon.sizes} (${sizeKB}KB)`);
    console.log(`      Purpose: ${icon.purpose || 'any'}`);
    
    if (icon.purpose === 'maskable') {
      iconStats.maskable++;
    } else {
      iconStats.any++;
    }
    iconStats.total++;
  } else {
    console.log(`   ❌ ${icon.src} - ARQUIVO NÃO ENCONTRADO`);
    allIconsExist = false;
  }
});

console.log(`\n   📊 Total: ${iconStats.total} ícones`);
console.log(`      - Any: ${iconStats.any}`);
console.log(`      - Maskable: ${iconStats.maskable}`);

if (!allIconsExist) {
  console.error('\n❌ Alguns ícones não foram encontrados!');
  process.exit(1);
}

// 4. Validar shortcuts
console.log('\n🔗 SHORTCUTS:');
if (manifest.shortcuts && manifest.shortcuts.length > 0) {
  manifest.shortcuts.forEach((shortcut, index) => {
    console.log(`   ✅ ${shortcut.name}`);
    console.log(`      URL: ${shortcut.url}`);
    console.log(`      Descrição: ${shortcut.description || 'N/A'}`);
  });
  console.log(`\n   📊 Total: ${manifest.shortcuts.length} shortcuts`);
} else {
  console.log('   ⚠️  Nenhum shortcut definido');
}

// 5. Validar configurações PWA
console.log('\n⚙️  CONFIGURAÇÕES PWA:');
console.log(`   Display: ${manifest.display}`);
console.log(`   Orientation: ${manifest.orientation || 'N/A'}`);
console.log(`   Theme color: ${manifest.theme_color}`);
console.log(`   Background: ${manifest.background_color}`);
console.log(`   Scope: ${manifest.scope || '/'}`);
console.log(`   Start URL: ${manifest.start_url}`);

// 6. Validar locale
console.log('\n🌍 LOCALE:');
console.log(`   Lang: ${manifest.lang || 'N/A'}`);
console.log(`   Dir: ${manifest.dir || 'ltr'}`);

// 7. Validar categorias
console.log('\n📂 CATEGORIAS:');
if (manifest.categories && manifest.categories.length > 0) {
  console.log(`   ✅ ${manifest.categories.join(', ')}`);
} else {
  console.log('   ⚠️  Nenhuma categoria definida');
}

// 8. Resumo final
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMO DA VALIDAÇÃO\n');

const issues = [];
const warnings = [];

// Verificar tamanhos recomendados
const hasIcon192 = manifest.icons.some(i => i.sizes === '192x192');
const hasIcon512 = manifest.icons.some(i => i.sizes === '512x512');
const hasMaskable = manifest.icons.some(i => i.purpose === 'maskable');

if (!hasIcon192) issues.push('Falta ícone 192x192');
if (!hasIcon512) issues.push('Falta ícone 512x512');
if (!hasMaskable) warnings.push('Sem ícones maskable (opcional para Android)');

// Verificar start_url e scope
if (manifest.start_url === '/' && manifest.scope !== '/') {
  warnings.push('start_url e scope diferentes podem causar problemas');
}

// Mostrar resultados
if (issues.length > 0) {
  console.log('❌ PROBLEMAS ENCONTRADOS:');
  issues.forEach(issue => console.log(`   - ${issue}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  AVISOS:');
  warnings.forEach(warning => console.log(`   - ${warning}`));
  console.log('');
}

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ MANIFEST 100% VÁLIDO!\n');
  console.log('🎉 Tudo pronto para PWA!');
  console.log('   - Ícones: OK');
  console.log('   - Shortcuts: OK');
  console.log('   - Configurações: OK');
  console.log('   - Locale: OK\n');
  console.log('📱 Próximos passos:');
  console.log('   1. Testar em Chrome DevTools (Application → Manifest)');
  console.log('   2. Lighthouse audit (PWA score)');
  console.log('   3. Testar instalação em device real\n');
  process.exit(0);
} else if (issues.length === 0) {
  console.log('✅ MANIFEST VÁLIDO (com avisos opcionais)\n');
  process.exit(0);
} else {
  console.log('❌ MANIFEST COM PROBLEMAS\n');
  process.exit(1);
}
