'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Eye, Gift, Truck, Trash2 } from 'lucide-react'
import { TabLayout } from './TabLayout'
import { AID_TYPE_OPTIONS, DELIVERY_STATUS_OPTIONS, CURRENCY_OPTIONS, AidType } from '@/types/linked-records.types'
import { useLinkedRecords, useCreateLinkedRecord, useDeleteLinkedRecord, NeedyAidReceived } from '@/hooks/queries/use-linked-records'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface AidsReceivedTabProps {
  needyPersonId: string
  onClose?: () => void
}

export function AidsReceivedTab({ needyPersonId }: AidsReceivedTabProps) {
  const [searchValue, setSearchValue] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  const { data: aids = [], isLoading } = useLinkedRecords<NeedyAidReceived>('needy_aids_received', needyPersonId, { orderBy: 'aid_date' })
  const createMutation = useCreateLinkedRecord<NeedyAidReceived>('needy_aids_received')
  const deleteMutation = useDeleteLinkedRecord('needy_aids_received')

  const [formData, setFormData] = useState({
    aid_type: '' as AidType | '',
    aid_category: '',
    description: '',
    amount: '',
    currency: 'TRY',
    aid_date: new Date().toISOString().split('T')[0],
  })

  const columns = [
    { key: 'date', label: 'Yardım Tarihi', width: '120px' },
    { key: 'type', label: 'Yardım Türü', width: '120px' },
    { key: 'category', label: 'Kategori', width: '120px' },
    { key: 'description', label: 'Açıklama' },
    { key: 'amount', label: 'Tutar', width: '120px' },
    { key: 'status', label: 'Teslimat', width: '100px' },
  ]

  const handleAdd = () => {
    setFormData({ aid_type: '', aid_category: '', description: '', amount: '', currency: 'TRY', aid_date: new Date().toISOString().split('T')[0] })
    setIsAddModalOpen(true)
  }

  const handleSave = async () => {
    try {
      await createMutation.mutateAsync({
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        needy_person_id: needyPersonId,
        delivery_status: 'delivered'
      })
      toast.success('Yardım kaydı eklendi')
      setIsAddModalOpen(false)
    } catch (_error) {
      toast.error('Kayıt başarısız oldu')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu yardım kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await deleteMutation.mutateAsync({ id, needyPersonId })
        toast.success('Kayıt silindi')
      } catch (_error) {
        toast.error('Silme işlemi başarısız oldu')
      }
    }
  }

  const filteredAids = aids.filter(aid => 
    !searchValue || 
    aid.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
    aid.aid_category?.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Toplam tutar hesaplama
  const totalAmount = aids.reduce((sum, aid) => sum + (aid.amount || 0), 0)

  return (
    <>
      <TabLayout
        showStatusFilter={false}
        showSearch={true}
        searchPlaceholder="Yardım ara..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showAddButton={true}
        addButtonLabel="Ekle"
        onAdd={handleAdd}
        totalRecords={filteredAids.length}
        isLoading={isLoading}
      >
        {/* Özet Kartı */}
        {aids.length > 0 && (
          <div className="bg-success/5 border border-success/20 rounded-lg p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-success">Toplam Yardım Tutarı</p>
                <p className="text-2xl font-bold text-success">{totalAmount.toLocaleString('tr-TR')} ₺</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-success">Yardım Sayısı</p>
              <p className="text-xl font-bold text-success">{aids.length}</p>
            </div>
          </div>
        )}

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
              {filteredAids.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">
                    Yapılan yardım kaydı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                filteredAids.map((aid) => (
                  <TableRow key={aid.id}>
                    <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button></TableCell>
                    <TableCell>{aid.aid_date && format(new Date(aid.aid_date), 'dd.MM.yyyy', { locale: tr })}</TableCell>
                    <TableCell>{AID_TYPE_OPTIONS.find(t => t.value === aid.aid_type)?.label}</TableCell>
                    <TableCell>{aid.aid_category}</TableCell>
                    <TableCell className="truncate max-w-[200px]">{aid.description}</TableCell>
                    <TableCell className="font-medium">{aid.amount?.toLocaleString('tr-TR')} {aid.currency}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 w-fit ${
                        aid.delivery_status === 'delivered' ? 'bg-success/10 text-success' : 
                        aid.delivery_status === 'pending' ? 'bg-warning/10 text-warning' : 
                        'bg-muted text-muted-foreground'
                      }`}>
                        <Truck className="h-3 w-3" />
                        {DELIVERY_STATUS_OPTIONS.find(s => s.value === aid.delivery_status)?.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(aid.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <DialogTitle>Yardım Kaydı Ekle</DialogTitle>
            <DialogDescription>
              İhtiyaç sahibine yapılan yardımın detaylarını buradan kaydedebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Yardım Tarihi *</Label><Input type="date" value={formData.aid_date} onChange={(e) => setFormData({ ...formData, aid_date: e.target.value })} /></div>
              <div><Label>Yardım Türü *</Label>
                <Select value={formData.aid_type} onValueChange={(v) => setFormData({ ...formData, aid_type: v as AidType })}>
                  <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                  <SelectContent>{AID_TYPE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Kategori</Label><Input value={formData.aid_category} onChange={(e) => setFormData({ ...formData, aid_category: e.target.value })} /></div>
            <div><Label>Açıklama</Label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tutar</Label><Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} /></div>
              <div><Label>Para Birimi</Label>
                <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCY_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
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
