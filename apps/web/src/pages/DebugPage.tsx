import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ConnectionTest {
  session: unknown
  sessionError?: string
  queryResult: unknown
  queryError?: string
}

export function DebugPage() {
  const [envCheck] = useState({
    url: import.meta.env.VITE_SUPABASE_URL,
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  })
  const [connectionTest, setConnectionTest] = useState<ConnectionTest | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...')

      // Test 1: Get session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      console.log('Session:', sessionData, sessionError)

      // Test 2: Try to query a simple table (will fail if not authenticated, but should not CORS)
      const { data, error } = await supabase.from('tasks').select('count').limit(1)
      console.log('Query test:', data, error)

      setConnectionTest({
        session: sessionData,
        sessionError: sessionError?.message,
        queryResult: data,
        queryError: error?.message,
      })
    } catch (err) {
      console.error('Connection test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Supabase 连接诊断</h1>

        {/* Environment Variables */}
        <div className="rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">环境变量检查</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <strong>VITE_SUPABASE_URL:</strong>{' '}
              <span className={envCheck.url ? 'text-green-600' : 'text-red-600'}>
                {envCheck.url || '❌ 未设置'}
              </span>
            </div>
            <div>
              <strong>VITE_SUPABASE_ANON_KEY:</strong>{' '}
              <span className={envCheck.hasKey ? 'text-green-600' : 'text-red-600'}>
                {envCheck.hasKey ? '✅ 已设置' : '❌ 未设置'}
              </span>
            </div>
          </div>
        </div>

        {/* Connection Test */}
        <div className="rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">连接测试</h2>
          {error && (
            <div className="mb-4 rounded bg-red-100 p-4 text-red-800">
              <strong>错误:</strong> {error}
            </div>
          )}
          <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs">
            {JSON.stringify(connectionTest, null, 2)}
          </pre>
          <button
            onClick={testConnection}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            重新测试
          </button>
        </div>

        {/* Console Instructions */}
        <div className="rounded-lg border border-yellow-400 bg-yellow-50 p-6">
          <h2 className="mb-2 text-xl font-semibold text-yellow-800">🔍 检查浏览器控制台</h2>
          <p className="mb-2 text-yellow-800">
            请按 <kbd className="rounded bg-yellow-200 px-2 py-1 font-mono">F12</kbd> 打开开发者工具，查看：
          </p>
          <ul className="list-inside list-disc space-y-1 text-yellow-800">
            <li>Console 标签中的错误信息（红色）</li>
            <li>Network 标签中失败的请求（红色）</li>
            <li>点击失败的请求查看详细错误</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
