-- ============================================
-- KUMBARA SİSTEMİ MIGRATION
-- Tarih: 30 Ocak 2026
-- Açıklama: Fiziksel bağış kutuları (kumbara) takip sistemi
-- ============================================

-- ============================================
-- 1. KUMBARA LOKASYON TİPLERİ
-- ============================================
CREATE TABLE IF NOT EXISTS donation_box_location_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Varsayılan lokasyon tipleri
INSERT INTO donation_box_location_types (name, description, icon, color) VALUES
('Cami', 'Cami içi veya avlusu', 'mosque', '#10B981'),
('Okul', 'Eğitim kurumları', 'school', '#3B82F6'),
('İş Yeri', 'Ofis ve mağazalar', 'building', '#F59E0B'),
('Restoran', 'Restoran ve kafeler', 'utensils', '#EF4444'),
('Sokak', 'Sokak ve caddeler', 'map-pin', '#8B5CF6'),
('Etkinlik', 'Özel etkinlik alanları', 'calendar', '#EC4899'),
('Kurum', 'Diğer kurumlar', 'landmark', '#6366F1')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. KUMBARALAR (Donation Boxes)
-- ============================================
CREATE TABLE IF NOT EXISTS donation_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- KMB-001
  name TEXT NOT NULL,
  
  -- Lokasyon
  location_type_id UUID REFERENCES donation_box_location_types(id),
  location_name TEXT NOT NULL, -- Örn: "Fatih Camii"
  address TEXT,
  city TEXT DEFAULT 'İstanbul',
  district TEXT,
  neighborhood TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- İletişim
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  
  -- Kumbara detayları
  box_type TEXT DEFAULT 'standard' CHECK (box_type IN ('standard', 'digital', 'secure', 'custom')),
  box_size TEXT DEFAULT 'medium' CHECK (box_size IN ('small', 'medium', 'large', 'xlarge')),
  installation_date DATE,
  
  -- Durum
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'removed')),
  last_collection_date DATE,
  next_collection_date DATE,
  
  -- Tahmini performans
  estimated_monthly_amount DECIMAL(10,2) DEFAULT 0,
  average_collection_amount DECIMAL(10,2) DEFAULT 0,
  collection_count INTEGER DEFAULT 0,
  
  -- Notlar
  notes TEXT,
  
  -- Meta
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexler
CREATE INDEX idx_donation_boxes_status ON donation_boxes(status);
CREATE INDEX idx_donation_boxes_location_type ON donation_boxes(location_type_id);
CREATE INDEX idx_donation_boxes_city ON donation_boxes(city);
CREATE INDEX idx_donation_boxes_district ON donation_boxes(district);
CREATE INDEX idx_donation_boxes_coordinates ON donation_boxes(latitude, longitude);

-- RLS
ALTER TABLE donation_boxes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read boxes" ON donation_boxes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage boxes" ON donation_boxes
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator'));

-- ============================================
-- 3. TOPLAMA ROTALARI (Collection Routes)
-- ============================================
CREATE TABLE IF NOT EXISTS collection_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- ROTA-001
  name TEXT NOT NULL,
  description TEXT,
  
  -- Bölge
  city TEXT NOT NULL,
  district TEXT,
  
  -- Sorumlu
  collector_id UUID REFERENCES volunteers(id),
  backup_collector_id UUID REFERENCES volunteers(id),
  
  -- Program
  frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  collection_day INTEGER[] DEFAULT '{}', -- [1, 3, 5] = Pazartesi, Çarşamba, Cuma
  estimated_duration INTEGER, -- dakika
  
  -- Durum
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexler
CREATE INDEX idx_collection_routes_city ON collection_routes(city);
CREATE INDEX idx_collection_routes_collector ON collection_routes(collector_id);
CREATE INDEX idx_collection_routes_active ON collection_routes(is_active);

-- RLS
ALTER TABLE collection_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read routes" ON collection_routes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage routes" ON collection_routes
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator'));

-- ============================================
-- 4. ROTA-KUMBARA İLİŞKİSİ
-- ============================================
CREATE TABLE IF NOT EXISTS route_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES collection_routes(id) ON DELETE CASCADE,
  box_id UUID NOT NULL REFERENCES donation_boxes(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL DEFAULT 0,
  estimated_minutes INTEGER, -- Bir önceki duraktan süre
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(route_id, box_id)
);

CREATE INDEX idx_route_boxes_route ON route_boxes(route_id);
CREATE INDEX idx_route_boxes_box ON route_boxes(box_id);
CREATE INDEX idx_route_boxes_order ON route_boxes(route_id, stop_order);

-- RLS
ALTER TABLE route_boxes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read route boxes" ON route_boxes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage route boxes" ON route_boxes
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator'));

