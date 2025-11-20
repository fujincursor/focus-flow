import { useEffect } from 'react'
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
  const { currentView, updateCurrentViewSettings, resetToDefaults, loadSettings } =
    useSettingsStore()
  const { toast } = useToast()

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleResetDefaults = () => {
    resetToDefaults()
    toast({
      title: '设置已重置',
      description: '所有设置已恢复为默认值',
      duration: 3000,
    })
  }

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">设置</h1>
        <p className="text-muted-foreground mt-2">
          自定义您的 Focus Flow 体验
        </p>
      </div>

      {/* Current View Settings */}
      <Card>
        <CardHeader>
          <CardTitle>当下视图设置</CardTitle>
          <CardDescription>
            自定义"当下能做什么"视图的行为和展示
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Maximum Anytime Tasks */}
          <div className="space-y-2">
            <Label htmlFor="max-anytime-tasks">
              随时可做任务显示数量
            </Label>
            <Select
              value={currentView.maxAnytimeTasks.toString()}
              onValueChange={(value) =>
                updateCurrentViewSettings({
                  maxAnytimeTasks: parseInt(value, 10),
                })
              }
            >
              <SelectTrigger id="max-anytime-tasks">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 5, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} 个任务
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              控制在"随时可做"类别中最多显示多少个任务
            </p>
          </div>

          {/* Auto Switch After Complete */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="auto-switch">完成后自动切换</Label>
              <p className="text-sm text-muted-foreground">
                完成任务后自动显示下一个任务
              </p>
            </div>
            <Switch
              id="auto-switch"
              checked={currentView.autoSwitchAfterComplete}
              onCheckedChange={(checked) =>
                updateCurrentViewSettings({
                  autoSwitchAfterComplete: checked,
                })
              }
            />
          </div>

          {/* Celebration Animation */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="celebration">庆祝动画</Label>
              <p className="text-sm text-muted-foreground">
                完成任务时显示庆祝动画
              </p>
            </div>
            <Switch
              id="celebration"
              checked={currentView.celebrationAnimation}
              onCheckedChange={(checked) =>
                updateCurrentViewSettings({
                  celebrationAnimation: checked,
                })
              }
            />
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="sound">音效</Label>
              <p className="text-sm text-muted-foreground">
                完成任务时播放提示音
              </p>
            </div>
            <Switch
              id="sound"
              checked={currentView.soundEffects}
              onCheckedChange={(checked) =>
                updateCurrentViewSettings({
                  soundEffects: checked,
                })
              }
            />
          </div>

          {/* Prioritize Short Tasks */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="short-tasks">晚上优先短任务</Label>
              <p className="text-sm text-muted-foreground">
                18:00 后优先推荐 30 分钟以内的任务
              </p>
            </div>
            <Switch
              id="short-tasks"
              checked={currentView.prioritizeShortTasks}
              onCheckedChange={(checked) =>
                updateCurrentViewSettings({
                  prioritizeShortTasks: checked,
                })
              }
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleResetDefaults}>
            恢复默认设置
          </Button>
          <p className="text-sm text-muted-foreground">
            设置会自动保存
          </p>
        </CardFooter>
      </Card>

      {/* Future Settings Sections */}
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>通知设置</CardTitle>
          <CardDescription>
            即将推出 - 自定义提醒和通知
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>主题设置</CardTitle>
          <CardDescription>
            即将推出 - 自定义颜色和外观
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
