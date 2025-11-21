# Story 2.5: Keyboard Shortcuts - Brownfield Enhancement

**Story ID:** Story 2.5
**Epic:** Epic 2 - 任务管理增强功能
**Type:** Brownfield Enhancement
**Priority:** P2
**Estimated Effort:** 4-5 hours
**Status:** Ready for Development

---

## User Story

**作为** Focus Flow 高效用户，
**我想要** 使用键盘快捷键快速执行常用操作，
**以便** 提高工作效率，减少鼠标点击次数。

---

## Story Context

### Existing System Integration

- **Integrates with:** 全局应用层，所有任务相关组件
- **Technology:** React + Custom Hook (`useKeyboardShortcuts`)
- **Follows pattern:** Event listener pattern, React hooks
- **Touch points:**
  - 全局快捷键监听 (App.tsx)
  - TasksPage, CurrentViewPage
  - Create/Edit/Delete 操作

---

## Acceptance Criteria

### Functional Requirements

1. **全局快捷键**
   - `Ctrl/Cmd + N`: 打开创建任务对话框
   - `Ctrl/Cmd + K`: 聚焦搜索框 (如果存在)
   - `Ctrl/Cmd + /`: 显示快捷键帮助面板
   - `Escape`: 关闭当前打开的对话框/面板

2. **任务列表快捷键** (在 TasksPage)
   - `↑ / ↓`: 在任务列表中导航 (选中上/下一个任务)
   - `Enter`: 编辑选中的任务
   - `Space`: 切换选中任务的完成状态
   - `Delete / Backspace`: 删除选中的任务 (显示确认对话框)

3. **对话框内快捷键**
   - `Ctrl/Cmd + Enter`: 提交表单 (创建/编辑任务)
   - `Escape`: 关闭对话框

4. **快捷键帮助面板**
   - 按 `Ctrl/Cmd + /` 显示所有可用快捷键
   - 按 `Escape` 或再次按 `Ctrl/Cmd + /` 关闭
   - 显示分类的快捷键列表（全局、任务操作等）
   - 根据操作系统显示正确的修饰键 (Mac: Cmd, Windows/Linux: Ctrl)

### Integration Requirements

5. **不冲突现有功能**
   - 快捷键不干扰输入框正常输入
   - 在输入框聚焦时禁用任务列表导航快捷键
   - 浏览器默认快捷键优先 (如 Ctrl+S)

6. **国际化**
   - 快捷键帮助面板文本支持中英文
   - 快捷键提示在 UI 中显示 (如按钮 tooltip)

### Quality Requirements

7. **用户体验**
   - 快捷键响应迅速 (< 100ms)
   - 视觉反馈：选中的任务高亮显示
   - 快捷键提示易于发现（设置页面说明 + 帮助面板）

8. **可访问性**
   - 快捷键符合 ARIA 最佳实践
   - 屏幕阅读器用户可以通过 aria-keyshortcuts 属性了解快捷键

---

## Technical Implementation

### 1. Create useKeyboardShortcuts Hook

```typescript
// apps/web/src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react'

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: (event: KeyboardEvent) => void
  preventDefault?: boolean
  enabled?: boolean
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue

        const isCtrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey
        const isShiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const isAltMatch = shortcut.alt ? event.altKey : !event.altKey
        const isKeyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

        if (isCtrlMatch && isShiftMatch && isAltMatch && isKeyMatch) {
          if (shortcut.preventDefault) {
            event.preventDefault()
          }
          shortcut.handler(event)
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
```

### 2. Global Shortcuts in App.tsx

```typescript
// apps/web/src/App.tsx
import { useState } from 'react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { ShortcutsHelpDialog } from '@/components/shortcuts/ShortcutsHelpDialog'

export function App() {
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)

  useKeyboardShortcuts([
    {
      key: '/',
      ctrl: true,
      handler: () => setShowShortcutsHelp(prev => !prev),
      preventDefault: true,
    },
    {
      key: 'Escape',
      handler: () => {
        // Close any open dialogs
        setShowShortcutsHelp(false)
      },
    },
  ])

  return (
    <>
      {/* Existing app content */}
      <ShortcutsHelpDialog
        open={showShortcutsHelp}
        onOpenChange={setShowShortcutsHelp}
      />
    </>
  )
}
```

### 3. TasksPage Shortcuts

