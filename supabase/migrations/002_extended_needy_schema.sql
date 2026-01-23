-- İhtiyaç Sahipleri Genişletilmiş Şema
-- Orijinal sistemdeki 100+ alan için

-- ===========================================
-- LOOKUP TABLES (Ek Tanım Tabloları)
-- ===========================================

-- Sektörler
CREATE TABLE IF NOT EXISTS sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meslekler
CREATE TABLE IF NOT EXISTS professions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hastalıklar
CREATE TABLE IF NOT EXISTS diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gelir Kaynakları
CREATE TABLE IF NOT EXISTS income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Etiketler
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  type TEXT, -- 'needy', 'application', 'orphan'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsorluk Tipleri
CREATE TABLE IF NOT EXISTS sponsorship_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  monthly_amount DECIMAL(12,2),
  currency TEXT DEFAULT 'TRY',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Birimler
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES units(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- NEEDY_PERSONS TABLOSUNU GENİŞLET
-- ===========================================

-- Yeni alanlar ekle (mevcut tabloya ALTER ile)
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS sponsorship_type_id UUID REFERENCES sponsorship_types(id);

-- Kimlik Bilgileri (Genişletilmiş)
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS father_name TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS mother_name TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS id_document_type TEXT; -- 'none', 'id_card', 'tc_card', 'temp_residence', 'foreign_id'
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS id_document_serial TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS id_validity_date DATE;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS previous_nationality_id UUID REFERENCES countries(id);
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS previous_name TEXT;

-- Pasaport ve Vize (Genişletilmiş)
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS visa_expiry DATE;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS return_status TEXT; -- 'impossible', 'no_means', 'not_planning', 'will_return', 'transit', 'visa_expiry'

-- Kişisel Bilgiler (Genişletilmiş)
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS birth_place TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS marital_status TEXT; -- 'single', 'married', 'divorced', 'widowed'
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS education_status TEXT; -- 'never', 'graduated', 'dropout', 'student'
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS education_level TEXT; -- 'primary', 'middle', 'high', 'associate', 'bachelor', 'master', 'literate'
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS religion TEXT; -- 'muslim', 'christian', 'jewish', 'buddhist', 'other'
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS criminal_record BOOLEAN DEFAULT FALSE;

-- İletişim (Genişletilmiş)
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS mobile_phone TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS mobile_operator TEXT; -- '530', '531', vb.
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS landline_phone TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS foreign_phone TEXT;

-- Aile ve Bağlantılar
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS linked_orphan_id UUID;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS linked_card_id UUID;

-- İş ve Gelir (Genişletilmiş)
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS monthly_expense DECIMAL(12,2);
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS social_security TEXT; -- 'state', 'private', 'green_card', 'none'
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS employment_status TEXT; -- 'employed', 'unemployed', 'retired', 'disabled'
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS sector_id UUID REFERENCES sectors(id);
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS profession_id UUID REFERENCES professions(id);
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS profession_description TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS additional_notes_tr TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS additional_notes_en TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS additional_notes_ar TEXT;

-- Sağlık (Genişletilmiş)
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS blood_type TEXT; -- 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS is_smoker TEXT; -- 'never', 'quit', 'occasional', 'regular'
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS health_issue TEXT; -- 'none', 'needs_treatment', 'in_treatment', 'untreatable', 'abroad_treatment'
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS disability_rate INTEGER; -- 0-100
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS prosthetics TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS regular_medications TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS surgeries TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS health_notes TEXT;

-- Acil Durum İletişimi
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS emergency_contact1_name TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS emergency_contact1_relation TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS emergency_contact1_phone TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS emergency_contact2_name TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS emergency_contact2_relation TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS emergency_contact2_phone TEXT;

-- Fotoğraf ve Dokümanlar
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS consent_status TEXT DEFAULT 'pending'; -- 'pending', 'received', 'rejected'
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS consent_date DATE;

-- Fon ve Dosya Bilgileri
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS fund_region TEXT; -- 'europe', 'free'

-- Kayıt Bilgileri
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS created_ip TEXT;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS total_aid_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS application_count INTEGER DEFAULT 0;
ALTER TABLE needy_persons ADD COLUMN IF NOT EXISTS aid_count INTEGER DEFAULT 0;

-- ===========================================
-- İLİŞKİLİ TABLOLAR (Bağlantılı Kayıtlar)
-- ===========================================

-- Banka Hesapları
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
  account_holder TEXT NOT NULL,
  currency TEXT DEFAULT 'TRY',
  transaction_type TEXT,
  iban TEXT,
  bank_name TEXT,
  branch_name TEXT,
  account_number TEXT,
  swift_code TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dokümanlar
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'needy_person', 'application', 'orphan', 'sponsor'
  entity_id UUID NOT NULL,
  document_type TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  group_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_by UUID,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fotoğraflar
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'needy_person', 'orphan'
  entity_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  is_profile BOOLEAN DEFAULT FALSE,
  uploaded_by UUID,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Baktığı Yetimler (İhtiyaç sahibinin baktığı yetimler)
CREATE TABLE IF NOT EXISTS needy_orphans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
  orphan_id UUID NOT NULL REFERENCES orphans(id) ON DELETE CASCADE,
  relation_type TEXT, -- 'parent', 'guardian', 'relative'
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Baktığı Kişiler (Bakmakla yükümlü olunan kişiler)
CREATE TABLE IF NOT EXISTS dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  relation_type TEXT, -- 'spouse', 'child', 'parent', 'sibling', 'other'
  gender TEXT,
  date_of_birth DATE,
  identity_number TEXT,
  has_disability BOOLEAN DEFAULT FALSE,
  disability_details TEXT,
  education_status TEXT,
  employment_status TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsor Bağlantıları
CREATE TABLE IF NOT EXISTS needy_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  sponsorship_type_id UUID REFERENCES sponsorship_types(id),
  start_date DATE,
  end_date DATE,
  monthly_amount DECIMAL(12,2),
  currency TEXT DEFAULT 'TRY',
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'ended'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referanslar
CREATE TABLE IF NOT EXISTS needy_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation_type TEXT, -- 'personal', 'work', 'family', 'other'
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Görüşme Kayıtları
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
  interview_type TEXT, -- 'face_to_face', 'phone', 'video', 'home_visit'
  interview_date TIMESTAMPTZ,
  interviewer_id UUID,
  interviewer_name TEXT,
  subject TEXT,
  notes TEXT,
  result TEXT, -- 'positive', 'negative', 'follow_up', 'pending'
  next_action TEXT,
  next_interview_date TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Görüşme Seans Takibi
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
  session_number INTEGER,
  scheduled_date TIMESTAMPTZ,
  actual_date TIMESTAMPTZ,
  duration_minutes INTEGER,
  status TEXT, -- 'scheduled', 'completed', 'cancelled', 'no_show'
  notes TEXT,
  progress_notes TEXT,
  counselor_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rıza Beyanları
CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'kvkk', 'aid', 'photo', 'data_sharing'
  consent_date DATE,
  expiry_date DATE,
  document_path TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'received', 'rejected', 'expired'
  notes TEXT,
  received_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sosyal Kartlar
CREATE TABLE IF NOT EXISTS social_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
  card_type TEXT, -- 'green_card', 'poverty_card', 'disabled_card', 'other'
  card_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  issuing_authority TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kişi-Hastalık İlişkisi
CREATE TABLE IF NOT EXISTS needy_diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
  disease_id UUID NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
  diagnosis_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(needy_person_id, disease_id)
);

