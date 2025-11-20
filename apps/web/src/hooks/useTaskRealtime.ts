import { useEffect, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTaskStore } from '@/stores/taskStore'
import { useToast } from '@/components/ui/use-toast'
import { useDebouncedCallback } from 'use-debounce'

/**
 * Hook for managing real-time task synchronization with Supabase
 *
 * Features:
 * - Subscribes to task changes (INSERT, UPDATE, DELETE)
 * - Debounced task refresh to prevent excessive updates
 * - Distinguishes between local and remote updates
 * - Shows toast notifications for remote changes
 * - Automatic cleanup on unmount
 */
export function useTaskRealtime() {
  const { user } = useAuthStore()
  const { fetchTasks, setOnLocalUpdate } = useTaskStore()
  const { toast } = useToast()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const recentLocalUpdatesRef = useRef<Map<string, number>>(new Map())

  // Debounced fetch to prevent excessive updates
  const debouncedFetchTasks = useDebouncedCallback(
    () => {
      fetchTasks()
    },
    100
  )

  /**
   * Mark a task as recently updated locally
   * Used to distinguish between local and remote updates
   */
  const markLocalUpdate = (taskId: string) => {
    recentLocalUpdatesRef.current.set(taskId, Date.now())
    // Clear after 5 seconds
    setTimeout(() => {
      recentLocalUpdatesRef.current.delete(taskId)
    }, 5000)
  }

  /**
   * Check if a task update was made locally (within last 5 seconds)
   */
  const isLocalUpdate = (taskId: string): boolean => {
    const timestamp = recentLocalUpdatesRef.current.get(taskId)
    if (!timestamp) return false

    // Consider it local if within 5 seconds
    return Date.now() - timestamp < 5000
  }

  // Register local update callback with taskStore
  useEffect(() => {
    setOnLocalUpdate(markLocalUpdate)
    return () => {
      setOnLocalUpdate(null)
    }
  }, [setOnLocalUpdate])

  useEffect(() => {
    if (!user) return

    // Subscribe to task changes for current user
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[Realtime] Task change detected:', payload.eventType, payload)

          const { eventType, new: newRecord, old: oldRecord } = payload

          switch (eventType) {
            case 'INSERT': {
              const taskId = (newRecord as { id?: string })?.id

              // Check if this was a local insert (we just created it)
              if (taskId && isLocalUpdate(taskId)) {
                console.log('[Realtime] Ignoring local INSERT')
                return
              }

              toast({
                title: '新任务已创建',
                description: '检测到新任务，正在同步...',
                duration: 3000,
              })
              debouncedFetchTasks()
              break
            }

            case 'UPDATE': {
              const taskId = (newRecord as { id?: string })?.id

              // Check if this was a local update (we just modified it)
              if (taskId && isLocalUpdate(taskId)) {
                console.log('[Realtime] Ignoring local UPDATE')
                return
              }

              toast({
                title: '任务已更新',
                description: '任务已在其他设备更新',
                duration: 3000,
              })
              debouncedFetchTasks()
              break
            }

            case 'DELETE': {
              const taskId = (oldRecord as { id?: string })?.id

              // Check if this was a local delete
              if (taskId && isLocalUpdate(taskId)) {
                console.log('[Realtime] Ignoring local DELETE')
                return
              }

              toast({
                title: '任务已删除',
                description: '任务已在其他设备删除',
                duration: 3000,
              })
              debouncedFetchTasks()
              break
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status)

        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Successfully subscribed to task changes')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error')
          toast({
            title: '实时同步错误',
            description: '无法建立实时连接，请刷新页面',
            variant: 'destructive',
            duration: 5000,
          })
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] Subscription timed out')
        }
      })

    channelRef.current = channel

    // Cleanup subscription on unmount
    return () => {
      console.log('[Realtime] Cleaning up subscription')
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user, toast, debouncedFetchTasks])
}
