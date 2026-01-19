-- Yardım Yönetim Paneli - Skills Management System Migration
-- Sürüm: 1.0.0
-- Tarih: 19 Ocak 2026
-- Tanım: Yetenek kategorileri ve yetenek yönetim sistemi

-- ============================================
-- 1. YETENEK KATEGORİLERİ (Skill Categories)
-- ============================================
CREATE TABLE IF NOT EXISTS skill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_skill_categories_status ON skill_categories(status);
CREATE INDEX idx_skill_categories_sort_order ON skill_categories(sort_order);

-- RLS
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON skill_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin manage" ON skill_categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 2. YETENEKLER (Skills)
-- ============================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES skill_categories(id) ON DELETE SET NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, category_id)
);

-- Indexes
CREATE INDEX idx_skills_category_id ON skills(category_id);
CREATE INDEX idx_skills_status ON skills(status);
CREATE INDEX idx_skills_name ON skills(name);

-- RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON skills
  FOR SELECT USING (true);

CREATE POLICY "Admin manage" ON skills
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 3. GÖNÜLLÜ YETENEKLERİ (Volunteer Skills)
-- ============================================
CREATE TABLE IF NOT EXISTS volunteer_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(volunteer_id, skill_id)
);

-- Indexes
CREATE INDEX idx_volunteer_skills_volunteer_id ON volunteer_skills(volunteer_id);
CREATE INDEX idx_volunteer_skills_skill_id ON volunteer_skills(skill_id);
CREATE INDEX idx_volunteer_skills_proficiency ON volunteer_skills(proficiency_level);

-- RLS
ALTER TABLE volunteer_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON volunteer_skills
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON volunteer_skills
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update delete" ON volunteer_skills
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 4. UPDATED AT TRIGGERS
-- ============================================
CREATE TRIGGER update_skill_categories_updated_at BEFORE UPDATE ON skill_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_skills_updated_at BEFORE UPDATE ON volunteer_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. SEED DATA (Örnek Veriler)
-- ============================================

-- Yetenek Kategorileri
INSERT INTO skill_categories (name, description, color, icon, sort_order) VALUES
('Teknik Beceriler', 'Bilgisayar ve teknik beceriler', '#3B82F6', 'laptop', 1),
('Dil Becerileri', 'Yabancı dil bilgisi', '#10B981', 'globe', 2),
('İletişim Becerileri', 'İletişim ve sunum becerileri', '#F59E0B', 'message-circle', 3),
('Yardım Becerileri', 'İlk yardım ve destek becerileri', '#EF4444', 'heart', 4),
('Lojistik', 'Ulaştırma ve lojistik', '#8B5CF6', 'truck', 5),
('Eğitim', 'Eğitim ve öğretim becerileri', '#EC4899', 'book-open', 6)
ON CONFLICT (name) DO NOTHING;

-- Yetenekler
INSERT INTO skills (name, category_id, description) VALUES
-- Teknik Beceriler
('Bilgisayar Kullanımı', (SELECT id FROM skill_categories WHERE name = 'Teknik Beceriler'), 'Temel bilgisayar ve ofis programları kullanımı'),
('Yazılım Geliştirme', (SELECT id FROM skill_categories WHERE name = 'Teknik Beceriler'), 'Web ve mobil uygulama geliştirme'),
('Veri Analizi', (SELECT id FROM skill_categories WHERE name = 'Teknik Beceriler'), 'Excel ve veri analizi araçları'),
('Grafik Tasarım', (SELECT id FROM skill_categories WHERE name = 'Teknik Beceriler'), 'Photoshop, Illustrator vb. tasarım programları'),
('Sosyal Medya Yönetimi', (SELECT id FROM skill_categories WHERE name = 'Teknik Beceriler'), 'Sosyal medya içerik ve yönetim'),

-- Dil Becerileri
('İngilizce', (SELECT id FROM skill_categories WHERE name = 'Dil Becerileri'), 'İngilizce dil bilgisi'),
('Arapça', (SELECT id FROM skill_categories WHERE name = 'Dil Becerileri'), 'Arapça dil bilgisi'),
('Almanca', (SELECT id FROM skill_categories WHERE name = 'Dil Becerileri'), 'Almanca dil bilgisi'),
('Fransızca', (SELECT id FROM skill_categories WHERE name = 'Dil Becerileri'), 'Fransızca dil bilgisi'),
('Rusça', (SELECT id FROM skill_categories WHERE name = 'Dil Becerileri'), 'Rusça dil bilgisi'),

-- İletişim Becerileri
('Sunum Becerisi', (SELECT id FROM skill_categories WHERE name = 'İletişim Becerileri'), 'Etkili sunum yapma'),
('Halkla İlişkiler', (SELECT id FROM skill_categories WHERE name = 'İletişim Becerileri'), 'İletişim ve organizasyon'),
('Eğitim Verme', (SELECT id FROM skill_categories WHERE name = 'İletişim Becerileri'), 'Gruplara eğitim verme'),
('Dinleme', (SELECT id FROM skill_categories WHERE name = 'İletişim Becerileri'), 'Aktif dinleme ve empati'),

