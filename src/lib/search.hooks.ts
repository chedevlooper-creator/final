/**
 * Advanced Search System - React Hooks v1.0.0
 * 
 * Kapsamlı React hooks:
 * - useSearch - Basit arama
 * - useAdvancedSearch - Gelişmiş arama (filter, sort, pagination)
 * - useAutocomplete - Otomatik tamamlama
 * - useFacetedSearch - Faceted arama
 */

'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type {
  SearchConfig,
  SearchResult,
  SearchState,
  SearchStatistics,
  FilterOption,
  ActiveFilter,
  SortOption,
  ActiveSort,
  PaginationOptions,
  PageInfo,
  AutocompleteOption,
  AutocompleteConfig,
  Facet,
  FacetedSearchResult
} from './search.types';

import {
  search,
  advancedSearch as advancedSearchLib,
  applyFilter,
  applySort,
  getSuggestions,
  getSearchStatistics,
  clearSearchCache
} from './search';

// ============================================================================
// USESEARCH HOOK
// ============================================================================

/**
 * Basit arama hook'u
 * 
 * @example
 * const { query, results, loading, search, clearSearch } = useSearch(items, {
 *   fields: ['name', 'email'],
 *   fuzzy: true,
 *   threshold: 0.6
 * });
 */
export function useSearch<T>(
  items: T[],
  config: SearchConfig = {}
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult<T>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchConfig, setSearchConfig] = useState<SearchConfig>(config);

  // Search fonksiyonu
  const performSearch = useCallback((searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simüle edilmiş async (gerçek uygulamada API çağrısı olabilir)
      setTimeout(() => {
        const searchResults = search(items, searchQuery, searchConfig);
        setResults(searchResults);
        setLoading(false);
      }, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Arama hatası');
      setLoading(false);
    }
  }, [items, searchConfig]);

  // Query değiştiğinde ara
  useEffect(() => {
    if (query.trim().length > 0) {
      performSearch(query);
    } else {
      setResults(items.map(item => ({ item, score: 1, matches: [] })));
    }
  }, [query, items, performSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  // Computed values
  const hasResults = useMemo(() => results.length > 0, [results.length]);
  const resultCount = useMemo(() => results.length, [results.length]);

  return {
    // State
    query,
    results,
    loading,
    error,

    // Computed
    hasResults,
    resultCount,

    // Actions
    search: performSearch,
    clearSearch,
    setQuery,

    // Config
    setConfig: setSearchConfig
  };
}

// ============================================================================
// USEADVANCEDSEARCH HOOK
// ============================================================================

/**
 * Gelişmiş arama hook'u (filter, sort, pagination)
 * 
 * @example
 * const { state, paginatedResults, statistics, search, setFilter, setPage } = useAdvancedSearch(items, {
 *   fields: ['name', 'email', 'phone'],
 *   limit: 10
 * });
 */
export function useAdvancedSearch<T>(
  items: T[],
  config: SearchConfig = {}
) {
  // State
  const [state, setState] = useState<SearchState>({
    query: '',
    config,
    filters: [],
    sort: null,
    pagination: {
      page: 1,
      pageSize: 10
    },
    results: [],
    isSearching: false,
    error: null,
    timestamp: Date.now()
  });

  // Search perform
  const performSearch = useCallback((searchQuery: string) => {
    setState(prev => ({
      ...prev,
      query: searchQuery,
      isSearching: true,
      timestamp: Date.now()
    }));

    try {
      const startTime = performance.now();

      // Advanced search
      const searchResults = advancedSearchLib(
        items,
        searchQuery,
        {
          search: state.config,
          filters: state.filters.map(f => f.option),
          sortBy: state.sort ? {
            field: state.sort.field,
            type: state.sort.dataType
          } : undefined,
          sortOrder: state.sort?.order
        }
      );

      const duration = performance.now() - startTime;

      setState(prev => ({
        ...prev,
        results: searchResults,
        isSearching: false,
        timestamp: Date.now()
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isSearching: false,
        error: err instanceof Error ? err.message : 'Arama hatası'
      }));
    }
  }, [items, state.config, state.filters, state.sort]);

  // Query değiştiğinde ara
  useEffect(() => {
    performSearch(state.query);
  }, [state.query, state.filters, state.sort, performSearch]);

  // Paginated results
  const paginatedResults = useMemo(() => {
    const { page, pageSize } = state.pagination;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return state.results.slice(startIndex, endIndex);
  }, [state.results, state.pagination]);

  // Statistics
  const statistics = useMemo((): SearchStatistics => {
    const stats = getSearchStatistics(
      state.results,
      items.length
    );

    return {
      ...stats,
      filteredItems: state.results.length,
      searchDuration: 0, // Gerçek uygulamada ölçülür
      filtersApplied: state.filters.length,
      cacheHit: false // Gerçek uygulamada kontrol edilir
    };
  }, [state.results, items.length, state.filters.length]);

  // Page info
  const pageInfo = useMemo((): PageInfo => {
    const totalPages = Math.ceil(state.results.length / state.pagination.pageSize);
    const startIndex = (state.pagination.page - 1) * state.pagination.pageSize;
    const endIndex = Math.min(startIndex + state.pagination.pageSize, state.results.length);

    return {
      currentPage: state.pagination.page,
      totalPages,
      pageSize: state.pagination.pageSize,
      totalItems: state.results.length,
      hasNextPage: state.pagination.page < totalPages,
      hasPreviousPage: state.pagination.page > 1,
      startIndex,
      endIndex
    };
  }, [state.results, state.pagination]);

  // Actions
  const search = useCallback((query: string) => {
    setState(prev => ({ ...prev, query, pagination: { ...prev.pagination, page: 1 } }));
  }, []);

  const setFilter = useCallback((filter: FilterOption<T>) => {
    const id = `${filter.field}-${filter.operator}-${Date.now()}`;
    
    setState(prev => ({
      ...prev,
      filters: [
        ...prev.filters,
        { id, option: filter, applied: true, createdAt: new Date() }
      ],
      pagination: { ...prev.pagination, page: 1 }
    }));
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setState(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== filterId),
      pagination: { ...prev.pagination, page: 1 }
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: [],
      pagination: { ...prev.pagination, page: 1 }
    }));
  }, []);

  const setSort = useCallback((sort: SortOption) => {
    setState(prev => ({
      ...prev,
      sort: {
        field: sort.field,
        order: sort.order || 'asc',
        dataType: sort.dataType || 'string'
      }
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page }
    }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, pageSize, page: 1 }
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      query: '',
      config,
      filters: [],
      sort: null,
      pagination: {
        page: 1,
        pageSize: 10
      },
      results: [],
      isSearching: false,
      error: null,
      timestamp: Date.now()
    });
  }, [config]);

  return {
    // State
    state,

    // Computed
    paginatedResults,
    statistics,
    pageInfo,

    // Actions
    search,
    setFilter,
    removeFilter,
    clearFilters,
    setSort,
    setPage,
    setPageSize,
    reset
  };
}

