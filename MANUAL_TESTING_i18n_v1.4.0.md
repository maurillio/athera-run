# 🧪 Manual Testing Checklist - i18n v1.4.0

**Date:** 04/November/2025  
**Version:** 1.4.0  
**Feature:** Multi-language support (pt-BR, en, es)

---

## ✅ Automated Tests Status

### 1. Translation Tests
- ✅ File existence (all 3 languages)
- ✅ Key consistency across languages (499 keys each)
- ✅ No empty translations
- ✅ Structure validation (13 sections each)
- ✅ API errors validation (28 messages × 3 languages)

### 2. Edge Cases Tests
- ✅ Config validation
- ✅ Middleware validation
- ✅ Hooks validation
- ✅ API utils validation
- ✅ API route validation
- ✅ LanguageSwitcher component
- ✅ Prisma schema (User.locale field)
- ✅ Database migration

**Result:** 13/13 automated tests passing ✅

---

## 📋 Manual Testing Checklist

### A. Language Switcher Functionality

#### A1. Cookie Persistence (Logged Out)
- [ ] Open site in incognito/private window
- [ ] Navigate to `/pt-BR/login`
- [ ] Click language switcher → Select English
- [ ] Verify URL changes to `/en/login`
- [ ] Verify cookie `atherarun_locale=en` is set (check DevTools)
- [ ] Refresh page → Verify language persists (still English)
- [ ] Close browser → Open again → Navigate to site
- [ ] Verify language persists (should be English from cookie)

**Expected:** Language persists via cookie even when logged out

#### A2. Database Persistence (Logged In)
- [ ] Login to atherarun.com
- [ ] Go to Dashboard
- [ ] Click language switcher → Select Spanish
- [ ] Verify URL changes to `/es/dashboard`
- [ ] Check DevTools Network tab → Verify POST to `/api/user/locale`
- [ ] Verify response: `{ "success": true, "locale": "es" }`
- [ ] Logout
- [ ] Login again
- [ ] Verify language is still Spanish (loaded from database)

**Expected:** Language preference saved to database and persists across sessions

#### A3. All Three Languages
- [ ] Test pt-BR (Portuguese - Brazil)
- [ ] Test en (English)
- [ ] Test es (Spanish)
- [ ] Verify flag icons display correctly for each
- [ ] Verify language names display correctly

---

### B. Page-by-Page Language Testing

#### B1. Login Page (`/[locale]/login`)
- [ ] Test in pt-BR: "Entrar", "Email", "Senha", "Esqueceu a senha?"
- [ ] Test in en: "Login", "Email", "Password", "Forgot password?"
- [ ] Test in es: "Iniciar sesión", "Email", "Contraseña", "¿Olvidaste la contraseña?"
- [ ] Verify error messages appear in correct language
- [ ] Verify "Continuar com Google" / "Continue with Google" / "Continuar con Google"

**Expected:** All text translated, including buttons, labels, errors

#### B2. Signup Page (`/[locale]/signup`)
- [ ] Test in pt-BR: "Cadastrar", "Nome completo", etc.
- [ ] Test in en: "Sign Up", "Full name", etc.
- [ ] Test in es: "Registrarse", "Nombre completo", etc.
- [ ] Verify form validation messages in correct language
- [ ] Verify success message after signup in correct language

**Expected:** Complete signup flow works in all 3 languages

#### B3. Onboarding (`/[locale]/onboarding`)

**Main Page:**
- [ ] Test progress bar labels (pt-BR, en, es)
- [ ] Test "Passo X de 7" / "Step X of 7" / "Paso X de 7"
- [ ] Test navigation buttons

**Step 1 - Basic Data:**
- [ ] Test age, gender, weight, height labels
- [ ] Test physiological data section
- [ ] Verify all dropdown options translated

**Step 2 - Sport Background:**
- [ ] Test running experience labels
- [ ] Test "Nunca corri" / "Never ran" / "Nunca he corrido"
- [ ] Test other sports checkboxes

**Step 3 - Performance:**
- [ ] Test race distance labels (5K, 10K, 21K, 42K)
- [ ] Test time input labels
- [ ] Verify VDOT calculation works

**Step 4 - Health:**
- [ ] Test injury history labels
- [ ] Test recovery status options
- [ ] Test medical conditions checkboxes

**Step 5 - Goals:**
- [ ] Test primary/secondary goal dropdowns
- [ ] Test motivations checkboxes
- [ ] Verify all goal options translated

**Step 6 - Availability:**
- [ ] Test days per week selector
- [ ] Test activity preferences
- [ ] Test infrastructure checkboxes

**Step 7 - Review:**
- [ ] Test summary section labels
- [ ] Test "Gerar Plano" / "Generate Plan" / "Generar Plan" button
- [ ] Verify confirmation dialog in correct language

