-- Yardım Yönetim Paneli - Core Tables Migration
-- Sürüm: 1.0.0
-- Tarih: 18 Ocak 2026
-- Tanım: Temel veritabanı tabloları ve RLS politikaları

-- ============================================
-- 1. İHTİYAÇ SAHİPLERİ (Needy Persons)
-- ============================================
CREATE TABLE IF NOT EXISTS needy_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  tc_no TEXT UNIQUE,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  postal_code TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  family_size INTEGER,
  monthly_income DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  needs_description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_needy_persons_status ON needy_persons(status);
CREATE INDEX idx_needy_persons_city ON needy_persons(city);
CREATE INDEX idx_needy_persons_priority ON needy_persons(priority);
CREATE INDEX idx_needy_persons_created_at ON needy_persons(created_at DESC);

-- RLS
ALTER TABLE needy_persons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON needy_persons
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON needy_persons
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update" ON needy_persons
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete" ON needy_persons
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 2. BAĞIŞÇILAR (Donors)
-- ============================================
CREATE TABLE IF NOT EXISTS donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE,
  address TEXT,
  city TEXT,
  district TEXT,
  postal_code TEXT,
  tc_no TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  donor_type TEXT DEFAULT 'individual' CHECK (donor_type IN ('individual', 'corporate')),
  company_name TEXT,
  tax_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_donors_status ON donors(status);
CREATE INDEX idx_donors_city ON donors(city);
CREATE INDEX idx_donors_email ON donors(email);
CREATE INDEX idx_donors_created_at ON donors(created_at DESC);

-- RLS
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON donors
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON donors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update delete" ON donors
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 3. BAĞIŞLAR (Donations)
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES donors(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  donation_date DATE NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'bank_transfer', 'online')),
  payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
  recurring BOOLEAN DEFAULT FALSE,
  recurring_period TEXT,
  notes TEXT,
  reference_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_date ON donations(donation_date DESC);
CREATE INDEX idx_donations_status ON donations(payment_status);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);

-- RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON donations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON donations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update delete" ON donations
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 4. YARDIM BAĞIŞLARI (Aid Distributions)
-- ============================================
CREATE TABLE IF NOT EXISTS aid_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  needy_person_id UUID REFERENCES needy_persons(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES donations(id) ON DELETE SET NULL,
  aid_type TEXT NOT NULL,
  amount DECIMAL(10,2),
  description TEXT,
  distribution_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'cancelled')),
  delivered_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_aid_distributions_needy_person_id ON aid_distributions(needy_person_id);
CREATE INDEX idx_aid_distributions_date ON aid_distributions(distribution_date DESC);
CREATE INDEX idx_aid_distributions_status ON aid_distributions(status);

-- RLS
ALTER TABLE aid_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON aid_distributions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON aid_distributions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update delete" ON aid_distributions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 5. KATEGORİLER (Categories)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_status ON categories(status);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admin manage" ON categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 6. GÖNÜLLÜLER (Volunteers)
-- ============================================
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE,
  address TEXT,
  city TEXT,
  district TEXT,
  birth_date DATE,
  skills TEXT[],
  availability TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_volunteers_status ON volunteers(status);
CREATE INDEX idx_volunteers_city ON volunteers(city);
CREATE INDEX idx_volunteers_skills ON volunteers USING GIN(skills);

-- RLS
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON volunteers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON volunteers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update delete" ON volunteers
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 7. GÖNÜLLÜ VARDİYALAR (Volunteer Shifts)
-- ============================================
CREATE TABLE IF NOT EXISTS volunteer_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  task_description TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_volunteer_shifts_volunteer_id ON volunteer_shifts(volunteer_id);
CREATE INDEX idx_volunteer_shifts_date ON volunteer_shifts(shift_date);
CREATE INDEX idx_volunteer_shifts_status ON volunteer_shifts(status);

