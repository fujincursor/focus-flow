import { NavLink } from 'react-router-dom'
import { Home, CheckSquare, Calendar, BarChart3, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const navItems = [
  {
    title: '当下任务',
    href: '/',
    icon: Home,
    description: '专注于此刻最重要的事',
  },
  {
    title: '所有任务',
    href: '/tasks',
    icon: CheckSquare,
    description: '查看和管理所有任务',
  },
  {
    title: '每日总结',
    href: '/daily-summary',
    icon: Calendar,
    description: '回顾每日完成情况',
  },
  {
    title: '数据统计',
    href: '/statistics',
    icon: BarChart3,
    description: '查看长期进度趋势',
  },
]

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  return (
    <>
      {/* 移动端遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 border-r bg-background transition-transform duration-300 md:sticky md:top-16 md:z-0 md:h-[calc(100vh-4rem)] md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* 移动端 Header */}
          <div className="flex h-16 items-center justify-between border-b px-4 md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">F</span>
              </div>
              <h2 className="text-lg font-semibold">菜单</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map(item => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => {
                  // 移动端点击后关闭侧边栏
                  if (window.innerWidth < 768) {
                    onClose?.()
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="h-5 w-5 shrink-0" />
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      {!isActive && (
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      )}
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <Separator />

          {/* 底部信息 */}
          <div className="p-4">
            <p className="text-xs text-muted-foreground">Focus Flow v1.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
