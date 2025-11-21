# Epic 5: 多语言支持 (i18n) - Brownfield Enhancement

**Epic ID:** Epic 5
**Type:** Brownfield Enhancement
**Priority:** P1 (V1.2 Feature)
**Estimated Effort:** 2-3 Stories
**Status:** Ready for Planning

---

## Epic Goal

为 Focus Flow 添加国际化支持,默认语言为英文,用户可在设置中切换为中文,提升产品的国际化能力和用户体验。

---

## Existing System Context

### Current Relevant Functionality

- **所有 UI 文本目前硬编码为中文**
  - 页面标题、按钮、表单标签、提示信息等
  - 分布在 10+ 页面组件和 20+ UI 组件中
  - 示例:CurrentViewPage, SettingsPage, TasksPage, PomodoroTimer 等

### Technology Stack

- **Frontend:** React 18 + TypeScript
- **State Management:** Zustand (用于 settings store)
- **Styling:** Tailwind CSS + shadcn/ui
- **Storage:** localStorage (用于持久化语言偏好)

### Integration Points

1. **SettingsPage** - 添加语言切换器 (Language Picker)
2. **所有页面和组件** - 替换硬编码文本为 i18n keys
3. **settingsStore** - 添加 `locale` 状态管理
4. **翻译文件** - 创建 `en.json` 和 `zh.json`

---

## Enhancement Details

### What's Being Added/Changed

**核心功能:**

1. **i18n 框架集成**
   - 使用 `react-i18next` (行业标准库)
   - 配置语言检测和切换逻辑
   - 支持动态语言切换(无需刷新页面)

2. **翻译文件系统**
   - 创建 `locales/en.json` (英文翻译,默认语言)
   - 创建 `locales/zh.json` (中文翻译)
   - 按功能模块组织翻译 keys (common, auth, tasks, pomodoro, settings)

3. **语言切换 UI**
   - 在 SettingsPage 添加"语言/Language"选择器
   - 使用 Select 组件(shadcn/ui)
   - 选项: "English" (en), "中文" (zh)

4. **全局文本国际化**
   - 重构所有硬编码文本为 `t('key')` 调用
   - 优先级: 核心页面 > UI 组件 > 辅助功能

### How It Integrates

```typescript
// 新增: i18nProvider 包裹 App
// apps/web/src/main.tsx
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'

<I18nextProvider i18n={i18n}>
  <App />
</I18nextProvider>

// 使用示例: CurrentViewPage
import { useTranslation } from 'react-i18next'

export function CurrentViewPage() {
  const { t } = useTranslation()

  return <h1>{t('currentView.title')}</h1>
  // 输出: "Focus Now" (en) or "专注当下" (zh)
}

// 语言切换: SettingsPage
import { useTranslation } from 'react-i18next'

const { i18n } = useTranslation()
const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng)
  localStorage.setItem('i18nextLng', lng)
}
```

### Success Criteria

1. ✅ 用户可在设置中切换语言(英文 ⇄ 中文)
2. ✅ 默认语言为英文(首次访问)
3. ✅ 语言偏好持久化到 localStorage
4. ✅ 切换语言后立即生效(无需刷新)
5. ✅ 所有核心页面和组件支持双语
6. ✅ 现有功能无破坏(功能行为不变)
7. ✅ 性能无明显下降

---

## Stories

### Story 5.1: i18n 框架集成与配置

**Goal:** 安装 react-i18next,配置语言检测和切换逻辑,创建翻译文件结构

**Tasks:**
- 安装 `react-i18next` 和 `i18next` 依赖
- 创建 `apps/web/src/i18n/index.ts` 配置文件
- 创建 `apps/web/src/locales/en/` 和 `locales/zh/` 目录
- 配置语言检测(优先级: localStorage > 浏览器语言)
- 在 `main.tsx` 集成 I18nextProvider

**Acceptance Criteria:**
- [x] i18n 框架正常工作
- [x] 默认语言为英文
- [x] 可通过 `i18n.changeLanguage()` 切换语言

