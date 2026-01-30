-- ============================================================================
-- Proje ve Program Yönetim Sistemi - Project & Program Management System
-- ============================================================================
-- Yardım programları, projeler, bütçe takibi ve aktivite yönetimi
-- ============================================================================

-- ============================================================================
-- TABLOLAR / TABLES
-- ============================================================================

-- Programlar/Projeler Tablosu
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Temel Bilgiler
  code TEXT, -- Proje kodu (otomatik oluşturulur)
  name TEXT NOT NULL,
  description TEXT,
  
  -- Program Tipi
  type TEXT DEFAULT 'ongoing' CHECK (type IN ('ongoing', 'project', 'campaign', 'emergency')),
  category TEXT CHECK (category IN (
    'education', 'health', 'food', 'housing', 'clothing', 
    'financial_aid', 'orphan_care', 'religious', 'cultural', 'other'
  )),
  
  -- Durum
  status TEXT DEFAULT 'planning' CHECK (status IN (
    'planning', 'active', 'paused', 'completed', 'cancelled', 'archived'
  )),
  
  -- Tarihler
  start_date DATE,
  end_date DATE,
  actual_start_date DATE, -- Gerçek başlama tarihi
  actual_end_date DATE, -- Gerçek bitiş tarihi
  
  -- Bütçe
  budget_allocated DECIMAL(12, 2) DEFAULT 0, -- Ayrılan bütçe
  budget_spent DECIMAL(12, 2) DEFAULT 0, -- Harcanan
  currency TEXT DEFAULT 'TRY',
  
  -- Hedefler
  target_beneficiaries INTEGER, -- Hedeflenen faydalanıcı sayısı
  actual_beneficiaries INTEGER DEFAULT 0, -- Gerçekleşen
  target_amount DECIMAL(12, 2), -- Hedeflenen bağış miktarı
  actual_amount DECIMAL(12, 2) DEFAULT 0, -- Toplanan
  
  -- Sorumlular
  program_manager_id UUID REFERENCES auth.users(id),
  coordinator_id UUID REFERENCES auth.users(id),
  
  -- Lokasyon
  city_id UUID REFERENCES cities(id),
  district_id UUID REFERENCES districts(id),
  location_description TEXT,
  
  -- Medya
  cover_image_url TEXT,
  gallery_urls TEXT[],
  
  -- Meta
  is_public BOOLEAN DEFAULT FALSE, -- Kamuya açık mı?
  is_featured BOOLEAN DEFAULT FALSE, -- Öne çıkan mı?
  tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Program Bütçe Kalemleri
CREATE TABLE IF NOT EXISTS program_budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Kalem Bilgileri
  category TEXT NOT NULL, -- Kategori adı
  description TEXT,
  
  -- Bütçe
  planned_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  actual_amount DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'TRY',
  
  -- Durum
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  
  -- Tarih
  expected_date DATE,
  completed_date DATE,
  
  -- Sorumlu
  responsible_user_id UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Program Aktiviteleri/Etkinlikleri
CREATE TABLE IF NOT EXISTS program_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Aktivite Bilgileri
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT CHECK (activity_type IN (
    'distribution', 'visit', 'meeting', 'training', 'event', 
    'assessment', 'procurement', 'other'
  )),
  
  -- Durum
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'postponed')),
  
  -- Tarihler
  planned_date DATE,
  planned_time TIME,
  actual_date DATE,
  duration_minutes INTEGER, -- Süre (dakika)
  
  -- Lokasyon
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Katılım
  expected_participants INTEGER,
  actual_participants INTEGER,
  
  -- Maliyet
  cost DECIMAL(10, 2) DEFAULT 0,
  
  -- Notlar
  notes TEXT,
  feedback TEXT,
  
  -- Media
  photos TEXT[],
  documents TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Program Faydalanıcıları (İhtiyaç sahipleri ile ilişki)
