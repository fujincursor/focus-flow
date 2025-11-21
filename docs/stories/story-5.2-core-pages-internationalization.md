# Story 5.2: Core Pages Internationalization - Brownfield Enhancement

**Story ID:** Story 5.2
**Epic:** Epic 5 - 多语言支持 (i18n)
**Type:** Brownfield Enhancement
**Priority:** P1
**Estimated Effort:** 6-8 hours
**Status:** Ready for Development
**Dependencies:** Story 5.1 (i18n Framework Integration)

---

## User Story

As a **Focus Flow user**,
I want **all core pages (authentication, tasks, settings, daily summary) to display in my chosen language**,
So that **I can understand and use the main features of the app in English or Chinese**.

---

## Story Context

### Existing System Integration

- **Integrates with:** Core pages (LoginPage, SignupPage, TasksPage, SettingsPage, DailySummaryPage, CurrentViewPage)
- **Technology:** react-i18next `useTranslation()` hook
- **Follows pattern:** Replace hardcoded strings with `t('key')` calls
- **Touch points:**
  - 6 core page components (listed above)
  - Translation files: `locales/{en,zh}/auth.json`, `tasks.json`, `settings.json`, `common.json`
  - Test files for each page (need to update mocks)

### Current State

- i18n framework integrated in Story 5.1
- All UI text currently hardcoded in Chinese
- Pages use shadcn/ui components (Button, Input, Card, etc.)
- Core pages identified:
  - **Authentication:** [LoginPage.tsx](apps/web/src/pages/LoginPage.tsx), [SignupPage.tsx](apps/web/src/pages/SignupPage.tsx)
  - **Tasks:** [TasksPage.tsx](apps/web/src/pages/TasksPage.tsx), [CurrentViewPage.tsx](apps/web/src/pages/CurrentViewPage.tsx)
  - **Settings:** [SettingsPage.tsx](apps/web/src/pages/SettingsPage.tsx)
  - **Summary:** [DailySummaryPage.tsx](apps/web/src/pages/DailySummaryPage.tsx)

---

## Acceptance Criteria

### Functional Requirements

1. **Authentication pages internationalized**
   - LoginPage: All text (titles, labels, buttons, errors) uses `t()` function
   - SignupPage: All text uses `t()` function
   - Translation keys organized in `locales/{en,zh}/auth.json`

2. **TasksPage internationalized**
   - Page title, tabs, buttons, search placeholder use `t()` function
   - Empty state messages use `t()` function
   - Translation keys organized in `locales/{en,zh}/tasks.json`

3. **SettingsPage internationalized**
   - Page title, section headers, labels, descriptions use `t()` function
   - All settings options text uses `t()` function
   - Translation keys organized in `locales/{en,zh}/settings.json`

4. **DailySummaryPage internationalized**
   - Page title, tabs, card titles, stats labels use `t()` function
   - Empty state and completion messages use `t()` function
   - Translation keys organized in `locales/{en,zh}/summary.json` (new module)

5. **CurrentViewPage internationalized**
   - Page title, buttons, progress labels use `t()` function
   - Empty state and celebration messages use `t()` function
   - Translation keys organized in `locales/{en,zh}/currentView.json` (new module)

### Integration Requirements

6. **Existing functionality unchanged**
   - All page features work identically in both languages
   - Forms, validation, navigation work correctly
   - No broken layouts or UI issues

7. **Language switching works correctly**
   - Switching language in browser console updates all page text immediately
   - No page refresh required
   - Text changes are smooth (no flicker or delay)

8. **Common navigation elements use shared translations**
   - Navigation links use `common.navigation.*` keys
   - Common actions (save, cancel, delete) use `common.actions.*` keys
   - Consistent terminology across all pages

### Quality Requirements

9. **Translation quality**
   - English translations are natural and clear
   - Chinese translations match original UI text
   - No missing translations (no keys displayed to user)
   - Consistent terminology (e.g., "task" not "to-do" in one place and "task" in another)

