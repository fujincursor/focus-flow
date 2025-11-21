# Translation Files Documentation

## Structure

Translation files are organized by language and module:

```
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
```

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

Add the same key to both `en/{module}.json` and `zh/{module}.json`.

**Example: Adding a new button text**

```json
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
```

### Step 3: Use in Component

Import the translation hook and use the `t()` function:

```typescript
import { useTranslation } from 'react-i18next'

export function MyComponent() {
  const { t } = useTranslation('common')

  return (
    <button>{t('actions.archive')}</button>
    // Renders: "Archive" (en) or "归档" (zh)
  )
}
```

## Key Naming Conventions

- Use **dot notation** for nested keys: `tasks.createButton`
- Use **camelCase** for key names: `completionRate`, not `completion_rate`
- Be **descriptive**: `tasks.createButton` is better than `btn1`
- Group related keys: Put all button text under `actions`

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

```typescript
// In browser console
i18n.changeLanguage('en')  // Switch to English
i18n.changeLanguage('zh')  // Switch to Chinese
```

Or use the language switcher in Settings page (once implemented in Story 5.3).
