'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Upload, 
  Camera, 
  Trash2,
  User,
  ImageIcon
} from 'lucide-react'
import Image from 'next/image'

interface PhotoSectionProps {
  photoUrl?: string
  onPhotoChange: (file: File | null) => void
}

export function PhotoSection({ photoUrl, onPhotoChange }: PhotoSectionProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(photoUrl || null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      onPhotoChange(file)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onPhotoChange(null)
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Fotoğraf
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3">
          {/* Photo Preview */}
          <div className="relative w-32 h-40 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/25 overflow-hidden">
            {previewUrl ? (
              <>
                <Image
                  src={previewUrl}
                  alt="Kişi fotoğrafı"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={handleRemove}
                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <User className="h-12 w-12 mb-2" />
                <span className="text-xs">Fotoğraf Yok</span>
              </div>
            )}
          </div>

          {/* Upload Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild className="relative">
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-1" />
                <span className="text-xs">Yükle</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </Button>
            <Button variant="outline" size="sm">
              <ImageIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Galeriden</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
