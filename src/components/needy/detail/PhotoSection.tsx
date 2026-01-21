"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  Camera,
  Trash2,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  uploadFile,
  deleteFile,
  validateFileSize,
  validateFileType,
} from "@/lib/upload";
import { Buckets } from "@/lib/upload.types";

interface PhotoSectionProps {
  photoUrl?: string | null;
  photoPath?: string | null;
  needyPersonId: string;
  onPhotoChange: (url: string | null, path: string | null) => void;
  onPhotoUpload?: (url: string, path: string) => Promise<void>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function PhotoSection({
  photoUrl,
  photoPath,
  needyPersonId,
  onPhotoChange,
  onPhotoUpload,
}: PhotoSectionProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(photoUrl || null);
  const [currentPath, setCurrentPath] = useState<string | null>(
    photoPath || null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);

      // Validate file
      try {
        validateFileSize(file, MAX_FILE_SIZE);
        validateFileType(file, ALLOWED_TYPES);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Dosya geçersiz";
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Show preview immediately
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Upload to Supabase Storage
        const result = await uploadFile(
          file,
          Buckets.PROFILES,
          `needy/${needyPersonId}`,
          (progress) => {
            setUploadProgress(progress.percentage);
          },
        );

        // Update state with uploaded URL
        setPreviewUrl(result.publicUrl);
        setCurrentPath(result.path);
        onPhotoChange(result.publicUrl, result.path);

        // Call optional callback to save to database
        if (onPhotoUpload) {
          await onPhotoUpload(result.publicUrl, result.path);
        }

        toast.success("Fotoğraf başarıyla yüklendi");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Yükleme hatası";
        setError(errorMessage);
        setPreviewUrl(photoUrl || null);
        toast.error(errorMessage);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        // Clean up local preview
        URL.revokeObjectURL(localPreview);
      }
    },
    [needyPersonId, onPhotoChange, onPhotoUpload, photoUrl],
  );

  const handleRemove = useCallback(async () => {
    if (!currentPath) {
      setPreviewUrl(null);
      onPhotoChange(null, null);
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      // Delete from Supabase Storage
      await deleteFile(currentPath, Buckets.PROFILES);

      setPreviewUrl(null);
      setCurrentPath(null);
      onPhotoChange(null, null);

      toast.success("Fotoğraf silindi");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Silme hatası";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [currentPath, onPhotoChange]);

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
                  unoptimized={previewUrl.startsWith("blob:")}
                />
                {/* Upload Progress Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin mb-2" />
                    <span className="text-xs text-white">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                )}
                {/* Delete Button */}
                {!isUploading && (
                  <button
                    onClick={handleRemove}
                    disabled={isDeleting}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                )}
                {/* Success indicator */}
                {!isUploading && currentPath && (
                  <div className="absolute bottom-1 left-1 p-1 bg-green-500 rounded-full">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                {isUploading ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <span className="text-xs">
                      {Math.round(uploadProgress)}%
                    </span>
                  </>
                ) : (
                  <>
                    <User className="h-12 w-12 mb-2" />
                    <span className="text-xs">Fotoğraf Yok</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Button */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="relative"
            disabled={isUploading || isDeleting}
          >
            <label className="cursor-pointer">
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-1" />
              )}
              <span className="text-xs">
                {isUploading ? "Yükleniyor..." : "Fotoğraf Yükle"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                disabled={isUploading || isDeleting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
            </label>
          </Button>

          {/* File info */}
          <p className="text-xs text-muted-foreground text-center">
            JPG, PNG, WebP, GIF (maks. 5MB)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