10. **Testing coverage**
    - All page tests updated with translation mocks
    - Tests pass for both English and Chinese
    - Test snapshots updated (if used)

11. **Code quality**
    - No TypeScript errors
    - No console warnings related to missing translation keys
    - Code follows existing patterns

---

## Technical Implementation Details

### Translation File Structure

Create the following new translation modules:

```
locales/
├── en/
│   ├── common.json        # (already exists from Story 5.1)
│   ├── auth.json          # ← New
│   ├── tasks.json         # ← New
│   ├── settings.json      # ← New
│   ├── summary.json       # ← New
│   └── currentView.json   # ← New
└── zh/
    └── [same structure]
```

### 1. Authentication Pages (`auth.json`)

**File:** `apps/web/src/locales/en/auth.json`

```json
{
  "login": {
    "title": "Welcome Back",
    "subtitle": "Sign in to continue to Focus Flow",
    "emailLabel": "Email",
    "emailPlaceholder": "Enter your email",
    "passwordLabel": "Password",
    "passwordPlaceholder": "Enter your password",
    "submitButton": "Sign In",
    "signingIn": "Signing in...",
    "noAccount": "Don't have an account?",
    "signupLink": "Sign up",
    "error": "Invalid email or password"
  },
  "signup": {
    "title": "Create Account",
    "subtitle": "Start your focus journey today",
    "emailLabel": "Email",
    "emailPlaceholder": "Enter your email",
    "passwordLabel": "Password",
    "passwordPlaceholder": "At least 6 characters",
    "confirmPasswordLabel": "Confirm Password",
    "confirmPasswordPlaceholder": "Re-enter your password",
    "submitButton": "Sign Up",
    "signingUp": "Creating account...",
    "hasAccount": "Already have an account?",
    "loginLink": "Sign in",
    "passwordMismatch": "Passwords do not match",
    "error": "Failed to create account"
  }
}
```

**File:** `apps/web/src/locales/zh/auth.json`

```json
{
  "login": {
    "title": "欢迎回来",
    "subtitle": "登录以继续使用 Focus Flow",
    "emailLabel": "邮箱",
    "emailPlaceholder": "请输入邮箱",
    "passwordLabel": "密码",
    "passwordPlaceholder": "请输入密码",
    "submitButton": "登录",
    "signingIn": "登录中...",
    "noAccount": "还没有账号？",
    "signupLink": "注册",
    "error": "邮箱或密码错误"
  },
  "signup": {
    "title": "创建账号",
    "subtitle": "开始您的专注之旅",
    "emailLabel": "邮箱",
    "emailPlaceholder": "请输入邮箱",
    "passwordLabel": "密码",
    "passwordPlaceholder": "至少 6 个字符",
    "confirmPasswordLabel": "确认密码",
    "confirmPasswordPlaceholder": "再次输入密码",
    "submitButton": "注册",
    "signingUp": "注册中...",
    "hasAccount": "已有账号？",
    "loginLink": "登录",
    "passwordMismatch": "两次密码不一致",
    "error": "创建账号失败"
  }
}
```

### 2. Tasks Pages (`tasks.json`)

**File:** `apps/web/src/locales/en/tasks.json`