-- RLS
ALTER TABLE volunteer_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON volunteer_shifts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated manage" ON volunteer_shifts
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 8. PROJELER (Projects)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  target_amount DECIMAL(10,2),
  collected_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  category_id UUID REFERENCES categories(id),
  coordinator_id UUID REFERENCES volunteers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category_id ON projects(category_id);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Admin manage" ON projects
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 9. AUDIT LOGS (Denetim Kayıtları)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical', 'security', 'compliance')),
  event_type TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'in_progress', 'pending')),
  
  -- User info
  user_id UUID,
  user_email TEXT,
  user_role TEXT,
  
  -- Client info
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  
  -- Event details
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  
  -- Changes
  changes JSONB,
  
  -- Request info
  request_id UUID,
  correlation_id TEXT,
  metadata JSONB,
  
  -- Result
  error_message TEXT,
  error_code TEXT,
  duration INTEGER,
  
  -- Location
  location JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_level ON audit_logs(level);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role all access" ON audit_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view all logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 10. SECURITY ALERTS (Güvenlik Uyarıları)
-- ============================================
CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  user_id UUID,
  ip_address TEXT,
  details JSONB,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_security_alerts_timestamp ON security_alerts(timestamp DESC);
CREATE INDEX idx_security_alerts_resolved ON security_alerts(resolved);
CREATE INDEX idx_security_alerts_severity ON security_alerts(severity);

-- RLS
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role all access" ON security_alerts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage alerts" ON security_alerts
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- UPDATED AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_needy_persons_updated_at BEFORE UPDATE ON needy_persons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donors_updated_at BEFORE UPDATE ON donors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aid_distributions_updated_at BEFORE UPDATE ON aid_distributions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON volunteers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_shifts_updated_at BEFORE UPDATE ON volunteer_shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Örnek Veriler)
-- ============================================

-- Kategoriler
INSERT INTO categories (name, description, color, sort_order) VALUES
('Gıda', 'Gıda yardımı', '#EF4444', 1),
('Giyim', 'Giyim yardımı', '#3B82F6', 2),
('Nakdi', 'Nakdi yardım', '#10B981', 3),
('Eğitim', 'Eğitim desteği', '#F59E0B', 4),
('Sağlık', 'Sağlık desteği', '#8B5CF6', 5),
('Barınma', 'Barınma desteği', '#EC4899', 6);

-- Örnek İhtiyaç Sahipleri
INSERT INTO needy_persons (first_name, last_name, phone, city, district, status, priority, needs_description) VALUES
('Ahmet', 'Yılmaz', '555-0101', 'İstanbul', 'Kadıköy', 'active', 'high', 'Gıda ve nakdi yardım ihtiyacı'),
('Fatma', 'Kaya', '555-0102', 'Ankara', 'Çankaya', 'active', 'medium', 'Eğitim masrafları için destek'),
('Mehmet', 'Demir', '555-0103', 'İzmir', 'Konak', 'active', 'critical', 'Acil barınma ihtiyacı'),
('Ayşe', 'Çelik', '555-0104', 'Bursa', 'Nilüfer', 'active', 'low', 'Gıda yardımı'),
('Ali', 'Öztürk', '555-0105', 'Antalya', 'Muratpaşa', 'inactive', 'medium', 'Sağlık desteği');

-- Örnek Bağışçılar
INSERT INTO donors (first_name, last_name, email, city, donor_type, status) VALUES
('Can', 'Yılmaz', 'can.yilmaz@example.com', 'İstanbul', 'individual', 'active'),
('Zeynep', 'Kaya', 'zeynep.kaya@example.com', 'Ankara', 'individual', 'active'),
('Mehmet', 'Şirketi', NULL, 'İzmir', 'corporate', 'active'),
('Elif', 'Demir', 'elif.demir@example.com', 'Bursa', 'individual', 'active'),
('Teknoloji', 'A.Ş.', NULL, 'İstanbul', 'corporate', 'active');

-- Örnek Bağışlar
INSERT INTO donations (donor_id, amount, donation_date, payment_method, payment_status) VALUES
((SELECT id FROM donors WHERE email = 'can.yilmaz@example.com'), 1000.00, '2026-01-15', 'online', 'completed'),
((SELECT id FROM donors WHERE email = 'zeynep.kaya@example.com'), 500.00, '2026-01-16', 'bank_transfer', 'completed'),
((SELECT id FROM donors WHERE donor_type = 'corporate' LIMIT 1), 5000.00, '2026-01-17', 'bank_transfer', 'completed'),
((SELECT id FROM donors WHERE email = 'elif.demir@example.com'), 250.00, '2026-01-18', 'cash', 'completed');

