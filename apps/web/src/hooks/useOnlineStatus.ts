import { useState, useEffect } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import { useToast } from '@/components/ui/use-toast'

/**
 * Hook for detecting online/offline status and handling reconnection
 *
 * Features:
 * - Detects network status changes
 * - Shows toast notifications on status change
 * - Auto-syncs tasks when coming back online
 * - Returns current online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { fetchTasks } = useTaskStore()
  const { toast } = useToast()

  useEffect(() => {
    const handleOnline = () => {
      console.log('[Network] Connection restored')
      setIsOnline(true)

      toast({
        title: '网络已连接',
        description: '正在同步数据...',
        duration: 3000,
      })

      // Sync tasks when coming back online
      fetchTasks()
    }

    const handleOffline = () => {
      console.log('[Network] Connection lost')
      setIsOnline(false)

      toast({
        title: '网络连接已断开',
        description: '应用将使用离线模式',
        variant: 'destructive',
        duration: 5000,
      })
    }

    // Listen for online/offline events
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup listeners
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [fetchTasks, toast])

  return isOnline
}