```json
{
  "page": {
    "title": "All Tasks",
    "subtitle": "Manage your tasks and priorities"
  },
  "tabs": {
    "uncompleted": "Active",
    "completed": "Completed",
    "today": "Today",
    "thisWeek": "This Week",
    "anytime": "Anytime"
  },
  "search": {
    "placeholder": "Search tasks..."
  },
  "create": {
    "button": "Create Task",
    "dialogTitle": "Create New Task",
    "titleLabel": "Task Title",
    "titlePlaceholder": "What do you need to do?",
    "descriptionLabel": "Description",
    "descriptionPlaceholder": "Add more details (optional)",
    "timeSensitivityLabel": "When",
    "durationLabel": "Estimated Duration",
    "durationPlaceholder": "e.g., 30",
    "durationUnit": "minutes",
    "submitButton": "Create",
    "cancelButton": "Cancel",
    "success": "Task created successfully",
    "error": "Failed to create task"
  },
  "edit": {
    "dialogTitle": "Edit Task",
    "submitButton": "Save Changes",
    "success": "Task updated successfully",
    "error": "Failed to update task"
  },
  "delete": {
    "dialogTitle": "Delete Task",
    "dialogDescription": "Are you sure you want to delete this task? This action cannot be undone.",
    "confirmButton": "Delete",
    "cancelButton": "Cancel",
    "success": "Task deleted successfully",
    "error": "Failed to delete task"
  },
  "timeSensitivity": {
    "today": "Today",
    "this_week": "This Week",
    "anytime": "Anytime"
  },
  "empty": {
    "uncompleted": "No active tasks",
    "completed": "No completed tasks yet",
    "today": "No tasks for today",
    "thisWeek": "No tasks for this week",
    "anytime": "No anytime tasks",
    "search": "No tasks found"
  },
  "actions": {
    "markComplete": "Mark as complete",
    "markIncomplete": "Mark as incomplete",
    "edit": "Edit",
    "delete": "Delete"
  }
}
```

**File:** `apps/web/src/locales/zh/tasks.json`

```json
{
  "page": {
    "title": "所有任务",
    "subtitle": "管理您的任务和优先级"
  },
  "tabs": {
    "uncompleted": "进行中",
    "completed": "已完成",
    "today": "今日",
    "thisWeek": "本周",
    "anytime": "随时"
  },
  "search": {
    "placeholder": "搜索任务..."
  },
  "create": {
    "button": "创建任务",
    "dialogTitle": "创建新任务",
    "titleLabel": "任务标题",
    "titlePlaceholder": "你需要做什么？",
    "descriptionLabel": "描述",
    "descriptionPlaceholder": "添加更多细节（可选）",
    "timeSensitivityLabel": "时间",
    "durationLabel": "预计时长",
    "durationPlaceholder": "例如：30",
    "durationUnit": "分钟",
    "submitButton": "创建",
    "cancelButton": "取消",
    "success": "任务创建成功",
    "error": "任务创建失败"
  },
  "edit": {
    "dialogTitle": "编辑任务",
    "submitButton": "保存修改",
    "success": "任务更新成功",
    "error": "任务更新失败"
  },
  "delete": {
    "dialogTitle": "删除任务",
    "dialogDescription": "确定要删除此任务吗？此操作无法撤销。",
    "confirmButton": "删除",
    "cancelButton": "取消",
    "success": "任务删除成功",
    "error": "任务删除失败"
  },
  "timeSensitivity": {
    "today": "今日",
    "this_week": "本周",
    "anytime": "随时"
  },
  "empty": {
    "uncompleted": "没有进行中的任务",
    "completed": "还没有完成的任务",
    "today": "今天没有任务",
    "thisWeek": "本周没有任务",
    "anytime": "没有随时任务",
    "search": "未找到任务"
  },
  "actions": {
    "markComplete": "标记为完成",
    "markIncomplete": "标记为未完成",
    "edit": "编辑",
    "delete": "删除"
  }
}
```

### 3. Settings Page (`settings.json`)

**File:** `apps/web/src/locales/en/settings.json`

