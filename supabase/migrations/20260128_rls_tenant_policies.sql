-- ==============================================================================
-- MULTI-TENANT RLS POLICIES
-- ==============================================================================
-- Bu migration, tüm veri tablolarına organizasyon bazlı RLS politikaları ekler.
-- ==============================================================================

-- Helper function: Kullanıcının organizasyon üyeliğini kontrol et
CREATE OR REPLACE FUNCTION auth.user_org_ids()
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: Belirli bir organizasyona erişim kontrolü
CREATE OR REPLACE FUNCTION auth.has_org_access(org_id UUID)
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: Organizasyonda admin veya owner mı?
CREATE OR REPLACE FUNCTION auth.is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = org_id
        AND role IN ('owner', 'admin')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- NEEDY_PERSONS RLS POLICIES
-- ==============================================================================

-- Mevcut politikaları kaldır (varsa)
DROP POLICY IF EXISTS "Allow authenticated read" ON needy_persons;
DROP POLICY IF EXISTS "Allow authenticated insert" ON needy_persons;
DROP POLICY IF EXISTS "Allow authenticated update" ON needy_persons;
DROP POLICY IF EXISTS "Allow authenticated delete" ON needy_persons;
DROP POLICY IF EXISTS "tenant_isolation_select" ON needy_persons;
DROP POLICY IF EXISTS "tenant_isolation_insert" ON needy_persons;
DROP POLICY IF EXISTS "tenant_isolation_update" ON needy_persons;
DROP POLICY IF EXISTS "tenant_isolation_delete" ON needy_persons;

-- Yeni multi-tenant politikalar
CREATE POLICY "tenant_isolation_select" ON needy_persons
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_insert" ON needy_persons
    FOR INSERT TO authenticated
    WITH CHECK (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_update" ON needy_persons
    FOR UPDATE TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_delete" ON needy_persons
    FOR DELETE TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()) AND auth.is_org_admin(organization_id));

-- ==============================================================================
-- DONATIONS RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Allow authenticated read" ON donations;
DROP POLICY IF EXISTS "Allow authenticated insert" ON donations;
DROP POLICY IF EXISTS "Allow authenticated update" ON donations;
DROP POLICY IF EXISTS "Allow authenticated delete" ON donations;
DROP POLICY IF EXISTS "tenant_isolation_select" ON donations;
DROP POLICY IF EXISTS "tenant_isolation_insert" ON donations;
DROP POLICY IF EXISTS "tenant_isolation_update" ON donations;
DROP POLICY IF EXISTS "tenant_isolation_delete" ON donations;

CREATE POLICY "tenant_isolation_select" ON donations
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_insert" ON donations
    FOR INSERT TO authenticated
    WITH CHECK (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_update" ON donations
    FOR UPDATE TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_delete" ON donations
    FOR DELETE TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()) AND auth.is_org_admin(organization_id));

-- ==============================================================================
-- ORPHANS RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Allow authenticated read" ON orphans;
DROP POLICY IF EXISTS "Allow authenticated insert" ON orphans;
DROP POLICY IF EXISTS "Allow authenticated update" ON orphans;
DROP POLICY IF EXISTS "Allow authenticated delete" ON orphans;
DROP POLICY IF EXISTS "tenant_isolation_select" ON orphans;
DROP POLICY IF EXISTS "tenant_isolation_insert" ON orphans;
DROP POLICY IF EXISTS "tenant_isolation_update" ON orphans;
DROP POLICY IF EXISTS "tenant_isolation_delete" ON orphans;

CREATE POLICY "tenant_isolation_select" ON orphans
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_insert" ON orphans
    FOR INSERT TO authenticated
    WITH CHECK (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_update" ON orphans
    FOR UPDATE TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_delete" ON orphans
    FOR DELETE TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()) AND auth.is_org_admin(organization_id));

-- ==============================================================================
-- VOLUNTEERS RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Allow authenticated read" ON volunteers;
DROP POLICY IF EXISTS "Allow authenticated insert" ON volunteers;
DROP POLICY IF EXISTS "Allow authenticated update" ON volunteers;
DROP POLICY IF EXISTS "Allow authenticated delete" ON volunteers;
DROP POLICY IF EXISTS "tenant_isolation_select" ON volunteers;
DROP POLICY IF EXISTS "tenant_isolation_insert" ON volunteers;
DROP POLICY IF EXISTS "tenant_isolation_update" ON volunteers;
DROP POLICY IF EXISTS "tenant_isolation_delete" ON volunteers;

CREATE POLICY "tenant_isolation_select" ON volunteers
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_insert" ON volunteers
    FOR INSERT TO authenticated
    WITH CHECK (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_update" ON volunteers
    FOR UPDATE TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_delete" ON volunteers
    FOR DELETE TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()) AND auth.is_org_admin(organization_id));

-- ==============================================================================
-- MEETINGS RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Allow authenticated read" ON meetings;
DROP POLICY IF EXISTS "Allow authenticated insert" ON meetings;
DROP POLICY IF EXISTS "Allow authenticated update" ON meetings;
DROP POLICY IF EXISTS "Allow authenticated delete" ON meetings;
DROP POLICY IF EXISTS "tenant_isolation_select" ON meetings;
DROP POLICY IF EXISTS "tenant_isolation_insert" ON meetings;
DROP POLICY IF EXISTS "tenant_isolation_update" ON meetings;
DROP POLICY IF EXISTS "tenant_isolation_delete" ON meetings;