CREATE TABLE IF NOT EXISTS program_beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
  
  -- Program içindeki durum
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'active', 'completed', 'dropped', 'suspended')),
  
  -- Kayıt Tarihi
  enrollment_date DATE DEFAULT CURRENT_DATE,
  completion_date DATE,
  
  -- Özel Notlar
  notes TEXT,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(program_id, needy_person_id)
);

-- Program Bağışları (Bağışlar ile ilişki)
CREATE TABLE IF NOT EXISTS program_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  
  -- Ayrıştırma
  allocated_amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  
  -- Not
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(program_id, donation_id)
);

-- Program Görevlileri (Çoklu görevli desteği)
CREATE TABLE IF NOT EXISTS program_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rol
  role TEXT NOT NULL CHECK (role IN ('manager', 'coordinator', 'field_officer', 'volunteer', 'consultant')),
  
  -- Sorumluluklar
  responsibilities TEXT[],
  
  -- Tarihler
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  
  -- Durum
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(program_id, user_id, role)
);

-- Program Raporları
CREATE TABLE IF NOT EXISTS program_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Rapor Bilgileri
  report_type TEXT NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'quarterly', 'final', 'incident', 'other')),
  title TEXT NOT NULL,
  content TEXT,
  
  -- Dönem
  period_start DATE,
  period_end DATE,
  
  -- İstatistikler
  beneficiaries_reached INTEGER,
  activities_completed INTEGER,
  budget_utilized DECIMAL(12, 2),
  
  -- Durum
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved')),
  
  -- Onay
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  
  -- Dosya
  file_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Program Logları
CREATE TABLE IF NOT EXISTS program_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL,
  description TEXT,
  old_values JSONB,
  new_values JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- INDEXLER / INDEXES
-- ============================================================================

-- Programs indexes
CREATE INDEX IF NOT EXISTS idx_programs_org ON programs(organization_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_programs_type ON programs(organization_id, type);
CREATE INDEX IF NOT EXISTS idx_programs_dates ON programs(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_programs_manager ON programs(program_manager_id);
CREATE INDEX IF NOT EXISTS idx_programs_public ON programs(organization_id, is_public, status) WHERE is_public = TRUE;

-- Budget items indexes
CREATE INDEX IF NOT EXISTS idx_program_budget_items_program ON program_budget_items(program_id);
CREATE INDEX IF NOT EXISTS idx_program_budget_items_status ON program_budget_items(program_id, status);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_program_activities_program ON program_activities(program_id);
CREATE INDEX IF NOT EXISTS idx_program_activities_date ON program_activities(program_id, planned_date);
CREATE INDEX IF NOT EXISTS idx_program_activities_status ON program_activities(program_id, status);

-- Beneficiaries indexes
CREATE INDEX IF NOT EXISTS idx_program_beneficiaries_program ON program_beneficiaries(program_id);
CREATE INDEX IF NOT EXISTS idx_program_beneficiaries_needy ON program_beneficiaries(needy_person_id);
CREATE INDEX IF NOT EXISTS idx_program_beneficiaries_status ON program_beneficiaries(program_id, status);

-- Donations indexes
CREATE INDEX IF NOT EXISTS idx_program_donations_program ON program_donations(program_id);
CREATE INDEX IF NOT EXISTS idx_program_donations_donation ON program_donations(donation_id);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_program_staff_program ON program_staff(program_id);
CREATE INDEX IF NOT EXISTS idx_program_staff_user ON program_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_program_staff_active ON program_staff(program_id, is_active);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_program_reports_program ON program_reports(program_id);
CREATE INDEX IF NOT EXISTS idx_program_reports_type ON program_reports(program_id, report_type);
CREATE INDEX IF NOT EXISTS idx_program_reports_status ON program_reports(program_id, status);

-- ============================================================================
-- RLS POLICIKALARI / RLS POLICIES
-- ============================================================================

-- Programs RLS
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view programs"
ON programs FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND is_active = TRUE
));

CREATE POLICY "Organization admins can manage programs"
ON programs FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND is_active = TRUE AND role IN ('owner', 'admin', 'moderator')
));

