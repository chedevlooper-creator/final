/**
 * Advanced Search System - Type Definitions v1.0.0
 * 
 * Kapsamlı TypeScript tipleri:
 * - Search tipleri
 * - Filter tipleri
 * - Sort tipleri
 * - Component prop tipleri
 * - Hook return tipleri
 */

// ============================================================================
// BASE TYPES
// ============================================================================

/**
 * Arama modu
 */
export enum SearchMode {
  EXACT = 'exact',           // Tam eşleşme
  FUZZY = 'fuzzy',           // Yaklaşık eşleşme
  FULL_TEXT = 'full_text',   // Full-text search
  MULTI_FIELD = 'multi_field' // Çoklu alan ağırlıklı
}

/**
 * Sıralama yönü
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Alan veri tipi
 */
export enum FieldDataType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object'
}

// ============================================================================
// SEARCH TYPES
// ============================================================================

/**
 * Arama seçenekleri
 */
export interface SearchConfig {
  mode?: SearchMode;
  fields?: string[];                    // Hangi alanlarda aranacağı
  fieldWeights?: Record<string, number>; // Alan ağırlıkları (multi-field için)
  threshold?: number;                   // Eşleşme eşiği 0-1 (default: 0.6)
  caseSensitive?: boolean;              // Büyük/küçük harf duyarlı
  diacriticSensitive?: boolean;         // Türkçe karakter duyarlı
  limit?: number;                       // Sonuç limiti
  offset?: number;                      // Sonuç atlama (pagination)
  highlightMatches?: boolean;           // Eşleşmeleri highlight et
  includeScore?: boolean;               // Skoru sonuçlara ekle
}

/**
 * Arama sonucu
 */
export interface SearchResult<T = any> {
  item: T;
  score?: number;              // Eşleşme skoru 0-1
  rank?: number;               // Sıralama sırası
  matches?: SearchMatch[];     // Eşleşme detayları
  highlighted?: Partial<T>;    // Highlight edilmiş alanlar
}

/**
 * Eşleşme detayı
 */