```json
{
  "page": {
    "title": "Settings",
    "subtitle": "Customize your Focus Flow experience"
  },
  "currentView": {
    "title": "Focus View Settings",
    "maxAnytimeTasksLabel": "Max Anytime Tasks",
    "maxAnytimeTasksDescription": "Maximum number of anytime tasks to show in the focus view",
    "prioritizeShortTasksLabel": "Prioritize Short Tasks",
    "prioritizeShortTasksDescription": "Show tasks with shorter estimated duration first",
    "celebrationAnimationLabel": "Celebration Animation",
    "celebrationAnimationDescription": "Show animation when completing a task",
    "autoSwitchLabel": "Auto Switch to Next Task",
    "autoSwitchDescription": "Automatically switch to next task after completion"
  },
  "pomodoro": {
    "title": "Pomodoro Timer Settings",
    "enableLabel": "Enable Pomodoro Timer",
    "enableDescription": "Show pomodoro timer on the focus view page",
    "workDurationLabel": "Work Duration",
    "workDurationDescription": "Length of each work session in minutes",
    "restDurationLabel": "Rest Duration",
    "restDurationDescription": "Length of each rest session in minutes",
    "autoStartRestLabel": "Auto Start Rest",
    "autoStartRestDescription": "Automatically start rest timer after work session",
    "autoStartWorkLabel": "Auto Start Work",
    "autoStartWorkDescription": "Automatically start next work session after rest",
    "unit": "minutes"
  },
  "actions": {
    "save": "Save Changes",
    "saving": "Saving...",
    "success": "Settings saved successfully",
    "error": "Failed to save settings"
  }
}
```

**File:** `apps/web/src/locales/zh/settings.json`

```json
{
  "page": {
    "title": "设置",
    "subtitle": "自定义您的 Focus Flow 体验"
  },
  "currentView": {
    "title": "专注视图设置",
    "maxAnytimeTasksLabel": "最多显示随时任务数",
    "maxAnytimeTasksDescription": "在专注视图中最多显示的随时任务数量",
    "prioritizeShortTasksLabel": "优先显示短任务",
    "prioritizeShortTasksDescription": "优先显示预计时长较短的任务",
    "celebrationAnimationLabel": "完成庆祝动画",
    "celebrationAnimationDescription": "完成任务时显示庆祝动画",
    "autoSwitchLabel": "自动切换下一任务",
    "autoSwitchDescription": "完成任务后自动切换到下一个任务"
  },
  "pomodoro": {
    "title": "番茄钟设置",
    "enableLabel": "启用番茄钟",
    "enableDescription": "在专注视图页面显示番茄钟计时器",
    "workDurationLabel": "工作时长",
    "workDurationDescription": "每个工作时段的时长（分钟）",
    "restDurationLabel": "休息时长",
    "restDurationDescription": "每个休息时段的时长（分钟）",
    "autoStartRestLabel": "自动开始休息",
    "autoStartRestDescription": "工作时段结束后自动开始休息计时",
    "autoStartWorkLabel": "自动开始工作",
    "autoStartWorkDescription": "休息结束后自动开始下一个工作时段",
    "unit": "分钟"
  },
  "actions": {
    "save": "保存修改",
    "saving": "保存中...",
    "success": "设置保存成功",
    "error": "设置保存失败"
  }
}
```

### 4. Daily Summary Page (`summary.json`)

**File:** `apps/web/src/locales/en/summary.json`

```json
{
  "page": {
    "title": "Daily Summary",
    "subtitle": "Review your daily progress"
  },
  "tabs": {
    "today": "Today",
    "week": "This Week",
    "recent": "Last 7 Days"
  },
  "stats": {
    "completedTasks": "Completed Tasks",
    "totalCreated": "Created",
    "completedPomodoros": "Completed Pomodoros",
    "focusDuration": "Focus Time",
    "completionRate": "Completion Rate",
    "workDuration": "Work Duration",
    "estimatedDuration": "Estimated",
    "averagePerDay": "Average Per Day",
    "tasksPerDay": "tasks/day",
    "excellentPerformance": "Excellent work!",
    "keepGoing": "Keep going!"
  },
  "sections": {
    "completedTasksTitle": "Completed Tasks",
    "completedTasksDescription": "All tasks completed today",
    "dailyBreakdownTitle": "Daily Breakdown",
    "dailyBreakdownDescription": "Progress for each day this week",
    "recentSummaryTitle": "Last 7 Days",
    "recentSummaryDescription": "Your daily completion overview"
  },
  "empty": {
    "today": "No data for today",
    "todayDescription": "Complete tasks to see your daily stats",
    "week": "No data for this week",
    "weekDescription": "Complete tasks to see your weekly stats",
    "recent": "No historical data",
    "recentDescription": "Complete tasks to see your historical stats",
    "noCompletedTasks": "No completed tasks yet"
  },
  "time": {
    "minutes": "{{count}} minute",
    "minutes_plural": "{{count}} minutes",
    "hours": "{{count}}h {{remainder}}m",
    "completedAt": "Completed at {{time}}"
  }
}
```

