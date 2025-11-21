# Story 5.3: UI Components and Language Switcher - Brownfield Enhancement

**Story ID:** Story 5.3
**Epic:** Epic 5 - 多语言支持 (i18n)
**Type:** Brownfield Enhancement
**Priority:** P1
**Estimated Effort:** 6-8 hours
**Status:** Ready for Development
**Dependencies:** Story 5.1 (i18n Framework), Story 5.2 (Core Pages i18n)

---

## User Story

As a **Focus Flow user**,
I want **UI components (timer, dialogs, navigation) to display in my chosen language and have a language switcher in Settings**,
So that **I can switch between English and Chinese and have a fully internationalized experience across all parts of the app**.

---

## Story Context

### Existing System Integration

- **Integrates with:** UI components (PomodoroTimer, WorkCompleteDialog, RestCompleteDialog, Sidebar, Header, FocusTaskCard) and SettingsPage
- **Technology:** react-i18next `useTranslation()` hook + SettingsStore
- **Follows pattern:** Replace hardcoded strings + add language picker in Settings
- **Touch points:**
  - UI components in `apps/web/src/components/`
  - SettingsPage for language switcher
  - settingsStore for persisting language preference
  - Translation files: `locales/{en,zh}/pomodoro.json`, `common.json`

### Current State

- i18n framework integrated (Story 5.1)
- Core pages internationalized (Story 5.2)
- UI components still have hardcoded Chinese text
- SettingsPage exists but has no language selector
- settingsStore manages other settings but not language

---

## Acceptance Criteria

### Functional Requirements

1. **Pomodoro components internationalized**
   - PomodoroTimer: All text (status labels, buttons, time display) uses `t()` function
   - WorkCompleteDialog: Dialog title, description, buttons use `t()` function
   - RestCompleteDialog: Dialog title, description, buttons use `t()` function
   - Translation keys in `locales/{en,zh}/pomodoro.json`

2. **Navigation components internationalized**
   - Sidebar: Navigation item titles and descriptions use `t()` function (use `common.navigation.*`)
   - Header: User menu items use `t()` function (use `common.actions.*`)
   - App logo/branding remains "Focus Flow" in both languages

3. **Task components internationalized**
   - FocusTaskCard: Labels and buttons use `t()` function
   - CreateTaskDialog: Already handled in Story 5.2 (verify working)
   - EditTaskDialog: Already handled in Story 5.2 (verify working)

4. **Language switcher added to SettingsPage**
   - New section: "语言 / Language" in SettingsPage
   - Select component with options: "English", "中文"
   - Current language displayed correctly
   - Changing language updates UI immediately (no page refresh)

5. **Language preference persists**
   - Language selection saved to localStorage (`i18nextLng` key)
   - Language persists across sessions (page refresh maintains language)
   - settingsStore optionally tracks current locale (for convenience)

### Integration Requirements

6. **Existing functionality unchanged**
   - Pomodoro timer functionality works identically
   - Navigation and dialogs work correctly
   - Settings page other sections unaffected

7. **Language switching works correctly**
   - Switching language in Settings updates all UI components
   - Navigation, dialogs, timer all update immediately
   - No console errors or warnings

8. **Consistent translations**
   - Terminology consistent across all components
   - Navigation items match Sidebar and Header
   - Common actions (save, cancel, delete) use shared translations

### Quality Requirements

9. **Translation quality**
   - English translations natural and clear
   - Chinese translations match original UI text
   - No missing translations or displayed keys

10. **Testing coverage**
    - Component tests updated with i18n mocks
    - Tests pass for both languages
    - Manual testing checklist completed

11. **Code quality**
    - No TypeScript errors
    - No console warnings
    - Code follows existing patterns

---

## Technical Implementation Details

### 1. Pomodoro Translations (`pomodoro.json`)

**File:** `apps/web/src/locales/en/pomodoro.json`

