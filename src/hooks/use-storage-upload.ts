'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Desteklenen dosya türleri
export const ALLOWED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg,.jpeg',
  'image/jpg': '.jpg,.jpeg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
} as const

export type AllowedMimeType = keyof typeof ALLOWED_FILE_TYPES

// Maksimum dosya boyutu: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export interface UploadOptions {
  bucket?: string
  folder?: string
  _onProgress?: (progress: number) => void
}

export interface UploadResult {
  path: string
  fileName: string
  fileSize: number
  mimeType: string
  publicUrl: string | null
}

export interface UseStorageUploadReturn {
  uploadFile: (file: File, needyPersonId: string, options?: UploadOptions) => Promise<UploadResult | null>
  deleteFile: (path: string) => Promise<boolean>
  getPublicUrl: (path: string) => string | null
  downloadFile: (path: string, fileName: string) => Promise<void>
  isUploading: boolean
  progress: number
  error: string | null
}

/**
 * Supabase Storage dosya yükleme hook'u
 */
export function useStorageUpload(): UseStorageUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  /**
   * Dosya türü validasyonu
   */
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Boyut kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Dosya boyutu çok büyük. Maksimum 10MB olmalıdır. (Yüklenen: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      }
    }

    // Tür kontrolü
    if (!ALLOWED_FILE_TYPES[file.type as AllowedMimeType]) {
      const allowedTypes = Object.values(ALLOWED_FILE_TYPES).join(', ')
      return {
        valid: false,
        error: `Desteklenmeyen dosya türü. İzin verilen türler: ${allowedTypes}`,
      }
    }

    return { valid: true }
  }, [])

  /**
   * Benzersiz dosya adı oluştur
   */
  const generateUniqueFileName = useCallback((originalName: string, needyPersonId: string): string => {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()?.toLowerCase() || ''
    const baseName = originalName.split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9\-_]/g, '_')
    
    return `${needyPersonId}/${timestamp}_${randomString}_${baseName}.${extension}`
  }, [])

  /**
   * Dosya yükle
   */
  const uploadFile = useCallback(
    async (file: File, needyPersonId: string, options: UploadOptions = {}): Promise<UploadResult | null> => {
      const { bucket = 'needy-documents', _onProgress } = options

      setError(null)
      setProgress(0)

      try {
        // Validasyon
        const validation = validateFile(file)
        if (!validation.valid) {
          setError(validation.error || 'Geçersiz dosya')
          toast.error(validation.error || 'Geçersiz dosya')
          return null
        }

        setIsUploading(true)

        // Dosya adını oluştur
        const filePath = generateUniqueFileName(file.name, needyPersonId)

        // Dosyayı yükle
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Yükleme hatası: ${uploadError.message}`)
        }

        // Public URL al
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path)

        setProgress(100)

        toast.success('Dosya başarıyla yüklendi')

        return {
          path: uploadData.path,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          publicUrl: urlData?.publicUrl || null,
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Dosya yüklenirken bir hata oluştu'
        setError(errorMessage)
        toast.error(errorMessage)
        return null
      } finally {
        setIsUploading(false)
      }
    },
    [supabase, validateFile, generateUniqueFileName]
  )

  /**
   * Dosya sil
   */
  const deleteFile = useCallback(
    async (path: string, bucket: string = 'needy-documents'): Promise<boolean> => {
      try {
        const { error: deleteError } = await supabase.storage.from(bucket).remove([path])

        if (deleteError) {
          throw new Error(`Silme hatası: ${deleteError.message}`)
        }

        toast.success('Dosya silindi')
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Dosya silinirken bir hata oluştu'
        toast.error(errorMessage)
        return false
      }
    },
    [supabase]
  )

  /**
   * Public URL al
   */
  const getPublicUrl = useCallback(
    (path: string, bucket: string = 'needy-documents'): string | null => {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return data?.publicUrl || null
    },
    [supabase]
  )

  /**
   * Dosya indir
   */
  const downloadFile = useCallback(
    async (path: string, fileName: string, bucket: string = 'needy-documents'): Promise<void> => {
      try {
        const { data, error: downloadError } = await supabase.storage.from(bucket).download(path)

        if (downloadError) {
          throw new Error(`İndirme hatası: ${downloadError.message}`)
        }

        // Blob'dan indirme bağlantısı oluştur
        const url = window.URL.createObjectURL(data)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast.success('Dosya indiriliyor...')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Dosya indirilirken bir hata oluştu'
        toast.error(errorMessage)
      }
    },
    [supabase]
  )

  return {
    uploadFile,
    deleteFile,
    getPublicUrl,
    downloadFile,
    isUploading,
    progress,
    error,
  }
}

export default useStorageUpload
