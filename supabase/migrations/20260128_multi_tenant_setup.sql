-- ==============================================================================
-- MULTI-TENANT SETUP MIGRATION
-- ==============================================================================
-- Bu migration, sistemi çoklu dernek (multi-tenant) yapısına geçirir.
-- Her dernek (organization) kendi verilerini izole bir şekilde görebilir.
-- ==============================================================================

-- 1. ORGANIZATIONS TABLE
-- Her STK/dernek için ana kayıt tablosu
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,

    -- İletişim bilgileri
    email TEXT,
    phone TEXT,
    website TEXT,
    address TEXT,
    city TEXT,

    -- Abonelik bilgileri
    plan_tier TEXT NOT NULL DEFAULT 'professional' CHECK (plan_tier IN ('free', 'professional', 'enterprise')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'trial', 'suspended', 'cancelled')),
    trial_ends_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,

    -- Stripe entegrasyonu
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,

    -- Ayarlar
    settings JSONB DEFAULT '{
        "currency": "TRY",
        "language": "tr",
        "timezone": "Europe/Istanbul",
        "date_format": "DD.MM.YYYY",
        "max_users": 10,
        "features": {
            "sms_enabled": true,
            "email_enabled": true,
            "mernis_enabled": true,
            "reports_enabled": true
        }
    }'::jsonb,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 2. ORGANIZATION_MEMBERS TABLE
-- Kullanıcı-organizasyon ilişkisi
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Rol (organizasyon bazında)
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('owner', 'admin', 'moderator', 'user', 'viewer')),

    -- Davet bilgileri
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),

    -- Durum
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_active_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Her kullanıcı bir organizasyonda sadece bir üyelik kaydına sahip olabilir
    CONSTRAINT unique_org_member UNIQUE (organization_id, user_id)
);

-- 3. ORGANIZATION_INVITES TABLE
-- Davet yönetimi
CREATE TABLE IF NOT EXISTS organization_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user', 'viewer')),
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_pending_invite UNIQUE (organization_id, email)
);

-- 4. ADD organization_id TO ALL DATA TABLES
-- İhtiyaç sahipleri
ALTER TABLE needy_persons
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Yetimler
ALTER TABLE orphans
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Gönüllüler
ALTER TABLE volunteers
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Bağışlar
ALTER TABLE donations
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Başvurular
ALTER TABLE aid_applications
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Toplantılar
ALTER TABLE meetings
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Banka hesapları
ALTER TABLE bank_accounts
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Bildirimler
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Etkinlikler (varsa)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') THEN
        ALTER TABLE events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Satın alma talepleri (varsa)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'purchase_requests') THEN
        ALTER TABLE purchase_requests ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Bağlantılı kayıtlar tabloları
DO $$
DECLARE
    linked_tables TEXT[] := ARRAY[
        'needy_bank_accounts',
        'needy_documents',
        'needy_photos',
        'needy_interviews',
        'needy_dependents',
        'needy_sponsors',
        'needy_aids_received',
        'needy_references',
        'needy_notes',
        'needy_addresses',
        'needy_contacts',
        'orphan_relations'
    ];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY linked_tables
    LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = tbl) THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE', tbl);
        END IF;
    END LOOP;
END $$;

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_plan ON organizations(plan_tier, subscription_status);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_token ON organization_invites(token);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON organization_invites(email);

-- Data tables indexes
CREATE INDEX IF NOT EXISTS idx_needy_org ON needy_persons(organization_id);
CREATE INDEX IF NOT EXISTS idx_donations_org ON donations(organization_id);
CREATE INDEX IF NOT EXISTS idx_orphans_org ON orphans(organization_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_org ON volunteers(organization_id);
CREATE INDEX IF NOT EXISTS idx_meetings_org ON meetings(organization_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_org ON bank_accounts(organization_id);

-- 6. ENABLE RLS ON NEW TABLES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES FOR ORGANIZATIONS
-- Kullanıcı sadece üyesi olduğu organizasyonları görebilir
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Sadece owner ve admin organizasyonu güncelleyebilir
CREATE POLICY "Admins can update organization" ON organizations
    FOR UPDATE TO authenticated
    USING (
        id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
            AND is_active = true
        )
    );

-- 8. RLS POLICIES FOR ORGANIZATION MEMBERS
CREATE POLICY "View org members" ON organization_members
    FOR SELECT TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins can manage members" ON organization_members
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
            AND is_active = true
        )
    );

-- 9. RLS POLICIES FOR INVITES
CREATE POLICY "Admins can manage invites" ON organization_invites
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
            AND is_active = true
        )
    );

-- 10. HELPER FUNCTIONS

-- Kullanıcının aktif organizasyonunu döndür
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT organization_id
        FROM organization_members
        WHERE user_id = auth.uid()
        AND is_active = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının organizasyondaki rolünü döndür
CREATE OR REPLACE FUNCTION get_user_org_role(org_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role
        FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = org_id
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının organizasyona erişimi var mı kontrol et
CREATE OR REPLACE FUNCTION user_has_org_access(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = org_id
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. UPDATE PROFILES TABLE
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS default_organization_id UUID REFERENCES organizations(id);

-- 12. TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_organization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_organization_updated_at();

CREATE TRIGGER organization_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION update_organization_updated_at();

-- 13. COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE organizations IS 'Her STK/dernek için ana kayıt tablosu - Multi-tenant izolasyon sağlar';
COMMENT ON TABLE organization_members IS 'Kullanıcı-organizasyon ilişkisi ve rol yönetimi';
COMMENT ON TABLE organization_invites IS 'Organizasyona davet yönetimi';
COMMENT ON COLUMN organizations.plan_tier IS 'Abonelik seviyesi: free, professional, enterprise';
COMMENT ON COLUMN organizations.settings IS 'Organizasyon ayarları (JSON formatında)';
COMMENT ON FUNCTION get_user_organization_id() IS 'Kullanıcının aktif organizasyon ID''sini döndürür';