**File:** `apps/web/src/locales/zh/summary.json`

```json
{
  "page": {
    "title": "每日总结",
    "subtitle": "回顾您的每日完成情况"
  },
  "tabs": {
    "today": "今日总结",
    "week": "本周总结",
    "recent": "最近7天"
  },
  "stats": {
    "completedTasks": "已完成任务",
    "totalCreated": "共创建",
    "completedPomodoros": "完成番茄钟",
    "focusDuration": "专注时长",
    "completionRate": "完成率",
    "workDuration": "工作时长",
    "estimatedDuration": "预计时长",
    "averagePerDay": "日均完成",
    "tasksPerDay": "个任务/天",
    "excellentPerformance": "表现优秀！",
    "keepGoing": "继续加油！"
  },
  "sections": {
    "completedTasksTitle": "已完成的任务",
    "completedTasksDescription": "今天完成的所有任务",
    "dailyBreakdownTitle": "每日明细",
    "dailyBreakdownDescription": "本周各天的完成情况",
    "recentSummaryTitle": "最近7天统计",
    "recentSummaryDescription": "您的每日完成情况一览"
  },
  "empty": {
    "today": "今日暂无数据",
    "todayDescription": "完成任务后，这里会显示您的今日统计",
    "week": "本周暂无数据",
    "weekDescription": "完成任务后，这里会显示您的本周统计",
    "recent": "暂无历史数据",
    "recentDescription": "完成任务后，这里会显示您的历史统计",
    "noCompletedTasks": "暂无完成的任务"
  },
  "time": {
    "minutes": "{{count}}分钟",
    "hours": "{{count}}h {{remainder}}m",
    "completedAt": "完成于 {{time}}"
  }
}
```

### 5. Current View Page (`currentView.json`)

**File:** `apps/web/src/locales/en/currentView.json`

```json
{
  "page": {
    "title": "Focus Now",
    "subtitle": "Focus on one task at a time"
  },
  "taskCard": {
    "currentTask": "Current Task",
    "estimatedDuration": "Estimated: {{duration}} min",
    "completeButton": "Complete",
    "skipButton": "Skip",
    "nextTask": "Next Task",
    "description": "Description"
  },
  "progress": {
    "completed": "Completed {{current}} of {{total}} tasks",
    "allComplete": "All tasks completed!"
  },
  "empty": {
    "title": "No tasks to focus on",
    "description": "Create your first task to get started",
    "createButton": "Create Task"
  },
  "celebration": {
    "taskComplete": "Task completed! 🎉",
    "allTasksComplete": "All tasks completed! Amazing work! 🎉"
  },
  "offline": {
    "banner": "You are offline. Changes will sync when you're back online."
  }
}
```

**File:** `apps/web/src/locales/zh/currentView.json`

```json
{
  "page": {
    "title": "专注当下",
    "subtitle": "一次专注一个任务"
  },
  "taskCard": {
    "currentTask": "当前任务",
    "estimatedDuration": "预计: {{duration}} 分钟",
    "completeButton": "完成",
    "skipButton": "跳过",
    "nextTask": "下一任务",
    "description": "描述"
  },
  "progress": {
    "completed": "已完成 {{current}} / {{total}} 个任务",
    "allComplete": "所有任务已完成！"
  },
  "empty": {
    "title": "暂无待专注的任务",
    "description": "创建您的第一个任务开始专注",
    "createButton": "创建任务"
  },
  "celebration": {
    "taskComplete": "任务完成！🎉",
    "allTasksComplete": "所有任务已完成！太棒了！🎉"
  },
  "offline": {
    "banner": "您当前离线。恢复网络后将自动同步。"
  }
}
```

