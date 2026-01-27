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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Eye, Download, Trash2, FileText, Upload, CheckCircle2 } from 'lucide-react'
import { TabLayout } from './TabLayout'
import { DOCUMENT_TYPE_OPTIONS, DocumentType } from '@/types/linked-records.types'
import { useLinkedRecords, useCreateLinkedRecord, useDeleteLinkedRecord } from '@/hooks/queries/use-linked-records'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface DocumentsTabProps {
  needyPersonId: string
  onClose?: () => void
}

export function DocumentsTab({ needyPersonId }: DocumentsTabProps) {
  const [searchValue, setSearchValue] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  const { data: documents = [], isLoading } = useLinkedRecords<Record<string, unknown>>('needy_documents', needyPersonId)
  const createMutation = useCreateLinkedRecord<Record<string, unknown>>('needy_documents')
  const deleteMutation = useDeleteLinkedRecord('needy_documents')

  const [formData, setFormData] = useState({
    document_type: '' as DocumentType | '',
    document_name: '',
    document_number: '',
    issue_date: '',
    expiry_date: '',
    issuing_authority: '',
    notes: '',
  })

  const columns = [
    { key: 'document_type', label: 'Belge Türü', width: '150px' },
    { key: 'document_name', label: 'Belge Adı' },
    { key: 'document_number', label: 'Belge No', width: '120px' },
    { key: 'issue_date', label: 'Veriliş Tarihi', width: '120px' },
    { key: 'expiry_date', label: 'Geçerlilik Tarihi', width: '120px' },
    { key: 'is_verified', label: 'Doğrulandı', width: '100px' },
  ]

  const handleAdd = () => {
    setFormData({
      document_type: '',
      document_name: '',
      document_number: '',
      issue_date: '',
      expiry_date: '',
      issuing_authority: '',
      notes: '',
    })
    setIsAddModalOpen(true)
  }

  const handleSave = async () => {
    try {
      await createMutation.mutateAsync({
        ...formData,
        needy_person_id: needyPersonId
      })
      toast.success('Döküman eklendi')
      setIsAddModalOpen(false)
    } catch (_error) {
      toast.error('Döküman yüklenemedi')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu dokümanı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteMutation.mutateAsync({ id, needyPersonId })
        toast.success('Döküman silindi')
      } catch (_error) {
        toast.error('Silme işlemi başarısız oldu')
      }
    }
  }

  const filteredDocs = documents.filter((doc: Record<string, unknown>) => {
    const docName = doc['document_name'] as string | undefined
    const docNumber = doc['document_number'] as string | undefined
    return !searchValue || 
      docName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      docNumber?.includes(searchValue)
  })

  return (
    <>
      <TabLayout
        showStatusFilter={false}
        showSearch={true}
        searchPlaceholder="Belge adı veya numarası ara..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showAddButton={true}
        addButtonLabel="Yükle"
        onAdd={handleAdd}
        totalRecords={filteredDocs.length}
        isLoading={isLoading}
      >
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                {columns.map((col) => (
                  <TableHead key={col.key} style={{ width: col.width }}>
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="w-[120px]">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">
                    Kayıtlı doküman bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocs.map((doc: Record<string, unknown>) => (
                  <TableRow key={doc['id'] as string}>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {DOCUMENT_TYPE_OPTIONS.find(t => t.value === doc['document_type'])?.label}
                      </div>
                    </TableCell>
                    <TableCell>{doc['document_name'] as string}</TableCell>
                    <TableCell>{doc['document_number'] as string}</TableCell>
                    <TableCell>
                      {doc['issue_date'] ? format(new Date(doc['issue_date'] as string), 'dd.MM.yyyy', { locale: tr }) : null}
                    </TableCell>
                    <TableCell>
                      {doc['expiry_date'] ? format(new Date(doc['expiry_date'] as string), 'dd.MM.yyyy', { locale: tr }) : null}
                    </TableCell>
                    <TableCell>
                      {doc['is_verified'] ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(doc['id'] as string)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabLayout>

      {/* Ekleme Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Doküman Yükle</DialogTitle>
            <DialogDescription>
              İhtiyaç sahibine ait yeni bir dökümanı buradan sisteme yükleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Belge Türü *</Label>
              <Select
                value={formData.document_type}
                onValueChange={(v) => setFormData({ ...formData, document_type: v as DocumentType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Belge türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Belge Adı *</Label>
              <Input
                value={formData.document_name}
                onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                placeholder="Belge açıklaması"
              />
            </div>
            
            <div>
              <Label>Dosya</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Dosya yüklemek için tıklayın veya sürükleyin
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG (Max: 10MB)
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Belge Numarası</Label>
                <Input
                  value={formData.document_number}
                  onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                  placeholder="Belge numarası"
                />
              </div>
              <div>
                <Label>Veren Kurum</Label>
                <Input
                  value={formData.issuing_authority}
                  onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                  placeholder="Veren kurum"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Veriliş Tarihi</Label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Geçerlilik Tarihi</Label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSave}>
              Yükle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
