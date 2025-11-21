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
