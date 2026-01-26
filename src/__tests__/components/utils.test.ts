import { describe, it, expect } from 'vitest'
import {
  cn,
  formatDate,
  formatDateShort,
  formatDateTime,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatPhone,
  formatTCKN,
  truncate,
  capitalize,
  getFullName,
  formatFileSize,
  slugify,
  generateId,
  statusColors,
  statusLabels,
} from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      const condition = false
      expect(cn('foo', condition ? 'bar' : '', 'baz')).toBe('foo baz')
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

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2024-01-15')
      expect(result).toContain('Ocak')
      expect(result).toContain('2024')
    })

    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00')
      const result = formatDate(date)
      expect(result).toContain('Ocak')
    })
  })

  describe('formatDateShort', () => {
    it('should format date in short format', () => {
      const result = formatDateShort('2024-01-15')
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/)
    })
  })

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const result = formatDateTime('2024-01-15T14:30:00')
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}/)
    })
  })

  describe('formatCurrency', () => {
    it('should format TRY currency', () => {
      const result = formatCurrency(1234.56)
      expect(result).toBe('₺1.234,56')
    })

    it('should format USD currency (with Turkish locale formatting)', () => {
      const result = formatCurrency(1234.56, 'USD')
      // tr-TR locale uses . as thousand separator, , as decimal
      expect(result).toBe('$1.234,56')
    })

    it('should handle zero amount', () => {
      const result = formatCurrency(0)
      expect(result).toBe('₺0')
    })
  })

  describe('formatNumber', () => {
    it('should format number with thousand separators', () => {
      expect(formatNumber(1000000)).toBe('1.000.000')
      expect(formatNumber(1234)).toBe('1.234')
    })
  })

  describe('formatPercent', () => {
    it('should format percentage', () => {
      expect(formatPercent(0.1234)).toBe('%0.1')
      // 0.5.toFixed(0) rounds to 1
      expect(formatPercent(0.5, 0)).toBe('%1')
    })
  })

  describe('formatPhone', () => {
    it('should format Turkish phone number correctly (11 digits with leading 0)', () => {
      // Leading 0 is stripped from area code in the formatted output
      expect(formatPhone('05551234567')).toBe('(555) 123 45 67')
    })

    it('should format Turkish phone number (10 digits without leading 0)', () => {
      expect(formatPhone('5551234567')).toBe('(555) 123 45 67')
    })

    it('should return phone unchanged if format does not match', () => {
      // +905551234567 has 12 digits after cleaning, doesn't match patterns
      expect(formatPhone('+905551234567')).toBe('+905551234567')
    })

    it('should return dash for null', () => {
      expect(formatPhone(null)).toBe('-')
      expect(formatPhone(undefined)).toBe('-')
    })
  })

  describe('formatTCKN', () => {
    it('should format Turkish ID number', () => {
      expect(formatTCKN('12345678901')).toBe('123 456 789 01')
    })

    it('should return dash for null', () => {
      expect(formatTCKN(null)).toBe('-')
    })
  })

  describe('truncate', () => {
    it('should truncate long text', () => {
      // 'Hello World' (11 chars) with maxLength 8: takes 5 chars + '...'
      expect(truncate('Hello World', 8)).toBe('Hello...')
    })

    it('should not truncate short text', () => {
      expect(truncate('Hi', 5)).toBe('Hi')
    })

    it('should return exact text at maxLength', () => {
      expect(truncate('Hi', 2)).toBe('Hi')
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter of each word', () => {
      expect(capitalize('hello world')).toBe('Hello World')
      expect(capitalize('HELLO')).toBe('Hello')
    })
  })

  describe('getFullName', () => {
    it('should combine first and last name', () => {
      expect(getFullName('Ahmet', 'Yılmaz')).toBe('Ahmet Yılmaz')
    })

    it('should return only first name if last name missing', () => {
      expect(getFullName('Ahmet', null)).toBe('Ahmet')
    })

    it('should return dash for both null', () => {
      expect(getFullName(null, null)).toBe('-')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })
  })

  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Çalışma')).toBe('calisma')
      expect(slugify('foo bar baz')).toBe('foo-bar-baz')
    })
  })

  describe('generateId', () => {
    it('should generate ID of specified length', () => {
      const id = generateId(8)
      expect(id).toHaveLength(8)
    })

    it('should generate different IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('statusColors', () => {
    it('should have color for active status', () => {
      expect(statusColors['active']).toContain('success')
    })

    it('should have color for pending status', () => {
      expect(statusColors['pending']).toContain('warning')
    })

    it('should have color for completed status', () => {
      expect(statusColors['completed']).toContain('success')
    })
  })

  describe('statusLabels', () => {
    it('should have Turkish label for active status', () => {
      expect(statusLabels['active']).toBe('Aktif')
    })

    it('should have Turkish label for pending status', () => {
      expect(statusLabels['pending']).toBe('Beklemede')
    })

    it('should have Turkish label for completed status', () => {
      expect(statusLabels['completed']).toBe('Tamamlandı')
    })
  })
})
