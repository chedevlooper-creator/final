-- ============================================================================
-- Aidat ve Üyelik Yönetim Sistemi - Membership & Dues Management System
-- ============================================================================
-- Dernek üyeleri, aidat takibi ve ödeme yönetimi için tablolar
-- ============================================================================

-- ============================================================================
-- TABLOLAR / TABLES
-- ============================================================================

-- Üyelik Kategorileri (Asil üye, onursal üye, vb.)
CREATE TABLE IF NOT EXISTS membership_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  dues_amount DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Aylık/yıllık aidat miktarı
  dues_frequency TEXT DEFAULT 'monthly' CHECK (dues_frequency IN ('monthly', 'quarterly', 'yearly')),
  benefits TEXT[], -- Üye avantajları
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, name)
);

-- Üyeler Tablosu
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_number TEXT, -- Üye numarası (otomatik oluşturulabilir)
  
  -- Kişisel Bilgiler
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  identity_number TEXT, -- TC Kimlik
  
  -- Adres Bilgileri
  address TEXT,
  city_id UUID REFERENCES cities(id),
  district_id UUID REFERENCES districts(id),
  
  -- Üyelik Bilgileri
  category_id UUID REFERENCES membership_categories(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'expired')),
  membership_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Üyelik başlangıç tarihi
  expiry_date DATE, -- Üyelik bitiş tarihi (opsiyonel)
  
  -- Meslek ve Eğitim
  profession TEXT,
  education_level TEXT,
  workplace TEXT,
  
  -- Acil Durum Bilgileri
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  
  -- Notlar
  notes TEXT,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Aidat Ödemeleri Tablosu
CREATE TABLE IF NOT EXISTS membership_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  
  -- Ödeme Bilgileri
  period_start DATE NOT NULL, -- Dönem başlangıcı
  period_end DATE NOT NULL, -- Dönem bitişi
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  
  -- Ödeme Durumu
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'overdue', 'waived')),
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  paid_at TIMESTAMPTZ,
  
  -- Ödeme Metodu
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'deduction', 'other')),
  payment_reference TEXT, -- Dekont no, işlem no vb.
  
  -- İndirim/Gecikme
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  discount_reason TEXT,
  late_fee DECIMAL(10, 2) DEFAULT 0, -- Gecikme cezası
  
  -- Notlar
  notes TEXT,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Aidat Hatırlatmaları
CREATE TABLE IF NOT EXISTS membership_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES membership_payments(id) ON DELETE CASCADE,
  
  -- Hatırlatma Bilgileri
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('sms', 'email', 'call', 'letter')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  
  -- Zamanlama
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  
  -- İçerik
  subject TEXT,
  message TEXT,
  
  -- Sonuç
  response TEXT,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Üyelik Değişiklik Logu
CREATE TABLE IF NOT EXISTS membership_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'payment_received', 'reminder_sent', 'deleted')),
  old_values JSONB,
  new_values JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- INDEXLER / INDEXES
-- ============================================================================

-- Membership categories indexes
CREATE INDEX IF NOT EXISTS idx_membership_categories_org ON membership_categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_membership_categories_active ON membership_categories(organization_id, is_active);