**Expected:** Complete onboarding works smoothly in all 3 languages

#### B4. Dashboard (`/[locale]/dashboard`)
- [ ] Test welcome message with user name
- [ ] Test "Próximo Treino" / "Next Workout" / "Próximo Entrenamiento"
- [ ] Test quick stats cards (all 4)
- [ ] Test "Treinos de Hoje" / "Today's Workouts" / "Entrenamientos de Hoy"
- [ ] Test "Treinos de Amanhã" / "Tomorrow's Workouts" / "Entrenamientos de Mañana"
- [ ] Test quick access menu (6 items)
- [ ] Test "Gerar Novo Plano" card for new users

**Expected:** Dashboard fully functional in all languages

#### B5. Plano (`/[locale]/plano`)
- [ ] Test summary cards (Meta, Semana, Progresso, Duração)
- [ ] Test week navigation (◀ Semana Anterior / ◀ Previous Week)
- [ ] Test workout cards with status indicators
- [ ] Test "Completar Treino" / "Complete Workout" / "Completar Entrenamiento"
- [ ] Test "Foco da Semana" section
- [ ] Test quick actions menu

**Expected:** Training plan displays correctly in all languages

#### B6. Perfil (`/[locale]/perfil`)
- [ ] Test 4 tabs: Perfil, Dados Médicos, Provas, Ações
- [ ] Test profile fields (all editable)
- [ ] Test "Regenerar Plano" / "Regenerate Plan" button
- [ ] Test "Excluir Perfil" / "Delete Profile" button
- [ ] Verify confirmation dialogs in correct language
- [ ] Test toast notifications in correct language

**Expected:** Profile page works in all languages with proper confirmations

---

### C. Global Components

#### C1. Header / UserDropdown
- [ ] Test "Entrar" / "Login" / "Iniciar sesión" button (logged out)
- [ ] Test "Cadastrar" / "Sign Up" / "Registrarse" button (logged out)
- [ ] Test user menu items (logged in):
  - [ ] "Editar Perfil" / "Edit Profile" / "Editar Perfil"
  - [ ] "Painel Admin" / "Admin Panel" / "Panel de Administración"
  - [ ] "Fazer Upgrade" / "Upgrade" / "Actualizar"
  - [ ] "Sair" / "Logout" / "Cerrar sesión"

**Expected:** Header adapts to language, all menu items translated

#### C2. PaywallModal
- [ ] Trigger paywall (try premium feature)
- [ ] Verify "Recurso Premium" / "Premium Feature" / "Función Premium"
- [ ] Verify benefits list translated (6 items)
- [ ] Test "Ver Planos Premium" / "View Premium Plans" button
- [ ] Test "Talvez mais tarde" / "Maybe later" button

**Expected:** Paywall modal fully translated

#### C3. Error Pages
- [ ] Navigate to `/pt-BR/non-existent-page` → Verify 404 in Portuguese
- [ ] Navigate to `/en/non-existent-page` → Verify 404 in English
- [ ] Navigate to `/es/non-existent-page` → Verify 404 in Spanish
- [ ] Verify "Página não encontrada" / "Page not found" / "Página no encontrada"
- [ ] Test "Voltar para Home" / "Go to Home" button

**Expected:** 404 page shows in correct language based on URL

---

### D. API Error Messages

#### D1. Authentication Errors
- [ ] Try logging in with wrong password
- [ ] Verify error: "Email ou senha inválidos" / "Invalid credentials" / "Credenciales inválidas"
- [ ] Try accessing protected route without login
- [ ] Verify error: "Não autorizado" / "Unauthorized" / "No autorizado"

#### D2. Validation Errors
- [ ] Submit form with invalid data
- [ ] Verify validation messages in correct language
- [ ] Try updating profile with invalid email
- [ ] Verify error message translated

#### D3. Success Messages
- [ ] Update profile successfully
- [ ] Verify: "Perfil atualizado com sucesso" / "Profile updated successfully" / "Perfil actualizado exitosamente"
- [ ] Complete a workout
- [ ] Verify success message in correct language

**Expected:** All API responses (errors + success) in correct language

---

### E. Edge Cases & Fallbacks

#### E1. Invalid Locale in URL
- [ ] Navigate to `/invalid-locale/dashboard`
- [ ] Verify redirect to `/pt-BR/dashboard` (default)
- [ ] Verify no errors in console

**Expected:** Graceful fallback to default locale

#### E2. Missing Translation Key
- [ ] Check console for "Missing translation" warnings
- [ ] If found, verify fallback to pt-BR value
- [ ] Verify app doesn't crash

**Expected:** Fallback to Portuguese (default), no crashes

#### E3. Cookie Manipulation
- [ ] Set invalid cookie: `atherarun_locale=invalid`
- [ ] Refresh page
- [ ] Verify fallback to browser language or pt-BR
- [ ] Verify app still works