### 6. Update i18n Configuration

**File:** `apps/web/src/i18n/index.ts`

Add the new namespaces:

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enCommon from '@/locales/en/common.json'
import enAuth from '@/locales/en/auth.json'
import enTasks from '@/locales/en/tasks.json'
import enSettings from '@/locales/en/settings.json'
import enSummary from '@/locales/en/summary.json'
import enCurrentView from '@/locales/en/currentView.json'

import zhCommon from '@/locales/zh/common.json'
import zhAuth from '@/locales/zh/auth.json'
import zhTasks from '@/locales/zh/tasks.json'
import zhSettings from '@/locales/zh/settings.json'
import zhSummary from '@/locales/zh/summary.json'
import zhCurrentView from '@/locales/zh/currentView.json'

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    tasks: enTasks,
    settings: enSettings,
    summary: enSummary,
    currentView: enCurrentView,
  },
  zh: {
    common: zhCommon,
    auth: zhAuth,
    tasks: zhTasks,
    settings: zhSettings,
    summary: zhSummary,
    currentView: zhCurrentView,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'tasks', 'settings', 'summary', 'currentView'],

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  })

export default i18n
```

### 7. Example: Internationalize LoginPage

**File:** `apps/web/src/pages/LoginPage.tsx`

**Before:**
```typescript
<h2 className="text-3xl font-bold">欢迎回来</h2>
<p className="text-muted-foreground">登录以继续使用 Focus Flow</p>
```

**After:**
```typescript
import { useTranslation } from 'react-i18next'

export function LoginPage() {
  const { t } = useTranslation('auth')
  // ... rest of the code

  return (
    // ...
    <h2 className="text-3xl font-bold">{t('login.title')}</h2>
    <p className="text-muted-foreground">{t('login.subtitle')}</p>
    // ...
  )
}
```

Apply similar changes to all hardcoded strings in LoginPage:
- Form labels: `t('login.emailLabel')`, `t('login.passwordLabel')`
- Placeholders: `t('login.emailPlaceholder')`, `t('login.passwordPlaceholder')`
- Buttons: `t('login.submitButton')`, loading state: `t('login.signingIn')`
- Links: `t('login.noAccount')`, `t('login.signupLink')`
- Error messages: `t('login.error')`

**Similar pattern applies to:**
- SignupPage → use `t('signup.*')` keys
- TasksPage → use `t('page.*')`, `t('tabs.*')`, `t('create.*')`, etc.
- SettingsPage → use `t('page.*')`, `t('currentView.*')`, `t('pomodoro.*')`
- DailySummaryPage → use `t('page.*')`, `t('tabs.*')`, `t('stats.*')`
- CurrentViewPage → use `t('page.*')`, `t('taskCard.*')`, `t('progress.*')`

---

## Testing Strategy

### Manual Testing

1. **Test each page in English:**
   ```javascript
   // In browser console
   i18n.changeLanguage('en')
   ```
   - Navigate to each core page
   - Verify all text is in English
   - Check for missing keys (displayed as `key.path` instead of text)

2. **Test each page in Chinese:**
   ```javascript
   i18n.changeLanguage('zh')
   ```
   - Navigate to each core page
   - Verify all text matches original Chinese UI
   - Confirm translations are accurate

3. **Test language switching:**
   - Switch language while on a page
   - Verify text updates immediately without page refresh
   - Check that forms, dialogs, and interactive elements work correctly

4. **Test edge cases:**
   - Long task titles/descriptions (test text overflow)
   - Empty states (ensure empty messages are translated)
   - Error states (ensure error messages are translated)

### Automated Testing

1. **Update test mocks:**
   All page tests need updated translation mocks:

   ```typescript
   // In test files
   import { vi } from 'vitest'

   vi.mock('react-i18next', () => ({
     useTranslation: () => ({
       t: (key: string) => key, // Return key as-is for testing
       i18n: {
         language: 'en',
         changeLanguage: vi.fn(),
       },
     }),
   }))
   ```

2. **Run tests:**
   ```bash
   pnpm --filter web test
   ```
   - All tests should pass
   - Update test assertions if they check for specific text

3. **Type check:**
   ```bash
   pnpm --filter web type-check
   ```
   - No TypeScript errors

---

## Technical Notes

### Integration Approach

- **Replace hardcoded strings progressively:** Start with page titles, then buttons, then labels, then descriptions
- **Use namespace parameter:** Each page imports its specific namespace: `useTranslation('tasks')`
- **Share common translations:** Navigation and actions use shared `common` namespace
- **Handle pluralization:** Use i18next pluralization for time units (e.g., "1 minute" vs "2 minutes")

### Existing Pattern Reference

- Component structure unchanged, only string values replaced
- Event handlers and logic remain identical
- Form validation schemas unchanged (validation happens before translation)

### Key Constraints

- **No functional changes:** Only text replacement, no behavior changes
- **Maintain original Chinese text:** Chinese translations must match current UI exactly
- **English as default:** All new users see English first
- **No layout breaks:** Translations must fit existing UI layout (may need to adjust for longer English text)

### Translation Interpolation

For dynamic values, use interpolation:

```typescript
// In translation file:
{
  "progress": {
    "completed": "Completed {{current}} of {{total}} tasks"
  }
}

