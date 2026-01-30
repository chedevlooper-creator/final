'use client'

import { useDeviceType } from '@/hooks/use-device-type'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable } from './data-table'
import { ReactNode } from 'react'

interface Column<T> {
  key: keyof T | string
  header: string
  cell: (item: T) => ReactNode
  mobileVisible?: boolean
}

interface ResponsiveDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  mobileCardRenderer?: (item: T) => ReactNode
  emptyMessage?: string
}

/**
 * Responsive DataTable bileşeni
 * Desktop: Normal tablo görünümü
 * Mobil: Kart görünümü
 */
export function ResponsiveDataTable<T>({
  data,
  columns,
  keyExtractor,
  mobileCardRenderer,
  emptyMessage = 'Veri bulunamadı',
}: ResponsiveDataTableProps<T>) {
  const { isMobile } = useDeviceType()

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  // Desktop: Normal tablo
  if (!isMobile) {
    return (
      <DataTable 
        columns={columns.map(c => ({
          accessorKey: c.key as string,
          header: c.header,
          cell: ({ row }: { row: { original: T } }) => c.cell(row.original),
        }))}
        data={data}
      />
    )
  }

  // Mobil: Kart görünümü
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <MobileCard 
          key={keyExtractor(item)}
          item={item}
          columns={columns.filter(c => c.mobileVisible !== false)}
          renderer={mobileCardRenderer}
        />
      ))}
    </div>
  )
}

// Mobil kart bileşeni
function MobileCard<T>({
  item,
  columns,
  renderer,
}: {
  item: T
  columns: Column<T>[]
  renderer?: (item: T) => ReactNode
}) {
  if (renderer) {
    return <Card>{renderer(item)}</Card>
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-2">
        {columns.map((col) => (
          <div key={String(col.key)} className="flex justify-between items-start gap-2">
            <span className="text-xs text-muted-foreground shrink-0">{col.header}</span>
            <span className="text-sm font-medium text-right">{col.cell(item)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