```typescript
// apps/web/src/pages/TasksPage.tsx
import { useState } from 'react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export function TasksPage() {
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { tasks } = useTaskStore()

  // Check if input is focused
  const isInputFocused = () => {
    const activeEl = document.activeElement
    return activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA'
  }

  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      handler: () => setShowCreateDialog(true),
      preventDefault: true,
    },
    {
      key: 'ArrowDown',
      handler: () => {
        if (!isInputFocused()) {
          setSelectedTaskIndex(prev => Math.min(prev + 1, tasks.length - 1))
        }
      },
      enabled: !isInputFocused(),
    },
    {
      key: 'ArrowUp',
      handler: () => {
        if (!isInputFocused()) {
          setSelectedTaskIndex(prev => Math.max(prev - 1, 0))
        }
      },
      enabled: !isInputFocused(),
    },
    {
      key: 'Enter',
      handler: () => {
        if (!isInputFocused()) {
          // Open edit dialog for selected task
          const selectedTask = tasks[selectedTaskIndex]
          if (selectedTask) {
            openEditDialog(selectedTask)
          }
        }
      },
      enabled: !isInputFocused(),
    },
    {
      key: ' ', // Space
      handler: () => {
        if (!isInputFocused()) {
          const selectedTask = tasks[selectedTaskIndex]
          if (selectedTask) {
            toggleTaskCompletion(selectedTask.id)
          }
        }
      },
      preventDefault: true,
      enabled: !isInputFocused(),
    },
    {
      key: 'Delete',
      handler: () => {
        if (!isInputFocused()) {
          const selectedTask = tasks[selectedTaskIndex]
          if (selectedTask) {
            openDeleteDialog(selectedTask)
          }
        }
      },
      enabled: !isInputFocused(),
    },
  ])

  // ... rest of component
}
```

### 4. Shortcuts Help Dialog

```typescript
// apps/web/src/components/shortcuts/ShortcutsHelpDialog.tsx
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
const modKey = isMac ? '⌘' : 'Ctrl'

export function ShortcutsHelpDialog({ open, onOpenChange }) {
  const { t } = useTranslation('shortcuts')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div>
            <h3 className="font-semibold mb-2">{t('global.title')}</h3>
            <div className="space-y-1 text-sm">
              <ShortcutRow keys={[modKey, 'N']} description={t('global.newTask')} />
              <ShortcutRow keys={[modKey, 'K']} description={t('global.search')} />
              <ShortcutRow keys={[modKey, '/']} description={t('global.help')} />
              <ShortcutRow keys={['Esc']} description={t('global.close')} />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">{t('tasks.title')}</h3>
            <div className="space-y-1 text-sm">
              <ShortcutRow keys={['↑', '↓']} description={t('tasks.navigate')} />
              <ShortcutRow keys={['Enter']} description={t('tasks.edit')} />
              <ShortcutRow keys={['Space']} description={t('tasks.toggle')} />
              <ShortcutRow keys={['Del']} description={t('tasks.delete')} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ShortcutRow({ keys, description }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  )
}
```

### 5. Add Translation Keys

```json
// zh/shortcuts.json
{
  "title": "键盘快捷键",
  "global": {
    "title": "全局快捷键",
    "newTask": "创建新任务",
    "search": "搜索任务",
    "help": "显示快捷键帮助",
    "close": "关闭对话框"
  },
  "tasks": {
    "title": "任务操作",
    "navigate": "导航任务列表",
    "edit": "编辑选中任务",
    "toggle": "切换完成状态",
    "delete": "删除选中任务"
  }
}
```

---

## Definition of Done

- [x] useKeyboardShortcuts hook created
- [x] Global shortcuts implemented (Ctrl+N, Ctrl+/, Esc)
- [x] Task list navigation shortcuts (↑↓ Enter Space Delete)
- [x] Shortcuts help dialog created
- [x] Correct mod key shown (Cmd/Ctrl based on OS)
- [x] Shortcuts don't interfere with input fields
- [x] Internationalization (中/英) implemented
- [x] Visual feedback for selected task
- [x] aria-keyshortcuts attributes added
- [x] Unit tests for hook
- [x] No regression in existing functionality

---

## Risk Mitigation

**Primary Risk:** Shortcuts conflict with browser/OS shortcuts

**Mitigation:**
- Avoid common browser shortcuts (Ctrl+S, Ctrl+R, etc.)
- Use preventDefault carefully
- Test on Windows, Mac, Linux

**Rollback:** Remove keyboard shortcuts, minimal impact

---

## References

- [Web Keyboard Shortcuts Best Practices](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [ARIA keyshortcuts](https://www.w3.org/TR/wai-aria-1.1/#aria-keyshortcuts)
