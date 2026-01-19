import { describe, it, expect } from 'vitest'
import { search, fuzzyScore, normalizeText, levenshteinDistance } from '@/lib/search'

describe('Search System', () => {
  describe('fuzzyScore', () => {
    it('should return 1 for exact match', () => {
      expect(fuzzyScore('ahmet', 'ahmet')).toBe(1)
    })

    it('should handle Turkish characters', () => {
      const score = fuzzyScore('ışık', 'isik')
      expect(score).toBeGreaterThan(0.5)
    })

    it('should return 0 for completely different strings', () => {
      expect(fuzzyScore('abc', 'xyz')).toBe(0)
    })

    it('should be case insensitive', () => {
      expect(fuzzyScore('Ahmet', 'ahmet')).toBe(1)
    })
  })

  describe('normalizeText', () => {
    it('should convert Turkish characters', () => {
      expect(normalizeText('ışık', false)).toBe('isik')
      expect(normalizeText('ŞŞŞ', false)).toBe('sss')
      expect(normalizeText('ÇÇÇ', false)).toBe('ccc')
    })

    it('should preserve original text when diacritic sensitive', () => {
      expect(normalizeText('ışık', true)).toBe('ışık')
    })

    it('should convert to lowercase', () => {
      expect(normalizeText('AHMET', false)).toBe('ahmet')
    })
  })

  describe('levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('test', 'test')).toBe(0)
    })

    it('should return correct distance for similar strings', () => {
      expect(levenshteinDistance('test', 'testt')).toBe(1)
      expect(levenshteinDistance('kedi', 'kedim')).toBe(1)
    })
  })

  describe('search', () => {
    const mockData = [
      { id: '1', name: 'Ahmet Yılmaz', email: 'ahmet@example.com' },
      { id: '2', name: 'Mehmet Öztürk', email: 'mehmet@example.com' },
      { id: '3', name: 'Ayşe Demir', email: 'ayse@example.com' },
    ]

    it('should find exact matches', () => {
      const results = search(mockData, 'Ahmet')
      expect(results).toHaveLength(1)
      expect(results[0].item.name).toBe('Ahmet Yılmaz')
    })

    it('should handle Turkish character search', () => {
      const results = search(mockData, 'ozturk', { diacriticSensitive: false })
      expect(results.length).toBeGreaterThan(0)
    })

    it('should return empty array for no matches', () => {
      const results = search(mockData, 'xyz123')
      expect(results).toHaveLength(0)
    })

    it('should limit results', () => {
      const results = search(mockData, 'ahmet', { limit: 1 })
      expect(results.length).toBeLessThanOrEqual(1)
    })

    it('should search in specific fields', () => {
      const results = search(mockData, 'example.com', { fields: ['email'] })
      expect(results.length).toBe(3)
    })
  })
})