-- ============================================
-- 5. TOPLAMA KOLEKSİYONLARI (Collections)
-- ============================================
CREATE TYPE collection_status AS ENUM (
  'scheduled',    -- Planlandı
  'in_progress',  -- Devam ediyor
  'completed',    -- Tamamlandı
  'cancelled',    -- İptal edildi
  'postponed'     -- Ertelendi
);

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_number TEXT UNIQUE NOT NULL, -- TOP-20260130-001
  
  -- İlişkiler
  route_id UUID REFERENCES collection_routes(id),
  collector_id UUID REFERENCES volunteers(id),
  
  -- Tarih/Saat
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Durum
  status collection_status DEFAULT 'scheduled',
  cancellation_reason TEXT,
  
  -- Sonuçlar
  total_boxes INTEGER DEFAULT 0,
  collected_boxes INTEGER DEFAULT 0,
  skipped_boxes INTEGER DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  
  -- Notlar
  notes TEXT,
  
  -- Meta
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexler
CREATE INDEX idx_collections_route ON collections(route_id);
CREATE INDEX idx_collections_collector ON collections(collector_id);
CREATE INDEX idx_collections_date ON collections(scheduled_date DESC);
CREATE INDEX idx_collections_status ON collections(status);

-- RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read collections" ON collections
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage collections" ON collections
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator', 'user'));

-- ============================================
-- 6. KUMBARA TOPLAMA DETAYLARI
-- ============================================
CREATE TABLE IF NOT EXISTS collection_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  box_id UUID NOT NULL REFERENCES donation_boxes(id),
  
  -- Zamanlama
  arrived_at TIMESTAMPTZ,
  departed_at TIMESTAMPTZ,
  
  -- Sonuç
  is_collected BOOLEAN DEFAULT TRUE,
  skip_reason TEXT, -- toplanmadıysa sebep
  
  -- Miktarlar
  estimated_amount DECIMAL(10,2),
  actual_amount DECIMAL(10,2),
  
  -- İçerik detayı (opsiyonel)
  coin_amount DECIMAL(10,2) DEFAULT 0,
  bill_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Fotoğraf/Delil
  photos TEXT[],
  receipt_number TEXT,
  
  -- Notlar
  notes TEXT,
  
  -- Konum (gerçek toplama noktası)
  collected_latitude DECIMAL(10, 8),
  collected_longitude DECIMAL(11, 8),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(collection_id, box_id)
);

CREATE INDEX idx_collection_details_collection ON collection_details(collection_id);
CREATE INDEX idx_collection_details_box ON collection_details(box_id);

-- RLS
ALTER TABLE collection_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read details" ON collection_details
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage details" ON collection_details
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator', 'user'));

-- ============================================
-- 7. KUMBARA BAKIM/ARIZA KAYITLARI
-- ============================================
CREATE TABLE IF NOT EXISTS donation_box_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES donation_boxes(id) ON DELETE CASCADE,
  
  -- Bakım detayı
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('repair', 'cleaning', 'replacement', 'inspection', 'relocation')),
  description TEXT NOT NULL,
  
  -- Durum
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  
  -- Tarihler
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_date DATE,
  completed_at TIMESTAMPTZ,
  
  -- Sorumlular
  reported_by UUID REFERENCES profiles(id),
  assigned_to UUID REFERENCES volunteers(id),
  
  -- Maliyet
  cost DECIMAL(10,2) DEFAULT 0,
  
  -- Notlar
  resolution_notes TEXT,
  photos_before TEXT[],
  photos_after TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_box_maintenance_box ON donation_box_maintenance(box_id);
CREATE INDEX idx_box_maintenance_status ON donation_box_maintenance(status);

-- RLS
ALTER TABLE donation_box_maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read maintenance" ON donation_box_maintenance
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage maintenance" ON donation_box_maintenance
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' IN ('admin', 'moderator', 'user'));

-- ============================================
-- TRIGGERS
-- ============================================

-- Güncelleme tarihi trigger'ları
CREATE TRIGGER update_donation_boxes_updated_at BEFORE UPDATE ON donation_boxes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_routes_updated_at BEFORE UPDATE ON collection_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_box_maintenance_updated_at BEFORE UPDATE ON donation_box_maintenance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Toplama numarası otomatik oluşturma
CREATE SEQUENCE IF NOT EXISTS collection_seq START 1;

CREATE OR REPLACE FUNCTION generate_collection_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.collection_number IS NULL THEN
    NEW.collection_number := 'TOP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('collection_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_collection_number
  BEFORE INSERT ON collections
  FOR EACH ROW EXECUTE FUNCTION generate_collection_number();

