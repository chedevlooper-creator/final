/**
 * Virtualized List Component
 * 
 * Renders only visible items for better performance with long lists
 * Uses react-window for efficient rendering
 */

'use client'

import { useRef, useEffect, useState, ReactNode } from 'react'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => ReactNode
  overscan?: number
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollTop(scrollContainerRef.current.scrollTop)
    }
  }

  const totalHeight = items.length * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  )
  const visibleItems = items.slice(startIndex, endIndex + 1)

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      style={{ height: containerHeight, overflow: 'auto' }}
      className="relative"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Simple Paginated List
 * Alternative to virtualization for smaller lists
 */

interface PaginatedListProps<T> {
  items: T[]
  itemsPerPage?: number
  renderItem: (item: T, index: number) => ReactNode
  renderEmpty?: () => ReactNode
}

export function PaginatedList<T>({
  items,
  itemsPerPage = 10,
  renderItem,
  renderEmpty,
}: PaginatedListProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = items.slice(startIndex, endIndex)

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  if (items.length === 0) {
    return <>{renderEmpty?.()}</>
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {currentItems.map((item, index) => renderItem(item, startIndex + index))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Toplam {items.length} kayıt • Sayfa {currentPage} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Önceki
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Infinite Scroll List
 * Loads more items as user scrolls
 */

interface InfiniteListProps<T> {
  items: T[]
  hasMore: boolean
  isLoading: boolean
  renderItem: (item: T, index: number) => ReactNode
  onLoadMore: () => void
  loader?: ReactNode
}

export function InfiniteScrollList<T>({
  items,
  hasMore,
  isLoading,
  renderItem,
  onLoadMore,
  loader,
}: InfiniteListProps<T>) {
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore()
        }
      },
      { threshold: 1.0 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, isLoading, onLoadMore])

  return (
    <div className="space-y-2">
      {items.map((item, index) => renderItem(item, index))}
      
      {hasMore && (
        <div ref={observerTarget} className="py-4 text-center">
          {isLoading ? (
            loader || <div className="text-slate-500">Yükleniyor...</div>
          ) : (
            <div className="text-slate-400">Daha fazla kayıt yüklemek için kaydırın</div>
          )}
        </div>
      )}
    </div>
  )
}
