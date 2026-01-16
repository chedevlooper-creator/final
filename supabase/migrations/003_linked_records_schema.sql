-- =====================================================
-- BAĞLANTILI KAYITLAR TAB'LARI İÇİN VERİTABANI ŞEMASI
-- 14 Tab için tüm tablolar
-- =====================================================

-- =====================================================
-- TAB 1: BANKA HESAPLARI
-- =====================================================
CREATE TABLE IF NOT EXISTS needy_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
    
    -- Hesap Bilgileri
    account_holder_name VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'TRY', -- TRY, USD, EUR, GBP
    transaction_type VARCHAR(50), -- Havale, EFT, Swift
    iban VARCHAR(34),
    bank_name VARCHAR(100),
    branch_name VARCHAR(100),
    branch_code VARCHAR(20),
    account_number VARCHAR(30),
    swift_code VARCHAR(11),
    address TEXT,
    
    -- Durum
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    notes TEXT
);

CREATE INDEX idx_needy_bank_accounts_person ON needy_bank_accounts(needy_person_id);
CREATE INDEX idx_needy_bank_accounts_active ON needy_bank_accounts(is_active);

-- =====================================================
-- TAB 2: DOKÜMANLAR
-- =====================================================
CREATE TABLE IF NOT EXISTS needy_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
    
    -- Doküman Bilgileri
    document_type VARCHAR(50) NOT NULL, -- kimlik, pasaport, ikamet, gelir_belgesi, saglik_raporu, diger
    document_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Geçerlilik
    issue_date DATE,
    expiry_date DATE,
    document_number VARCHAR(100),
    issuing_authority VARCHAR(255),
    
    -- Durum
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    notes TEXT
);

CREATE INDEX idx_needy_documents_person ON needy_documents(needy_person_id);
CREATE INDEX idx_needy_documents_type ON needy_documents(document_type);

-- =====================================================
-- TAB 3: FOTOĞRAFLAR
-- =====================================================
CREATE TABLE IF NOT EXISTS needy_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
    
    -- Fotoğraf Bilgileri
    photo_type VARCHAR(50) DEFAULT 'general', -- profile, family, document, general
    file_path TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Boyutlar
    width INTEGER,
    height INTEGER,
    thumbnail_path TEXT,
    
    -- Durum
    is_primary BOOLEAN DEFAULT false,
    is_consent_given BOOLEAN DEFAULT false,
    consent_date DATE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    description TEXT
);

CREATE INDEX idx_needy_photos_person ON needy_photos(needy_person_id);
CREATE INDEX idx_needy_photos_type ON needy_photos(photo_type);

-- =====================================================
-- TAB 4: BAKTIĞI YETİMLER
-- =====================================================
CREATE TABLE IF NOT EXISTS needy_orphan_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
    orphan_id UUID NOT NULL, -- orphans tablosuna referans
    
    -- İlişki Bilgileri
    relation_type VARCHAR(50) DEFAULT 'guardian', -- guardian, caretaker, relative
    relation_description VARCHAR(255),
    start_date DATE,
    end_date DATE,
    
    -- Durum
    is_active BOOLEAN DEFAULT true,
    is_primary_guardian BOOLEAN DEFAULT false,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    notes TEXT
);

CREATE INDEX idx_needy_orphan_relations_person ON needy_orphan_relations(needy_person_id);
CREATE INDEX idx_needy_orphan_relations_orphan ON needy_orphan_relations(orphan_id);

-- =====================================================
-- TAB 5: BAKTIĞI KİŞİLER (BAĞIMLI KİŞİLER)
-- =====================================================
CREATE TABLE IF NOT EXISTS needy_dependents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
    dependent_person_id UUID REFERENCES needy_persons(id), -- Başka bir needy person olabilir
    
    -- Bağımlı Kişi Bilgileri (eğer sistemde kayıtlı değilse)
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    identity_number VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10),
    
    -- İlişki Bilgileri
    relation_type VARCHAR(50) NOT NULL, -- child, spouse, parent, sibling, other
    relation_description VARCHAR(255),
    
    -- Durum
    is_active BOOLEAN DEFAULT true,
    needs_support BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    notes TEXT
);

CREATE INDEX idx_needy_dependents_person ON needy_dependents(needy_person_id);
CREATE INDEX idx_needy_dependents_relation ON needy_dependents(relation_type);