CREATE POLICY "tenant_isolation_select" ON meetings
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_insert" ON meetings
    FOR INSERT TO authenticated
    WITH CHECK (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_update" ON meetings
    FOR UPDATE TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_delete" ON meetings
    FOR DELETE TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()) AND auth.is_org_admin(organization_id));

-- ==============================================================================
-- BANK_ACCOUNTS RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Allow authenticated read" ON bank_accounts;
DROP POLICY IF EXISTS "Allow authenticated insert" ON bank_accounts;
DROP POLICY IF EXISTS "Allow authenticated update" ON bank_accounts;
DROP POLICY IF EXISTS "Allow authenticated delete" ON bank_accounts;
DROP POLICY IF EXISTS "tenant_isolation_select" ON bank_accounts;
DROP POLICY IF EXISTS "tenant_isolation_insert" ON bank_accounts;
DROP POLICY IF EXISTS "tenant_isolation_update" ON bank_accounts;
DROP POLICY IF EXISTS "tenant_isolation_delete" ON bank_accounts;

CREATE POLICY "tenant_isolation_select" ON bank_accounts
    FOR SELECT TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_insert" ON bank_accounts
    FOR INSERT TO authenticated
    WITH CHECK (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_update" ON bank_accounts
    FOR UPDATE TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_delete" ON bank_accounts
    FOR DELETE TO authenticated
    USING (organization_id IN (SELECT auth.user_org_ids()) AND auth.is_org_admin(organization_id));

-- ==============================================================================
-- NOTIFICATIONS RLS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "tenant_isolation_select" ON notifications;
DROP POLICY IF EXISTS "tenant_isolation_insert" ON notifications;
DROP POLICY IF EXISTS "tenant_isolation_update" ON notifications;

CREATE POLICY "tenant_isolation_select" ON notifications
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        AND organization_id IN (SELECT auth.user_org_ids())
    );

CREATE POLICY "tenant_isolation_insert" ON notifications
    FOR INSERT TO authenticated
    WITH CHECK (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "tenant_isolation_update" ON notifications
    FOR UPDATE TO authenticated
    USING (
        user_id = auth.uid()
        AND organization_id IN (SELECT auth.user_org_ids())
    );

-- ==============================================================================
-- AID_APPLICATIONS RLS POLICIES (if exists)
-- ==============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'aid_applications') THEN
        EXECUTE 'DROP POLICY IF EXISTS "tenant_isolation_select" ON aid_applications';
        EXECUTE 'DROP POLICY IF EXISTS "tenant_isolation_insert" ON aid_applications';
        EXECUTE 'DROP POLICY IF EXISTS "tenant_isolation_update" ON aid_applications';
        EXECUTE 'DROP POLICY IF EXISTS "tenant_isolation_delete" ON aid_applications';

        EXECUTE 'CREATE POLICY "tenant_isolation_select" ON aid_applications
            FOR SELECT TO authenticated
            USING (organization_id IN (SELECT auth.user_org_ids()))';

        EXECUTE 'CREATE POLICY "tenant_isolation_insert" ON aid_applications
            FOR INSERT TO authenticated
            WITH CHECK (organization_id IN (SELECT auth.user_org_ids()))';

        EXECUTE 'CREATE POLICY "tenant_isolation_update" ON aid_applications
            FOR UPDATE TO authenticated
            USING (organization_id IN (SELECT auth.user_org_ids()))';

        EXECUTE 'CREATE POLICY "tenant_isolation_delete" ON aid_applications
            FOR DELETE TO authenticated
            USING (organization_id IN (SELECT auth.user_org_ids()) AND auth.is_org_admin(organization_id))';
    END IF;
END $$;

-- ==============================================================================
-- PROFILES RLS POLICIES (special case - user-centric but org-aware)
-- ==============================================================================

-- Profiles tablosu için mevcut politikaları güncelle
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "org_members_can_view_profiles" ON profiles;

-- Kullanıcılar kendi profilini görebilir
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());

-- Aynı organizasyondaki kullanıcılar birbirini görebilir
CREATE POLICY "org_members_can_view_profiles" ON profiles
    FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT user_id FROM organization_members
            WHERE organization_id IN (SELECT auth.user_org_ids())
            AND is_active = true
        )
    );

-- Kullanıcılar sadece kendi profilini güncelleyebilir
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid());

-- ==============================================================================
-- COMMENTS
-- ==============================================================================

COMMENT ON FUNCTION auth.user_org_ids() IS 'Kullanıcının üyesi olduğu tüm organizasyon ID''lerini döndürür';
COMMENT ON FUNCTION auth.has_org_access(UUID) IS 'Kullanıcının belirtilen organizasyona erişimi var mı kontrol eder';
COMMENT ON FUNCTION auth.is_org_admin(UUID) IS 'Kullanıcı belirtilen organizasyonda admin veya owner mı kontrol eder';
