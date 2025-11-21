import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/stores/settingsStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export function SettingsPage() {
  const { t, i18n } = useTranslation('settings')
  const {
    pomodoro,
    updatePomodoroSettings,
    resetToDefaults,
    loadSettings,
  } = useSettingsStore()
  const { toast } = useToast()

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleResetDefaults = () => {
    resetToDefaults()
    toast({
      title: t('messages.resetSuccess'),
      duration: 3000,
    })
  }

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language)
  }

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('page.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('page.subtitle')}
        </p>
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.appearance')}</CardTitle>
          <CardDescription>
            {t('appearance.languageDescription')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="language">{t('appearance.language')}</Label>
            <Select
              value={i18n.language}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pomodoro Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.pomodoro')}</CardTitle>
          <CardDescription>
            {t('pomodoro.workDurationDescription')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Work Duration */}
          <div className="space-y-2">
            <Label htmlFor="work-duration">{t('pomodoro.workDuration')}</Label>
            <Select
              value={pomodoro.pomodoroWorkDuration.toString()}
              onValueChange={(value) =>
                updatePomodoroSettings({
                  pomodoroWorkDuration: parseInt(value, 10),
                })
              }
            >
              <SelectTrigger id="work-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[15, 20, 25, 30, 45, 60].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {t('pomodoro.minutes')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t('pomodoro.workDurationDescription')}
            </p>
          </div>

          {/* Rest Duration */}
          <div className="space-y-2">
            <Label htmlFor="rest-duration">{t('pomodoro.shortBreak')}</Label>
            <Select
              value={pomodoro.pomodoroRestDuration.toString()}
              onValueChange={(value) =>
                updatePomodoroSettings({
                  pomodoroRestDuration: parseInt(value, 10),
                })
              }
            >
              <SelectTrigger id="rest-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 5, 10, 15, 20].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {t('pomodoro.minutes')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t('pomodoro.shortBreakDescription')}
            </p>
          </div>

          {/* Sound Enabled */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="pomodoro-sound">{t('notifications.sound')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.soundDescription')}
              </p>
            </div>
            <Switch
              id="pomodoro-sound"
              checked={pomodoro.pomodoroSoundEnabled}
              onCheckedChange={(checked) =>
                updatePomodoroSettings({
                  pomodoroSoundEnabled: checked,
                })
              }
            />
          </div>

          {/* Auto Start Rest */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="auto-start-rest">{t('pomodoro.autoStartBreaks')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('pomodoro.autoStartBreaksDescription')}
              </p>
            </div>
            <Switch
              id="auto-start-rest"
              checked={pomodoro.autoStartRest}
              onCheckedChange={(checked) =>
                updatePomodoroSettings({
                  autoStartRest: checked,
                })
              }
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleResetDefaults}>
            {t('actions.reset')}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t('messages.saveSuccess')}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