```json
{
  "timer": {
    "idle": "Ready to focus?",
    "working": "Working",
    "paused": "Paused",
    "resting": "Take a rest",
    "timeRemaining": "Time Remaining",
    "startWork": "Start Work",
    "startRest": "Start Rest",
    "pause": "Pause",
    "resume": "Resume",
    "cancel": "Cancel",
    "minutes": "{{count}} min",
    "seconds": "{{count}} sec"
  },
  "workComplete": {
    "title": "Work Session Complete!",
    "description": "Great job! You've completed a focused work session.",
    "takeBreak": "Take a Break",
    "continueWorking": "Continue Working",
    "nextTask": "Next Task"
  },
  "restComplete": {
    "title": "Rest Complete!",
    "description": "Break time is over. Ready to continue working?",
    "startWork": "Start Working",
    "skipWork": "Skip for Now"
  },
  "session": {
    "workSession": "Work Session",
    "restSession": "Rest Session",
    "completed": "Completed",
    "interrupted": "Interrupted"
  }
}
```

**File:** `apps/web/src/locales/zh/pomodoro.json`

```json
{
  "timer": {
    "idle": "准备开始专注？",
    "working": "工作中",
    "paused": "已暂停",
    "resting": "休息一下",
    "timeRemaining": "剩余时间",
    "startWork": "开始工作",
    "startRest": "开始休息",
    "pause": "暂停",
    "resume": "继续",
    "cancel": "取消",
    "minutes": "{{count}} 分",
    "seconds": "{{count}} 秒"
  },
  "workComplete": {
    "title": "工作时段完成！",
    "description": "做得好！您已完成一个专注工作时段。",
    "takeBreak": "休息一下",
    "continueWorking": "继续工作",
    "nextTask": "下一任务"
  },
  "restComplete": {
    "title": "休息完成！",
    "description": "休息时间结束。准备继续工作了吗？",
    "startWork": "开始工作",
    "skipWork": "稍后再说"
  },
  "session": {
    "workSession": "工作时段",
    "restSession": "休息时段",
    "completed": "已完成",
    "interrupted": "已中断"
  }
}
```

### 2. Update Pomodoro Components

**File:** `apps/web/src/components/pomodoro/PomodoroTimer.tsx`

Add at the top of the component:

```typescript
import { useTranslation } from 'react-i18next'

export function PomodoroTimer({...props}) {
  const { t } = useTranslation('pomodoro')
  // ... rest of code

  // Replace hardcoded strings:
  // "工作中" → t('timer.working')
  // "休息一下" → t('timer.resting')
  // "开始工作" → t('timer.startWork')
  // "暂停" → t('timer.pause')
  // "继续" → t('timer.resume')
  // "取消" → t('timer.cancel')

  // Format time display:
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  // Display: `${minutes}:${seconds.toString().padStart(2, '0')}`
}
```

**File:** `apps/web/src/components/pomodoro/WorkCompleteDialog.tsx`

```typescript
import { useTranslation } from 'react-i18next'

export function WorkCompleteDialog({ open, onOpenChange, onTakeBreak, onContinue }: WorkCompleteDialogProps) {
  const { t } = useTranslation('pomodoro')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('workComplete.title')}</DialogTitle>
          <DialogDescription>{t('workComplete.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onContinue}>
            {t('workComplete.continueWorking')}
          </Button>
          <Button onClick={onTakeBreak}>
            {t('workComplete.takeBreak')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**File:** `apps/web/src/components/pomodoro/RestCompleteDialog.tsx`

```typescript
import { useTranslation } from 'react-i18next'

