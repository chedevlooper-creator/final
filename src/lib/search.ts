/**
 * Advanced Search System v1.0.0
 * 
 * Kapsamlı arama kütüphanesi:
 * - Fuzzy search (yaklaşık eşleşme)
 * - Full-text search
 * - Multi-field search
 * - Filter ve sort
 * - Cache mekanizması
 * - Türkçe karakter desteği
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SearchOptions {
  fields?: string[];           // Hangi alanlarda aranacağı
  fuzzy?: boolean;             // Yaklaşık arama (default: true)
  threshold?: number;          // Eşleşme eşiği 0-1 (default: 0.6)
  caseSensitive?: boolean;     // Büyük/küçük harf duyarlı (default: false)
  diacriticSensitive?: boolean; // Türkçe karakter duyarlı (default: false)
  limit?: number;              // Sonuç limiti
  sortBy?: SearchSortField;    // Sıralama alanı
  sortOrder?: 'asc' | 'desc';  // Sıralama yönü
}

export interface SearchSortField {
  field: string;
  type: 'string' | 'number' | 'date';
}

export interface SearchResult<T> {
  item: T;
  score: number;               // Eşleşme skoru 0-1
  matches: SearchMatch[];      // Eşleşme detayları
}

export interface SearchMatch {
  field: string;
  value: string;
  indices: number[];           // Eşleşen karakter pozisyonları
  highlighted?: string;        // Highlight edilmiş değer
}

export interface FilterOptions<T> {
  field: keyof T;
  operator: FilterOperator;
  value: any;
}

export type FilterOperator = 
  | 'eq'        // Eşit
  | 'ne'        // Eşit değil
  | 'gt'        // Büyük
  | 'gte'       // Büyük veya eşit
  | 'lt'        // Küçük
  | 'lte'       // Küçük veya eşit
  | 'contains'  // İçerir
  | 'startsWith' // İle başlar
  | 'endsWith'  // İle biter
  | 'in'        // İçinde (array)
  | 'between';  // Arasında

// ============================================================================
// SEARCH CACHE
// ============================================================================

interface CacheEntry<T> {
  results: SearchResult<T>[];
  timestamp: number;
}

class SearchCache {
  private cache = new Map<string, CacheEntry<any>>();
  private ttl = 5 * 60 * 1000; // 5 dakika

  set<T>(key: string, results: SearchResult<T>[]): void {
    this.cache.set(key, {
      results,
      timestamp: Date.now()
    });
  }

  get<T>(key: string): SearchResult<T>[] | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // TTL kontrolü
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.results;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const searchCache = new SearchCache();

// ============================================================================
// TEXT NORMALIZATION
// ============================================================================

/**
 * Türkçe karakter normalization
 */
function normalizeText(text: string, diacriticSensitive: boolean): string {
  if (diacriticSensitive) return text;
  
  return text
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[şŞ]/g, 's')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[âÂ]/g, 'a')
    .replace(/[îÎ]/g, 'i')
    .replace(/[ûÛ]/g, 'u');
}

/**
 * Tokenize - metni kelimelere ayır
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // Sadece harf ve rakam
    .split(/\s+/)
    .filter(token => token.length > 0);
}

// ============================================================================
// FUZZY SEARCH (Levenshtein Distance)
// ============================================================================

/**
 * Levenshtein mesafesi hesapla
 * İki string arasındaki minimum düzenleme sayısı
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Matrix oluştur
  const matrix: number[][] = [];
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Doldur
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Silme
        matrix[i][j - 1] + 1,      // Ekleme
        matrix[i - 1][j - 1] + cost // Değiştirme
      );
    }
  }
  
  return matrix[len1][len2];
}

/**
 * Fuzzy match skoru hesapla (0-1 arası)
 */
function fuzzyScore(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);
  
  if (maxLen === 0) return 1;
  
  // Skor: 1 (tam eşleşme) - 0 (hiç eşleşme yok)
  const score = 1 - distance / maxLen;
  return Math.max(0, score);
}

/**
 * Tüm eşleşme pozisyonlarını bul
 */
function findMatchIndices(text: string, query: string): number[] {
  const indices: number[] = [];
  const normalizedText = normalizeText(text, false);
  const normalizedQuery = normalizeText(query, false);
  
  let pos = normalizedText.indexOf(normalizedQuery);
  while (pos !== -1) {
    indices.push(...Array.from({ length: normalizedQuery.length }, (_, i) => pos + i));
    pos = normalizedText.indexOf(normalizedQuery, pos + 1);
  }
  
  return indices;
}

