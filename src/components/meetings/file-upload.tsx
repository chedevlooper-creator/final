'use client';

/**
 * Dosya Yükleme Bileşeni
 * File Upload Component
 * 
 * Toplantıya dosya yükleme
 * Upload files to meeting
 */

import { useState, useRef } from 'react';
import { useMeetingFiles, useUploadFile } from '@/hooks/queries/use-meetings';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Upload, File, FileText, Image, Film, Music, Archive, X, Download } from 'lucide-react';

interface FileUploadProps {
  meetingId: string;
}

export function FileUpload({ meetingId }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: files, isLoading } = useMeetingFiles(meetingId);
  const uploadFile = useUploadFile();

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList) return;
    
    Array.from(fileList).forEach(async (file) => {
      try {
        await uploadFile.mutateAsync({ meetingId, file });
      } catch (error) {
        console.error('Dosya yüklenirken hata:', error);
        alert(`"${file.name}" yüklenirken hata oluştu`);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-purple-600" />;
    if (mimeType.startsWith('video/')) return <Film className="w-5 h-5 text-red-600" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5 text-pink-600" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-5 h-5 text-blue-600" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return <Archive className="w-5 h-5 text-orange-600" />;
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-lg font-medium text-gray-700 mb-1">
          Dosya yüklemek için tıklayın veya sürükleyin
        </p>
        <p className="text-sm text-gray-500">
          Herhangi bir dosya türünü yükleyebilirsiniz
        </p>
      </div>

      {/* Files List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
      ) : !files || files.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <File className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>Henüz dosya yüklenmemiş</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file: any) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getFileIcon(file.mime_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.file_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.file_size)} •{' '}
                    {format(new Date(file.created_at), 'd MMM', { locale: tr })}
                  </p>
                </div>
              </div>
              <a
                href={file.file_path}
                download={file.file_name}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="İndir"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploadFile.isPending && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">Dosya yükleniyor...</span>
          </div>
        </div>
      )}
    </div>
  );
}
