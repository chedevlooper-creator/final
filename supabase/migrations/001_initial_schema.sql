-- Yardım Yönetim Paneli - Initial Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- LOOKUP TABLES (Reference Tables)
-- ===========================================

-- Countries
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  phone_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cities
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Districts
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Neighborhoods
CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT, -- 'needy', 'donation', 'application' etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partners
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT, -- 'partner', 'field'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- MAIN TABLES
-- ===========================================

-- Needy Persons (İhtiyaç Sahipleri)
CREATE TABLE IF NOT EXISTS needy_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_number TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  field_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  first_name_original TEXT,
  last_name_original TEXT,
  nationality_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
  
  -- Identity
  identity_type TEXT CHECK (identity_type IN ('tc', 'passport', 'other')),
  identity_number TEXT,
  passport_number TEXT,
  passport_type TEXT CHECK (passport_type IN ('normal', 'diplomatic', 'service', 'special')),
  passport_expiry DATE,
  visa_type TEXT CHECK (visa_type IN ('tourist', 'work', 'student', 'residence', 'temporary_protection')),
  
  -- Personal Details
  gender TEXT CHECK (gender IN ('male', 'female')),
  date_of_birth DATE,
  phone TEXT,
  email TEXT,
  address TEXT,
  
  -- Living Situation
  living_situation TEXT CHECK (living_situation IN ('own_house', 'rental', 'with_relatives', 'shelter', 'homeless', 'other')),
  income_source TEXT CHECK (income_source IN ('none', 'salary', 'pension', 'social_aid', 'charity', 'other')),
  monthly_income DECIMAL(12,2),
  rent_amount DECIMAL(12,2),
  debt_amount DECIMAL(12,2),
  family_size INTEGER,
  
  -- Health
  health_status TEXT,
  disability_status TEXT,
  
  -- Meta
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  is_active BOOLEAN DEFAULT TRUE,
  tags TEXT[],
  
  -- Audit
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aid Applications (Yardım Başvuruları)
CREATE TABLE IF NOT EXISTS aid_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT,
  needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
  application_type TEXT NOT NULL CHECK (application_type IN ('food', 'health', 'education', 'shelter', 'clothing', 'fuel', 'household', 'cash', 'other')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'approved', 'rejected', 'pending_delivery', 'delivered', 'completed')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_user_id UUID,
  description TEXT,
  requested_amount DECIMAL(12,2),
  approved_amount DECIMAL(12,2),
  notes TEXT,
  
  -- Audit
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations (Bağışlar)
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_number TEXT,
  donor_name TEXT,
  donor_phone TEXT,
  donor_email TEXT,
  donation_type TEXT NOT NULL CHECK (donation_type IN ('cash', 'in_kind', 'sacrifice', 'zakat', 'fitre', 'sadaka')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD', 'EUR', 'GBP')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'online')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'cancelled')),
  description TEXT,
  notes TEXT,
  
  -- Audit
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsors
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schools
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('public', 'private', 'foundation')),
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orphans (Yetimler & Öğrenciler)
CREATE TABLE IF NOT EXISTS orphans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_number TEXT,
  type TEXT NOT NULL CHECK (type IN ('ihh_orphan', 'orphan', 'family', 'education_scholarship')),
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  field_name TEXT,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  first_name_original TEXT,
  last_name_original TEXT,
  nationality_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  gender TEXT CHECK (gender IN ('male', 'female')),
  date_of_birth DATE,
  identity_number TEXT,
  
  -- Sponsorship
  status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing', 'assigned', 'active', 'paused', 'completed')),
  last_assignment_date DATE,
  assignment_status TEXT,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE SET NULL,
  
  -- Education
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  grade TEXT,
  education_status TEXT,
  
  -- Photo
  photo_url TEXT,
  
  -- Guardian
  guardian_name TEXT,
  guardian_relation TEXT,
  guardian_phone TEXT,
  
  -- Address
  address TEXT,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  
  -- Notes
  notes TEXT,
  
  -- Audit
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_needy_persons_status ON needy_persons(status);
CREATE INDEX IF NOT EXISTS idx_needy_persons_category ON needy_persons(category_id);
CREATE INDEX IF NOT EXISTS idx_needy_persons_city ON needy_persons(city_id);
CREATE INDEX IF NOT EXISTS idx_needy_persons_identity ON needy_persons(identity_number);

CREATE INDEX IF NOT EXISTS idx_aid_applications_status ON aid_applications(status);
CREATE INDEX IF NOT EXISTS idx_aid_applications_needy ON aid_applications(needy_person_id);
CREATE INDEX IF NOT EXISTS idx_aid_applications_type ON aid_applications(application_type);

CREATE INDEX IF NOT EXISTS idx_donations_type ON donations(donation_type);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(payment_status);

CREATE INDEX IF NOT EXISTS idx_orphans_status ON orphans(status);
CREATE INDEX IF NOT EXISTS idx_orphans_sponsor ON orphans(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_orphans_type ON orphans(type);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_needy_persons_updated_at BEFORE UPDATE ON needy_persons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_aid_applications_updated_at BEFORE UPDATE ON aid_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orphans_updated_at BEFORE UPDATE ON orphans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE needy_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE aid_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orphans ENABLE ROW LEVEL SECURITY;

-- Basic policies (allow authenticated users to read/write)
CREATE POLICY "Allow authenticated read" ON needy_persons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON needy_persons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON needy_persons FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON aid_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON aid_applications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON aid_applications FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON donations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON donations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON donations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON orphans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON orphans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON orphans FOR UPDATE TO authenticated USING (true);

-- Lookup tables are public read
CREATE POLICY "Allow public read" ON countries FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON cities FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON districts FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON neighborhoods FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON partners FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON schools FOR SELECT USING (true);

-- ===========================================
-- SEED DATA
-- ===========================================

-- Insert Turkey
INSERT INTO countries (name, code, phone_code) VALUES ('Türkiye', 'TR', '+90') ON CONFLICT DO NOTHING;

-- Insert some categories
INSERT INTO categories (name, type) VALUES 
  ('Mülteci', 'needy'),
  ('Suriyeli', 'needy'),
  ('Yetim Ailesi', 'needy'),
  ('Engelli', 'needy'),
  ('Yaşlı', 'needy'),
  ('Gıda', 'donation'),
  ('Nakdi', 'donation'),
  ('Giyim', 'donation')
ON CONFLICT DO NOTHING;