// ============================================================================
// SEARCH ENGINE
// ============================================================================

/**
 * Alan değerini string'e çevir
 */
function getFieldValue(item: any, field: string): string {
  const value = field.split('.').reduce((obj, key) => obj?.[key], item);
  
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  if (value instanceof Date) return value.toISOString();
  
  return JSON.stringify(value);
}

/**
 * Tek bir item'da ara
 */
function searchItem<T>(
  item: T,
  query: string,
  options: SearchOptions
): SearchResult<T> | null {
  const { 
    fields = Object.keys(item as object), 
    threshold = 0.6,
    caseSensitive = false,
    diacriticSensitive = false
  } = options;
  
  let maxScore = 0;
  const matches: SearchMatch[] = [];
  
  // Tüm alanlarda ara
  for (const field of fields) {
    const fieldValue = getFieldValue(item, field);
    
    if (!fieldValue) continue;
    
    // Normalizasyon
    const normalizedValue = caseSensitive 
      ? fieldValue 
      : fieldValue.toLowerCase();
    
    const normalizedQuery = caseSensitive 
      ? query 
      : query.toLowerCase();
    
    // Tam eşleşme kontrolü
    if (!diacriticSensitive) {
      const normalizedValue2 = normalizeText(normalizedValue, false);
      const normalizedQuery2 = normalizeText(normalizedQuery, false);
      
      if (normalizedValue2.includes(normalizedQuery2)) {
        const indices = findMatchIndices(normalizedValue, normalizedQuery);
        const score = 1.0;
        
        matches.push({
          field,
          value: fieldValue,
          indices,
          highlighted: highlightMatches(fieldValue, indices)
        });
        
        maxScore = Math.max(maxScore, score);
        continue;
      }
    }
    
    // Fuzzy search
    if (options.fuzzy !== false) {
      const tokens = tokenize(normalizedValue);
      
      for (const token of tokens) {
        const score = fuzzyScore(
          normalizeText(token, diacriticSensitive),
          normalizeText(normalizedQuery, diacriticSensitive)
        );
        
        if (score >= threshold) {
          const indices = findMatchIndices(normalizedValue, token);
          
          matches.push({
            field,
            value: fieldValue,
            indices,
            highlighted: highlightMatches(fieldValue, indices)
          });
          
          maxScore = Math.max(maxScore, score);
        }
      }
    }
  }
  
  // Eşleşme bulundu mu?
  if (maxScore >= threshold && matches.length > 0) {
    return {
      item,
      score: maxScore,
      matches
    };
  }
  
  return null;
}

/**
 * Highlight eşleşen karakterleri
 */
function highlightMatches(text: string, indices: number[]): string {
  if (indices.length === 0) return text;
  
  const sortedIndices = [...indices].sort((a, b) => a - b);
  let result = '';
  let lastIndex = 0;
  
  for (const index of sortedIndices) {
    if (index > lastIndex) {
      result += text.substring(lastIndex, index);
    }
    
    result += `<mark>${text[index]}</mark>`;
    lastIndex = index + 1;
  }
  
  result += text.substring(lastIndex);
  
  return result;
}

// ============================================================================
// PUBLIC SEARCH FUNCTIONS
// ============================================================================

/**
 * Ana search fonksiyonu
 */
