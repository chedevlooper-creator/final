import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })

    it('should handle Tailwind conflicts', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
    })

    it('should return empty string for no arguments', () => {
      expect(cn()).toBe('')
    })

    it('should handle undefined and null', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
    })
  })
})
