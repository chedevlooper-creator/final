'use client';

/**
 * Dosya Yükleme Sistemi v1.0.0
 * Supabase Storage entegrasyonlu comprehensive upload yönetimi
 */

import { Buckets, UploadResult } from './upload.types';

export class UploadError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

export class FileValidationError extends UploadError {
  constructor(message: string, public fileName: string) {
    super(message, 'FILE_VALIDATION_ERROR', 400);
    this.name = 'FileValidationError';
  }
}

export class FileSizeError extends FileValidationError {
  constructor(fileName: string, public maxSize: number, public actualSize: number) {
    super(
      `Dosya boyutu fazla: ${fileName} (${formatFileSize(actualSize)} > ${formatFileSize(maxSize)})`,
      fileName
    );
    this.name = 'FileSizeError';
    this.code = 'FILE_SIZE_ERROR';
  }
}

export class FileTypeError extends FileValidationError {
  constructor(fileName: string, public allowedTypes: string[]) {
    super(
      `Dosya türüne izin verilmiyor: ${fileName}. İzin verilen: ${allowedTypes.join(', ')}`,
      fileName
    );
    this.name = 'FileTypeError';
    this.code = 'FILE_TYPE_ERROR';
  }
}

// Yardımcı fonksiyonlar
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function getFileExtension(fileName: string): string {
  return fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function validateFileSize(file: File, maxSize: number): void {
  if (file.size > maxSize) {
    throw new FileSizeError(file.name, maxSize, file.size);
  }
}

export function validateFileType(file: File, allowedTypes: string[]): void {
  const fileExtension = '.' + getFileExtension(file.name).toLowerCase();
  const mimeType = file.type;

  const isValidExtension = allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return fileExtension === type.toLowerCase();
    }
    if (type.includes('/*')) {
      const baseType = type.split('/*')[0];
      return mimeType.startsWith(baseType);
    }
    return mimeType === type || fileExtension === type.toLowerCase();
  });

  if (!isValidExtension) {
    throw new FileTypeError(file.name, allowedTypes);
  }
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalName);
  const nameWithoutExt = originalName.replace(`.${extension}`, '');
  return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
}

export function getFileTypeCategory(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text') || 
      mimeType.includes('sheet') || mimeType.includes('presentation')) return 'document';
  return 'other';
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf';
}

export function isDocumentFile(file: File): boolean {
  const documentTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ];
  return documentTypes.includes(file.type);
}

// Progress tracking için interface
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type ProgressCallback = (progress: UploadProgress) => void;

/**
 * Supabase Storage'e dosya yükle
 * @param file Yüklenecek dosya
 * @param bucket Bucket adı
 * @param path Dosya yolu (opsiyonel)
 * @param onUploadProgress Progress callback
 * @returns UploadResult
 */
export async function uploadFile(
  file: File,
  bucket: Buckets = Buckets.DOCUMENTS,
  path: string = '',
  onUploadProgress?: ProgressCallback
): Promise<UploadResult> {
  try {
    // @ts-expect-error - Dynamic import of Supabase client - Supabase client will be imported from proper location
    const { supabase } = await import('@/lib/supabase/client');

    const fileName = generateUniqueFileName(file.name);
    const fullPath = path ? `${path}/${fileName}` : fileName;

    // Upload with progress tracking
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false,
        ...(onUploadProgress && {
          // Supabase doesn't support native progress tracking yet
          // We'll simulate it
        })
      });

    if (error) {
      throw new UploadError(error.message, error.code || 'UPLOAD_ERROR');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fullPath);

    return {
      path: fullPath,
      fullPath: data.path,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      bucket: bucket,
      publicUrl: publicUrl,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    throw new UploadError(
      error instanceof Error ? error.message : 'Bilinmeyen yükleme hatası',
      'UNKNOWN_UPLOAD_ERROR'
    );
  }
}

/**
 * Birden fazla dosya yükle
 * @param files Dosya listesi
 * @param bucket Bucket adı
 * @param path Dosya yolu
 * @param onProgress Progress callback
 * @returns UploadResult[]
 */