-- Memberships indexes
CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_memberships_category ON memberships(organization_id, category_id);
CREATE INDEX IF NOT EXISTS idx_memberships_number ON memberships(organization_id, member_number);
CREATE INDEX IF NOT EXISTS idx_memberships_name ON memberships(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_memberships_expiry ON memberships(expiry_date) WHERE expiry_date IS NOT NULL;

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_membership_payments_org ON membership_payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_membership_payments_member ON membership_payments(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_payments_status ON membership_payments(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_membership_payments_period ON membership_payments(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_membership_payments_overdue ON membership_payments(organization_id, status, period_end) WHERE status IN ('pending', 'overdue');

-- Reminders indexes
CREATE INDEX IF NOT EXISTS idx_membership_reminders_org ON membership_reminders(organization_id);
CREATE INDEX IF NOT EXISTS idx_membership_reminders_scheduled ON membership_reminders(scheduled_at, status);
CREATE INDEX IF NOT EXISTS idx_membership_reminders_pending ON membership_reminders(organization_id, status) WHERE status = 'pending';

-- Logs indexes
CREATE INDEX IF NOT EXISTS idx_membership_logs_member ON membership_logs(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_logs_created ON membership_logs(created_at DESC);

-- ============================================================================
-- RLS POLICIKALARI / RLS POLICIES
-- ============================================================================

-- Membership Categories RLS
ALTER TABLE membership_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view categories"
ON membership_categories FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND is_active = TRUE
));

CREATE POLICY "Organization admins can manage categories"
ON membership_categories FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND is_active = TRUE AND role IN ('owner', 'admin')
));

-- Memberships RLS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view memberships"
ON memberships FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND is_active = TRUE
));

CREATE POLICY "Organization admins can manage memberships"
ON memberships FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND is_active = TRUE AND role IN ('owner', 'admin', 'moderator')
));

-- Membership Payments RLS
ALTER TABLE membership_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view payments"
ON membership_payments FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND is_active = TRUE
));

CREATE POLICY "Organization admins can manage payments"
ON membership_payments FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND is_active = TRUE AND role IN ('owner', 'admin', 'moderator')
));

-- Membership Reminders RLS
ALTER TABLE membership_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view reminders"
ON membership_reminders FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND is_active = TRUE
));

CREATE POLICY "Organization admins can manage reminders"
ON membership_reminders FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND is_active = TRUE AND role IN ('owner', 'admin', 'moderator')
));

-- Membership Logs RLS
ALTER TABLE membership_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view logs"
ON membership_logs FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND is_active = TRUE
));

CREATE POLICY "System can insert logs"
ON membership_logs FOR INSERT
WITH CHECK (organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND is_active = TRUE
));

-- ============================================================================
-- FONKSİYONLAR / FUNCTIONS
-- ============================================================================

-- Otomatik güncelleme zamanı
CREATE OR REPLACE FUNCTION update_membership_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_membership_updated_at
BEFORE UPDATE ON memberships
FOR EACH ROW EXECUTE FUNCTION update_membership_updated_at();

CREATE TRIGGER trigger_update_membership_category_updated_at
BEFORE UPDATE ON membership_categories
FOR EACH ROW EXECUTE FUNCTION update_membership_updated_at();

CREATE TRIGGER trigger_update_membership_payment_updated_at
BEFORE UPDATE ON membership_payments
FOR EACH ROW EXECUTE FUNCTION update_membership_updated_at();

-- Üye numarası otomatik oluşturma
CREATE OR REPLACE FUNCTION generate_member_number()
RETURNS TRIGGER AS $$
DECLARE
  org_prefix TEXT;
  year TEXT;
  sequence_num INTEGER;
BEGIN
  -- Organizasyon slug'ını al
  SELECT slug INTO org_prefix 
  FROM organizations 
  WHERE id = NEW.organization_id;
  
  -- Yıl
  year := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Sıradaki numarayı bul
  SELECT COUNT(*) + 1 INTO sequence_num
  FROM memberships
  WHERE organization_id = NEW.organization_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Format: ORG-YY-00001
  NEW.member_number := UPPER(org_prefix) || '-' || year || '-' || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_member_number
BEFORE INSERT ON memberships
FOR EACH ROW
WHEN (NEW.member_number IS NULL)
EXECUTE FUNCTION generate_member_number();