export interface SearchMatch {
  field: string;               // Alan adı
  value: string;               // Eşleşen değer
  query: string;               // Aranan sorgu
  score?: number;              // Alan skoru
  indices?: number[];          // Eşleşen karakter pozisyonları
  highlighted?: string;        // Highlight edilmiş değer
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filtre operatörü
 */
export enum FilterOperator {
  EQ = 'eq',                  // Eşit (=)
  NE = 'ne',                  // Eşit değil (!=)
  GT = 'gt',                  // Büyük (>)
  GTE = 'gte',                // Büyük veya eşit (>=)
  LT = 'lt',                  // Küçük (<)
  LTE = 'lte',                // Küçük veya eşit (<=)
  CONTAINS = 'contains',      // İçerir (LIKE %value%)
  STARTS_WITH = 'startsWith', // İle başlar (LIKE value%)
  ENDS_WITH = 'endsWith',     // İle biter (LIKE %value)
  IN = 'in',                  // İçinde (IN array)
  NOT_IN = 'not_in',          // İçinde değil (NOT IN array)
  BETWEEN = 'between',        // Arasında (BETWEEN min AND max)
  IS_NULL = 'is_null',        // Null (IS NULL)
  IS_NOT_NULL = 'is_not_null',// Null değil (IS NOT NULL)
  EXISTS = 'exists'           // Var (EXISTS)
}

/**
 * Filtre seçenekleri
 */
export interface FilterOption<T = any> {
  field: keyof T | string;    // Alan adı
  operator: FilterOperator;   // Operatör
  value?: any;                // Değer
  values?: any[];             // Çoklu değer (IN operatörü için)
  min?: any;                  // Minimum değer (BETWEEN için)
  max?: any;                  // Maksimum değer (BETWEEN için)
  label?: string;             // Görüntüleme etiketi
}

/**
 * Filtre grubu (AND/OR mantığı)
 */
export interface FilterGroup<T = any> {
  logic: 'AND' | 'OR';
  filters: (FilterOption<T> | FilterGroup<T>)[];
}

/**
 * Aktif filtre durumu
 */
export interface ActiveFilter<T = any> {
  id: string;
  option: FilterOption<T>;
  applied: boolean;
  createdAt: Date;
}

// ============================================================================
// SORT TYPES
// ============================================================================

/**
 * Sıralama seçeneği
 */
export interface SortOption {
  field: string;
  label?: string;
  dataType?: FieldDataType;
  order?: SortOrder;
}

/**
 * Aktif sıralama
 */
export interface ActiveSort {
  field: string;
  order: SortOrder;
  dataType: FieldDataType;
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

/**
 * Sayfalama seçenekleri
 */
export interface PaginationOptions {
  page: number;               // Sayfa numarası (1-indexed)
  pageSize: number;           // Sayfa başı sonuç sayısı
  totalItems?: number;        // Toplam sonuç sayısı
}

/**
 * Sayfalama bilgisi
 */
export interface PageInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

/**
 * Sayfalama sonucu
 */
export interface PaginatedResult<T = any> {
  items: T[];
  pageInfo: PageInfo;
}

// ============================================================================
// SEARCH STATE TYPES
// ============================================================================

/**
 * Arama durumu
 */
export interface SearchState {
  query: string;              // Aranan metin
  config: SearchConfig;       // Arama konfigürasyonu
  filters: ActiveFilter[];    // Aktif filtreler
  sort: ActiveSort | null;    // Aktif sıralama
  pagination: PaginationOptions; // Sayfalama
  results: SearchResult[];    // Sonuçlar
  isSearching: boolean;       // Arama正在进行
  error: string | null;       // Hata mesajı
  timestamp: number;          // Son arama zamanı
}

/**
 * Arama istatistikleri
 */
export interface SearchStatistics {
  totalItems: number;
  matchedItems: number;
  filteredItems: number;
  averageScore: number;
  topScore: number;
  searchDuration: number;     // ms
  fieldsSearched: string[];
  filtersApplied: number;
  cacheHit: boolean;
}

// ============================================================================
// AUTOCOMPLETE TYPES
// ============================================================================

/**
 * Autocomplete seçeneği
 */
export interface AutocompleteOption {
  value: string;
  label: string;
  count?: number;
  category?: string;
}

/**
 * Autocomplete sonucu
 */
export interface AutocompleteResult {
  query: string;
  suggestions: AutocompleteOption[];
  hasMore: boolean;
}

/**
 * Autocomplete konfigürasyonu
 */
export interface AutocompleteConfig {
  field: string;
  minChars?: number;          // Minimum karakter sayısı
  debounceMs?: number;        // Debounce süresi
  limit?: number;             // Öneri limiti
  showCounts?: boolean;       // Sonuç sayılarını göster
  groupByCategory?: boolean;  // Kategoriye göre grupla
}

// ============================================================================
// FACETED SEARCH TYPES
// ============================================================================

/**
 * Facet (facet arama)
 */
export interface Facet {
  field: string;
  label: string;
  type: FacetType;
  options: FacetOption[];
  selected: string[];
  displayType?: FacetDisplayType;
}

/**
 * Facet tipi
 */
export enum FacetType {
  CHECKBOX = 'checkbox',     // Checkbox listesi
  RADIO = 'radio',           // Radio button
  SELECT = 'select',         // Dropdown
  RANGE = 'range',           // Aralık (slider)
  DATE_RANGE = 'date_range', // Tarih aralığı
  RATING = 'rating',         // Puanlama
  COLOR = 'color'            // Renk seçimi
}

/**
 * Facet görüntüleme tipi
 */
export enum FacetDisplayType {
  LIST = 'list',             // Liste
  GRID = 'grid',             // Grid
  DROPDOWN = 'dropdown',     // Dropdown
  SLIDER = 'slider'          // Slider
}

/**
 * Facet seçeneği
 */
export interface FacetOption {
  value: string;
  label: string;
  count: number;
  selected?: boolean;
  color?: string;            // Renk hex kodu (COLOR tipi için)
}

/**
 * Faceted search sonucu
 */
export interface FacetedSearchResult<T = any> {
  results: SearchResult<T>[];
  facets: Facet[];
  statistics: SearchStatistics;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * SearchBar props
 */
export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  showIcon?: boolean;
  showClearButton?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
}

/**
 * SearchInput props
 */
export interface SearchInputProps extends SearchBarProps {
  autocomplete?: boolean;
  autocompleteConfig?: AutocompleteConfig;
  onAutocompleteSelect?: (option: AutocompleteOption) => void;
}

/**
 * FilterPanel props
 */
export interface FilterPanelProps<T = any> {
  filters: FilterOption<T>[];
  activeFilters: ActiveFilter<T>[];
  onAddFilter: (filter: FilterOption<T>) => void;
  onRemoveFilter: (filterId: string) => void;
  onClearAll: () => void;
  onApply: () => void;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

/**
 * SearchResults props
 */
export interface SearchResultsProps<T = any> {
  results: SearchResult<T>[];
  loading?: boolean;
  error?: string | null;
  renderItem: (item: SearchResult<T>) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderError?: (error: string) => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  highlightMatches?: boolean;
  showScore?: boolean;
  className?: string;
}

/**
 * Pagination props
 */
export interface PaginationProps {
  pageInfo: PageInfo;
  onPageChange: (page: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  pageSizeOptions?: number[];
  className?: string;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * useSearch hook return
 */
export interface UseSearchReturn<T = any> {
  // State
  query: string;
  results: SearchResult<T>[];
  loading: boolean;
  error: string | null;
  
  // Computed
  hasResults: boolean;
  resultCount: number;
  
  // Actions
  search: (query: string) => void;
  clearSearch: () => void;
  setQuery: (query: string) => void;
  
  // Config
  setConfig: (config: Partial<SearchConfig>) => void;
}

/**
 * useAdvancedSearch hook return
 */
export interface UseAdvancedSearchReturn<T = any> {
  // State
  state: SearchState;
  
  // Computed
  paginatedResults: SearchResult<T>[];
  statistics: SearchStatistics;
  
  // Actions
  search: (query: string) => void;
  setFilter: (filter: FilterOption<T>) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  setSort: (sort: SortOption) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  
  // Reset
  reset: () => void;
}

/**
 * useAutocomplete hook return
 */
export interface UseAutocompleteReturn {
  suggestions: AutocompleteOption[];
  loading: boolean;
  error: string | null;
  getSuggestions: (query: string) => Promise<AutocompleteOption[]>;
  clearSuggestions: () => void;
}

/**
 * useFacetedSearch hook return
 */
export interface UseFacetedSearchReturn<T = any> {
  results: SearchResult<T>[];
  facets: Facet[];
  loading: boolean;
  error: string | null;
  
  // Actions
  search: (query: string) => void;
  toggleFacet: (field: string, value: string) => void;
  clearFacet: (field: string) => void;
  clearAllFacets: () => void;
  
  // Computed
  activeFacetCount: number;
  hasActiveFilters: boolean;
}

// ============================================================================
// PRESET TEMPLATES
// ============================================================================

/**
 * Arama şablonu
 */
export interface SearchPreset {
  id: string;
  name: string;
  description?: string;
  config: SearchConfig;
  filters?: FilterOption[];
  sort?: SortOption;
  icon?: string;
}

/**
 * Kayıtlı arama
 */
export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  config: SearchConfig;
  filters: FilterOption[];
  sort?: SortOption;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  SearchConfig,
  SearchResult,
  SearchMatch,
  FilterOption,
  FilterGroup,
  ActiveFilter,
  SortOption,
  ActiveSort,
  PaginationOptions,
  PageInfo,
  PaginatedResult,
  SearchState,
  SearchStatistics,
  AutocompleteOption,
  AutocompleteResult,
  AutocompleteConfig,
  Facet,
  FacetOption,
  FacetedSearchResult,
  SearchBarProps,
  SearchInputProps,
  FilterPanelProps,
  SearchResultsProps,
  PaginationProps,
  UseSearchReturn,
  UseAdvancedSearchReturn,
  UseAutocompleteReturn,
  UseFacetedSearchReturn,
  SearchPreset,
  SavedSearch
};
