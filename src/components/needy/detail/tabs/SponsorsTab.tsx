'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Eye, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { TabLayout } from './TabLayout'
import { 
  Sponsor, 
  SPONSOR_TYPE_OPTIONS, 
  SPONSORSHIP_TYPE_OPTIONS,
  SPONSOR_STATUS_OPTIONS,
  CURRENCY_OPTIONS,
  StatusFilter 
} from '@/types/linked-records.types'

interface SponsorsTabProps {
  needyPersonId: string
  onClose: () => void
}

export function SponsorsTab({ needyPersonId, onClose }: SponsorsTabProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [searchValue, setSearchValue] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [sponsors, setSponsors] = useState<Sponsor[]>([])

  const columns = [
    { key: 'sponsor_name', label: 'Sponsor Adı' },
    { key: 'sponsor_type', label: 'Tür', width: '100px' },
    { key: 'sponsorship_type', label: 'Sponsorluk Tipi', width: '140px' },
    { key: 'monthly_amount', label: 'Aylık Tutar', width: '120px' },
    { key: 'start_date', label: 'Başlangıç', width: '100px' },
    { key: 'status', label: 'Durum', width: '80px' },
  ]

  const handleAdd = () => setIsAddModalOpen(true)
  const handleSave = async () => setIsAddModalOpen(false)

  return (
    <>
      <TabLayout
        showStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        showSearch={true}
        searchPlaceholder="Sponsor ara..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showAddButton={true}
        addButtonLabel="Bağla"
        onAdd={handleAdd}
        totalRecords={sponsors.length}
      >
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                {columns.map((col) => (
                  <TableHead key={col.key} style={{ width: col.width }}>{col.label}</TableHead>
                ))}
                <TableHead className="w-[80px]">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sponsors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">
                    Bağlı sponsor bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                sponsors.map((sp) => (
                  <TableRow key={sp.id}>
                    <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button></TableCell>
                    <TableCell>{sp.sponsor_name}</TableCell>
                    <TableCell>{SPONSOR_TYPE_OPTIONS.find(t => t.value === sp.sponsor_type)?.label}</TableCell>
                    <TableCell>{SPONSORSHIP_TYPE_OPTIONS.find(t => t.value === sp.sponsorship_type)?.label}</TableCell>
                    <TableCell>{sp.monthly_amount?.toLocaleString('tr-TR')} {sp.currency}</TableCell>
                    <TableCell>{sp.start_date}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${sp.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {SPONSOR_STATUS_OPTIONS.find(s => s.value === sp.status)?.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabLayout>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sponsor Bağla</DialogTitle>
            <DialogDescription>
              Bu kişiye sponsor bağlamak için mevcut bir sponsor seçin veya yeni sponsor ekleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            <p>Sponsor seçimi için arama yapın veya yeni sponsor ekleyin.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>İptal</Button>
            <Button onClick={handleSave}>Bağla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
