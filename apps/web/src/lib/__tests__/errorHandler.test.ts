import { describe, it, expect } from 'vitest'
import { handleSupabaseError, getUserFriendlyMessage } from '../errorHandler'
import { AuthError, DatabaseError } from '@/types/errors'

describe('errorHandler', () => {
  it('should convert PGRST116 to AuthError', () => {
    const error = { code: 'PGRST116', message: 'Unauthorized' } as any
    const result = handleSupabaseError(error)
    expect(result).toBeInstanceOf(AuthError)
    expect(result.code).toBe('AUTH_ERROR')
  })

  it('should convert 23505 to DatabaseError with duplicate message', () => {
    const error = { code: '23505', message: 'Duplicate key' } as any
    const result = handleSupabaseError(error)
    expect(result).toBeInstanceOf(DatabaseError)
    expect(result.message).toBe('Duplicate entry')
  })

  it('should convert other errors to DatabaseError', () => {
    const error = { code: 'UNKNOWN', message: 'Some error' } as any
    const result = handleSupabaseError(error)
    expect(result).toBeInstanceOf(DatabaseError)
    expect(result.message).toBe('Some error')
  })

  it('should return user-friendly message for AuthError', () => {
    const error = new AuthError('Test error')
    const message = getUserFriendlyMessage(error)
    expect(message).toBe('登录已过期，请重新登录')
  })

  it('should return user-friendly message for DatabaseError', () => {
    const error = new DatabaseError('Test error')
    const message = getUserFriendlyMessage(error)
    expect(message).toBe('数据保存失败，请稍后重试')
  })

  it('should return generic message for unknown errors', () => {
    const error = new Error('Unknown error')
    const message = getUserFriendlyMessage(error)
    expect(message).toBe('发生未知错误，请稍后重试')
  })
})
