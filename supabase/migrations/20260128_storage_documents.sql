-- =====================================================
-- STORAGE: needy-documents Bucket ve RLS Politikaları
-- =====================================================

-- Storage bucket oluştur (eğer yoksa)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'needy-documents',
    'needy-documents',
    false,  -- Private bucket
    10485760,  -- 10MB limit
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

-- =====================================================
-- STORAGE RLS POLICICIES
-- =====================================================

-- Tüm authenticated kullanıcılar dosya yükleyebilir
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'needy-documents');

-- Tüm authenticated kullanıcılar dosya okuyabilir
CREATE POLICY "Allow authenticated reads" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'needy-documents');

-- Tüm authenticated kullanıcılar dosya silebilir
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'needy-documents');

-- =====================================================
-- needy_documents TABLOSU GÜNCELLEME
-- =====================================================

-- file_path zorunlu olmaktan çıkar (opsiyonel hale getir)
-- Bu migration öncesi kayıtları bozmamak için
ALTER TABLE needy_documents ALTER COLUMN file_path DROP NOT NULL;

-- storage_path kolonu ekle (Storage'daki tam yol)
ALTER TABLE needy_documents ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- file_url kolonu ekle (Geçici public URL)
ALTER TABLE needy_documents ADD COLUMN IF NOT EXISTS file_url TEXT;

-- file_name kolonu ekle (Orijinal dosya adı)
ALTER TABLE needy_documents ADD COLUMN IF NOT EXISTS file_name TEXT;

-- =====================================================
-- HELPER FONKSİYON: Dosya uzantısı alma
-- =====================================================
CREATE OR REPLACE FUNCTION get_file_extension(filename TEXT)
RETURNS TEXT AS $$
DECLARE
    ext TEXT;
BEGIN
    ext := lower(split_part(filename, '.', array_length(string_to_array(filename, '.'), 1)));
    RETURN ext;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- HELPER FONKSİYON: MIME type kontrolü
-- =====================================================
CREATE OR REPLACE FUNCTION is_valid_document_mime_type(mime_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN mime_type IN (
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- INDEXLER
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_needy_documents_storage_path ON needy_documents(storage_path);