-- Budget Items RLS
ALTER TABLE program_budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view budget items"
ON program_budget_items FOR SELECT
USING (program_id IN (
  SELECT id FROM programs WHERE organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = TRUE
  )
));

CREATE POLICY "Organization admins can manage budget items"
ON program_budget_items FOR ALL
USING (program_id IN (
  SELECT id FROM programs WHERE organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = TRUE AND role IN ('owner', 'admin', 'moderator')
  )
));

-- Activities RLS
ALTER TABLE program_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view activities"
ON program_activities FOR SELECT
USING (program_id IN (
  SELECT id FROM programs WHERE organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = TRUE
  )
));

CREATE POLICY "Organization admins can manage activities"
ON program_activities FOR ALL
USING (program_id IN (
  SELECT id FROM programs WHERE organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = TRUE AND role IN ('owner', 'admin', 'moderator')
  )
));

-- Beneficiaries RLS
ALTER TABLE program_beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view beneficiaries"
ON program_beneficiaries FOR SELECT
USING (program_id IN (
  SELECT id FROM programs WHERE organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = TRUE
  )
));

CREATE POLICY "Organization admins can manage beneficiaries"
ON program_beneficiaries FOR ALL
USING (program_id IN (
  SELECT id FROM programs WHERE organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = TRUE AND role IN ('owner', 'admin', 'moderator')
  )
));

-- Staff RLS
ALTER TABLE program_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view staff"
ON program_staff FOR SELECT
USING (program_id IN (
  SELECT id FROM programs WHERE organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = TRUE
  )
));

CREATE POLICY "Organization admins can manage staff"
ON program_staff FOR ALL
USING (program_id IN (
  SELECT id FROM programs WHERE organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = TRUE AND role IN ('owner', 'admin', 'moderator')
  )
));

-- Reports RLS
ALTER TABLE program_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view reports"
ON program_reports FOR SELECT
USING (program_id IN (
  SELECT id FROM programs WHERE organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = TRUE
  )
));

CREATE POLICY "Organization admins can manage reports"
ON program_reports FOR ALL
USING (program_id IN (
  SELECT id FROM programs WHERE organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = TRUE AND role IN ('owner', 'admin', 'moderator')
  )
));

-- ============================================================================
-- FONKSİYONLAR / FUNCTIONS
-- ============================================================================

-- Otomatik güncelleme zamanı
CREATE OR REPLACE FUNCTION update_program_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_program_updated_at
BEFORE UPDATE ON programs
FOR EACH ROW EXECUTE FUNCTION update_program_updated_at();

CREATE TRIGGER trigger_update_program_activity_updated_at
BEFORE UPDATE ON program_activities
FOR EACH ROW EXECUTE FUNCTION update_program_updated_at();

CREATE TRIGGER trigger_update_program_report_updated_at
BEFORE UPDATE ON program_reports
FOR EACH ROW EXECUTE FUNCTION update_program_updated_at();

-- Proje kodu otomatik oluşturma
CREATE OR REPLACE FUNCTION generate_program_code()
RETURNS TRIGGER AS $$
DECLARE
  org_prefix TEXT;
  year TEXT;
  sequence_num INTEGER;
  type_code TEXT;
BEGIN
  -- Tip kodu
  type_code := CASE NEW.type
    WHEN 'project' THEN 'PRJ'
    WHEN 'campaign' THEN 'CMP'
    WHEN 'emergency' THEN 'EMR'
    ELSE 'PGM'
  END;
  
  -- Organizasyon slug'ını al
  SELECT slug INTO org_prefix 
  FROM organizations 
  WHERE id = NEW.organization_id;
  
  -- Yıl
  year := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Sıradaki numarayı bul
  SELECT COUNT(*) + 1 INTO sequence_num
  FROM programs
  WHERE organization_id = NEW.organization_id
    AND type = NEW.type
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Format: ORG-TIP-YY-00001
  NEW.code := UPPER(org_prefix) || '-' || type_code || '-' || year || '-' || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_program_code
BEFORE INSERT ON programs
FOR EACH ROW
WHEN (NEW.code IS NULL)
EXECUTE FUNCTION generate_program_code();