-- Örnek Yardım Dağıtımları
INSERT INTO aid_distributions (needy_person_id, donation_id, aid_type, amount, distribution_date, status) VALUES
((SELECT id FROM needy_persons WHERE first_name = 'Ahmet'), (SELECT id FROM donations ORDER BY created_at LIMIT 1), 'Gıda', 500.00, '2026-01-16', 'delivered'),
((SELECT id FROM needy_persons WHERE first_name = 'Fatma'), (SELECT id FROM donations ORDER BY created_at OFFSET 1 LIMIT 1), 'Nakdi', 300.00, '2026-01-17', 'delivered'),
((SELECT id FROM needy_persons WHERE first_name = 'Mehmet'), (SELECT id FROM donations ORDER BY created_at OFFSET 2 LIMIT 1), 'Barınma', 2000.00, '2026-01-18', 'approved');

-- Örnek Gönüllüler
INSERT INTO volunteers (first_name, last_name, email, phone, city, skills, status) VALUES
('Selin', 'Yılmaz', 'selin.volunteer@example.com', '555-0201', 'İstanbul', ARRAY['teaching', 'counseling'], 'active'),
('Emre', 'Kaya', 'emre.volunteer@example.com', '555-0202', 'Ankara', ARRAY['driving', 'logistics'], 'active'),
('Deniz', 'Demir', 'deniz.volunteer@example.com', '555-0203', 'İzmir', ARRAY['medical', 'first_aid'], 'active');

-- ============================================
-- FUNCTIONS (Yardımcı Fonksiyonlar)
-- ============================================

-- Toplam bağış miktarı hesaplama
CREATE OR REPLACE FUNCTION get_total_donations()
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM donations
  WHERE payment_status = 'completed';
$$ LANGUAGE SQL;

-- Aktif ihtiyaç sahipleri sayısı
CREATE OR REPLACE FUNCTION get_active_needy_count()
RETURNS INTEGER AS $$
  SELECT COUNT(*)
  FROM needy_persons
  WHERE status = 'active';
$$ LANGUAGE SQL;

-- Aktif bağışçılar sayısı
CREATE OR REPLACE FUNCTION get_active_donor_count()
RETURNS INTEGER AS $$
  SELECT COUNT(*)
  FROM donors
  WHERE status = 'active';
$$ LANGUAGE SQL;

-- ============================================
-- VIEWS (Görünümler)
-- ============================================

-- Dashboard özeti view
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT
  (SELECT COUNT(*) FROM needy_persons WHERE status = 'active') as active_needy_count,
  (SELECT COUNT(*) FROM donors WHERE status = 'active') as active_donor_count,
  (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE payment_status = 'completed') as total_donations,
  (SELECT COUNT(*) FROM volunteers WHERE status = 'active') as active_volunteer_count,
  (SELECT COUNT(*) FROM projects WHERE status = 'active') as active_project_count;

-- Aylık bağış özeti view
CREATE OR REPLACE VIEW monthly_donation_summary AS
SELECT
  DATE_TRUNC('month', donation_date) as month,
  COUNT(*) as donation_count,
  SUM(amount) as total_amount
FROM donations
WHERE payment_status = 'completed'
GROUP BY DATE_TRUNC('month', donation_date)
ORDER BY month DESC;

-- ============================================
-- COMPLETED MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Yardım Yönetim Paneli - Migration Tamamlandı!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Oluşturulan Tablolar: 10';
  RAISE NOTICE '- needy_persons (İhtiyaç Sahipleri)';
  RAISE NOTICE '- donors (Bağışçılar)';
  RAISE NOTICE '- donations (Bağışlar)';
  RAISE NOTICE '- aid_distributions (Yardım Dağıtımları)';
  RAISE NOTICE '- categories (Kategoriler)';
  RAISE NOTICE '- volunteers (Gönüllüler)';
  RAISE NOTICE '- volunteer_shifts (Gönüllü Vardiyaları)';
  RAISE NOTICE '- projects (Projeler)';
  RAISE NOTICE '- audit_logs (Denetim Kayıtları)';
  RAISE NOTICE '- security_alerts (Güvenlik Uyarıları)';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Seed Data Eklendi: 25+ kayıt';
  RAISE NOTICE 'RLS Politikaları Aktif';
  RAISE NOTICE 'Indexler Oluşturuldu';
  RAISE NOTICE 'Triggers ve Fonksiyonlar Hazır';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Next: npm run dev (Development server başlat)';
  RAISE NOTICE '===========================================';
END $$;
