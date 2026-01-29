'use client'

import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil } from 'lucide-react'

interface MobileTableRowProps<TData> {
  data: TData
  columns: ColumnDef<TData, any>[]
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function MobileTableRow<TData>({
  data,
  columns,
  onClick,
  onEdit,
  onDelete,
}: MobileTableRowProps<TData>) {
  const renderableColumns = columns.filter(
    col => col.id !== 'actions' && col.id !== 'detail'
  ).slice(0, 3)

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 space-y-3 active:bg-muted/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1" onClick={onClick}>
          {renderableColumns.map((column, index) => (
            <div key={column.id || index} className="flex items-start gap-2">
              {column.header && typeof column.header === 'string' && (
                <span className="text-xs text-muted-foreground min-w-[60px] font-medium">
                  {column.header}
                </span>
              )}
              <div className="flex-1 text-sm text-foreground">
                {(data as Record<string, unknown>)[column.id as string] as React.ReactNode}
              </div>
            </div>
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 shrink-0"
          onClick={onClick}
        >
          <Eye className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onEdit}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Düzenle
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            Sil
          </Button>
        )}
      </div>
    </div>
  )
}
