'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Trash2, Upload, Camera, Image as ImageIcon, Star, StarOff, X } from 'lucide-react'
import { Photo, PHOTO_TYPE_OPTIONS, PhotoType } from '@/types/linked-records.types'
import { useNeedyPhotos, useDeletePhoto, useSetPrimaryPhoto, useUploadPhoto } from '@/hooks/queries/use-needy-photos'
import { toast } from 'sonner'

interface PhotosTabProps {
  needyPersonId: string
  onClose: () => void
}

export function PhotosTab({ needyPersonId, onClose: _onClose }: PhotosTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    photo_type: 'general' as PhotoType,
    description: '',
  })

  const { data: photos = [], isLoading } = useNeedyPhotos(needyPersonId)
  const deleteMutation = useDeletePhoto()
  const setPrimaryMutation = useSetPrimaryPhoto()
  const uploadMutation = useUploadPhoto()

  const handleAdd = () => {
    setFormData({ photo_type: 'general', description: '' })
    setIsAddModalOpen(true)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await uploadMutation.mutateAsync({
        needyPersonId,
        file,
        photoType: formData.photo_type,
      })
      toast.success('Fotoğraf yüklendi')
      setIsAddModalOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fotoğraf yüklenirken hata oluştu'
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = () => {
    fileInputRef.current?.click()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteMutation.mutateAsync({ id, needyPersonId })
        toast.success('Fotoğraf silindi')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Fotoğraf silinirken hata oluştu'
        toast.error(message)
      }
    }
  }

  const handleSetPrimary = async (id: string) => {
    try {
      await setPrimaryMutation.mutateAsync({ id, needyPersonId })
      toast.success('Profil fotoğrafı güncellendi')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fotoğraf güncellenirken hata oluştu'
      toast.error(message)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{photos.length} Fotoğraf</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleAdd}>
              <Camera className="h-4 w-4 mr-1" />
              Çek
            </Button>
            <Button size="sm" onClick={handleAdd}>
              <Upload className="h-4 w-4 mr-1" />
              Yükle
            </Button>
          </div>
        </div>

        {/* Galeri */}
        {photos.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Fotoğraf Yok</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Henüz fotoğraf yüklenmemiş. Fotoğraf yüklemek için aşağıdaki butonu kullanın.
            </p>
            <Button onClick={handleAdd}>
              <Upload className="h-4 w-4 mr-2" />
              Fotoğraf Yükle
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group border rounded-lg overflow-hidden aspect-square bg-muted cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.file_path}
                  alt={photo.description || 'Fotoğraf'}
                  className="w-full h-full object-cover"
                />
                
                {/* Primary badge */}
                {photo.is_primary && (
                  <div className="absolute top-2 left-2 bg-warning text-warning-foreground px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Profil
                  </div>
                )}
                
                {/* Photo type badge */}
                <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                  {PHOTO_TYPE_OPTIONS.find(t => t.value === photo.photo_type)?.label}
                </div>
                
                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSetPrimary(photo.id)
                    }}
                  >
                    {photo.is_primary ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(photo.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Yükleme Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Fotoğraf Yükle</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Fotoğraf Türü</Label>
              <Select
                value={formData.photo_type}
                onValueChange={(v) => setFormData({ ...formData, photo_type: v as PhotoType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PHOTO_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Fotoğraf</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Fotoğraf yüklemek için tıklayın veya sürükleyin
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WEBP (Max: 5MB)
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading ? 'Yükleniyor...' : 'Yükle'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fotoğraf Görüntüleme Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {selectedPhoto && (
              <img
                src={selectedPhoto.file_path}
                alt={selectedPhoto.description || 'Fotoğraf'}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
