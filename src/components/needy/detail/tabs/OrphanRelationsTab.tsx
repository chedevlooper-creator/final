'use client'

import { useState, useEffect } from 'react'
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
import { OrphanRelation, ORPHAN_RELATION_TYPE_OPTIONS, OrphanRelationType, StatusFilter } from '@/types/linked-records.types'
import Link from 'next/link'
import { toast } from 'sonner'

interface OrphanRelationsTabProps {
  needyPersonId: string
  onClose: () => void
}

interface Orphan {
  id: string
  first_name: string
  last_name: string
}

export function OrphanRelationsTab({ needyPersonId, onClose }: OrphanRelationsTabProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [searchValue, setSearchValue] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [relations, setRelations] = useState<OrphanRelation[]>([])
  const [orphans, setOrphans] = useState<Orphan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    orphan_id: '',
    relation_type: '' as OrphanRelationType | '',
    relation_description: '',
    start_date: '',
    is_primary_guardian: false,
  })

  // Fetch orphans list for dropdown
  useEffect(() => {
    const fetchOrphans = async () => {
      try {
        const response = await fetch('/api/orphans?limit=100')
        if (response.ok) {
          const data = await response.json()
          setOrphans(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch orphans:', error)
      }
    }
    fetchOrphans()
  }, [])

  // Fetch existing relations
  useEffect(() => {
    const fetchRelations = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/needy/${needyPersonId}/orphan-relations`)
        if (response.ok) {
          const data = await response.json()
          setRelations(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch relations:', error)
      } finally {
        setIsLoading(false)
      }
    }
    if (needyPersonId) {
      fetchRelations()
    }
  }, [needyPersonId])

  const columns = [
    { key: 'orphan_name', label: 'Yetim Adı' },
    { key: 'relation_type', label: 'İlişki Türü', width: '150px' },
    { key: 'start_date', label: 'Başlangıç', width: '120px' },
    { key: 'is_primary', label: 'Birincil Veli', width: '100px' },
    { key: 'status', label: 'Durum', width: '80px' },
  ]

  const handleAdd = () => {
    setFormData({
      orphan_id: '',
      relation_type: '',
      relation_description: '',
      start_date: '',
      is_primary_guardian: false,
    })
    setIsAddModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.orphan_id || !formData.relation_type) {
      toast.error('Lütfen gerekli alanları doldurun')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/needy/${needyPersonId}/orphan-relations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Bağlantı oluşturulamadı')
      }

      const result = await response.json()
      setRelations([...relations, result.data])
      toast.success('Yetim bağlantısı başarıyla oluşturuldu')
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Save relation error:', error)
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu bağlantıyı kaldırmak istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/needy/${needyPersonId}/orphan-relations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Bağlantı silinemedi')
      }

      setRelations(relations.filter(r => r.id !== id))
      toast.success('Bağlantı başarıyla kaldırıldı')
    } catch (error) {
      console.error('Delete relation error:', error)
      toast.error('Bir hata oluştu')
    }
  }

  return (
    <>
      <TabLayout
        showStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        showSearch={true}
        searchPlaceholder="Yetim adı ara..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showAddButton={true}
        addButtonLabel="Bağla"
        onAdd={handleAdd}
        totalRecords={relations.length}
        currentPage={1}
        totalPages={1}
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
              {relations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">
                    Bağlı yetim kaydı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                relations.map((relation) => (
                  <TableRow key={relation.id}>
                    <TableCell>
                      <Link href={`/orphans/${relation.orphan_id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {relation.orphan?.first_name} {relation.orphan?.last_name}
                    </TableCell>
                    <TableCell>
                      {ORPHAN_RELATION_TYPE_OPTIONS.find(t => t.value === relation.relation_type)?.label}
                    </TableCell>
                    <TableCell>{relation.start_date}</TableCell>
                    <TableCell>
                      {relation.is_primary_guardian && (
                        <span className="text-success text-sm">✓</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${relation.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {relation.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(relation.id)}
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

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yetim Bağla</DialogTitle>
            <DialogDescription>
              Bu kişinin bir yetim ile olan ilişki türünü belirleyin ve bağlayın.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Yetim Seç *</Label>
              <Select
                value={formData.orphan_id}
                onValueChange={(v) => setFormData({ ...formData, orphan_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Yetim seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {orphans.map((orphan) => (
                    <SelectItem key={orphan.id} value={orphan.id}>
                      {orphan.first_name} {orphan.last_name}
                    </SelectItem>
                  ))}
                  {orphans.length === 0 && (
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      Henüz yetim kaydı yok
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>İlişki Türü *</Label>
              <Select
                value={formData.relation_type}
                onValueChange={(v) => setFormData({ ...formData, relation_type: v as OrphanRelationType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="İlişki türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  {ORPHAN_RELATION_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Başlangıç Tarihi</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Açıklama</Label>
              <Input
                value={formData.relation_description}
                onChange={(e) => setFormData({ ...formData, relation_description: e.target.value })}
                placeholder="İlişki hakkında not"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Kaydediliyor...' : 'Bağla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
