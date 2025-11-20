import { describe, it, expect } from 'vitest'
import { signUpSchema, signInSchema } from '../auth'

describe('signUpSchema', () => {
  it('should accept valid email and password', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = signUpSchema.safeParse({
      email: 'invalid-email',
      password: 'Password123',
      confirmPassword: 'Password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('should reject weak password (too short)', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'weak',
      confirmPassword: 'weak',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password')
    }
  })

  it('should reject password without uppercase letter', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('should reject password without lowercase letter', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'PASSWORD123',
      confirmPassword: 'PASSWORD123',
    })
    expect(result.success).toBe(false)
  })

  it('should reject password without number', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'Password',
      confirmPassword: 'Password',
    })
    expect(result.success).toBe(false)
  })

  it('should reject mismatched passwords', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Different123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('confirmPassword')
    }
  })

  it('should reject empty email', () => {
    const result = signUpSchema.safeParse({
      email: '',
      password: 'Password123',
      confirmPassword: 'Password123',
    })
    expect(result.success).toBe(false)
  })
})

describe('signInSchema', () => {
  it('should accept valid email and password', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: 'anypassword',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'invalid-email',
      password: 'anypassword',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty password', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })
})