---

### Story 5.2: 核心页面国际化 (Phase 1)

**Goal:** 重构核心页面的硬编码文本为 i18n keys,优先处理高频使用页面

**Scope:**
- CurrentViewPage (当下视图)
- TasksPage (任务列表)
- SettingsPage (设置页面)
- LoginPage / SignupPage (认证页面)

**Tasks:**
- 提取所有硬编码文本到翻译文件
- 创建 `locales/en/common.json`, `tasks.json`, `settings.json`, `auth.json`
- 创建 `locales/zh/` 对应的中文翻译
- 使用 `useTranslation()` hook 替换硬编码文本

**Acceptance Criteria:**
- [x] 核心页面的所有文本支持双语
- [x] 英文翻译完整且自然
- [x] 中文翻译与原有文本一致
- [x] 测试用例通过(需更新测试 mock)

---

### Story 5.3: UI 组件和语言切换器

**Goal:** 国际化 UI 组件(如 PomodoroTimer, FocusTaskCard),在 SettingsPage 添加语言切换器

**Scope:**
- PomodoroTimer 组件
- WorkCompleteDialog / RestCompleteDialog
- FocusTaskCard
- Header / Sidebar
- 语言选择器 UI

**Tasks:**
- 国际化番茄钟相关组件
- 国际化任务卡片和对话框
- 创建 `locales/en/pomodoro.json` 和 `locales/zh/pomodoro.json`
- 在 SettingsPage 添加语言切换 Select 组件
- 语言切换时更新 localStorage

**Acceptance Criteria:**
- [x] 所有 UI 组件支持双语
- [x] SettingsPage 显示语言选择器("English" / "中文")
- [x] 切换语言后 UI 立即更新
- [x] 语言偏好持久化(刷新后保持)
- [x] 翻译文件组织清晰(按模块分类)

---

## Compatibility Requirements

### No Breaking Changes

- ✅ **Existing APIs remain unchanged** - 纯 UI 层变更,不涉及 API 修改
- ✅ **Database schema unchanged** - 无数据库变更
- ✅ **UI patterns consistent** - 使用现有 shadcn/ui Select 组件
- ✅ **Performance impact minimal** - i18next 运行时开销 < 50ms

### Backward Compatibility

- 用户已有的设置和数据不受影响
- 如果 localStorage 没有语言设置,自动使用默认语言(英文)
- 现有中文用户首次访问时,检测浏览器语言自动设为中文

---

## Risk Mitigation

### Primary Risk

**翻译不完整或不准确导致用户体验下降**

**Mitigation:**
1. 使用结构化的翻译 keys(如 `tasks.createButton` 而非 `btn1`)
2. 所有翻译由人工校对(避免机器翻译错误)
3. 创建翻译 checklist,确保覆盖所有 UI 文本
4. 如果翻译缺失,自动 fallback 到英文(而非显示 key)

### Secondary Risk

**i18n 集成破坏现有测试**

**Mitigation:**
1. 在测试中 mock `useTranslation` hook
2. 使用 `react-i18next/test-utils` 提供的测试工具
3. 优先运行回归测试,确保现有功能不受影响

### Rollback Plan

如果出现严重问题:
1. 在 SettingsPage 添加"关闭多语言"选项(强制使用中文)
2. 通过 feature flag 控制 i18n 功能开启/关闭
3. 最坏情况: 回滚代码到 epic-4 完成状态

---

## Definition of Done

### Feature Complete

- [x] react-i18next 集成并配置完成
- [x] 所有核心页面支持英文和中文
- [x] 所有 UI 组件支持英文和中文
- [x] SettingsPage 显示语言切换器
- [x] 语言偏好持久化到 localStorage
- [x] 默认语言为英文

### Quality Checks