-- =====================================================
-- TAB 6: SPONSORLAR
-- =====================================================
CREATE TABLE IF NOT EXISTS needy_sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
    sponsor_id UUID, -- sponsors tablosuna referans
    
    -- Sponsor Bilgileri (eğer sistemde kayıtlı değilse)
    sponsor_name VARCHAR(255),
    sponsor_type VARCHAR(50), -- individual, organization, foundation
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    
    -- Sponsorluk Detayları
    sponsorship_type VARCHAR(50), -- orphan, education, health, general
    monthly_amount DECIMAL(12, 2),
    currency VARCHAR(10) DEFAULT 'TRY',
    start_date DATE,
    end_date DATE,
    
    -- Durum
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active', -- active, paused, ended
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    notes TEXT
);

CREATE INDEX idx_needy_sponsors_person ON needy_sponsors(needy_person_id);
CREATE INDEX idx_needy_sponsors_status ON needy_sponsors(status);

-- =====================================================
-- TAB 7: REFERANSLAR
-- =====================================================
CREATE TABLE IF NOT EXISTS needy_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
    
    -- Referans Kişi Bilgileri
    reference_name VARCHAR(255) NOT NULL,
    reference_type VARCHAR(50), -- personal, work, family, neighbor
    relation VARCHAR(100), -- Yakınlık derecesi
    
    -- İletişim
    phone VARCHAR(20),
    alt_phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    
    -- Durum
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    notes TEXT
);

CREATE INDEX idx_needy_references_person ON needy_references(needy_person_id);

-- =====================================================
-- TAB 8: GÖRÜŞME KAYITLARI
-- =====================================================
CREATE TABLE IF NOT EXISTS needy_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
    
    -- Görüşme Bilgileri
    interview_date TIMESTAMPTZ NOT NULL,
    interview_type VARCHAR(50) NOT NULL, -- face_to_face, phone, video, home_visit
    interviewer_id UUID,
    interviewer_name VARCHAR(255),
    
    -- Konu ve İçerik
    subject VARCHAR(255),
    summary TEXT,
    detailed_notes TEXT,
    
    -- Konum
    location VARCHAR(255),
    
    -- Sonuç
    outcome VARCHAR(50), -- positive, negative, pending, follow_up_needed
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    
    -- Durum
    status VARCHAR(50) DEFAULT 'completed', -- scheduled, completed, cancelled
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

CREATE INDEX idx_needy_interviews_person ON needy_interviews(needy_person_id);
CREATE INDEX idx_needy_interviews_date ON needy_interviews(interview_date);
CREATE INDEX idx_needy_interviews_type ON needy_interviews(interview_type);

-- =====================================================
-- TAB 9: GÖRÜŞME SEANS TAKİBİ
-- =====================================================
CREATE TABLE IF NOT EXISTS needy_interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
    interview_id UUID REFERENCES needy_interviews(id),
    
    -- Seans Bilgileri
    session_number INTEGER DEFAULT 1,
    scheduled_date TIMESTAMPTZ NOT NULL,
    actual_date TIMESTAMPTZ,
    duration_minutes INTEGER,
    
    -- Görüşmeci
    counselor_id UUID,
    counselor_name VARCHAR(255),
    
    -- Seans İçeriği
    session_type VARCHAR(50), -- initial, follow_up, assessment, counseling
    session_notes TEXT,
    progress_notes TEXT,
    
    -- Durum
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
    
    -- Sonraki Seans
    next_session_date TIMESTAMPTZ,
    next_session_notes TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

CREATE INDEX idx_needy_sessions_person ON needy_interview_sessions(needy_person_id);
CREATE INDEX idx_needy_sessions_date ON needy_interview_sessions(scheduled_date);
CREATE INDEX idx_needy_sessions_status ON needy_interview_sessions(status);

-- =====================================================
-- TAB 10: YARDIM TALEPLERİ (applications tablosu zaten var, link tablosu)
-- =====================================================
-- applications tablosu zaten mevcut, needy_person_id ile bağlantılı