export function RestCompleteDialog({ open, onOpenChange, onStartWork, onSkip }: RestCompleteDialogProps) {
  const { t } = useTranslation('pomodoro')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('restComplete.title')}</DialogTitle>
          <DialogDescription>{t('restComplete.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onSkip}>
            {t('restComplete.skipWork')}
          </Button>
          <Button onClick={onStartWork}>
            {t('restComplete.startWork')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### 3. Update Navigation Components

**File:** `apps/web/src/components/layout/Sidebar.tsx`

Update the `navItems` array to use translations:

```typescript
import { useTranslation } from 'react-i18next'

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation('common')

  const navItems = [
    {
      title: t('navigation.currentView'),
      href: '/',
      icon: Home,
      description: t('navigation.currentViewDescription'),
    },
    {
      title: t('navigation.tasks'),
      href: '/tasks',
      icon: CheckSquare,
      description: t('navigation.tasksDescription'),
    },
    {
      title: t('navigation.dailySummary'),
      href: '/daily-summary',
      icon: Calendar,
      description: t('navigation.dailySummaryDescription'),
    },
    {
      title: t('navigation.statistics'),
      href: '/statistics',
      icon: BarChart3,
      description: t('navigation.statisticsDescription'),
    },
  ]

  return (
    // ... sidebar JSX
  )
}
```

**Update:** `apps/web/src/locales/en/common.json`

Add navigation descriptions:

```json
{
  "navigation": {
    "currentView": "Focus Now",
    "currentViewDescription": "Focus on the most important thing right now",
    "tasks": "All Tasks",
    "tasksDescription": "View and manage all your tasks",
    "dailySummary": "Daily Summary",
    "dailySummaryDescription": "Review your daily progress",
    "statistics": "Statistics",
    "statisticsDescription": "View your long-term progress trends",
    "settings": "Settings"
  }
}
```

**Update:** `apps/web/src/locales/zh/common.json`

```json
{
  "navigation": {
    "currentView": "专注当下",
    "currentViewDescription": "专注于此刻最重要的事",
    "tasks": "所有任务",
    "tasksDescription": "查看和管理所有任务",
    "dailySummary": "每日总结",
    "dailySummaryDescription": "回顾每日完成情况",
    "statistics": "数据统计",
    "statisticsDescription": "查看长期进度趋势",
    "settings": "设置"
  }
}
```

**File:** `apps/web/src/components/layout/Header.tsx`

Update user menu items:

```typescript
import { useTranslation } from 'react-i18next'

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation('common')

  return (
    <header>
      {/* ... */}
      <DropdownMenuItem onClick={() => navigate('/settings')}>
        <Settings className="mr-2 h-4 w-4" />
        <span>{t('navigation.settings')}</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>{t('actions.signOut')}</span>
      </DropdownMenuItem>
    </header>
  )
}
```

**Update:** `apps/web/src/locales/en/common.json` (add signOut)

```json
{
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "confirm": "Confirm",
    "close": "Close",
    "signOut": "Sign Out"
  }
}
```

**Update:** `apps/web/src/locales/zh/common.json`

```json
{
  "actions": {
    "save": "保存",
    "cancel": "取消",
    "delete": "删除",
    "edit": "编辑",
    "create": "创建",
    "confirm": "确认",
    "close": "关闭",
    "signOut": "退出登录"
  }
}
```

### 4. Language Switcher in SettingsPage

**File:** `apps/web/src/pages/SettingsPage.tsx`

Add language selector section:

```typescript
import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SettingsPage() {
  const { t, i18n } = useTranslation('settings')

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language)
    // Optional: also save to settingsStore if you want to track it there
    // settingsStore.setLanguage(language)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('page.title')}</h1>
        <p className="text-muted-foreground">{t('page.subtitle')}</p>
      </div>

      {/* Language Selector - NEW SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>{t('language.title')}</CardTitle>
          <CardDescription>{t('language.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('language.selectLabel')}</label>
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('language.currentLanguage')}: {i18n.language === 'en' ? 'English' : '中文'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Existing settings sections... */}
      {/* ... Current View Settings ... */}
      {/* ... Pomodoro Settings ... */}
    </div>
  )
}
```

**Update:** `apps/web/src/locales/en/settings.json`

```json
{
  "page": {
    "title": "Settings",
    "subtitle": "Customize your Focus Flow experience"
  },
  "language": {
    "title": "Language",
    "description": "Choose your preferred language",
    "selectLabel": "Select Language",
    "currentLanguage": "Current language"
  },
  "currentView": {
    // ... existing settings ...
  },
  "pomodoro": {
    // ... existing settings ...
  }
}
```

**Update:** `apps/web/src/locales/zh/settings.json`

```json
{
  "page": {
    "title": "设置",
    "subtitle": "自定义您的 Focus Flow 体验"
  },
  "language": {
    "title": "语言",
    "description": "选择您偏好的语言",
    "selectLabel": "选择语言",
    "currentLanguage": "当前语言"
  },
  "currentView": {
    // ... existing settings ...
  },
  "pomodoro": {
    // ... existing settings ...
  }
}
```

### 5. Update i18n Configuration

**File:** `apps/web/src/i18n/index.ts`

Add pomodoro namespace:

```typescript
import enPomodoro from '@/locales/en/pomodoro.json'
import zhPomodoro from '@/locales/zh/pomodoro.json'

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    tasks: enTasks,
    settings: enSettings,
    summary: enSummary,
    currentView: enCurrentView,
    pomodoro: enPomodoro, // ← Add this
  },
  zh: {
    common: zhCommon,
    auth: zhAuth,
    tasks: zhTasks,
    settings: zhSettings,
    summary: zhSummary,
    currentView: zhCurrentView,
    pomodoro: zhPomodoro, // ← Add this
  },
}

i18n.init({
  // ...
  ns: ['common', 'auth', 'tasks', 'settings', 'summary', 'currentView', 'pomodoro'], // ← Add 'pomodoro'
  // ...
})
```

### 6. Optional: Track Locale in SettingsStore

**File:** `apps/web/src/stores/settingsStore.ts`

(Optional enhancement - not required but can be useful)

```typescript
interface SettingsState {
  // ... existing settings ...
  locale: string // ← Add this
  setLocale: (locale: string) => void // ← Add this
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // ... existing state ...
      locale: 'en', // Default

      setLocale: (locale: string) => {
        set({ locale })
        // Optionally sync with i18n here
      },

      // ... rest of the store ...
    }),
    {
      name: 'focus-flow-settings',
    }
  )
)
```

---

## Testing Strategy

### Manual Testing

1. **Test language switcher in Settings:**
   - Navigate to Settings page
   - See "Language" section with Select dropdown
   - Current language displayed correctly (English by default)
   - Select "中文", verify all UI updates to Chinese
   - Select "English", verify all UI updates to English
   - No page refresh required

2. **Test Pomodoro components:**
   - In English: Start timer, verify buttons say "Pause", "Cancel"
   - Complete work session, verify dialog says "Work Session Complete!"
   - In Chinese: Same tests, verify correct Chinese text

3. **Test Navigation:**
   - Switch language, verify Sidebar items update
   - Verify Header menu items update
   - Navigation remains functional in both languages

4. **Test persistence:**
   - Set language to Chinese
   - Refresh page
   - Verify language remains Chinese
   - Check localStorage: `localStorage.getItem('i18nextLng')` should be 'zh'

5. **Test all pages end-to-end:**
   - Switch to Chinese
   - Visit all pages: CurrentView, Tasks, Settings, DailySummary, Statistics
   - Verify all text is in Chinese
   - Switch to English
   - Revisit all pages, verify all text is in English

### Automated Testing

1. **Update component tests:**
   - PomodoroTimer.test.tsx: Update with i18n mock
   - WorkCompleteDialog.test.tsx: Update with i18n mock
   - RestCompleteDialog.test.tsx: Update with i18n mock
   - Sidebar.test.tsx: Update with i18n mock (if exists)

   Example test update:
   ```typescript
   import { vi } from 'vitest'

   vi.mock('react-i18next', () => ({
     useTranslation: () => ({
       t: (key: string) => key,
       i18n: { language: 'en', changeLanguage: vi.fn() },
     }),
   }))

   describe('PomodoroTimer', () => {
     it('renders start button', () => {
       render(<PomodoroTimer />)
       expect(screen.getByText('timer.startWork')).toBeInTheDocument()
     })
   })
   ```

2. **Run tests:**
   ```bash
   pnpm --filter web test
   ```

3. **Type check:**
   ```bash
   pnpm --filter web type-check
   ```

---

## Technical Notes

### Integration Approach

- **Pomodoro components:** Each component imports `useTranslation('pomodoro')`
- **Navigation components:** Use shared `common.navigation.*` keys
- **Language switcher:** Directly calls `i18n.changeLanguage()`, no need for state management wrapper
- **Persistence:** Handled automatically by i18next-browser-languagedetector

### Existing Pattern Reference

- Language switcher follows same pattern as other settings (Card with Select)
- Component internationalization follows same pattern as pages (Story 5.2)
- No architectural changes, only text replacement

### Key Constraints

- **No functional changes:** Timer logic, navigation behavior unchanged
- **Language switcher in Settings:** Not in Header/Sidebar (avoid clutter)
- **Maintain existing UI:** No layout changes, only text updates
- **Keep "Focus Flow" brand name:** Don't translate app name

### Special Considerations

**Time Display:**
- Timer shows "25:00" format (no translation needed for numbers)
- Unit labels can be translated: "25 min" (en) vs "25 分" (zh)
- Use interpolation: `t('timer.minutes', { count: 25 })`

**Status Badges:**
- Use Badge color variants consistently across languages
- "Working" (green), "Resting" (blue), "Paused" (yellow)

**Dialog Animations:**
- Dialog transitions work identically in both languages
- No special handling needed

---

## Risk Mitigation

### Primary Risk

**Long English text breaks timer UI layout (English is typically longer)**

**Mitigation:**
1. Keep timer labels concise ("Work", "Rest" instead of "Working Session", "Rest Period")
2. Test timer on mobile screens (narrower layout)
3. Use abbreviations if needed ("min" instead of "minutes")
4. Adjust button padding if necessary (minimal CSS changes)

**Rollback:**
- Revert component changes
- Remove language switcher from Settings
- App reverts to Chinese-only UI

### Secondary Risk

**Language switching causes UI flicker or delay**

**Mitigation:**
1. i18next updates are synchronous (no async delay)
2. React re-renders are fast (< 100ms)
3. Test on slower devices to verify performance
4. Use React.memo() for expensive components if needed

**Rollback:**
- Same as primary risk rollback

---

## Definition of Done

### Functional Completeness
- [x] PomodoroTimer fully internationalized
- [x] WorkCompleteDialog fully internationalized
- [x] RestCompleteDialog fully internationalized
- [x] Sidebar fully internationalized
- [x] Header fully internationalized
- [x] FocusTaskCard fully internationalized (if not already in Story 5.2)
- [x] Language switcher added to SettingsPage
- [x] Translation files created (`pomodoro.json`, updated `common.json`, `settings.json`)

### Quality Assurance
- [x] All components tested in English
- [x] All components tested in Chinese
- [x] Language switcher works smoothly
- [x] Language preference persists across sessions
- [x] No missing translation keys
- [x] No layout breaks or UI issues
- [x] All tests pass
- [x] TypeScript type-check passes

### Integration Verification
- [x] Pomodoro timer works correctly in both languages
- [x] Dialogs display and function correctly
- [x] Navigation works in both languages
- [x] Settings page shows language selector
- [x] Language change updates all UI immediately

---

## Related Stories

- **Story 5.1:** i18n Framework Integration (prerequisite)
- **Story 5.2:** Core Pages Internationalization (prerequisite)

---

## References

- [react-i18next Language Switcher](https://react.i18next.com/guides/quick-start#using-the-hook)
- [i18next Interpolation](https://www.i18next.com/translation-function/interpolation)
- [Epic 5: 多语言支持](../epics/epic-5-i18n-support.md)
- [Story 5.1: i18n Framework Integration](./story-5.1-i18n-framework-integration.md)
- [Story 5.2: Core Pages Internationalization](./story-5.2-core-pages-internationalization.md)
- [PomodoroTimer Component](apps/web/src/components/pomodoro/PomodoroTimer.tsx)
- [SettingsPage](apps/web/src/pages/SettingsPage.tsx)
- [Sidebar Component](apps/web/src/components/layout/Sidebar.tsx)
