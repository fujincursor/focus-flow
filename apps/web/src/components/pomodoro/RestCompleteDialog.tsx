import { useTranslation } from 'react-i18next'
import { Coffee } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface RestCompleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartWork: () => void
  onFinish: () => void
}

export function RestCompleteDialog({
  open,
  onOpenChange,
  onStartWork,
  onFinish,
}: RestCompleteDialogProps) {
  const { t } = useTranslation('pomodoro')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Coffee className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {t('restComplete.title')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('restComplete.description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            onClick={onStartWork}
            className="w-full sm:w-auto"
            size="lg"
          >
            {t('restComplete.startWork')}
          </Button>
          <Button
            onClick={onFinish}
            variant="outline"
            className="w-full sm:w-auto"
            size="lg"
          >
            {t('restComplete.skipWork')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
