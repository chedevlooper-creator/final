import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function NeedyListLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Filter Bar Skeleton */}
      <Card className="shadow-soft p-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </Card>

      {/* Table Skeleton */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-soft">
        {/* Table Header */}
        <div className="border-b bg-muted p-4">
          <div className="flex gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" style={{ flex: i === 0 ? 0.5 : 1 }} />
            ))}
          </div>
        </div>
        {/* Table Rows */}
        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b p-4">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-8 w-8 rounded-lg" style={{ flex: 0.5 }} />
              {Array.from({ length: 9 }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  className="h-4 rounded" 
                  style={{ flex: 1, width: `${60 + Math.random() * 40}%` }} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
