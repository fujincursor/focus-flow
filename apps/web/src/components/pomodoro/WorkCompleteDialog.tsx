import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface WorkCompleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartRest: () => void
  onSkipRest: () => void
}

export function WorkCompleteDialog({
  open,
  onOpenChange,
  onStartRest,
  onSkipRest,
}: WorkCompleteDialogProps) {
  const { t } = useTranslation('pomodoro')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {t('workComplete.title')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('workComplete.description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            onClick={onStartRest}
            className="w-full sm:w-auto"
            size="lg"
          >
            {t('workComplete.takeBreak')}
          </Button>
          <Button
            onClick={onSkipRest}
            variant="outline"
            className="w-full sm:w-auto"
            size="lg"
          >
            {t('workComplete.continueWorking')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
