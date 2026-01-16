'use client'

import { Button } from '@/components/ui/button'
import { 
  Save, 
  X, 
  Link2, 
  History,
  Loader2,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

interface DetailHeaderProps {
  id: string
  isLoading?: boolean
  isDirty?: boolean
  onSave: () => void
  onClose: () => void
  onDeleteRequest?: () => void
}

export function DetailHeader({ 
  id, 
  isLoading, 
  isDirty,
  onSave, 
  onClose,
  onDeleteRequest
}: DetailHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Sol Taraf - Aksiyon Butonları */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onSave}
            disabled={!isDirty || isLoading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Kaydet
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-2" />
            Kapat
          </Button>
        </div>

        {/* Orta - Başlık */}
        <h1 className="text-lg font-semibold text-foreground">
          İhtiyaç Sahibi Kişi ID # {id.slice(0, 8)}
        </h1>

        {/* Sağ Taraf - Link Butonları */}
        <div className="flex items-center gap-2">
          <Link href={`/needy/merge/${id}`}>
            <Button variant="ghost" size="sm">
              <Link2 className="h-4 w-4 mr-2" />
              Kart Birleştirme
            </Button>
          </Link>
          <Link href={`/history?tab=needy&id=${id}`}>
            <Button variant="ghost" size="sm">
              <History className="h-4 w-4 mr-2" />
              İşlem Geçmişi
            </Button>
          </Link>
          {onDeleteRequest && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onDeleteRequest}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Kaydı Sil
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
