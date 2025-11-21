# Story 5.1: i18n Framework Integration - Brownfield Enhancement

**Story ID:** Story 5.1
**Epic:** Epic 5 - 多语言支持 (i18n)
**Type:** Brownfield Enhancement
**Priority:** P1
**Estimated Effort:** 4-6 hours
**Status:** Ready for Development

---

## User Story

As a **Focus Flow user**,
I want **the application to support multiple languages with English as the default**,
So that **I can use the app in my preferred language (English or Chinese) and have a better user experience**.

---

## Story Context

### Existing System Integration

- **Integrates with:** React 18 application root ([main.tsx](apps/web/src/main.tsx))
- **Technology:** react-i18next (industry-standard i18n library for React)
- **Follows pattern:** Provider pattern (similar to existing AuthProvider, QueryClientProvider)
- **Touch points:**
  - `apps/web/src/main.tsx` - Wrap app with I18nextProvider
  - `apps/web/src/i18n/` - New i18n configuration directory
  - `apps/web/src/locales/` - New translation files directory
  - `package.json` - Add i18n dependencies

### Current State

- All UI text is hardcoded in Chinese across 10+ pages and 20+ components
- No i18n framework currently exists
- Settings are managed by Zustand store with localStorage persistence ([settingsStore.ts](apps/web/src/stores/settingsStore.ts))
- App entry point: [apps/web/src/main.tsx](apps/web/src/main.tsx)

---

## Acceptance Criteria

### Functional Requirements

1. **i18n framework installed and configured**
   - `react-i18next`, `i18next`, and `i18next-browser-languagedetector` packages installed
   - i18n configuration file created at `apps/web/src/i18n/index.ts`
   - Default language set to English (`fallbackLng: 'en'`)
   - Language detection configured (priority: localStorage > browser language)

2. **Translation file structure created**
   - Directory structure: `apps/web/src/locales/{en,zh}/{module}.json`
   - Initial modules: `common.json` (with app name and basic actions)
   - Example translations demonstrating the pattern (at least 5 keys)

3. **I18nextProvider integrated**
   - App wrapped with I18nextProvider in `main.tsx`
   - i18n instance properly initialized before app render
   - No runtime errors or warnings

### Integration Requirements

4. **Existing app functionality unchanged**
   - All pages and components still render correctly (still showing Chinese text for now)
   - No breaking changes to existing code
   - Dev server starts without errors

5. **Language switching capability verified**
   - `i18n.changeLanguage('en')` and `i18n.changeLanguage('zh')` work in browser console
   - Language preference persists to localStorage (`i18nextLng` key)
   - Console log confirms active language: `i18n.language` returns correct value

6. **Hook usage pattern established**
   - Create example component demonstrating `useTranslation()` hook usage
   - Example file: `apps/web/src/components/i18n/I18nExample.tsx` (for testing only, not used in production)

### Quality Requirements

7. **TypeScript types properly configured**
   - No TypeScript errors in `i18n/index.ts`
   - Translation JSON files validated (proper syntax)
   - Type-safe usage of `useTranslation()` hook

8. **Documentation created**
   - Add README at `apps/web/src/locales/README.md` explaining translation file structure
   - Document how to add new translations (step-by-step guide)
   - Include code examples for using `t()` function

9. **Testing setup completed**
   - Mock `useTranslation` in test setup file
   - Existing tests still pass (with i18n mock)
   - Test command runs without errors: `pnpm --filter web test`

---

## Technical Implementation Details

### 1. Install Dependencies

```bash
cd apps/web
pnpm add react-i18next i18next i18next-browser-languagedetector
```

**Expected versions:**
- react-i18next: ^14.0.0 or higher
- i18next: ^23.0.0 or higher
- i18next-browser-languagedetector: ^7.0.0 or higher

### 2. Create i18n Configuration

**File:** `apps/web/src/i18n/index.ts`

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enCommon from '@/locales/en/common.json'
import zhCommon from '@/locales/zh/common.json'

const resources = {
  en: {
    common: enCommon,
  },
  zh: {
    common: zhCommon,
  },
}

i18n
  .use(LanguageDetector) // Detect language from localStorage or browser
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language is English
    defaultNS: 'common',
    ns: ['common'],

    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already handles XSS protection
    },

    react: {
      useSuspense: false, // Disable suspense for now (can enable later)
    },
  })