**Expected:** Robust handling of invalid cookie values

#### E4. Concurrent Language Changes
- [ ] Open site in 2 tabs
- [ ] Change language to English in Tab 1
- [ ] Change language to Spanish in Tab 2
- [ ] Verify last change wins (Spanish)
- [ ] Verify both tabs eventually sync

**Expected:** Last write wins, no conflicts

#### E5. API Failure
- [ ] Change language (triggers API call)
- [ ] Simulate network failure (DevTools → Offline)
- [ ] Verify language still changes (via cookie)
- [ ] Verify no visible error to user
- [ ] Check console for error log

**Expected:** Graceful degradation, cookie still works

---

### F. Performance & UX

#### F1. Language Switching Speed
- [ ] Click language switcher
- [ ] Measure time to new page load
- [ ] Should be < 500ms for good UX

**Expected:** Fast language switching (< 500ms)

#### F2. No Layout Shift
- [ ] Switch between languages
- [ ] Verify no significant layout shifts
- [ ] Verify buttons don't overflow
- [ ] Verify text doesn't wrap unexpectedly

**Expected:** Stable layout across all languages

#### F3. Text Overflow
- [ ] Test long Spanish words (tend to be longer)
- [ ] Verify buttons don't cut off text
- [ ] Verify cards don't overflow
- [ ] Test on mobile viewport (320px width)

**Expected:** All text fits properly, responsive

---

## 🔍 Database Verification

### Check User Locale in Database
```sql
-- After changing language, verify in DB
SELECT id, email, locale FROM users WHERE email = 'test@example.com';
-- Expected: locale = 'en' or 'es' (depending on test)
```

### Check Migration Applied
```sql
-- Verify locale column exists
\d users
-- Should show: locale | character varying | default 'pt-BR'
```

---

## 🌐 Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Samsung Internet

**Expected:** Works consistently across all browsers

---

## 📱 Responsive Testing

### Viewports
- [ ] Mobile (320px - 375px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1280px+)
- [ ] Large Desktop (1920px+)

### Tests
- [ ] Language switcher accessible on all sizes
- [ ] Text doesn't overflow on mobile
- [ ] Forms work properly on mobile
- [ ] Navigation works on all sizes

**Expected:** Fully responsive in all 3 languages

---

## 🎨 Visual Polish

### Typography
- [ ] Headings properly sized in all languages
- [ ] Body text readable (14px+)
- [ ] Line height appropriate
- [ ] No font rendering issues

### Spacing
- [ ] Consistent padding/margins
- [ ] Cards aligned properly
- [ ] Buttons properly sized
- [ ] White space balanced

### Colors
- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] Interactive elements have hover states
- [ ] Active language highlighted in switcher
- [ ] Error messages in red, success in green

**Expected:** Professional, polished UI in all languages

---

## 📊 Testing Summary

### Automated Tests: ✅ 13/13 PASSED
- Translation completeness: ✅
- Key consistency: ✅
- Structure validation: ✅
- Edge cases: ✅

### Manual Tests: To Be Completed
- [ ] Language switcher (3 tests)
- [ ] Page-by-page (6 pages × 3 languages = 18 tests)
- [ ] Global components (3 tests)
- [ ] API messages (3 tests)
- [ ] Edge cases (5 tests)
- [ ] Performance (3 tests)
- [ ] Cross-browser (7 browsers)
- [ ] Responsive (4 viewports)
- [ ] Visual polish (3 categories)

**Total Manual Tests:** ~45 test scenarios

---

## 🚀 Production Readiness Checklist

Before deploying v1.4.0 to production:

- [ ] All automated tests passing ✅
- [ ] Manual testing completed (45 scenarios)
- [ ] Database migration ready
- [ ] Build passes without errors ✅
- [ ] No TypeScript errors ✅
- [ ] No console errors in any language
- [ ] Translation quality reviewed by native speakers
- [ ] Performance benchmarks met
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness verified
- [ ] Accessibility (WCAG AA) verified
- [ ] Rollback plan prepared
- [ ] Documentation updated ✅

---

## 📝 Notes

### Known Issues
- None found in automated testing ✅

### Future Improvements
- Add more languages (French, German, Italian)
- Add RTL support (Arabic, Hebrew)
- Locale-specific date/time formatting
- Locale-specific number formatting (1.000 vs 1,000)
- Currency formatting per locale

### Testing Tools Used
- Custom Node.js test scripts
- Chrome DevTools
- PostgreSQL CLI
- Manual testing across browsers

---

**Tester:** AI Assistant  
**Date:** 04/November/2025  
**Status:** Automated Tests Complete ✅ | Manual Tests Pending  
**Version:** v1.4.0 - i18n Multi-language Support