export function search<T>(
  items: T[],
  query: string,
  options: SearchOptions = {}
): SearchResult<T>[] {
  if (!query || query.trim().length === 0) {
    return items.map(item => ({ item, score: 1, matches: [] }));
  }
  
  // Cache kontrolü
  const cacheKey = JSON.stringify({ query, options, itemCount: items.length });
  const cached = searchCache.get<SearchResult<T>[]>(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  // Search
  const results: SearchResult<T>[] = [];
  
  for (const item of items) {
    const result = searchItem(item, query, options);
    
    if (result) {
      results.push(result);
    }
  }
  
  // Sort by score
  results.sort((a, b) => b.score - a.score);
  
  // Apply limit
  const limitedResults = options.limit 
    ? results.slice(0, options.limit)
    : results;
  
  // Cache'e yaz
  searchCache.set(cacheKey, limitedResults);
  
  return limitedResults;
}

/**
 * Multi-field search ( farklı alanları farklı ağırlıklarla )
 */
export function multiFieldSearch<T>(
  items: T[],
  query: string,
  fieldWeights: Record<string, number> // { 'name': 2, 'email': 1 }
): SearchResult<T>[] {
  const results = new Map<T, SearchResult<T>>();
  
  for (const [field, weight] of Object.entries(fieldWeights)) {
    const fieldResults = search(items, query, {
      fields: [field],
      fuzzy: true,
      threshold: 0.4
    });
    
    for (const result of fieldResults) {
      const existing = results.get(result.item);
      
      if (existing) {
        // Ağırlıklı skor ekle
        existing.score += result.score * weight;
        existing.matches.push(...result.matches);
      } else {
        results.set(result.item, {
          ...result,
          score: result.score * weight
        });
      }
    }
  }
  
  // Sort by score
  return Array.from(results.values())
    .sort((a, b) => b.score - a.score);
}

/**
 * Full-text search (tüm metin alanlarında)
 */
export function fullTextSearch<T>(
  items: T[],
  query: string,
  options: SearchOptions = {}
): SearchResult<T>[] {
  const textFields = options.fields || getAllTextFields(items);
  
  return search(items, query, {
    ...options,
    fields: textFields,
    fuzzy: true,
    threshold: 0.5
  });
}

/**
 * Tüm text alanlarını bul
 */
function getAllTextFields<T>(items: T[]): string[] {
  if (items.length === 0) return [];
  
  const fields: string[] = [];
  
  for (const key in items[0]) {
    const value = (items[0] as any)[key];
    
    if (typeof value === 'string') {
      fields.push(key);
    }
  }
  
  return fields;
}

// ============================================================================
// FILTER FUNCTIONS
// ============================================================================

/**
 * Filter uygula
 */
export function applyFilter<T>(items: T[], filters: FilterOptions<T>[]): T[] {
  return items.filter(item => {
    return filters.every(filter => {
      const itemValue = (item as any)[filter.field];
      const filterValue = filter.value;
      
      switch (filter.operator) {
        case 'eq':
          return itemValue === filterValue;
        
        case 'ne':
          return itemValue !== filterValue;
        
        case 'gt':
          return itemValue > filterValue;
        
        case 'gte':
          return itemValue >= filterValue;
        
        case 'lt':
          return itemValue < filterValue;
        
        case 'lte':
          return itemValue <= filterValue;
        
        case 'contains':
          return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
        
        case 'startsWith':
          return String(itemValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
        
        case 'endsWith':
          return String(itemValue).toLowerCase().endsWith(String(filterValue).toLowerCase());
        
        case 'in':
          const inValues = (filter as any).values || (filter as any).value;
          return Array.isArray(inValues) && inValues.includes(itemValue);
        
        case 'between':
          return Array.isArray(filterValue) && 
                 itemValue >= filterValue[0] && 
                 itemValue <= filterValue[1];
        
        default:
          return true;
      }
    });
  });
}

/**
 * Filtre oluştur (builder pattern)
 */
export class FilterBuilder<T> {
  private filters: FilterOptions<T>[] = [];
  
  eq(field: keyof T, value: any): this {
    this.filters.push({ field, operator: 'eq', value });
    return this;
  }
  
  ne(field: keyof T, value: any): this {
    this.filters.push({ field, operator: 'ne', value });
    return this;
  }
  
  gt(field: keyof T, value: any): this {
    this.filters.push({ field, operator: 'gt', value });
    return this;
  }
  
  gte(field: keyof T, value: any): this {
    this.filters.push({ field, operator: 'gte', value });
    return this;
  }
  
  lt(field: keyof T, value: any): this {
    this.filters.push({ field, operator: 'lt', value });
    return this;
  }
  
  lte(field: keyof T, value: any): this {
    this.filters.push({ field, operator: 'lte', value });
    return this;
  }
  
  contains(field: keyof T, value: string): this {
    this.filters.push({ field, operator: 'contains', value });
    return this;
  }
  
  startsWith(field: keyof T, value: string): this {
    this.filters.push({ field, operator: 'startsWith', value });
    return this;
  }
  
  endsWith(field: keyof T, value: string): this {
    this.filters.push({ field, operator: 'endsWith', value });
    return this;
  }
  
  in(field: keyof T, value: any[]): this {
    this.filters.push({ field, operator: 'in', value });
    return this;
  }
  
  between(field: keyof T, min: any, max: any): this {
    this.filters.push({ field, operator: 'between', value: [min, max] });
    return this;
  }
  
  apply(items: T[]): T[] {
    return applyFilter(items, this.filters);
  }
  
  build(): FilterOptions<T>[] {
    return [...this.filters];
  }
}

// ============================================================================
// SORT FUNCTIONS
// ============================================================================

/**
 * Sort uygula
 */
export function applySort<T>(
  items: T[],
  sortBy: SearchSortField,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aValue = (a as any)[sortBy.field];
    const bValue = (b as any)[sortBy.field];
    
    let comparison = 0;
    
    switch (sortBy.type) {
      case 'string':
        comparison = String(aValue).localeCompare(String(bValue), 'tr');
        break;
      
      case 'number':
        comparison = Number(aValue) - Number(bValue);
        break;
      
      case 'date':
        comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
        break;
    }
    
    return order === 'desc' ? -comparison : comparison;
  });
}

