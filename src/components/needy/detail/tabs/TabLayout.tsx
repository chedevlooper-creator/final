'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { StatusFilter, STATUS_FILTER_OPTIONS } from '@/types/linked-records.types'

interface TabLayoutProps {
  title?: string
  children?: ReactNode
  
  // Tablo özellikleri
  columns?: { key: string; label: string; width?: string }[]
  data?: Record<string, unknown>[]
  renderRow?: (item: Record<string, unknown>, index: number) => ReactNode
  emptyMessage?: string
  
  // Filtreleme
  showStatusFilter?: boolean
  statusFilter?: StatusFilter
  onStatusFilterChange?: (value: StatusFilter) => void
  
  // Arama
  showSearch?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearch?: () => void
  
  // Ekleme
  showAddButton?: boolean
  addButtonLabel?: string
  onAdd?: () => void
  
  // Sayfalama
  totalRecords?: number
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  
  // Loading
  isLoading?: boolean
}

export function TabLayout({
  children,
  columns = [],
  data = [],
  renderRow,
  emptyMessage = 'Kayıt bulunamadı',
  showStatusFilter = true,
  statusFilter = 'active',
  onStatusFilterChange,
  showSearch = true,
  searchPlaceholder = 'Ara...',
  searchValue = '',
  onSearchChange,
  onSearch,
  showAddButton = true,
  addButtonLabel = 'Ekle',
  onAdd,
  totalRecords = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}: TabLayoutProps) {
  return (
    <div className="space-y-4">
      {/* Header - Filtreler ve Aksiyon Butonları */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          {showStatusFilter && (
            <Select 
              value={statusFilter} 
              onValueChange={(v) => onStatusFilterChange?.(v as StatusFilter)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showSearch && (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="h-9"
              />
              <Button size="sm" variant="secondary" onClick={onSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {showAddButton && (
          <Button size="sm" onClick={onAdd} className="gap-1">
            <Plus className="h-4 w-4" />
            {addButtonLabel}
          </Button>
        )}
      </div>

      {/* Kayıt Sayısı ve Sayfalama Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{totalRecords} Kayıt</span>
        <span>{currentPage} / {totalPages}</span>
      </div>

      {/* İçerik - Tablo veya Custom Children */}
      {children ? (
        children
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  {/* Ekle ikonu için boş başlık */}
                </TableHead>
                {columns.map((col) => (
                  <TableHead key={col.key} style={{ width: col.width }}>
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="w-[50px]">
                  {/* İşlem kolonu için boş başlık */}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      <span>Yükleniyor...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => renderRow?.(item, index))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage <= 1}
            onClick={() => onPageChange?.(1)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage <= 1}
            onClick={() => onPageChange?.(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="px-3 py-1 text-sm">
            {currentPage}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange?.(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange?.(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
