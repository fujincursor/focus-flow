import { describe, it, expect } from 'vitest'
import { formatDuration, debounce, getToday } from '../utils'

describe('utils', () => {
  describe('formatDuration', () => {
    it('should format duration with only minutes', () => {
      expect(formatDuration(30)).toBe('30分钟')
      expect(formatDuration(45)).toBe('45分钟')
    })

    it('should format duration with only hours', () => {
      expect(formatDuration(60)).toBe('1小时')
      expect(formatDuration(120)).toBe('2小时')
    })

    it('should format duration with hours and minutes', () => {
      expect(formatDuration(90)).toBe('1小时30分钟')
      expect(formatDuration(150)).toBe('2小时30分钟')
    })

    it('should handle zero minutes', () => {
      expect(formatDuration(0)).toBe('0分钟')
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let count = 0
      const increment = debounce(() => count++, 100)

      increment()
      increment()
      increment()

      // Should not have been called yet
      expect(count).toBe(0)

      // Wait for debounce delay
      await new Promise((resolve) => setTimeout(resolve, 150))

      // Should have been called once
      expect(count).toBe(1)
    })

    it('should pass arguments to debounced function', async () => {
      let result = 0
      const add = debounce((a: number, b: number) => {
        result = a + b
      }, 100)

      add(2, 3)

      await new Promise((resolve) => setTimeout(resolve, 150))

      expect(result).toBe(5)
    })
  })

  describe('getToday', () => {
    it('should return today in YYYY-MM-DD format', () => {
      const today = getToday()
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)

      // Verify it's actually today
      const expected = new Date().toISOString().split('T')[0]
      expect(today).toBe(expected)
    })
  })
})