export async function uploadMultipleFiles(
  files: File[],
  bucket: Buckets = Buckets.DOCUMENTS,
  path: string = '',
  onProgress?: ProgressCallback
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const result = await uploadFile(file, bucket, path, (progress) => {
        if (onProgress) {
          // Global progress hesapla
          const globalProgress = {
            loaded: (i * file.size) + progress.loaded,
            total: files.reduce((sum, f) => sum + f.size, 0),
            percentage: ((i * 100) + progress.percentage) / totalFiles
          };
          onProgress(globalProgress);
        }
      });
      
      results.push(result);
    } catch (error) {
      console.error(`Dosya yükleme hatası: ${file.name}`, error);
      results.push({
        path: '',
        fullPath: '',
        fileName: '',
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        bucket: bucket,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      } as UploadResult & { error: string });
    }
  }

  return results;
}

/**
 * Dosya sil
 * @param path Dosya yolu
 * @param bucket Bucket adı
 */
export async function deleteFile(path: string, bucket: Buckets = Buckets.DOCUMENTS): Promise<void> {
  try {
    // @ts-expect-error - Dynamic import of Supabase client
    const { supabase } = await import('@/lib/supabase/client');

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new UploadError(error.message, error.code || 'DELETE_ERROR');
    }
  } catch (error) {
    throw new UploadError(
      error instanceof Error ? error.message : 'Dosya silinemedi',
      'DELETE_FAILED'
    );
  }
}

/**
 * Birden fazla dosya sil
 * @param paths Dosya yolları
 * @param bucket Bucket adı
 */
export async function deleteMultipleFiles(
  paths: string[],
  bucket: Buckets = Buckets.DOCUMENTS
): Promise<void> {
  try {
    // @ts-expect-error - Dynamic import of Supabase client
    const { supabase } = await import('@/lib/supabase/client');

    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      throw new UploadError(error.message, error.code || 'DELETE_MULTIPLE_ERROR');
    }
  } catch (error) {
    throw new UploadError(
      error instanceof Error ? error.message : 'Dosyalar silinemedi',
      'DELETE_MULTIPLE_FAILED'
    );
  }
}

/**
 * Dosya URL'i oluştur
 * @param path Dosya yolu
 * @param bucket Bucket adı
 * @returns Public URL
 */
export async function getFileUrl(
  path: string,
  bucket: Buckets = Buckets.DOCUMENTS
): Promise<string> {
  try {
    // @ts-expect-error - Dynamic import of Supabase client
    const { supabase } = await import('@/lib/supabase/client');

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  } catch (error) {
    throw new UploadError(
      error instanceof Error ? error.message : 'URL oluşturulamadı',
      'GET_URL_FAILED'
    );
  }
}

/**
 * Dosya listele
 * @param path Klasör yolu
 * @param bucket Bucket adı
 * @returns Dosya listesi
 */
export async function listFiles(
  path: string = '',
  bucket: Buckets = Buckets.DOCUMENTS
): Promise<unknown[]> {
  try {
    // @ts-expect-error - Dynamic import of Supabase client
    const { supabase } = await import('@/lib/supabase/client');

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);

    if (error) {
      throw new UploadError(error.message, error.code || 'LIST_ERROR');
    }

    return data || [];
  } catch (error) {
    throw new UploadError(
      error instanceof Error ? error.message : 'Dosya listelenemedi',
      'LIST_FAILED'
    );
  }
}

/**
 * Resimleri optimize et (thumbnail oluştur)
 * Supabase image transformation API kullanır
 */
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  const transformUrl = new URL(url);
  
  if (width) transformUrl.searchParams.set('width', width.toString());
  if (height) transformUrl.searchParams.set('height', height.toString());
  transformUrl.searchParams.set('quality', quality.toString());
  
  return transformUrl.toString();
}

/**
 * Dosya yükleme bilgisi al
 */
export function getFileInfo(file: File): {
  name: string;
  size: number;
  sizeFormatted: string;
  type: string;
  extension: string;
  category: 'image' | 'video' | 'audio' | 'document' | 'other';
} {
  return {
    name: file.name,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    type: file.type,
    extension: getFileExtension(file.name),
    category: getFileTypeCategory(file.type)
  };
}