export default i18n
```

### 3. Create Translation Files

**File:** `apps/web/src/locales/en/common.json`

```json
{
  "app": {
    "name": "Focus Flow",
    "tagline": "Focus on what matters, one task at a time"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "confirm": "Confirm",
    "close": "Close"
  },
  "navigation": {
    "currentView": "Focus Now",
    "tasks": "All Tasks",
    "dailySummary": "Daily Summary",
    "statistics": "Statistics",
    "settings": "Settings"
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "noData": "No data available"
  }
}
```

**File:** `apps/web/src/locales/zh/common.json`

```json
{
  "app": {
    "name": "Focus Flow",
    "tagline": "专注于重要的事,一次只做一件事"
  },
  "actions": {
    "save": "保存",
    "cancel": "取消",
    "delete": "删除",
    "edit": "编辑",
    "create": "创建",
    "confirm": "确认",
    "close": "关闭"
  },
  "navigation": {
    "currentView": "专注当下",
    "tasks": "所有任务",
    "dailySummary": "每日总结",
    "statistics": "数据统计",
    "settings": "设置"
  },
  "common": {
    "loading": "加载中...",
    "error": "错误",
    "success": "成功",
    "noData": "暂无数据"
  }
}
```

### 4. Integrate I18nextProvider

**File:** `apps/web/src/main.tsx`

**Before:**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

**After:**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </I18nextProvider>
  </React.StrictMode>
)
```

### 5. Create Example Component (for testing)

**File:** `apps/web/src/components/i18n/I18nExample.tsx`

```typescript
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Example component demonstrating i18n usage
 * This is for testing purposes only - not used in production
 */
export function I18nExample() {
  const { t, i18n } = useTranslation('common')

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>{t('app.name')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{t('app.tagline')}</p>

        <div className="space-y-2">
          <p className="text-sm">
            Current language: <strong>{i18n.language}</strong>
          </p>
          <p className="text-sm">
            Translation test: {t('common.loading')}
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={toggleLanguage}>
            Toggle Language
          </Button>
          <Button variant="outline" onClick={() => i18n.changeLanguage('en')}>
            English
          </Button>
          <Button variant="outline" onClick={() => i18n.changeLanguage('zh')}>
            中文
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 6. Update Test Configuration

**File:** `apps/web/src/test/setup.ts` (create if doesn't exist)

```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}))
```

**Update:** `apps/web/vitest.config.ts` (if not already configured)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts', // Add this line
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 7. Create Documentation

**File:** `apps/web/src/locales/README.md`

```markdown
# Translation Files Documentation

## Structure

Translation files are organized by language and module:

\`\`\`
locales/
├── en/                    # English translations
│   ├── common.json       # Common UI text (buttons, navigation, etc.)
│   ├── auth.json         # Authentication pages (login, signup)
│   ├── tasks.json        # Task management pages
│   ├── pomodoro.json     # Pomodoro timer and dialogs
│   ├── settings.json     # Settings page
│   └── errors.json       # Error messages
└── zh/                   # Chinese translations
    └── [same structure]
\`\`\`

## How to Add New Translations

### Step 1: Identify the Module

Determine which module your text belongs to:
- **common**: Navigation, buttons, general UI elements
- **auth**: Login, signup, password reset pages
- **tasks**: Task list, task creation, task details
- **pomodoro**: Pomodoro timer, work/rest dialogs
- **settings**: Settings page options
- **errors**: Error messages and validation

### Step 2: Add Keys to Both Languages

Add the same key to both \`en/{module}.json\` and \`zh/{module}.json\`.

**Example: Adding a new button text**

\`\`\`json
// locales/en/common.json
{
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "archive": "Archive"  // ← New key
  }
}

// locales/zh/common.json
{
  "actions": {
    "save": "保存",
    "cancel": "取消",
    "archive": "归档"  // ← New key
  }
}
\`\`\`

### Step 3: Use in Component

Import the translation hook and use the \`t()\` function:

\`\`\`typescript
import { useTranslation } from 'react-i18next'

export function MyComponent() {
  const { t } = useTranslation('common')

  return (
    <button>{t('actions.archive')}</button>
    // Renders: "Archive" (en) or "归档" (zh)
  )
}
\`\`\`

## Key Naming Conventions

- Use **dot notation** for nested keys: \`tasks.createButton\`
- Use **camelCase** for key names: \`completionRate\`, not \`completion_rate\`
- Be **descriptive**: \`tasks.createButton\` is better than \`btn1\`
- Group related keys: Put all button text under \`actions\`

## Translation Guidelines

### English (Default Language)

- Use natural, conversational English
- Be concise but clear
- Use title case for page titles: "Daily Summary"
- Use sentence case for buttons: "Create task"

### Chinese

- Maintain consistency with the original Chinese UI text
- Use 简体中文 (Simplified Chinese)
- Keep translations concise (Chinese is often shorter than English)

## Testing Translations

Test your translations by switching languages:

\`\`\`typescript
// In browser console
i18n.changeLanguage('en')  // Switch to English
i18n.changeLanguage('zh')  // Switch to Chinese
\`\`\`

Or use the language switcher in Settings page (once implemented in Story 5.3).
\`\`\`

---

## Testing Strategy

### Manual Testing

1. **Install and run dev server:**
   ```bash
   pnpm install
   pnpm dev
   ```

2. **Verify no errors in console**
   - Check browser console for errors or warnings
   - Confirm i18n initialization message (if added)

3. **Test language switching in browser console:**
   ```javascript
   // Should return 'en' by default
   console.log(i18n.language)

   // Switch to Chinese
   i18n.changeLanguage('zh')

   // Switch back to English
   i18n.changeLanguage('en')

   // Check localStorage
   localStorage.getItem('i18nextLng') // Should return 'en' or 'zh'
   ```

4. **Verify example component:**
   - Temporarily add `<I18nExample />` to a page
   - Click "Toggle Language" button
   - Confirm text changes between English and Chinese
   - Remove `<I18nExample />` after testing

### Automated Testing

1. **Run existing tests:**
   ```bash
   pnpm --filter web test
   ```
   - All existing tests should pass with i18n mock
   - No new test failures

2. **Type checking:**
   ```bash
   pnpm --filter web type-check
   ```
   - No TypeScript errors

3. **Build verification:**
   ```bash
   pnpm --filter web build
   ```
   - Build completes successfully
   - No build warnings related to i18n

---

## Technical Notes

### Integration Approach

- **Non-invasive:** i18n framework is added without modifying existing components (yet)
- **Progressive enhancement:** Story 5.2 and 5.3 will replace hardcoded text with `t()` calls
- **Provider pattern:** Follows existing pattern used by AuthProvider, QueryClientProvider

### Existing Pattern Reference

Similar provider integration in [main.tsx](apps/web/src/main.tsx):
- App is already wrapped with multiple providers
- I18nextProvider is added to the provider chain
- Order matters: I18nextProvider should wrap App but be inside React.StrictMode

### Key Constraints

- **Default language must be English** (as per Epic 5 requirement)
- **Must support Chinese** (current UI language)
- **Language preference persists** to localStorage
- **No breaking changes** to existing functionality
- **TypeScript strict mode** must be satisfied

### Dependencies Added

```json
{
  "dependencies": {
    "react-i18next": "^14.0.0",
    "i18next": "^23.0.0",
    "i18next-browser-languagedetector": "^7.0.0"
  }
}
```

---

## Risk Mitigation

### Primary Risk

**i18n configuration errors cause app to fail to load**

**Mitigation:**
1. Test dev server immediately after integration
2. Add error boundaries around I18nextProvider if needed
3. Use `react.useSuspense: false` to avoid suspense issues
4. Verify i18n.init() completes before app render

**Rollback:**
- Remove I18nextProvider from main.tsx
- Remove i18n import
- Uninstall packages: `pnpm remove react-i18next i18next i18next-browser-languagedetector`

### Secondary Risk

**Test failures due to useTranslation hook not being mocked**

**Mitigation:**
1. Add comprehensive mock in test setup file
2. Mock returns simple identity function: `t: (key) => key`
3. Test mock locally before committing
4. Update any tests that rely on specific UI text

**Rollback:**
- Remove test setup mock
- Tests will continue working with original hardcoded text

---

## Definition of Done

- [x] Dependencies installed (`react-i18next`, `i18next`, `i18next-browser-languagedetector`)
- [x] i18n configuration file created at `apps/web/src/i18n/index.ts`
- [x] Translation file structure created (`locales/en/common.json`, `locales/zh/common.json`)
- [x] I18nextProvider integrated in `main.tsx`
- [x] Example component created demonstrating usage
- [x] Test setup configured with i18n mock
- [x] Documentation created (`locales/README.md`)
- [x] Dev server runs without errors
- [x] Language switching works in browser console
- [x] All existing tests pass
- [x] TypeScript type-check passes
- [x] Build completes successfully

---

## Related Stories

- **Story 5.2:** Core Pages Internationalization (uses this framework)
- **Story 5.3:** UI Components and Language Switcher (uses this framework)

---

## References

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Epic 5: 多语言支持](../epics/epic-5-i18n-support.md)
- [Current SettingsStore](apps/web/src/stores/settingsStore.ts) (for future locale state integration in Story 5.3)
