/**
 * Dosya Yükleme Sistemi - Type Definitions v1.0.0
 */

/**
 * Supabase Storage bucket'ları
 */
export enum Buckets {
  DOCUMENTS = "documents", // Belgeler
  IMAGES = "images", // Resimler
  VIDEOS = "videos", // Videolar
  PROFILES = "profiles", // Profil fotoğrafları
  EVIDENCE = "evidence", // Kanıt/belge dosyaları
  TEMP = "temp", // Geçici dosyalar
}

/**
 * Upload sonucu
 */
export interface UploadResult {
  path: string; // Storage path
  fullPath: string; // Full storage path
  fileName: string; // Generated file name
  originalName: string; // Original file name
  size: number; // File size in bytes
  mimeType: string; // MIME type
  bucket: Buckets; // Bucket name
  publicUrl: string; // Public URL
  createdAt: string; // ISO timestamp
}

/**
 * Upload seçenekleri
 */
export interface UploadOptions {
  maxSize?: number; // Maksimum dosya boyutu (bytes)
  allowedTypes?: string[]; // İzin verilen dosya türleri
  path?: string; // Yükleme yolu
  bucket?: Buckets; // Bucket
  validate?: boolean; // Validasyon yap
  onProgress?: (progress: UploadProgressInfo) => void; // Progress callback
  onSuccess?: (result: UploadResult) => void; // Success callback
  onError?: (error: UploadError) => void; // Error callback
}

/**
 * Progress bilgisi
 */
export interface UploadProgressInfo {
  loaded: number; // Yüklenen byte
  total: number; // Toplam byte
  percentage: number; // Yüzde (0-100)
  fileName?: string; // Dosya adı
  status: "pending" | "uploading" | "success" | "error";
}

/**
 * Upload state
 */
export interface UploadState {
  file: File;
  progress: UploadProgressInfo;
  result?: UploadResult;
  error?: string;
  id: string;
}

/**
 * Dosya önizleme bilgisi
 */
export interface FilePreview {
  id: string;
  file: File;
  preview?: string; // Base64 preview (for images)
  url?: string; // External URL
  thumbnail?: string; // Thumbnail URL
  info: FileInfo;
  state: "pending" | "uploading" | "success" | "error";
  progress?: number;
  error?: string;
  result?: UploadResult;
}

/**
 * Dosya bilgisi
 */
export interface FileInfo {
  name: string;
  size: number;
  sizeFormatted: string;
  type: string;
  extension: string;
  category: FileCategory;
}

/**
 * Dosya kategorisi
 */
export type FileCategory = "image" | "video" | "audio" | "document" | "other";

/**
 * Validasyon sonucu
 */
export interface ValidationResult {
  valid: boolean;
  error?: ValidationError;
}

/**
 * Validasyon hatası
 */
export interface ValidationError {
  type: "size" | "type" | "count" | "other";
  message: string;
  fileName?: string;
  maxSize?: number;
  actualSize?: number;
  allowedTypes?: string[];
}

/**
 * Upload statistics
 */
export interface UploadStatistics {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  totalSize: number;
  uploadedSize: number;
}

/**
 * Dosya seçimi yapılandırması
 */
export interface FileSelectConfig {
  multiple?: boolean; // Çoklu seçim
  accept?: string; // Accept attribute (e.g., "image/*,.pdf")
  maxSize?: number; // Max size (bytes)
  maxCount?: number; // Max file count
  disabled?: boolean; // Disabled
}

/**
 * Drag & Drop zone state
 */
export interface DropZoneState {
  isDragging: boolean;
  isDragOver: boolean;
  isProcessing: boolean;
}

/**
 * Image optimization options
 */
export interface ImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 1-100
  format?: "webp" | "jpeg" | "png";
  enableThumbnail?: boolean;
  thumbnailSize?: number;
}

/**
 * Video processing options
 */
export interface VideoOptions {
  enableThumbnail?: boolean;
  thumbnailTime?: number; // Thumbnail zamanı (saniye)
  maxSize?: number; // Max video size
  quality?: "low" | "medium" | "high";
}

/**
 * Upload task queue
 */
export interface UploadTask {
  id: string;
  file: File;
  options: UploadOptions;
  status: "pending" | "uploading" | "success" | "error" | "cancelled";
  progress: number;
  result?: UploadResult;
  error?: Error;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Upload error class
 */
export class UploadError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

/**
 * Batch upload sonuçları
 */
export interface BatchUploadResult {
  successful: UploadResult[];
  failed: Array<{
    file: File;
    error: string;
  }>;
  total: number;
  statistics: UploadStatistics;
}

/**
 * Dosya yönetimi yapılandırması
 */
export interface FileManagementConfig {
  bucket: Buckets;
  path?: string;
  enablePublicUrl?: boolean;
  enableVersioning?: boolean;
  maxFiles?: number;
  maxTotalSize?: number;
  allowedTypes?: string[];
}

/**
 * Cloudinary-style transformation
 */
export interface ImageTransform {
  width?: number;
  height?: number;
  quality?: number;
  crop?: "scale" | "fit" | "fill" | "crop";
  format?: "webp" | "jpg" | "png";
}

/**
 * Upload metadata
 */
export interface UploadMetadata {
  uploadedBy?: string;
  category?: string;
  tags?: string[];
  description?: string;
  customData?: Record<string, any>;
}