-- =====================================================
-- TAB 11: YAPILAN YARDIMLAR
-- =====================================================
CREATE TABLE IF NOT EXISTS needy_aids_received (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id),
    
    -- Yardım Bilgileri
    aid_type VARCHAR(50) NOT NULL, -- cash, food, in_kind, service, education, health
    aid_category VARCHAR(100),
    description TEXT,
    
    -- Tutar
    amount DECIMAL(12, 2),
    currency VARCHAR(10) DEFAULT 'TRY',
    quantity INTEGER,
    unit VARCHAR(50),
    
    -- Tarihler
    aid_date DATE NOT NULL,
    delivery_date DATE,
    
    -- Teslimat
    delivery_method VARCHAR(50), -- direct, bank_transfer, cargo, hand_delivery
    delivery_status VARCHAR(50) DEFAULT 'pending', -- pending, delivered, returned
    delivered_by UUID,
    delivered_at TIMESTAMPTZ,
    
    -- Belge
    receipt_number VARCHAR(100),
    receipt_path TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    notes TEXT
);

CREATE INDEX idx_needy_aids_person ON needy_aids_received(needy_person_id);
CREATE INDEX idx_needy_aids_date ON needy_aids_received(aid_date);
CREATE INDEX idx_needy_aids_type ON needy_aids_received(aid_type);

-- =====================================================
-- TAB 12: RIZA BEYANLARI
-- =====================================================
CREATE TABLE IF NOT EXISTS needy_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
    
    -- Rıza Tipi
    consent_type VARCHAR(50) NOT NULL, -- kvkk, photo, aid, data_sharing, marketing
    consent_name VARCHAR(255),
    
    -- Rıza Durumu
    is_given BOOLEAN DEFAULT false,
    given_date DATE,
    expiry_date DATE,
    
    -- Belge
    document_path TEXT,
    document_signed BOOLEAN DEFAULT false,
    signature_type VARCHAR(50), -- wet_signature, digital, verbal
    
    -- Kapsamı
    scope TEXT,
    
    -- İptal
    revoked BOOLEAN DEFAULT false,
    revoked_date DATE,
    revocation_reason TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    witness_name VARCHAR(255),
    witness_id_number VARCHAR(20),
    notes TEXT
);

CREATE INDEX idx_needy_consents_person ON needy_consents(needy_person_id);
CREATE INDEX idx_needy_consents_type ON needy_consents(consent_type);
CREATE INDEX idx_needy_consents_given ON needy_consents(is_given);

-- =====================================================
-- TAB 13: SOSYAL KARTLAR
-- =====================================================
CREATE TABLE IF NOT EXISTS needy_social_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    needy_person_id UUID NOT NULL REFERENCES needy_persons(id) ON DELETE CASCADE,
    
    -- Kart Bilgileri
    card_type VARCHAR(50) NOT NULL, -- green_card, poverty_card, refugee_card, disability_card
    card_name VARCHAR(255),
    card_number VARCHAR(50),
    
    -- Geçerlilik
    issue_date DATE,
    expiry_date DATE,
    issuing_authority VARCHAR(255),
    
    -- Kapsam
    coverage_details TEXT,
    benefits TEXT[],
    
    -- Durum
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active', -- active, expired, cancelled, pending
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    notes TEXT
);

CREATE INDEX idx_needy_social_cards_person ON needy_social_cards(needy_person_id);
CREATE INDEX idx_needy_social_cards_type ON needy_social_cards(card_type);
CREATE INDEX idx_needy_social_cards_active ON needy_social_cards(is_active);

