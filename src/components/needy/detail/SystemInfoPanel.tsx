'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { 
  Clock, 
  Globe, 
  User, 
  DollarSign,
  FileCheck
} from 'lucide-react'
import { FormSection } from './FormSection'

interface SystemInfoPanelProps {
  createdAt?: string
  createdIp?: string
  createdBy?: string
  totalAidAmount?: number
  status: 'pending' | 'active' | 'inactive' | 'rejected'
  onStatusChange: (status: 'pending' | 'active' | 'inactive' | 'rejected') => void
  showStatus?: boolean
  showSystemInfo?: boolean
}

export function SystemInfoPanel({
  createdAt,
  createdIp,
  createdBy,
  totalAidAmount = 0,
  status,
  onStatusChange,
  showStatus = true,
  showSystemInfo = true,
}: SystemInfoPanelProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      {/* Durum Bölümü */}
      {showStatus && (
        <FormSection 
          title="Durum" 
          icon={<FileCheck className="h-4 w-4 text-blue-500" />}
          defaultOpen={true}
        >
          <RadioGroup
            value={status}
            onValueChange={(value) => onStatusChange(value as typeof status)}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pending" id="status-pending" />
              <Label htmlFor="status-pending" className="cursor-pointer">Taslak</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="status-active" />
              <Label htmlFor="status-active" className="cursor-pointer text-green-600">Onaylandı</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inactive" id="status-inactive" />
              <Label htmlFor="status-inactive" className="cursor-pointer text-slate-600">Pasif</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rejected" id="status-rejected" />
              <Label htmlFor="status-rejected" className="cursor-pointer text-red-600">Reddedildi</Label>
            </div>
          </RadioGroup>
        </FormSection>
      )}

      {/* Sistem Bilgileri */}
      {showSystemInfo && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sistem Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground">Kayıt Zamanı</span>
                <p className="text-sm font-medium">{formatDate(createdAt)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Kayıt Edilen IP
                </span>
                <p className="text-sm font-mono">{createdIp || '-'}</p>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                Kayıt Eden
              </span>
              <p className="text-sm">{createdBy || '-'}</p>
            </div>
            <div className="border-t pt-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Toplam Yardım Tutarı
              </span>
              <p className="text-lg font-bold text-emerald-600">
                {formatCurrency(totalAidAmount)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