-- Yardım Becerileri
('İlk Yardım', (SELECT id FROM skill_categories WHERE name = 'Yardım Becerileri'), 'İlk yardım sertifikası'),
('Psikolojik Destek', (SELECT id FROM skill_categories WHERE name = 'Yardım Becerileri'), 'Psikososyal destek'),
('Özel Bakım', (SELECT id FROM skill_categories WHERE name = 'Yardım Becerileri'), 'Yaşlı ve engelli bakımı'),
('Çocuk Bakımı', (SELECT id FROM skill_categories WHERE name = 'Yardım Becerileri'), 'Çocuk bakımı ve gelişimi'),

-- Lojistik
('Araç Kullanma', (SELECT id FROM skill_categories WHERE name = 'Lojistik'), 'B sınıfı ehliyet'),
('Kargo ve Depo', (SELECT id FROM skill_categories WHERE name = 'Lojistik'), 'Depo ve lojistik yönetimi'),
('Dağıtım', (SELECT id FROM skill_categories WHERE name = 'Lojistik'), 'Malzeme dağıtımı'),

-- Eğitim
('Öğretmenlik', (SELECT id FROM skill_categories WHERE name = 'Eğitim'), 'Öğretmenlik sertifikası'),
('Ders Verme', (SELECT id FROM skill_categories WHERE name = 'Eğitim'), 'Matematik, Türkçe vb. dersler'),
('Koçluk', (SELECT id FROM skill_categories WHERE name = 'Eğitim'), 'Kişisel gelişim koçluğu'),
('Mentörlük', (SELECT id FROM skill_categories WHERE name = 'Eğitim'), 'Öğrenci mentörlüğü')
ON CONFLICT (name, category_id) DO NOTHING;

-- ============================================
-- 6. VIEWS (Görünümler)
-- ============================================

-- Yetenekler ve kategorileri birleştiren view
CREATE OR REPLACE VIEW skills_with_categories AS
SELECT
  s.id,
  s.name,
  s.description,
  s.status,
  s.created_at,
  s.updated_at,
  sc.id as category_id,
  sc.name as category_name,
  sc.description as category_description,
  sc.color as category_color,
  sc.icon as category_icon
FROM skills s
LEFT JOIN skill_categories sc ON s.category_id = sc.id;

-- Gönüllü yetenekleri detaylı view
CREATE OR REPLACE VIEW volunteer_skills_detail AS
SELECT
  vs.id,
  vs.volunteer_id,
  v.first_name,
  v.last_name,
  v.email,
  vs.skill_id,
  s.name as skill_name,
  sc.name as category_name,
  sc.color as category_color,
  vs.proficiency_level,
  vs.verified,
  vs.verified_at,
  vs.notes,
  vs.created_at,
  vs.updated_at
FROM volunteer_skills vs
JOIN volunteers v ON vs.volunteer_id = v.id
JOIN skills s ON vs.skill_id = s.id
LEFT JOIN skill_categories sc ON s.category_id = sc.id;

-- ============================================
-- 7. FUNCTIONS (Fonksiyonlar)
-- ============================================

-- Gönüllünün yeteneklerini getir
CREATE OR REPLACE FUNCTION get_volunteer_skills(p_volunteer_id UUID)
RETURNS TABLE (
  skill_id UUID,
  skill_name TEXT,
  category_name TEXT,
  category_color TEXT,
  proficiency_level TEXT,
  verified BOOLEAN,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    sc.name,
    sc.color,
    vs.proficiency_level,
    vs.verified,
    vs.notes
  FROM volunteer_skills vs
  JOIN skills s ON vs.skill_id = s.id
  LEFT JOIN skill_categories sc ON s.category_id = sc.id
  WHERE vs.volunteer_id = p_volunteer_id
  ORDER BY sc.sort_order, s.name;
END;
$$ LANGUAGE plpgsql;

-- Kategoriye göre yetenekleri getir
CREATE OR REPLACE FUNCTION get_skills_by_category(p_category_id UUID)
RETURNS TABLE (
  skill_id UUID,
  skill_name TEXT,
  description TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.description,
    s.status
  FROM skills s
  WHERE s.category_id = p_category_id AND s.status = 'active'
  ORDER BY s.name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMPLETED MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Yetenek Yönetim Sistemi - Migration Tamamlandı!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Oluşturulan Tablolar: 3';
  RAISE NOTICE '- skill_categories (Yetenek Kategorileri)';
  RAISE NOTICE '- skills (Yetenekler)';
  RAISE NOTICE '- volunteer_skills (Gönüllü Yetenekleri)';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Seed Data Eklendi:';
  RAISE NOTICE '- 6 Yetenek Kategorisi';
  RAISE NOTICE '- 24+ Yetenek';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Görünümler: 2';
  RAISE NOTICE '- skills_with_categories';
  RAISE NOTICE '- volunteer_skills_detail';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Fonksiyonlar: 2';
  RAISE NOTICE '- get_volunteer_skills()';
  RAISE NOTICE '- get_skills_by_category()';
  RAISE NOTICE '===========================================';
END $$;