-- Aidat kaydı oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION create_membership_dues(
  p_organization_id UUID,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_member RECORD;
  v_category RECORD;
  v_amount DECIMAL(10, 2);
BEGIN
  -- Aktif üyeleri dolaş
  FOR v_member IN 
    SELECT id, category_id 
    FROM memberships 
    WHERE organization_id = p_organization_id 
      AND status = 'active'
  LOOP
    -- Kategori aidat miktarını al
    SELECT dues_amount, dues_frequency INTO v_category
    FROM membership_categories
    WHERE id = v_member.category_id;
    
    IF v_category IS NOT NULL THEN
      v_amount := v_category.dues_amount;
      
      -- Aidat kaydı oluştur (eğer yoksa)
      INSERT INTO membership_payments (
        organization_id,
        membership_id,
        period_start,
        period_end,
        amount,
        status
      )
      VALUES (
        p_organization_id,
        v_member.id,
        p_period_start,
        p_period_end,
        v_amount,
        'pending'
      )
      ON CONFLICT DO NOTHING;
      
      v_count := v_count + 1;
    END IF;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gecikmiş aidatları kontrol etme
CREATE OR REPLACE FUNCTION check_overdue_payments()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  UPDATE membership_payments
  SET status = 'overdue',
      updated_at = NOW()
  WHERE status = 'pending'
    AND period_end < CURRENT_DATE - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Üyelik istatistikleri
CREATE OR REPLACE FUNCTION get_membership_stats(p_organization_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_members', COUNT(DISTINCT m.id),
    'active_members', COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'active'),
    'new_this_month', COUNT(DISTINCT m.id) FILTER (WHERE m.created_at >= DATE_TRUNC('month', NOW())),
    'expiring_soon', COUNT(DISTINCT m.id) FILTER (WHERE m.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'),
    'total_dues_current_month', COALESCE(SUM(p.amount) FILTER (WHERE p.period_start >= DATE_TRUNC('month', NOW())), 0),
    'collected_dues', COALESCE(SUM(p.paid_amount) FILTER (WHERE p.status = 'paid' AND p.period_start >= DATE_TRUNC('month', NOW())), 0),
    'pending_dues', COALESCE(SUM(p.amount) FILTER (WHERE p.status IN ('pending', 'overdue') AND p.period_start >= DATE_TRUNC('month', NOW())), 0),
    'overdue_count', COUNT(p.id) FILTER (WHERE p.status = 'overdue'),
    'collection_rate', CASE 
      WHEN SUM(p.amount) FILTER (WHERE p.period_start >= DATE_TRUNC('month', NOW())) > 0 
      THEN ROUND(
        (SUM(p.paid_amount) FILTER (WHERE p.status = 'paid' AND p.period_start >= DATE_TRUNC('month', NOW())) / 
         SUM(p.amount) FILTER (WHERE p.period_start >= DATE_TRUNC('month', NOW()))) * 100
      )
      ELSE 0 
    END
  ) INTO v_stats
  FROM memberships m
  LEFT JOIN membership_payments p ON p.membership_id = m.id
  WHERE m.organization_id = p_organization_id;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REAL-TIME SUPPORT
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE memberships;
ALTER PUBLICATION supabase_realtime ADD TABLE membership_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE membership_reminders;

-- ============================================================================
-- COMMENTLER
-- ============================================================================

COMMENT ON TABLE membership_categories IS 'Üyelik kategorileri (asil üye, onursal üye vb.)';
COMMENT ON TABLE memberships IS 'Dernek üyeleri';
COMMENT ON TABLE membership_payments IS 'Aidat ödemeleri';
COMMENT ON TABLE membership_reminders IS 'Aidat hatırlatmaları';
COMMENT ON TABLE membership_logs IS 'Üyelik değişiklik logları';

COMMENT ON FUNCTION create_membership_dues IS 'Belirli bir dönem için tüm aktif üyelere aidat kaydı oluşturur';
COMMENT ON FUNCTION check_overdue_payments IS 'Gecikmiş aidatları otomatik işaretler';
COMMENT ON FUNCTION get_membership_stats IS 'Üyelik istatistiklerini getirir';