-- Kumbara istatistiklerini güncelleme
CREATE OR REPLACE FUNCTION update_box_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Toplama tamamlandığında kumbara istatistiklerini güncelle
  IF NEW.status = 'completed' AND NEW.total_amount > 0 THEN
    UPDATE donation_boxes
    SET 
      last_collection_date = NEW.scheduled_date,
      collection_count = collection_count + 1,
      average_collection_amount = (
        (average_collection_amount * collection_count + NEW.total_amount) / (collection_count + 1)
      ),
      next_collection_date = CASE 
        WHEN EXISTS (SELECT 1 FROM collection_routes WHERE id = NEW.route_id) THEN
          NEW.scheduled_date + (
            SELECT CASE frequency
              WHEN 'daily' THEN INTERVAL '1 day'
              WHEN 'weekly' THEN INTERVAL '7 days'
              WHEN 'biweekly' THEN INTERVAL '14 days'
              WHEN 'monthly' THEN INTERVAL '1 month'
            END
            FROM collection_routes WHERE id = NEW.route_id
          )
        ELSE NULL
      END
    WHERE id IN (
      SELECT box_id FROM collection_details WHERE collection_id = NEW.id AND is_collected = TRUE
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_box_statistics
  AFTER UPDATE OF status ON collections
  FOR EACH ROW WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_box_statistics();

-- ============================================
-- VIEWS
-- ============================================

-- Kumbara performans view
CREATE OR REPLACE VIEW donation_box_performance AS
SELECT 
  db.id,
  db.code,
  db.name,
  db.location_name,
  dblt.name AS location_type,
  db.city,
  db.district,
  db.status,
  db.last_collection_date,
  db.next_collection_date,
  db.estimated_monthly_amount,
  db.average_collection_amount,
  db.collection_count,
  CASE 
    WHEN db.collection_count = 0 THEN 0
    ELSE ROUND((db.average_collection_amount / NULLIF(db.estimated_monthly_amount, 0) * 100)::numeric, 2)
  END AS performance_percentage,
  (
    SELECT COUNT(*) 
    FROM collection_details cd
    JOIN collections c ON cd.collection_id = c.id
    WHERE cd.box_id = db.id AND c.status = 'completed'
  ) AS total_collections
FROM donation_boxes db
LEFT JOIN donation_box_location_types dblt ON db.location_type_id = dblt.id
WHERE db.is_active = TRUE;

-- Rota detay view
CREATE OR REPLACE VIEW route_details AS
SELECT 
  cr.*,
  v.first_name || ' ' || v.last_name AS collector_name,
  (
    SELECT COUNT(*) FROM route_boxes WHERE route_id = cr.id
  ) AS box_count,
  (
    SELECT COALESCE(SUM(estimated_minutes), 0) FROM route_boxes WHERE route_id = cr.id
  ) AS total_estimated_minutes
FROM collection_routes cr
LEFT JOIN volunteers v ON cr.collector_id = v.id;

-- Aylık toplama özeti
CREATE OR REPLACE VIEW monthly_collection_summary AS
SELECT 
  DATE_TRUNC('month', scheduled_date) AS month,
  COUNT(*) AS collection_count,
  SUM(total_boxes) AS total_boxes,
  SUM(collected_boxes) AS collected_boxes,
  SUM(total_amount) AS total_amount,
  AVG(total_amount) AS average_amount
FROM collections
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', scheduled_date)
ORDER BY month DESC;

-- ============================================
-- SEED DATA
-- ============================================

-- Örnek kumbaralar
INSERT INTO donation_boxes (code, name, location_type_id, location_name, address, city, district, status, estimated_monthly_amount) VALUES
('KMB-001', 'Fatih Camii Kumbarası', (SELECT id FROM donation_box_location_types WHERE name = 'Cami'), 'Fatih Camii', 'Fatih Mah. Cami Sok.', 'İstanbul', 'Fatih', 'active', 5000),
('KMB-002', 'Kadıköy İş Merkezi', (SELECT id FROM donation_box_location_types WHERE name = 'İş Yeri'), 'Kadıköy Plaza', 'Caferağa Mah. Bahariye Cad.', 'İstanbul', 'Kadıköy', 'active', 3000),
('KMB-003', 'Üsküdar Restoran', (SELECT id FROM donation_box_location_types WHERE name = 'Restoran'), 'Deniz Restaurant', 'Mimar Sinan Mah.', 'İstanbul', 'Üsküdar', 'active', 1500)
ON CONFLICT (code) DO NOTHING;

-- Örnek rota
INSERT INTO collection_routes (code, name, city, district, frequency, collection_day) VALUES
('ROTA-001', 'Avrupa Yakası Rota 1', 'İstanbul', 'Fatih', 'weekly', ARRAY[1, 4])
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- COMPLETED
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'KUMBARA SİSTEMİ Migration Tamamlandı!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Tablolar:';
  RAISE NOTICE '- donation_box_location_types (Lokasyon Tipleri)';
  RAISE NOTICE '- donation_boxes (Kumbaralar)';
  RAISE NOTICE '- collection_routes (Toplama Rotaları)';
  RAISE NOTICE '- route_boxes (Rota-Kumbara İlişkisi)';
  RAISE NOTICE '- collections (Toplama Koleksiyonları)';
  RAISE NOTICE '- collection_details (Toplama Detayları)';
  RAISE NOTICE '- donation_box_maintenance (Bakım Kayıtları)';
  RAISE NOTICE '===========================================';
END $$;
