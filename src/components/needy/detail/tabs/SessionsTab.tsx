'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { TabLayout } from './TabLayout'
import { InterviewSession, SESSION_TYPE_OPTIONS, SESSION_STATUS_OPTIONS, SessionType } from '@/types/linked-records.types'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface SessionsTabProps {
  needyPersonId: string
  onClose: () => void
}

export function SessionsTab({ needyPersonId: _needyPersonId, onClose: _onClose }: SessionsTabProps) {
  const [searchValue, setSearchValue] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [sessions] = useState<InterviewSession[]>([])
  const [formData, setFormData] = useState({
    scheduled_date: '',
    session_type: '' as SessionType | '',
    counselor_name: '',
    duration_minutes: '',
    session_notes: '',
  })

  const columns = [
    { key: 'session_number', label: '#', width: '50px' },
    { key: 'date', label: 'Planlanan Tarih', width: '140px' },
    { key: 'type', label: 'Seans Tipi', width: '120px' },
    { key: 'counselor', label: 'Danışman', width: '150px' },
    { key: 'duration', label: 'Süre', width: '80px' },
    { key: 'status', label: 'Durum', width: '100px' },
  ]

  const handleAdd = () => {
    setFormData({ scheduled_date: '', session_type: '', counselor_name: '', duration_minutes: '', session_notes: '' })
    setIsAddModalOpen(true)
  }
  const handleSave = async () => setIsAddModalOpen(false)

  return (
    <>
      <TabLayout
        showStatusFilter={false}
        showSearch={true}
        searchPlaceholder="Seans ara..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showAddButton={true}
        addButtonLabel="Planla"
        onAdd={handleAdd}
        totalRecords={sessions.length}
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
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">
                    Seans kaydı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((sess) => (
                  <TableRow key={sess.id}>
                    <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button></TableCell>
                    <TableCell className="font-medium">{sess.session_number}</TableCell>
                    <TableCell>{sess.scheduled_date && format(new Date(sess.scheduled_date), 'dd.MM.yyyy HH:mm', { locale: tr })}</TableCell>
                    <TableCell>{SESSION_TYPE_OPTIONS.find(t => t.value === sess.session_type)?.label}</TableCell>
                    <TableCell>{sess.counselor_name}</TableCell>
                    <TableCell>{sess.duration_minutes ? `${sess.duration_minutes} dk` : '-'}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${
                        sess.status === 'completed' ? 'bg-success/10 text-success' : 
                        sess.status === 'scheduled' ? 'bg-info/10 text-info' : 
                        'bg-muted text-muted-foreground'
                      }`}>
                        {SESSION_STATUS_OPTIONS.find(s => s.value === sess.status)?.label}
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
          <DialogHeader><DialogTitle>Seans Planla</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tarih/Saat *</Label><Input type="datetime-local" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} /></div>
              <div><Label>Seans Tipi *</Label>
                <Select value={formData.session_type} onValueChange={(v) => setFormData({ ...formData, session_type: v as SessionType })}>
                  <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                  <SelectContent>{SESSION_TYPE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Danışman</Label><Input value={formData.counselor_name} onChange={(e) => setFormData({ ...formData, counselor_name: e.target.value })} /></div>
              <div><Label>Süre (dk)</Label><Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} /></div>
            </div>
            <div><Label>Notlar</Label><Textarea value={formData.session_notes} onChange={(e) => setFormData({ ...formData, session_notes: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>İptal</Button>
            <Button onClick={handleSave}>Planla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
