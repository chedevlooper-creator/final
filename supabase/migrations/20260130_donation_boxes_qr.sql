-- ============================================
-- KUMBARA QR KOD KOLONU
-- ============================================

-- QR kod URL kolonu ekle
ALTER TABLE donation_boxes 
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- QR kod için indeks
CREATE INDEX IF NOT EXISTS idx_donation_boxes_qr ON donation_boxes(qr_code_url);

-- ============================================
-- STORAGE BUCKET OLUŞTURMA
-- ============================================

-- Kumbara QR kodları için storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('donation-boxes', 'donation-boxes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS politikaları
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'donation-boxes');

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'donation-boxes' 
    AND auth.role() = 'authenticated'
  );

-- ============================================
-- QR KOD İÇERİĞİ OLUŞTURMA FONKSİYONU
-- ============================================
CREATE OR REPLACE FUNCTION generate_box_qr_content(box_code TEXT, box_id UUID)
RETURNS TEXT AS $$
BEGIN
  -- Format: KUMBARA|KOD|UUID
  -- Örn: KUMBARA|KMB-001|550e8400-e29b-41d4-a716-446655440000
  RETURN 'KUMBARA|' || box_code || '|' || box_id::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- KUMBARA DOĞRULAMA FONKSİYONU
-- QR kod okutulduğunda kumbara bilgilerini getir
-- ============================================
CREATE OR REPLACE FUNCTION get_box_by_qr(qr_content TEXT)
RETURNS TABLE (
  id UUID,
  code TEXT,
  name TEXT,
  status TEXT,
  location_name TEXT,
  message TEXT
) AS $$
DECLARE
  v_box_code TEXT;
  v_box_id UUID;
  v_parts TEXT[];
BEGIN
  -- QR içeriğini parse et: KUMBARA|KOD|UUID
  v_parts := string_to_array(qr_content, '|');
  
  IF array_length(v_parts, 1) != 3 OR v_parts[1] != 'KUMBARA' THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, 'Geçersiz QR kod'::TEXT;
    RETURN;
  END IF;
  
  v_box_code := v_parts[2];
  v_box_id := v_parts[3]::UUID;
  
  RETURN QUERY
  SELECT 
    db.id,
    db.code,
    db.name,
    db.status,
    db.location_name,
    CASE 
      WHEN db.status = 'active' THEN 'Kumbara aktif'
      WHEN db.status = 'maintenance' THEN 'Kumbara bakımda'
      WHEN db.status = 'inactive' THEN 'Kumbara pasif'
      ELSE 'Kumbara kaldırıldı'
    END::TEXT as message
  FROM donation_boxes db
  WHERE db.id = v_box_id AND db.code = v_box_code;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, 'Kumbara bulunamadı'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;