-- Kişi-Gelir Kaynağı İlişkisi
CREATE TABLE IF NOT EXISTS needy_income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
  income_source_id UUID NOT NULL REFERENCES income_sources(id) ON DELETE CASCADE,
  amount DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(needy_person_id, income_source_id)
);

-- Kişi-Etiket İlişkisi
CREATE TABLE IF NOT EXISTS needy_tags (
  needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (needy_person_id, tag_id)
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_bank_accounts_needy ON bank_accounts(needy_person_id);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_photos_entity ON photos(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_needy_orphans_needy ON needy_orphans(needy_person_id);
CREATE INDEX IF NOT EXISTS idx_dependents_needy ON dependents(needy_person_id);
CREATE INDEX IF NOT EXISTS idx_needy_sponsors_needy ON needy_sponsors(needy_person_id);
CREATE INDEX IF NOT EXISTS idx_needy_references_needy ON needy_references(needy_person_id);
CREATE INDEX IF NOT EXISTS idx_interviews_needy ON interviews(needy_person_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_needy ON interview_sessions(needy_person_id);
CREATE INDEX IF NOT EXISTS idx_consents_needy ON consents(needy_person_id);
CREATE INDEX IF NOT EXISTS idx_social_cards_needy ON social_cards(needy_person_id);

-- ===========================================
-- TRIGGERS
-- ===========================================

CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- RLS Policies
-- ===========================================

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON bank_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON bank_accounts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON bank_accounts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON documents FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON photos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON interviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON interviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON interviews FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON consents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON consents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON consents FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON social_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON social_cards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON social_cards FOR UPDATE TO authenticated USING (true);

-- Lookup tables
CREATE POLICY "Allow public read" ON sectors FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON professions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON diseases FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON income_sources FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON tags FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON sponsorship_types FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON units FOR SELECT USING (true);

-- ===========================================
-- SEED DATA
-- ===========================================

-- Kategoriler (Genişletilmiş)
INSERT INTO categories (name, type) VALUES 
  ('İhtiyaç Sahibi Aile', 'needy'),
  ('Bakmakla Yükümlü Olunan Kişi', 'needy'),
  ('Öğrenci (Yabancı)', 'needy'),
  ('Öğrenci (TC)', 'needy'),
  ('Vakıf & Dernek', 'needy'),
  ('Devlet Okulu', 'needy'),
  ('Kamu Kurumu', 'needy'),
  ('Özel Eğitim Kurumu', 'needy')
ON CONFLICT DO NOTHING;

-- Hastalıklar
INSERT INTO diseases (name) VALUES
  ('Akdeniz Anemisi'),
  ('Alerji'),
  ('Astım'),
  ('Bronşit (Kronik)'),
  ('Böbrek Yetmezliği'),
  ('Diyabet (Şeker Hastalığı)'),
  ('Epilepsi (Sara)'),
  ('Görme Bozukluğu'),
  ('Hipertansiyon'),
  ('Kalp Yetmezliği'),
  ('Kanser'),
  ('Karaciğer Hastalığı'),
  ('Lösemi'),
  ('Migren'),
  ('Otizm'),
  ('Psikolojik Sorun'),
  ('Romatizma'),
  ('Down Sendromu'),
  ('Depresyon'),
  ('Diğer')
ON CONFLICT DO NOTHING;

-- Gelir Kaynakları
INSERT INTO income_sources (name) VALUES
  ('Basit Ticaret'),
  ('Devlet Yardımı'),
  ('Evde İmalat İşleri'),
  ('Maaş'),
  ('Özel Yardım / Burs'),
  ('Tarımsal Gelir')
ON CONFLICT DO NOTHING;

-- Etiketler
INSERT INTO tags (name, color, type) VALUES
  ('Düzenli Yardım Yapılabilir', '#22C55E', 'needy'),
  ('Gelecekteki Başvuruları Reddedilmeli', '#EF4444', 'needy'),
  ('Olumsuz', '#F97316', 'needy'),
  ('Sahte Evrak Getirdi / Yalan Beyanda Bulundu', '#DC2626', 'needy'),
  ('Depremzede', '#3B82F6', 'needy'),
  ('Acil', '#EF4444', 'needy')
ON CONFLICT DO NOTHING;

-- Sektörler
INSERT INTO sectors (name) VALUES
  ('Bilişim'),
  ('Sağlık'),
  ('Eğitim'),
  ('İnşaat'),
  ('Tekstil'),
  ('Gıda'),
  ('Ulaşım'),
  ('Finans'),
  ('Turizm'),
  ('Tarım'),
  ('Diğer')
ON CONFLICT DO NOTHING;

-- Sponsorluk Tipleri
INSERT INTO sponsorship_types (name, monthly_amount, currency) VALUES
  ('Yetim Sponsorluğu', 500, 'TRY'),
  ('Öğrenci Bursu', 750, 'TRY'),
  ('Aile Sponsorluğu', 1000, 'TRY'),
  ('Eğitim Desteği', 300, 'TRY')
ON CONFLICT DO NOTHING;

-- Birimler
INSERT INTO units (name) VALUES
  ('Başkan'),
  ('Yönetim Kurulu'),
  ('Yardım Birimi'),
  ('Mali İşler'),
  ('Burs Birimi'),
  ('Gönüllü Koordinasyonu')
ON CONFLICT DO NOTHING;