-- =====================================================
-- TAB 14: KART ÖZETİ (VIEW)
-- =====================================================
CREATE OR REPLACE VIEW needy_card_summary AS
SELECT 
    np.id AS needy_person_id,
    np.first_name,
    np.last_name,
    np.identity_number,
    np.category,
    np.status,
    
    -- Banka Hesapları
    (SELECT COUNT(*) FROM needy_bank_accounts WHERE needy_person_id = np.id AND is_active = true) AS active_bank_accounts,
    
    -- Dokümanlar
    (SELECT COUNT(*) FROM needy_documents WHERE needy_person_id = np.id) AS total_documents,
    
    -- Fotoğraflar
    (SELECT COUNT(*) FROM needy_photos WHERE needy_person_id = np.id) AS total_photos,
    
    -- Baktığı Yetimler
    (SELECT COUNT(*) FROM needy_orphan_relations WHERE needy_person_id = np.id AND is_active = true) AS active_orphan_relations,
    
    -- Baktığı Kişiler
    (SELECT COUNT(*) FROM needy_dependents WHERE needy_person_id = np.id AND is_active = true) AS active_dependents,
    
    -- Sponsorlar
    (SELECT COUNT(*) FROM needy_sponsors WHERE needy_person_id = np.id AND is_active = true) AS active_sponsors,
    
    -- Referanslar
    (SELECT COUNT(*) FROM needy_references WHERE needy_person_id = np.id) AS total_references,
    
    -- Görüşmeler
    (SELECT COUNT(*) FROM needy_interviews WHERE needy_person_id = np.id) AS total_interviews,
    
    -- Seanslar
    (SELECT COUNT(*) FROM needy_interview_sessions WHERE needy_person_id = np.id) AS total_sessions,
    
    -- Yardım Talepleri
    (SELECT COUNT(*) FROM applications WHERE needy_person_id = np.id) AS total_applications,
    (SELECT COUNT(*) FROM applications WHERE needy_person_id = np.id AND status = 'pending') AS pending_applications,
    
    -- Yapılan Yardımlar
    (SELECT COUNT(*) FROM needy_aids_received WHERE needy_person_id = np.id) AS total_aids_received,
    (SELECT COALESCE(SUM(amount), 0) FROM needy_aids_received WHERE needy_person_id = np.id AND currency = 'TRY') AS total_aid_amount_try,
    
    -- Rıza Beyanları
    (SELECT COUNT(*) FROM needy_consents WHERE needy_person_id = np.id AND is_given = true) AS given_consents,
    
    -- Sosyal Kartlar
    (SELECT COUNT(*) FROM needy_social_cards WHERE needy_person_id = np.id AND is_active = true) AS active_social_cards

FROM needy_persons np;

-- =====================================================
-- RLS POLİTİKALARI
-- =====================================================

-- Banka Hesapları
ALTER TABLE needy_bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view needy bank accounts" ON needy_bank_accounts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage needy bank accounts" ON needy_bank_accounts FOR ALL USING (auth.role() = 'authenticated');

-- Dokümanlar
ALTER TABLE needy_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view needy documents" ON needy_documents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage needy documents" ON needy_documents FOR ALL USING (auth.role() = 'authenticated');

-- Fotoğraflar
ALTER TABLE needy_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view needy photos" ON needy_photos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage needy photos" ON needy_photos FOR ALL USING (auth.role() = 'authenticated');

-- Yetim İlişkileri
ALTER TABLE needy_orphan_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view orphan relations" ON needy_orphan_relations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage orphan relations" ON needy_orphan_relations FOR ALL USING (auth.role() = 'authenticated');

-- Bağımlı Kişiler
ALTER TABLE needy_dependents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view dependents" ON needy_dependents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage dependents" ON needy_dependents FOR ALL USING (auth.role() = 'authenticated');

-- Sponsorlar
ALTER TABLE needy_sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view sponsors" ON needy_sponsors FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage sponsors" ON needy_sponsors FOR ALL USING (auth.role() = 'authenticated');

-- Referanslar
ALTER TABLE needy_references ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view references" ON needy_references FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage references" ON needy_references FOR ALL USING (auth.role() = 'authenticated');

-- Görüşmeler
ALTER TABLE needy_interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view interviews" ON needy_interviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage interviews" ON needy_interviews FOR ALL USING (auth.role() = 'authenticated');

-- Seanslar
ALTER TABLE needy_interview_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view sessions" ON needy_interview_sessions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage sessions" ON needy_interview_sessions FOR ALL USING (auth.role() = 'authenticated');

-- Yapılan Yardımlar
ALTER TABLE needy_aids_received ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view aids received" ON needy_aids_received FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage aids received" ON needy_aids_received FOR ALL USING (auth.role() = 'authenticated');

-- Rıza Beyanları
ALTER TABLE needy_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view consents" ON needy_consents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage consents" ON needy_consents FOR ALL USING (auth.role() = 'authenticated');

-- Sosyal Kartlar
ALTER TABLE needy_social_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view social cards" ON needy_social_cards FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage social cards" ON needy_social_cards FOR ALL USING (auth.role() = 'authenticated');