// ============================================================================
// SEARCH + FILTER + SORT
// ============================================================================

/**
 * Kapsamlı arama (search + filter + sort)
 */
export function advancedSearch<T>(
  items: T[],
  query: string,
  options: {
    search?: SearchOptions;
    filters?: FilterOptions<T>[];
    sortBy?: SearchSortField;
    sortOrder?: 'asc' | 'desc';
  } = {}
): SearchResult<T>[] {
  let results: SearchResult<T>[];
  
  // 1. Search
  if (query && query.trim().length > 0) {
    results = search(items, query, options.search);
  } else {
    results = items.map(item => ({ item, score: 1, matches: [] }));
  }
  
  // 2. Filter
  if (options.filters && options.filters.length > 0) {
    const filteredItems = applyFilter(
      results.map(r => r.item),
      options.filters
    );
    
    const filteredSet = new Set(filteredItems);
    results = results.filter(r => filteredSet.has(r.item));
  }
  
  // 3. Sort
  if (options.sortBy) {
    const sortedItems = applySort(
      results.map(r => r.item),
      options.sortBy,
      options.sortOrder
    );
    
    const orderMap = new Map(
      sortedItems.map((item, index) => [item, index])
    );
    
    results.sort((a, b) => {
      const aOrder = orderMap.get(a.item) ?? Number.MAX_VALUE;
      const bOrder = orderMap.get(b.item) ?? Number.MAX_VALUE;
      return aOrder - bOrder;
    });
  }
  
  return results;
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Search cache'i temizle
 */
export function clearSearchCache(pattern?: string): void {
  if (pattern) {
    searchCache.delete(pattern);
  } else {
    searchCache.clear();
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Search önerileri oluştur
 */
export function getSuggestions<T>(
  items: T[],
  query: string,
  field: keyof T,
  limit: number = 5
): string[] {
  const uniqueValues = new Set<string>();
  
  for (const item of items) {
    const value = String(item[field]);
    
    if (value.toLowerCase().includes(query.toLowerCase())) {
      uniqueValues.add(value);
    }
  }
  
  return Array.from(uniqueValues).slice(0, limit);
}

/**
 * Search istatistikleri
 */
export interface SearchStatistics {
  totalItems: number;
  matchedItems: number;
  averageScore: number;
  topScore: number;
  fieldsSearched: string[];
}

export function getSearchStatistics<T>(
  results: SearchResult<T>[],
  totalItems: number
): SearchStatistics {
  if (results.length === 0) {
    return {
      totalItems,
      matchedItems: 0,
      averageScore: 0,
      topScore: 0,
      fieldsSearched: []
    };
  }
  
  const scores = results.map(r => r.score);
  const allFields = new Set<string>();
  
  for (const result of results) {
    for (const match of result.matches) {
      allFields.add(match.field);
    }
  }
  
  return {
    totalItems,
    matchedItems: results.length,
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    topScore: Math.max(...scores),
    fieldsSearched: Array.from(allFields)
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  SearchCache,
  normalizeText,
  tokenize,
  levenshteinDistance,
  fuzzyScore,
  findMatchIndices,
  getFieldValue
};
