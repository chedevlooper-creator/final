'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Eye, Pencil, Trash2, CreditCard } from 'lucide-react'
import { TabLayout } from './TabLayout'
import { SocialCard, SOCIAL_CARD_TYPE_OPTIONS, SOCIAL_CARD_STATUS_OPTIONS, SocialCardType, SocialCardStatus, StatusFilter } from '@/types/linked-records.types'
import { format, isBefore } from 'date-fns'
import { tr } from 'date-fns/locale'

interface SocialCardsTabProps {
  needyPersonId: string
  onClose: () => void
}

export function SocialCardsTab({ needyPersonId, onClose }: SocialCardsTabProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [searchValue, setSearchValue] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [cards, setCards] = useState<SocialCard[]>([])
  const [formData, setFormData] = useState({
    card_type: '' as SocialCardType | '',
    card_name: '',
    card_number: '',
    issue_date: '',
    expiry_date: '',
    issuing_authority: '',
    coverage_details: '',
  })

  const columns = [
    { key: 'type', label: 'Kart Türü', width: '140px' },
    { key: 'name', label: 'Kart Adı' },
    { key: 'number', label: 'Kart No', width: '120px' },
    { key: 'issue_date', label: 'Veriliş', width: '100px' },
    { key: 'expiry_date', label: 'Geçerlilik', width: '100px' },
    { key: 'status', label: 'Durum', width: '90px' },
  ]

  const handleAdd = () => {
    setFormData({ card_type: '', card_name: '', card_number: '', issue_date: '', expiry_date: '', issuing_authority: '', coverage_details: '' })
    setIsAddModalOpen(true)
  }
  const handleSave = async () => setIsAddModalOpen(false)

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    return isBefore(new Date(expiryDate), new Date())
  }

  return (
    <>
      <TabLayout
        showStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        showSearch={true}
        searchPlaceholder="Kart ara..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showAddButton={true}
        addButtonLabel="Ekle"
        onAdd={handleAdd}
        totalRecords={cards.length}
      >
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                {columns.map((col) => (<TableHead key={col.key} style={{ width: col.width }}>{col.label}</TableHead>))}
                <TableHead className="w-[80px]">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">
                    Sosyal kart kaydı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                cards.map((card) => (
                  <TableRow key={card.id} className={isExpired(card.expiry_date) ? 'bg-danger/5' : ''}>
                    <TableCell>
                      <div className={`p-2 rounded ${
                        card.card_type === 'green_card' ? 'bg-success/10' :
                        card.card_type === 'refugee_card' ? 'bg-info/10' :
                        card.card_type === 'disability_card' ? 'bg-purple-100' :
                        'bg-muted'
                      }`}>
                        <CreditCard className="h-4 w-4" />
                      </div>
                    </TableCell>
                    <TableCell>{SOCIAL_CARD_TYPE_OPTIONS.find(t => t.value === card.card_type)?.label}</TableCell>
                    <TableCell>{card.card_name}</TableCell>
                    <TableCell className="font-mono text-sm">{card.card_number}</TableCell>
                    <TableCell>{card.issue_date && format(new Date(card.issue_date), 'dd.MM.yyyy', { locale: tr })}</TableCell>
                    <TableCell className={isExpired(card.expiry_date) ? 'text-danger font-medium' : ''}>
                      {card.expiry_date ? format(new Date(card.expiry_date), 'dd.MM.yyyy', { locale: tr }) : 'Süresiz'}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${
                        card.status === 'active' ? 'bg-success/10 text-success' :
                        card.status === 'expired' ? 'bg-danger/10 text-danger' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {SOCIAL_CARD_STATUS_OPTIONS.find(s => s.value === card.status)?.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
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
            <DialogTitle>Sosyal Kart Ekle</DialogTitle>
            <DialogDescription>
              Kişinin sosyal kart bilgilerini (yeşil kart, mavi kart, engelli kartı vb.) girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Kart Türü *</Label>
              <Select value={formData.card_type} onValueChange={(v) => setFormData({ ...formData, card_type: v as SocialCardType })}>
                <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                <SelectContent>{SOCIAL_CARD_TYPE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Kart Adı</Label><Input value={formData.card_name} onChange={(e) => setFormData({ ...formData, card_name: e.target.value })} /></div>
              <div><Label>Kart Numarası</Label><Input value={formData.card_number} onChange={(e) => setFormData({ ...formData, card_number: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Veriliş Tarihi</Label><Input type="date" value={formData.issue_date} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} /></div>
              <div><Label>Geçerlilik Tarihi</Label><Input type="date" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} /></div>
            </div>
            <div><Label>Veren Kurum</Label><Input value={formData.issuing_authority} onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })} /></div>
            <div><Label>Kapsam</Label><Input value={formData.coverage_details} onChange={(e) => setFormData({ ...formData, coverage_details: e.target.value })} placeholder="Kartın kapsamı..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>İptal</Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