// In component:
t('progress.completed', { current: 3, total: 10 })
// Output: "Completed 3 of 10 tasks" (en)
```

---

## Risk Mitigation

### Primary Risk

**Missing translations cause keys to be displayed to users**

**Mitigation:**
1. Create comprehensive translation files before implementing
2. Use a checklist to ensure all page text is covered
3. Test thoroughly in both languages before committing
4. Configure i18n to show warning in console for missing keys
5. Use fallback to English if Chinese translation is missing

**Rollback:**
- Revert component changes (keep translation files for future use)
- App reverts to hardcoded Chinese text

### Secondary Risk

**Long English text breaks UI layout (English is typically longer than Chinese)**

**Mitigation:**
1. Review all UI elements after translation
2. Use CSS `text-overflow: ellipsis` for long titles
3. Test on mobile screens (narrower layout)
4. Adjust spacing or font size if needed (minimal changes)

**Rollback:**
- Shorten English translations (use abbreviations)
- Adjust CSS for specific elements

---

## Definition of Done

### Functional Completeness
- [x] LoginPage fully internationalized
- [x] SignupPage fully internationalized
- [x] TasksPage fully internationalized
- [x] SettingsPage fully internationalized
- [x] DailySummaryPage fully internationalized
- [x] CurrentViewPage fully internationalized
- [x] All translation files created (`auth.json`, `tasks.json`, `settings.json`, `summary.json`, `currentView.json`)

### Quality Assurance
- [x] All pages tested in English
- [x] All pages tested in Chinese
- [x] Language switching works smoothly
- [x] No missing translation keys
- [x] No layout breaks or UI issues
- [x] All tests pass
- [x] TypeScript type-check passes

### Integration Verification
- [x] Navigation between pages works correctly
- [x] Forms and validation work correctly
- [x] Dialogs and toasts display correct language
- [x] Empty states and error messages translated

---

## Related Stories

- **Story 5.1:** i18n Framework Integration (prerequisite)
- **Story 5.3:** UI Components and Language Switcher (uses these translations)

---

## References

- [react-i18next Namespaces](https://react.i18next.com/latest/usetranslation-hook#loading-namespaces)
- [i18next Interpolation](https://www.i18next.com/translation-function/interpolation)
- [Epic 5: 多语言支持](../epics/epic-5-i18n-support.md)
- [Story 5.1: i18n Framework Integration](./story-5.1-i18n-framework-integration.md)
