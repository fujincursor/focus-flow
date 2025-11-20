import { AppError, AuthError, DatabaseError } from '@/types/errors'
import { PostgrestError } from '@supabase/supabase-js'

export function handleSupabaseError(error: PostgrestError): AppError {
  // 根据PostgreSQL错误码分类
  if (error.code === 'PGRST116') {
    return new AuthError('Unauthorized access', error)
  }

  if (error.code === '23505') {
    return new DatabaseError('Duplicate entry', error)
  }

  return new DatabaseError(error.message, error)
}

export function logError(error: Error): void {
  if (import.meta.env.MODE === 'development') {
    console.error('Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError && {
        code: error.code,
        details: error.details,
      }),
    })
  } else {
    // 生产环境只记录关键信息，不暴露敏感数据
    console.error('Error:', {
      name: error.name,
      message: error.message,
      ...(error instanceof AppError && { code: error.code }),
    })
  }
}

export function getUserFriendlyMessage(error: Error): string {
  if (error instanceof AuthError) {
    return '登录已过期，请重新登录'
  }

  if (error instanceof DatabaseError) {
    return '数据保存失败，请稍后重试'
  }

  if (error instanceof AppError) {
    return error.message
  }

  return '发生未知错误，请稍后重试'
}