-- Program bütçesini güncelle
CREATE OR REPLACE FUNCTION update_program_budget_spent()
RETURNS TRIGGER AS $$
DECLARE
  v_total_spent DECIMAL(12, 2);
BEGIN
  -- Toplam harcamayı hesapla
  SELECT COALESCE(SUM(actual_amount), 0) INTO v_total_spent
  FROM program_budget_items
  WHERE program_id = COALESCE(NEW.program_id, OLD.program_id);
  
  -- Program tablosunu güncelle
  UPDATE programs
  SET budget_spent = v_total_spent,
      updated_at = NOW()
  WHERE id = COALESCE(NEW.program_id, OLD.program_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_program_budget_spent
AFTER INSERT OR UPDATE OR DELETE ON program_budget_items
FOR EACH ROW EXECUTE FUNCTION update_program_budget_spent();

-- Program istatistikleri
CREATE OR REPLACE FUNCTION get_program_stats(p_program_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    -- Temel
    'program_id', p.id,
    'program_name', p.name,
    'status', p.status,
    
    -- Bütçe
    'budget_allocated', p.budget_allocated,
    'budget_spent', p.budget_spent,
    'budget_remaining', p.budget_allocated - p.budget_spent,
    'budget_utilization_rate', CASE 
      WHEN p.budget_allocated > 0 
      THEN ROUND((p.budget_spent / p.budget_allocated) * 100, 2)
      ELSE 0 
    END,
    
    -- Faydalanıcılar
    'target_beneficiaries', p.target_beneficiaries,
    'actual_beneficiaries', p.actual_beneficiaries,
    'beneficiary_achievement_rate', CASE 
      WHEN p.target_beneficiaries > 0 
      THEN ROUND((p.actual_beneficiaries::DECIMAL / p.target_beneficiaries) * 100, 2)
      ELSE 0 
    END,
    'total_beneficiaries_registered', COUNT(DISTINCT pb.id),
    'active_beneficiaries', COUNT(DISTINCT pb.id) FILTER (WHERE pb.status = 'active'),
    
    -- Aktiviteler
    'total_activities', COUNT(DISTINCT pa.id),
    'completed_activities', COUNT(DISTINCT pa.id) FILTER (WHERE pa.status = 'completed'),
    'planned_activities', COUNT(DISTINCT pa.id) FILTER (WHERE pa.status = 'planned'),
    'in_progress_activities', COUNT(DISTINCT pa.id) FILTER (WHERE pa.status = 'in_progress'),
    
    -- Bağış
    'total_donations_allocated', COALESCE(SUM(pd.allocated_amount), 0),
    'donation_count', COUNT(DISTINCT pd.id),
    
    -- Süre
    'days_elapsed', CASE 
      WHEN p.actual_start_date IS NOT NULL 
      THEN CURRENT_DATE - p.actual_start_date 
      ELSE NULL 
    END,
    'days_remaining', CASE 
      WHEN p.end_date IS NOT NULL 
      THEN p.end_date - CURRENT_DATE 
      ELSE NULL 
    END
  ) INTO v_stats
  FROM programs p
  LEFT JOIN program_beneficiaries pb ON pb.program_id = p.id
  LEFT JOIN program_activities pa ON pa.program_id = p.id
  LEFT JOIN program_donations pd ON pd.program_id = p.id
  WHERE p.id = p_program_id
  GROUP BY p.id;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizasyon program özetleri
CREATE OR REPLACE FUNCTION get_organization_program_summary(p_organization_id UUID)
RETURNS JSON AS $$
DECLARE
  v_summary JSON;
BEGIN
  SELECT json_build_object(
    'total_programs', COUNT(*) FILTER (WHERE status NOT IN ('cancelled', 'archived')),
    'active_programs', COUNT(*) FILTER (WHERE status = 'active'),
    'planning_programs', COUNT(*) FILTER (WHERE status = 'planning'),
    'completed_programs', COUNT(*) FILTER (WHERE status = 'completed'),
    
    'total_budget_allocated', COALESCE(SUM(budget_allocated), 0),
    'total_budget_spent', COALESCE(SUM(budget_spent), 0),
    'average_budget_utilization', CASE 
      WHEN SUM(budget_allocated) > 0 
      THEN ROUND((SUM(budget_spent) / SUM(budget_allocated)) * 100, 2)
      ELSE 0 
    END,
    
    'total_beneficiaries', COALESCE(SUM(actual_beneficiaries), 0),
    'total_target_beneficiaries', COALESCE(SUM(target_beneficiaries), 0),
    
    'programs_by_category', (
      SELECT json_object_agg(category, cnt)
      FROM (
        SELECT category, COUNT(*) as cnt
        FROM programs
        WHERE organization_id = p_organization_id
          AND status NOT IN ('cancelled', 'archived')
        GROUP BY category
      ) subq
    ),
    
    'programs_starting_this_month', COUNT(*) FILTER (
      WHERE start_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND start_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    ),
    'programs_ending_this_month', COUNT(*) FILTER (
      WHERE end_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND end_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    )
  ) INTO v_summary
  FROM programs
  WHERE organization_id = p_organization_id;
  
  RETURN v_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Faydalanıcı ekleme/güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION add_program_beneficiary(
  p_program_id UUID,
  p_needy_person_id UUID,
  p_enrollment_date DATE DEFAULT CURRENT_DATE,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_program_org UUID;
  v_needy_org UUID;
BEGIN
  -- Program'ın organizasyonunu kontrol et
  SELECT organization_id INTO v_program_org
  FROM programs WHERE id = p_program_id;
  
  -- İhtiyaç sahibinin organizasyonunu kontrol et (varsa)
  SELECT organization_id INTO v_needy_org
  FROM needy_persons WHERE id = p_needy_person_id;
  
  -- Organizasyon uyumluluğunu kontrol et
  IF v_needy_org IS NOT NULL AND v_needy_org != v_program_org THEN
    RETURN json_build_object('success', FALSE, 'error', 'Different organizations');
  END IF;
  
  -- Faydalanıcı ekle
  INSERT INTO program_beneficiaries (
    program_id, needy_person_id, enrollment_date, notes
  ) VALUES (
    p_program_id, p_needy_person_id, p_enrollment_date, p_notes
  )
  ON CONFLICT (program_id, needy_person_id) 
  DO UPDATE SET 
    status = 'registered',
    updated_at = NOW()
  RETURNING json_build_object(
    'success', TRUE,
    'id', id,
    'program_id', program_id,
    'needy_person_id', needy_person_id,
    'status', status
  ) INTO v_result;
  
  -- Program'ın actual_beneficiaries sayısını güncelle
  UPDATE programs
  SET actual_beneficiaries = (
    SELECT COUNT(*) FROM program_beneficiaries 
    WHERE program_id = p_program_id AND status = 'active'
  )
  WHERE id = p_program_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REAL-TIME SUPPORT
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE programs;
ALTER PUBLICATION supabase_realtime ADD TABLE program_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE program_beneficiaries;

-- ============================================================================
-- COMMENTLER
-- ============================================================================

COMMENT ON TABLE programs IS 'Program ve proje bilgileri';
COMMENT ON TABLE program_budget_items IS 'Program bütçe kalemleri';
COMMENT ON TABLE program_activities IS 'Program aktiviteleri ve etkinlikleri';
COMMENT ON TABLE program_beneficiaries IS 'Program faydalanıcıları';
COMMENT ON TABLE program_donations IS 'Programa ayrılan bağışlar';
COMMENT ON TABLE program_staff IS 'Program görevlileri';
COMMENT ON TABLE program_reports IS 'Program raporları';

COMMENT ON FUNCTION get_program_stats IS 'Program detaylı istatistiklerini getirir';
COMMENT ON FUNCTION get_organization_program_summary IS 'Organizasyon program özetini getirir';
COMMENT ON FUNCTION add_program_beneficiary IS 'Programa faydalanıcı ekler';