// ============================================================================
// USEAUTOCOMPLETE HOOK
// ============================================================================

/**
 * Autocomplete hook'u
 * 
 * @example
 * const { suggestions, loading, getSuggestions, clearSuggestions } = useAutocomplete(items, {
 *   field: 'name',
 *   minChars: 2,
 *   limit: 5
 * });
 */
export function useAutocomplete<T>(
  items: T[],
  config: AutocompleteConfig
) {
  const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Get suggestions
  const performGetSuggestions = useCallback(async (query: string): Promise<AutocompleteOption[]> => {
    const minChars = config.minChars || 2;
    const limit = config.limit || 5;

    if (query.length < minChars) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // Simüle edilmiş async
      return new Promise((resolve) => {
        setTimeout(() => {
          const results = getSuggestions(items, query, config.field as keyof T, limit);
          
          const options: AutocompleteOption[] = results.map(value => ({
            value,
            label: value,
            count: items.filter(item => 
              String((item as any)[config.field]).toLowerCase().includes(value.toLowerCase())
            ).length
          }));

          setSuggestions(options);
          setLoading(false);
          resolve(options);
        }, 100);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Autocomplete hatası';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  }, [items, config]);

  // Debounced getSuggestions
  const getSuggestionsDebounced = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const debounceMs = config.debounceMs || 300;

    debounceRef.current = setTimeout(() => {
      performGetSuggestions(query);
    }, debounceMs);
  }, [performGetSuggestions, config.debounceMs]);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    suggestions,
    loading,
    error,
    getSuggestions: getSuggestionsDebounced,
    clearSuggestions,
    performGetSuggestions // Direct access without debounce
  };
}

// ============================================================================
// USEFACETEDSEARCH HOOK
// ============================================================================

/**
 * Faceted search hook'u
 * 
 * @example
 * const { results, facets, loading, search, toggleFacet } = useFacetedSearch(items, facetConfig);
 */
export function useFacetedSearch<T>(
  items: T[],
  facetConfig: {
    facets: Array<{
      field: string;
      label: string;
      type: 'checkbox' | 'radio' | 'select' | 'range';
    }>;
  }
) {
  const [results, setResults] = useState<SearchResult<T>[]>([]);
  const [facets, setFacets] = useState<Facet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Build facets from data
  const buildFacets = useCallback(() => {
    const builtFacets: Facet[] = facetConfig.facets.map(facetDef => {
      // Get unique values for this field
      const uniqueValues = new Map<string, number>();

      for (const item of items) {
        const value = (item as any)[facetDef.field];
        
        if (value != null) {
          const valueStr = String(value);
          const count = uniqueValues.get(valueStr) || 0;
          uniqueValues.set(valueStr, count + 1);
        }
      }

      // Convert to facet options
      const options = Array.from(uniqueValues.entries())
        .map(([value, count]) => ({
          value,
          label: value,
          count,
          selected: false
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Limit to top 20

      return {
        field: facetDef.field,
        label: facetDef.label,
        type: facetDef.type,
        options,
        selected: [],
        displayType: 'list'
      };
    });

    setFacets(builtFacets);
  }, [items, facetConfig.facets]);

  // Initial facets build
  useEffect(() => {
    buildFacets();
  }, [buildFacets]);

  // Search with facets
  const performSearch = useCallback((searchQuery: string) => {
    setLoading(true);
    setError(null);
    setQuery(searchQuery);

    try {
      // Build filters from selected facets
      const filters: FilterOption<T>[] = [];

      for (const facet of facets) {
        if (facet.selected.length > 0) {
          filters.push({
            field: facet.field as keyof T,
            operator: 'in',
            values: facet.selected,
            label: facet.label
          });
        }
      }

      // Perform search
      const searchResults = advancedSearchLib(
        items,
        searchQuery,
        {
          search: {
            fuzzy: true,
            threshold: 0.6
          },
          filters: filters.length > 0 ? filters : undefined
        }
      );

      setResults(searchResults);
      setLoading(false);

      // Rebuild facets with filtered results
      if (filters.length > 0) {
        const filteredItems = searchResults.map(r => r.item);
        
        const updatedFacets = facets.map(facet => {
          const facetOptions = facet.options.map(option => {
            const count = filteredItems.filter(item => 
              String((item as any)[facet.field]) === option.value
            ).length;

            return { ...option, count };
          });

          return { ...facet, options: facetOptions };
        });

        setFacets(updatedFacets);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Faceted search hatası');
      setLoading(false);
    }
  }, [items, facets]);

  // Toggle facet selection
  const toggleFacet = useCallback((field: string, value: string) => {
    setFacets(prevFacets => {
      const updatedFacets = prevFacets.map(facet => {
        if (facet.field !== field) return facet;

        const isSelected = facet.selected.includes(value);
        
        let newSelected: string[];
        
        if (facet.type === 'radio') {
          // Radio: only one selection
          newSelected = isSelected ? [] : [value];
        } else {
          // Checkbox: multiple selections
          newSelected = isSelected
            ? facet.selected.filter(v => v !== value)
            : [...facet.selected, value];
        }

        return {
          ...facet,
          selected: newSelected,
          options: facet.options.map(opt => ({
            ...opt,
            selected: newSelected.includes(opt.value)
          }))
        };
      });

      return updatedFacets;
    });
  }, []);

  // Clear facet
  const clearFacet = useCallback((field: string) => {
    setFacets(prevFacets => 
      prevFacets.map(facet => {
        if (facet.field !== field) return facet;

        return {
          ...facet,
          selected: [],
          options: facet.options.map(opt => ({ ...opt, selected: false }))
        };
      })
    );
  }, []);

  // Clear all facets
  const clearAllFacets = useCallback(() => {
    setFacets(prevFacets =>
      prevFacets.map(facet => ({
        ...facet,
        selected: [],
        options: facet.options.map(opt => ({ ...opt, selected: false }))
      }))
    );
  }, []);

  // Computed
  const activeFacetCount = useMemo(
    () => facets.reduce((sum, facet) => sum + facet.selected.length, 0),
    [facets]
  );

  const hasActiveFilters = useMemo(
    () => activeFacetCount > 0 || query.trim().length > 0,
    [activeFacetCount, query]
  );

  return {
    // Results
    results,
    facets,
    loading,
    error,

    // Actions
    search: performSearch,
    toggleFacet,
    clearFacet,
    clearAllFacets,

    // Computed
    activeFacetCount,
    hasActiveFilters
  };
}

// ============================================================================
// USEFILTERBUILDER HOOK
// ============================================================================

/**
 * Filter builder hook'u
 * 
 * @example
 * const { filters, addFilter, removeFilter, clearFilters, apply } = useFilterBuilder(items);
 */
export function useFilterBuilder<T>(items: T[]) {
  const [filters, setFilters] = useState<FilterOption<T>[]>([]);

  const addFilter = useCallback((filter: FilterOption<T>) => {
    setFilters(prev => [...prev, filter]);
  }, []);

  const removeFilter = useCallback((index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const apply = useCallback(() => {
    if (filters.length === 0) {
      return items;
    }

    return applyFilter(items, filters);
  }, [items, filters]);

  return {
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    apply
  };
}

// ============================================================================
// USESEARCHPRESETS HOOK
// ============================================================================

interface Preset {
  id: string;
  name: string;
  description?: string;
  config: SearchConfig;
  filters?: FilterOption[];
  sort?: SortOption;
}

/**
 * Search presets hook'u
 * 
 * @example
 * const { presets, activePreset, setPreset, savePreset } = useSearchPresets();
 */
export function useSearchPresets() {
  const [presets, setPresets] = useState<Preset[]>([
    {
      id: 'all',
      name: 'Tümü',
      description: 'Tüm kayıtları göster',
      config: {}
    },
    {
      id: 'recent',
      name: 'Son Eklenenler',
      description: 'Yaklaşık eklenen kayıtlar',
      config: {
        sortBy: { field: 'createdAt', type: 'date' },
        sortOrder: 'desc'
      }
    }
  ]);
  const [activePreset, setActivePreset] = useState<string>('all');

  const setPreset = useCallback((presetId: string) => {
    setActivePreset(presetId);
  }, []);

  const savePreset = useCallback((preset: Omit<Preset, 'id'>) => {
    const newPreset: Preset = {
      ...preset,
      id: `preset-${Date.now()}`
    };

    setPresets(prev => [...prev, newPreset]);
    return newPreset;
  }, []);

  const deletePreset = useCallback((presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
  }, []);

  return {
    presets,
    activePreset,
    setPreset,
    savePreset,
    deletePreset
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  useSearch,
  useAdvancedSearch,
  useAutocomplete,
  useFacetedSearch,
  useFilterBuilder,
  useSearchPresets
};