- [x] 英文翻译自然流畅(由 native speaker review)
- [x] 中文翻译与原有文本一致
- [x] 所有翻译 keys 有文档说明
- [x] 单元测试覆盖 i18n 相关逻辑
- [x] E2E 测试验证语言切换流程

### No Regression

- [x] 现有功能正常工作(任务 CRUD, 番茄钟等)
- [x] 性能无明显下降
- [x] UI 布局不受影响
- [x] 所有现有测试通过

---

## Technical Notes

### Recommended i18n Structure

```
apps/web/src/
├── i18n/
│   └── index.ts           # i18n 配置
├── locales/
│   ├── en/
│   │   ├── common.json    # 通用文本(标题、按钮等)
│   │   ├── auth.json      # 认证相关
│   │   ├── tasks.json     # 任务管理
│   │   ├── pomodoro.json  # 番茄钟
│   │   ├── settings.json  # 设置页面
│   │   └── errors.json    # 错误消息
│   └── zh/
│       ├── common.json
│       ├── auth.json
│       ├── tasks.json
│       ├── pomodoro.json
│       ├── settings.json
│       └── errors.json
```

### Example i18n Config

```typescript
// apps/web/src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enCommon from '@/locales/en/common.json'
import zhCommon from '@/locales/zh/common.json'
// ... more imports

i18n
  .use(LanguageDetector) // 自动检测浏览器语言
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        // ... more namespaces
      },
      zh: {
        common: zhCommon,
        // ... more namespaces
      },
    },
    fallbackLng: 'en', // 默认语言
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React 已经处理 XSS
    },
  })

export default i18n
```

### Example Translation File

```json
// locales/en/common.json
{
  "app": {
    "name": "Focus Flow",
    "tagline": "Focus on what matters, one task at a time"
  },
  "navigation": {
    "currentView": "Focus Now",
    "tasks": "All Tasks",
    "dailySummary": "Daily Summary",
    "statistics": "Statistics",
    "settings": "Settings"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "confirm": "Confirm"
  }
}
```

```json
// locales/zh/common.json
{
  "app": {
    "name": "Focus Flow",
    "tagline": "专注于重要的事,一次只做一件事"
  },
  "navigation": {
    "currentView": "专注当下",
    "tasks": "所有任务",
    "dailySummary": "每日总结",
    "statistics": "数据统计",
    "settings": "设置"
  },
  "actions": {
    "save": "保存",
    "cancel": "取消",
    "delete": "删除",
    "edit": "编辑",
    "create": "创建",
    "confirm": "确认"
  }
}
```

---

## Dependencies

- **react-i18next**: ^14.0.0
- **i18next**: ^23.0.0
- **i18next-browser-languagedetector**: ^7.0.0

---

## Success Metrics

### User Experience

- **语言切换成功率**: 100% (无错误)
- **翻译完整性**: 100% (无缺失 keys)
- **切换响应时间**: < 100ms

### Technical Quality

- **测试覆盖率**: ≥ 85%
- **翻译文件大小**: < 50KB (gzip 后)
- **首屏加载时间增加**: < 200ms

---

## Future Enhancements (Out of Scope)

**Not included in this epic:**

- 添加更多语言(如日语、韩语、西班牙语)
- RTL (从右到左) 语言支持(如阿拉伯语)
- 动态翻译加载(懒加载语言包)
- 众包翻译平台集成

这些功能可在 V1.3+ 考虑。

---

## Story Manager Handoff

**请开发详细的用户故事,关键考虑:**

- 这是对现有 React + TypeScript 应用的增强
- 集成点: SettingsPage (语言切换器), 所有页面/组件 (文本国际化)
- 现有模式: 使用 Zustand + localStorage 进行状态管理
- 关键兼容性要求:
  - 不破坏现有功能
  - 翻译文件按模块组织
  - 默认语言为英文
  - 支持动态切换(无需刷新)
- 每个 story 必须包含测试用例更新(mock `useTranslation`)

史诗目标: 提供完整的英文/中文双语支持,提升产品国际化能力,默认语言为英文。
