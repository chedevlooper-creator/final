'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { TabLayout } from './TabLayout'
import { Interview, INTERVIEW_TYPE_OPTIONS, INTERVIEW_OUTCOME_OPTIONS, INTERVIEW_STATUS_OPTIONS, InterviewType, InterviewOutcome } from '@/types/linked-records.types'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface InterviewsTabProps {
  needyPersonId: string
  onClose?: () => void
}

export function InterviewsTab(_props: InterviewsTabProps) {
  const [searchValue, setSearchValue] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [interviews, _setInterviews] = useState<Interview[]>([])
  const [formData, setFormData] = useState({
    interview_date: '',
    interview_type: '' as InterviewType | '',
    interviewer_name: '',
    subject: '',
    summary: '',
    outcome: '' as InterviewOutcome | '',
  })

  const columns = [
    { key: 'date', label: 'Tarih', width: '140px' },
    { key: 'type', label: 'Görüşme Türü', width: '120px' },
    { key: 'interviewer', label: 'Görüşmeci', width: '150px' },
    { key: 'subject', label: 'Konu' },
    { key: 'outcome', label: 'Sonuç', width: '100px' },
    { key: 'status', label: 'Durum', width: '100px' },
  ]

  const handleAdd = () => {
    setFormData({ interview_date: '', interview_type: '', interviewer_name: '', subject: '', summary: '', outcome: '' })
    setIsAddModalOpen(true)
  }
  const handleSave = async () => setIsAddModalOpen(false)

  return (
    <>
      <TabLayout
        showStatusFilter={false}
        showSearch={true}
        searchPlaceholder="Görüşme ara..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showAddButton={true}
        addButtonLabel="Ekle"
        onAdd={handleAdd}
        totalRecords={interviews.length}
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
              {interviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">
                    Görüşme kaydı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                interviews.map((int) => (
                  <TableRow key={int.id}>
                    <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button></TableCell>
                    <TableCell>{int.interview_date && format(new Date(int.interview_date), 'dd.MM.yyyy HH:mm', { locale: tr })}</TableCell>
                    <TableCell>{INTERVIEW_TYPE_OPTIONS.find(t => t.value === int.interview_type)?.label}</TableCell>
                    <TableCell>{int.interviewer_name}</TableCell>
                    <TableCell className="truncate max-w-[200px]">{int.subject}</TableCell>
                    <TableCell>{INTERVIEW_OUTCOME_OPTIONS.find(o => o.value === int.outcome)?.label}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${int.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {INTERVIEW_STATUS_OPTIONS.find(s => s.value === int.status)?.label}
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
            <DialogTitle>Görüşme Ekle</DialogTitle>
            <DialogDescription>
              Bu kişi ile yapılan görüşme kaydını ve sonuçlarını girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tarih/Saat *</Label><Input type="datetime-local" value={formData.interview_date} onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })} /></div>
              <div><Label>Görüşme Türü *</Label>
                <Select value={formData.interview_type} onValueChange={(v) => setFormData({ ...formData, interview_type: v as InterviewType })}>
                  <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                  <SelectContent>{INTERVIEW_TYPE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Görüşmeci</Label><Input value={formData.interviewer_name} onChange={(e) => setFormData({ ...formData, interviewer_name: e.target.value })} /></div>
            <div><Label>Konu</Label><Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} /></div>
            <div><Label>Özet</Label><Textarea value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} rows={3} /></div>
            <div><Label>Sonuç</Label>
              <Select value={formData.outcome} onValueChange={(v) => setFormData({ ...formData, outcome: v as InterviewOutcome })}>
                <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                <SelectContent>{INTERVIEW_OUTCOME_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
              </Select>
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
