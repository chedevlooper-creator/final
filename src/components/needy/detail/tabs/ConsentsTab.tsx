'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Eye, Upload, CheckCircle2, XCircle, FileCheck } from 'lucide-react'
import { TabLayout } from './TabLayout'
import { Consent, CONSENT_TYPE_OPTIONS, SIGNATURE_TYPE_OPTIONS, ConsentType, SignatureType } from '@/types/linked-records.types'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface ConsentsTabProps {
  needyPersonId: string
  onClose: () => void
}

export function ConsentsTab({ needyPersonId, onClose }: ConsentsTabProps) {
  const [searchValue, setSearchValue] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [consents, setConsents] = useState<Consent[]>([])
  const [formData, setFormData] = useState({
    consent_type: '' as ConsentType | '',
    consent_name: '',
    given_date: '',
    expiry_date: '',
    signature_type: '' as SignatureType | '',
    witness_name: '',
    notes: '',
  })

  const columns = [
    { key: 'type', label: 'Rıza Türü', width: '150px' },
    { key: 'name', label: 'Açıklama' },
    { key: 'given_date', label: 'Veriliş Tarihi', width: '120px' },
    { key: 'expiry', label: 'Geçerlilik', width: '120px' },
    { key: 'signature', label: 'İmza Türü', width: '100px' },
    { key: 'status', label: 'Durum', width: '80px' },
  ]

  const handleAdd = () => {
    setFormData({ consent_type: '', consent_name: '', given_date: '', expiry_date: '', signature_type: '', witness_name: '', notes: '' })
    setIsAddModalOpen(true)
  }
  const handleSave = async () => setIsAddModalOpen(false)

  return (
    <>
      <TabLayout
        showStatusFilter={false}
        showSearch={true}
        searchPlaceholder="Rıza beyanı ara..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showAddButton={true}
        addButtonLabel="Ekle"
        onAdd={handleAdd}
        totalRecords={consents.length}
      >
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                {columns.map((col) => (<TableHead key={col.key} style={{ width: col.width }}>{col.label}</TableHead>))}
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">
                    Rıza beyanı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                consents.map((consent) => (
                  <TableRow key={consent.id}>
                    <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                        {CONSENT_TYPE_OPTIONS.find(t => t.value === consent.consent_type)?.label}
                      </div>
                    </TableCell>
                    <TableCell>{consent.consent_name}</TableCell>
                    <TableCell>{consent.given_date && format(new Date(consent.given_date), 'dd.MM.yyyy', { locale: tr })}</TableCell>
                    <TableCell>{consent.expiry_date ? format(new Date(consent.expiry_date), 'dd.MM.yyyy', { locale: tr }) : 'Süresiz'}</TableCell>
                    <TableCell>{SIGNATURE_TYPE_OPTIONS.find(s => s.value === consent.signature_type)?.label}</TableCell>
                    <TableCell>
                      {consent.is_given && !consent.revoked ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : consent.revoked ? (
                        <XCircle className="h-5 w-5 text-danger" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabLayout>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Rıza Beyanı Ekle</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Rıza Türü *</Label>
              <Select value={formData.consent_type} onValueChange={(v) => setFormData({ ...formData, consent_type: v as ConsentType })}>
                <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                <SelectContent>{CONSENT_TYPE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><Label>Açıklama</Label><Input value={formData.consent_name} onChange={(e) => setFormData({ ...formData, consent_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Veriliş Tarihi *</Label><Input type="date" value={formData.given_date} onChange={(e) => setFormData({ ...formData, given_date: e.target.value })} /></div>
              <div><Label>Geçerlilik Tarihi</Label><Input type="date" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} /></div>
            </div>
            <div><Label>İmza Türü *</Label>
              <Select value={formData.signature_type} onValueChange={(v) => setFormData({ ...formData, signature_type: v as SignatureType })}>
                <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                <SelectContent>{SIGNATURE_TYPE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><Label>Şahit</Label><Input value={formData.witness_name} onChange={(e) => setFormData({ ...formData, witness_name: e.target.value })} placeholder="Şahit adı soyadı" /></div>
            <div>
              <Label>Belge Yükle</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50">
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">İmzalı belge yükleyin</p>
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
