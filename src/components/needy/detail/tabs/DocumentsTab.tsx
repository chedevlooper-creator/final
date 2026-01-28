'use client'

import { useState, useRef, useCallback } from 'react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Eye, 
  Download, 
  Trash2, 
  FileText, 
  Upload, 
  CheckCircle2, 
  X,
  FileImage,
  FileSpreadsheet,
  MoreVertical,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { TabLayout } from './TabLayout'
import { DOCUMENT_TYPE_OPTIONS, DocumentType, Document as NeedyDocument } from '@/types/linked-records.types'
import { useLinkedRecords, useCreateLinkedRecord, useDeleteLinkedRecord } from '@/hooks/queries/use-linked-records'
import { useStorageUpload, MAX_FILE_SIZE } from '@/hooks/use-storage-upload'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DocumentsTabProps {
  needyPersonId: string
  onClose: () => void
}

// Dosya ikonu seçici
function getFileIcon(mimeType?: string | null) {
  if (!mimeType) return FileText
  if (mimeType.startsWith('image/')) return FileImage
  if (mimeType.includes('pdf')) return FileText
  return FileSpreadsheet
}

// Dosya boyutu formatlayıcı
function formatFileSize(bytes?: number | null): string {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function DocumentsTab({ needyPersonId }: DocumentsTabProps) {
  const [searchValue, setSearchValue] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<NeedyDocument | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { data: documents = [], isLoading } = useLinkedRecords<NeedyDocument>('needy_documents', needyPersonId)
  const createMutation = useCreateLinkedRecord<NeedyDocument>('needy_documents')
  const deleteMutation = useDeleteLinkedRecord('needy_documents')
  const { uploadFile, deleteFile, downloadFile, getPublicUrl, isUploading, progress } = useStorageUpload()

  const [formData, setFormData] = useState<{
    document_type: DocumentType | ''
    document_name: string
    document_number: string
    issue_date: string
    expiry_date: string
    issuing_authority: string
    notes: string
  }>({
    document_type: '',
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
    { key: 'file_size', label: 'Boyut', width: '100px' },
    { key: 'issue_date', label: 'Veriliş Tarihi', width: '120px' },
    { key: 'is_verified', label: 'Doğrulandı', width: '100px' },
  ]

  // Dosya seçme işleyicisi
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Dosya boyutu çok büyük. Maksimum 10MB olmalıdır.`)
      return
    }

    setSelectedFile(file)
    
    // Otomatik belge adı önerisi
    if (!formData.document_name) {
      const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.')
      setFormData(prev => ({ ...prev, document_name: fileNameWithoutExt }))
    }

    // Görsel için önizleme oluştur
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }, [formData.document_name])

  // Dosya seçme diyalogunu aç
  const handleSelectFileClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Seçili dosyayı temizle
  const handleClearFile = useCallback(() => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrl])

  // Yeni belge ekleme modalını aç
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
    setSelectedFile(null)
    setPreviewUrl(null)
    setIsAddModalOpen(true)
  }

  // Belge kaydet
  const handleSave = async () => {
    try {
      if (!formData.document_type) {
        toast.error('Belge türü seçilmelidir')
        return
      }

      if (!formData.document_name) {
        toast.error('Belge adı girilmelidir')
        return
      }

      let storagePath: string | null = null
      let fileUrl: string | null = null
      let fileSize: number | null = null
      let mimeType: string | null = null
      let originalFileName: string | null = null

      // Eğer dosya seçildiyse önce storage'a yükle
      if (selectedFile) {
        const uploadResult = await uploadFile(selectedFile, needyPersonId)
        if (!uploadResult) {
          return // Yükleme başarısız
        }
        storagePath = uploadResult.path
        fileUrl = uploadResult.publicUrl
        fileSize = uploadResult.fileSize
        mimeType = uploadResult.mimeType
        originalFileName = uploadResult.fileName
      }

      // Veritabanına kaydet
      await createMutation.mutateAsync({
        needy_person_id: needyPersonId,
        document_type: formData.document_type,
        document_name: formData.document_name,
        document_number: formData.document_number || null,
        issue_date: formData.issue_date || null,
        expiry_date: formData.expiry_date || null,
        issuing_authority: formData.issuing_authority || null,
        notes: formData.notes || null,
        storage_path: storagePath,
        file_path: storagePath, // Geriye uyumluluk için
        file_url: fileUrl,
        file_name: originalFileName,
        file_size: fileSize,
        mime_type: mimeType,
        is_verified: false,
      } as NeedyDocument)

      toast.success('Döküman eklendi')
      setIsAddModalOpen(false)
      handleClearFile()
    } catch (_error) {
      toast.error('Döküman kaydedilemedi')
    }
  }

  // Belge sil
  const handleDelete = async (doc: NeedyDocument) => {
    if (!confirm('Bu dokümanı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      // Önce storage'dan dosyayı sil (eğer varsa)
      if (doc.storage_path || doc.file_path) {
        const path = doc.storage_path || doc.file_path
        if (path) {
          await deleteFile(path)
        }
      }

      // Sonra veritabanından kaydı sil
      await deleteMutation.mutateAsync({ id: doc.id, needyPersonId })
      toast.success('Döküman silindi')
    } catch (_error) {
      toast.error('Silme işlemi başarısız oldu')
    }
  }

  // Belge önizleme
  const handlePreview = (doc: NeedyDocument) => {
    if (!doc.storage_path && !doc.file_path) {
      toast.info('Bu kayıt için dosya yüklenmemiş')
      return
    }

    const path = doc.storage_path || doc.file_path
    if (!path) return

    const publicUrl = getPublicUrl(path)
    if (publicUrl) {
      setPreviewDocument(doc)
      setPreviewUrl(publicUrl)
      setIsPreviewOpen(true)
    }
  }

  // Belge indir
  const handleDownload = async (doc: NeedyDocument) => {
    const path = doc.storage_path || doc.file_path
    if (!path) {
      toast.error('İndirilecek dosya bulunamadı')
      return
    }

    const fileName = doc.file_name || doc.document_name || 'belge'
    await downloadFile(path, fileName)
  }

  // Filtreleme
  const filteredDocs = documents.filter((doc: NeedyDocument) => 
    !searchValue || 
    doc.document_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    doc.document_number?.includes(searchValue)
  )

  return (
    <>
      <TabLayout
        showStatusFilter={false}
        showSearch={true}
        searchPlaceholder="Belge adı veya numarası ara..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showAddButton={true}
        addButtonLabel="Yeni Belge Ekle"
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
                <TableHead className="w-[100px]">İşlem</TableHead>
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
                filteredDocs.map((doc: NeedyDocument) => {
                  const FileIcon = getFileIcon(doc.mime_type)
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handlePreview(doc)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileIcon className="h-4 w-4 text-muted-foreground" />
                          {DOCUMENT_TYPE_OPTIONS.find(t => t.value === doc.document_type)?.label}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{doc.document_name}</span>
                          {doc.file_name && (
                            <span className="text-xs text-muted-foreground">{doc.file_name}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{doc.document_number || '-'}</TableCell>
                      <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                      <TableCell>
                        {doc.issue_date && format(new Date(doc.issue_date), 'dd.MM.yyyy', { locale: tr })}
                      </TableCell>
                      <TableCell>
                        {doc.is_verified && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreview(doc)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Görüntüle
                            </DropdownMenuItem>
                            {(doc.storage_path || doc.file_path) && (
                              <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                <Download className="h-4 w-4 mr-2" />
                                İndir
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDelete(doc)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </TabLayout>

      {/* Ekleme Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Belge Ekle</DialogTitle>
            <DialogDescription>
              İhtiyaç sahibine ait yeni bir belgeyi buradan sisteme yükleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Dosya Yükleme Alanı */}
            <div>
              <Label>Dosya *</Label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                onChange={handleFileSelect}
              />
              
              {!selectedFile ? (
                <div 
                  onClick={handleSelectFileClick}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    "hover:bg-muted/50 hover:border-primary/50"
                  )}
                >
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">
                    Dosya yüklemek için tıklayın veya sürükleyin
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, JPG, PNG, DOC, DOCX (Max: 10MB)
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-start gap-3">
                    {previewUrl && selectedFile.type.startsWith('image/') ? (
                      <img 
                        src={previewUrl} 
                        alt="Önizleme" 
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedFile.type}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 shrink-0"
                      onClick={handleClearFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Yükleme Progress */}
                  {isUploading && (
                    <div className="mt-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Yükleniyor... {progress}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Belge Türü */}
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
            
            {/* Belge Adı */}
            <div>
              <Label>Belge Adı *</Label>
              <Input
                value={formData.document_name}
                onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                placeholder="Örn: Kimlik Fotokopisi, Rıza Beyanı, vb."
              />
            </div>
            
            {/* Belge No ve Veren Kurum */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Belge Numarası</Label>
                <Input
                  value={formData.document_number}
                  onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                  placeholder="Örn: 12345678901"
                />
              </div>
              <div>
                <Label>Veren Kurum</Label>
                <Input
                  value={formData.issuing_authority}
                  onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                  placeholder="Örn: Nüfus Müdürlüğü"
                />
              </div>
            </div>
            
            {/* Tarihler */}
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

            {/* Notlar */}
            <div>
              <Label>Notlar</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ek notlar..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddModalOpen(false)}
              disabled={isUploading}
            >
              İptal
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isUploading || !formData.document_type || !formData.document_name}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Önizleme Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{previewDocument?.document_name}</DialogTitle>
            <DialogDescription>
              {previewDocument && DOCUMENT_TYPE_OPTIONS.find(t => t.value === previewDocument.document_type)?.label}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 flex-1 min-h-0 overflow-auto">
            {previewUrl && previewDocument?.mime_type?.startsWith('image/') ? (
              <img 
                src={previewUrl} 
                alt={previewDocument?.document_name || 'Belge'} 
                className="max-w-full h-auto mx-auto"
              />
            ) : previewUrl ? (
              <div className="h-[500px]">
                <iframe 
                  src={previewUrl} 
                  className="w-full h-full border-0"
                  title={previewDocument?.document_name || 'Belge'}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Dosya önizlemesi yapılamıyor</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Kapat
            </Button>
            {previewDocument && (
              <Button onClick={() => handleDownload(previewDocument)}>
                <Download className="h-4 w-4 mr-2" />
                İndir
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
