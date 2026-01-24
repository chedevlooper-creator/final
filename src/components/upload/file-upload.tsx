'use client';

/**
 * File Upload Component v1.0.0
 * Comprehensive dosya yükleme component'i
 * Drag & Drop, progress tracking, preview, validation
 */

import React, { 
  useState, 
  useCallback, 
  useRef, 
  useEffect,
  useMemo
} from 'react';
import { 
  Upload, 
  X, 
  File, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Music,
  AlertCircle,
  CheckCircle2,
  Download,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  uploadFile, 
  uploadMultipleFiles,
  getFileInfo,
  isImageFile,
  isVideoFile,
  isPdfFile,
  isDocumentFile,
  formatFileSize,
  validateFileSize,
  validateFileType,
  UploadProgress,
  type ProgressCallback
} from '@/lib/upload';
import { 
  Buckets, 
  UploadOptions, 
  FilePreview, 
  UploadStatistics,
  ValidationError
} from '@/lib/upload.types';

// Progress bar component
const ProgressBar = ({ 
  value, 
  max = 100, 
  className = '',
  showLabel = true 
}: { 
  value: number; 
  max?: number; 
  className?: string;
  showLabel?: boolean;
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`relative w-full ${className}`}>
      {showLabel && (
        <span className="absolute left-0 top-[-20px] text-xs text-muted-foreground">
          {Math.round(percentage)}%
        </span>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// File icon component
const FileIcon = ({ type, className = '' }: { type: string; className?: string }) => {
  if (type.startsWith('image/')) return <ImageIcon className={className} />;
  if (type.startsWith('video/')) return <Video className={className} />;
  if (type.startsWith('audio/')) return <Music className={className} />;
  if (type === 'application/pdf' || type.includes('document') || type.includes('text')) {
    return <FileText className={className} />;
  }
  return <File className={className} />;
};

// File preview card component
const FilePreviewCard = ({
  preview,
  onRemove,
  onView,
  onRetry
}: {
  preview: FilePreview;
  onRemove: () => void;
  onView?: () => void;
  onRetry?: () => void;
}) => {
  const info = preview.info;
  const statusColor = {
    pending: 'bg-warning/10 text-warning',
    uploading: 'bg-info/10 text-info',
    success: 'bg-success/10 text-success',
    error: 'bg-danger/10 text-danger'
  }[preview.state];

  const statusIcon = {
    pending: <AlertCircle className="w-4 h-4" />,
    uploading: <RefreshCw className="w-4 h-4 animate-spin" />,
    success: <CheckCircle2 className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />
  }[preview.state];

  return (
    <div className="relative p-4 border rounded-lg hover:border-border transition-colors">
      {/* Status indicator */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColor}`}>
        {statusIcon}
        {preview.state === 'pending' && 'Bekliyor'}
        {preview.state === 'uploading' && 'Yükleniyor'}
        {preview.state === 'success' && 'Tamamlandı'}
        {preview.state === 'error' && 'Hata'}
      </div>

      {/* File info */}
      <div className="flex items-start gap-3 pr-20">
        {/* File icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
          {preview.preview ? (
            <img 
              src={preview.preview} 
              alt={info.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <FileIcon type={info.type} className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{info.name}</p>
          <p className="text-sm text-muted-foreground">{info.sizeFormatted}</p>
          <p className="text-xs text-muted-foreground">{info.category}</p>

          {/* Progress bar for uploading files */}
          {preview.state === 'uploading' && preview.progress !== undefined && (
            <ProgressBar value={preview.progress} className="mt-2" />
          )}

          {/* Error message */}
          {preview.state === 'error' && preview.error && (
            <p className="mt-2 text-sm text-danger">{preview.error}</p>
          )}

          {/* Success with link */}
          {preview.state === 'success' && preview.result?.publicUrl && (
            <a 
              href={preview.result.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Dosyayı görüntüle
            </a>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        {preview.state === 'success' && onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="h-8 w-8 p-0"
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
        {preview.state === 'error' && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-8 w-8 p-0"
            title="Tekrar dene"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
        {(preview.state === 'pending' || preview.state === 'error') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 text-danger hover:text-danger hover:bg-danger/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Main FileUpload component
export interface FileUploadProps {
  // Upload options
  bucket?: Buckets;
  path?: string;
  maxSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
  maxFiles?: number;
  
  // UI options
  showPreview?: boolean;
  showProgress?: boolean;
  className?: string;
  disabled?: boolean;
  
  // Callbacks
  onUploadStart?: (files: File[]) => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  onUploadComplete?: (results: any[]) => void;
  onUploadError?: (error: Error) => void;
  onFileSelect?: (files: File[]) => void;
  onFileRemove?: (fileId: string) => void;
  
  // Labels
  label?: string;
  description?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  dragActiveLabel?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucket = Buckets.DOCUMENTS,
  path = '',
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes,
  multiple = true,
  maxFiles = 10,
  showPreview = true,
  showProgress = true,
  className = '',
  disabled = false,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onFileSelect,
  onFileRemove,
  label = 'Dosya Yükle',
  description = 'Dosyaları sürükleyip bırakın veya seçmek için tıklayın',
  acceptLabel = 'Yükle',
  rejectLabel = 'İptal',
  dragActiveLabel = 'Dosyaları bırakın'
}) => {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statistics, setStatistics] = useState<UploadStatistics>({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0,
    totalSize: 0,
    uploadedSize: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Create preview for file
  const createPreview = useCallback(async (file: File): Promise<FilePreview> => {
    const id = Math.random().toString(36).substring(2, 11);
    const info = getFileInfo(file);
    let preview: string | undefined;

    if (isImageFile(file)) {
      preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }

    return {
      id,
      file,
      preview,
      info,
      state: 'pending',
      progress: 0
    };
  }, []);

  // Validate file
  const validateFile = useCallback((file: File): ValidationError | null => {
    if (maxSize && file.size > maxSize) {
      return {
        type: 'size',
        message: `Dosya boyutu fazla: ${formatFileSize(file.size)} > ${formatFileSize(maxSize)}`,
        fileName: file.name,
        maxSize,
        actualSize: file.size
      };
    }

    if (allowedTypes && allowedTypes.length > 0) {
      try {
        validateFileType(file, allowedTypes);
      } catch (error) {
        if (error instanceof Error) {
          return {
            type: 'type',
            message: error.message,
            fileName: file.name,
            allowedTypes
          };
        }
      }
    }

    return null;
  }, [maxSize, allowedTypes]);

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    
    // Check max files limit
    if (maxFiles && previews.length + fileArray.length > maxFiles) {
      alert(`Maksimum ${maxFiles} dosya yükleyebilirsiniz`);
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    const invalidFiles: Array<{ file: File; error: ValidationError }> = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        invalidFiles.push({ file, error: validationError });
      } else {
        validFiles.push(file);
      }
    }

    // Show validation errors
    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map(
        ({ file, error }) => `${file.name}: ${error.message}`
      ).join('\n');
      alert(`Bazı dosyalar geçersiz:\n${errorMessages}`);
    }

    if (validFiles.length === 0) return;

    // Create previews
    const newPreviews = await Promise.all(
      validFiles.map(file => createPreview(file))
    );

    setPreviews(prev => [...prev, ...newPreviews]);
    
    // Update statistics
    setStatistics(prev => ({
      ...prev,
      total: prev.total + newPreviews.length,
      pending: prev.pending + newPreviews.length,
      totalSize: prev.totalSize + validFiles.reduce((sum, f) => sum + f.size, 0)
    }));

    onFileSelect?.(validFiles);
  }, [disabled, maxFiles, previews.length, validateFile, createPreview, onFileSelect]);

  // Upload files
  const uploadFiles = useCallback(async () => {
    const pendingPreviews = previews.filter(p => p.state === 'pending');
    
    if (pendingPreviews.length === 0) return;

    setIsUploading(true);
    onUploadStart?.(pendingPreviews.map(p => p.file));

    try {
      const results = await uploadMultipleFiles(
        pendingPreviews.map(p => p.file),
        bucket,
        path,
        (progress) => {
          onUploadProgress?.(progress);
          
          // Update individual progress
          setPreviews(prev => prev.map(p => {
            if (p.state === 'pending') {
              return {
                ...p,
                state: 'uploading',
                progress: progress.percentage
              };
            }
            return p;
          }));
        }
      );

      // Update previews with results
      setPreviews(prev => prev.map((p, index) => {
        const result = results[index];
        if (result && !('error' in result)) {
          return {
            ...p,
            state: 'success',
            progress: 100,
            result
          };
        } else if (result && 'error' in result) {
          return {
            ...p,
            state: 'error',
            error: String(result.error)
          };
        }
        return p;
      }));

      // Update statistics
      const successful = results.filter(r => !('error' in r)).length;
      const failed = results.filter(r => 'error' in r).length;

      setStatistics(prev => ({
        ...prev,
        successful: prev.successful + successful,
        failed: prev.failed + failed,
        pending: prev.pending - successful - failed,
        uploadedSize: prev.uploadedSize + results
          .filter(r => !('error' in r))
          .reduce((sum, r) => sum + r.size, 0)
      }));

      onUploadComplete?.(results);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Yükleme başarısız');
      onUploadError?.(err);
      
      setPreviews(prev => prev.map(p => {
        if (p.state === 'uploading') {
          return {
            ...p,
            state: 'error',
            error: err.message
          };
        }
        return p;
      }));
    } finally {
      setIsUploading(false);
    }
  }, [previews, bucket, path, onUploadStart, onUploadProgress, onUploadComplete, onUploadError]);

  // Remove file
  const removeFile = useCallback((id: string) => {
    setPreviews(prev => {
      const removed = prev.find(p => p.id === id);
      if (removed) {
        setStatistics(s => ({
          ...s,
          total: s.total - 1,
          pending: s.pending - (removed.state === 'pending' ? 1 : 0),
          totalSize: s.totalSize - removed.info.size
        }));
      }
      return prev.filter(p => p.id !== id);
    });
    onFileRemove?.(id);
  }, [onFileRemove]);

  // Clear all
  const clearAll = useCallback(() => {
    setPreviews([]);
    setStatistics({
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      totalSize: 0,
      uploadedSize: 0
    });
  }, []);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  // File input handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  // Accept attribute
  const accept = useMemo(() => {
    if (allowedTypes && allowedTypes.length > 0) {
      return allowedTypes.join(',');
    }
    return undefined;
  }, [allowedTypes]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        
        <p className="text-lg font-medium text-foreground mb-1">
          {isDragging ? dragActiveLabel : label}
        </p>
        
        <p className="text-sm text-muted-foreground mb-2">
          {description}
        </p>
        
        {maxSize && (
          <p className="text-xs text-muted-foreground">
            Maksimum dosya boyutu: {formatFileSize(maxSize)}
          </p>
        )}
        
        {allowedTypes && allowedTypes.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            İzin verilen türler: {allowedTypes.join(', ')}
          </p>
        )}
      </div>

      {/* Statistics */}
      {statistics.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{statistics.total}</p>
            <p className="text-sm text-muted-foreground">Toplam</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{statistics.successful}</p>
            <p className="text-sm text-muted-foreground">Başarılı</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">{statistics.pending}</p>
            <p className="text-sm text-muted-foreground">Bekleyen</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-danger">{statistics.failed}</p>
            <p className="text-sm text-muted-foreground">Başarısız</p>
          </div>
          </div>
      )}

      {/* File previews */}
      {showPreview && previews.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">
              Dosyalar ({previews.length})
            </h3>
            <div className="flex gap-2">
              {previews.some(p => p.state === 'pending') && (
                <Button
                  onClick={uploadFiles}
                  disabled={isUploading}
                  size="sm"
                >
                  {isUploading ? 'Yükleniyor...' : 'Yükle'}
                </Button>
              )}
              <Button
                onClick={clearAll}
                disabled={isUploading}
                size="sm"
                variant="outline"
              >
                Temizle
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            {previews.map(preview => (
              <FilePreviewCard
                key={preview.id}
                preview={preview}
                onRemove={() => removeFile(preview.id)}
                onRetry={() => {
                  // Reset and retry
                  setPreviews(prev => prev.map(p => 
                    p.id === preview.id 
                      ? { ...p, state: 'pending', progress: 0, error: undefined }
                      : p
                  ));
                  uploadFiles();
                }}
                onView={() => window.open(preview.result?.publicUrl, '_blank')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Global progress */}
      {showProgress && isUploading && (
        <div className="p-4 bg-info/10 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-info">Yükleniyor...</span>
            <span className="text-sm text-info/80">
              {formatFileSize(statistics.uploadedSize)} / {formatFileSize(statistics.totalSize)}
            </span>
          </div>
          <ProgressBar 
            value={(statistics.uploadedSize / statistics.totalSize) * 100} 
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
