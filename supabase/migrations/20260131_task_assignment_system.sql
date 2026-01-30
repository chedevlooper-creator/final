-- ==============================================================================
-- TASK ASSIGNMENT SYSTEM MIGRATION
-- ==============================================================================
-- Dernek başkanı tarafından çalışanlara haftalık görev atama sistemi
-- Aktivite loglama ve bildirim sistemi ile birlikte
-- ==============================================================================

-- 1. TASKS TABLE (Görevler)
-- Ana görev tanımları
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Görev bilgileri
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    
    -- Kategorizasyon
    category TEXT CHECK (category IN ('field_work', 'office_work', 'meeting', 'call', 'research', 'other')),
    tags TEXT[], -- ['yardim', 'gonullu', 'acil'] gibi etiketler
    
    -- Zamanlama
    due_date DATE NOT NULL, -- Haftalık görevler için son tarih
    start_date DATE DEFAULT CURRENT_DATE,
    completed_at TIMESTAMPTZ,
    
    -- Atama bilgileri
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index için
    CONSTRAINT valid_dates CHECK (due_date >= start_date)
);

-- 2. TASK ASSIGNMENTS TABLE (Görev Atamaları)
-- Hangi görev kime atandı, durumu nedir
CREATE TABLE IF NOT EXISTS task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Durum takibi
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'rejected')),
    
    -- Tamamlama bilgileri
    completed_at TIMESTAMPTZ,
    completion_notes TEXT, -- Çalışanın tamamlama notu
    
    -- Bildirim durumu
    notification_sent BOOLEAN DEFAULT false,
    notification_read_at TIMESTAMPTZ,
    
    -- Metadata
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Bir görev bir kullanıcıya sadece bir kez atanabilir
    CONSTRAINT unique_task_assignment UNIQUE (task_id, assigned_to)
);

-- 3. ACTIVITY LOGS TABLE (Aktivite Kayıtları)
-- Kullanıcıların uygulama içindeki tüm işlemleri
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Kullanıcı bilgileri
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT, -- Cache için (kullanıcı silinirse de bilgi kalsın)
    user_role TEXT, -- O anki rolü
    
    -- Aktivite detayları
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'view', 'login', 'logout', 'export', etc.
    entity_type TEXT NOT NULL, -- 'needy_person', 'donation', 'task', 'meeting', etc.
    entity_id UUID, -- İlgili kaydın ID'si (varsa)
    entity_name TEXT, -- Okunabilir isim (örn: "Ahmet Yılmaz")
    
    -- Detaylar
    description TEXT NOT NULL, -- "Yeni yardım kaydı oluşturdu: Ahmet Yılmaz"
    old_values JSONB, -- Değişiklik öncesi değerler (update için)
    new_values JSONB, -- Yeni değerler
    
    -- IP ve cihaz bilgileri (güvenlik için)
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index için
    CONSTRAINT valid_action CHECK (action IN (
        'create', 'update', 'delete', 'view', 'list', 
        'login', 'logout', 'export', 'import', 'assign', 
        'complete', 'approve', 'reject', 'cancel'
    ))
);

-- 4. WEEKLY TASK SUMMARY VIEW (Haftalık Özet - Opsiyonel performans için)
CREATE OR REPLACE VIEW weekly_task_summary AS
SELECT 
    organization_id,
    assigned_to,
    DATE_TRUNC('week', assigned_at) as week_start,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'overdue') as overdue_count,
    COUNT(*) as total_count
FROM task_assignments
GROUP BY organization_id, assigned_to, DATE_TRUNC('week', assigned_at);

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_user ON task_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_task_assignments_org ON task_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_status ON task_assignments(status);
CREATE INDEX IF NOT EXISTS idx_task_assignments_completed ON task_assignments(completed_at) WHERE completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activity_logs_org ON activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- 6. ENABLE RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES FOR TASKS
-- Kullanıcı sadece kendi organizasyonunun görevlerini görebilir
CREATE POLICY "View org tasks" ON tasks
    FOR SELECT TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Sadece admin ve owner görev oluşturabilir
CREATE POLICY "Admins can create tasks" ON tasks
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND is_active = true
        )
    );

-- Sadece admin ve owner görev güncelleyebilir
CREATE POLICY "Admins can update tasks" ON tasks
    FOR UPDATE TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND is_active = true
        )
    );

-- Sadece admin ve owner görev silebilir
CREATE POLICY "Admins can delete tasks" ON tasks
    FOR DELETE TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND is_active = true
        )
    );

-- 8. RLS POLICIES FOR TASK ASSIGNMENTS
-- Kullanıcı kendi atamalarını veya organizasyonundaki tüm atamaları görebilir
CREATE POLICY "View task assignments" ON task_assignments
    FOR SELECT TO authenticated
    USING (
        assigned_to = auth.uid() OR
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Sadece admin ve owner atama yapabilir
CREATE POLICY "Admins can assign tasks" ON task_assignments
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND is_active = true
        )
    );

-- Kullanıcı kendi atamasını güncelleyebilir (tamamlama)
-- Admin tüm atamaları güncelleyebilir
CREATE POLICY "Update task assignments" ON task_assignments
    FOR UPDATE TO authenticated
    USING (
        assigned_to = auth.uid() OR
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND is_active = true
        )
    );

-- Sadece admin ve owner atama silebilir
CREATE POLICY "Admins can delete assignments" ON task_assignments
    FOR DELETE TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND is_active = true
        )
    );

-- 9. RLS POLICIES FOR ACTIVITY LOGS
-- Sadece admin ve owner tüm aktiviteleri görebilir
-- Diğer kullanıcılar sadece kendi aktivitelerini görebilir
CREATE POLICY "View activity logs" ON activity_logs
    FOR SELECT TO authenticated
    USING (
        -- Admin ve owner tüm aktiviteleri görebilir
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND is_active = true
        )
        OR
        -- Diğer kullanıcılar sadece kendi aktivitelerini
        user_id = auth.uid()
    );

-- Sistem tüm aktiviteleri kaydedebilir
CREATE POLICY "System can insert logs" ON activity_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- 10. TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_task_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_updated_at();

CREATE TRIGGER task_assignments_updated_at
    BEFORE UPDATE ON task_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_task_updated_at();

-- 11. HELPER FUNCTIONS

-- Görev tamamlandığında bildirim oluştur
CREATE OR REPLACE FUNCTION notify_task_completed()
RETURNS TRIGGER AS $$
DECLARE
    v_task_title TEXT;
    v_completed_by_name TEXT;
    v_created_by UUID;
    v_org_id UUID;
BEGIN
    -- Sadece status completed olduğunda çalış
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Görev bilgilerini al
        SELECT t.title, t.created_by, t.organization_id
        INTO v_task_title, v_created_by, v_org_id
        FROM tasks t
        WHERE t.id = NEW.task_id;
        
        -- Tamamlayan kişinin adını al
        SELECT p.name INTO v_completed_by_name
        FROM profiles p
        WHERE p.id = NEW.assigned_to;
        
        -- Görevi oluşturana bildirim gönder
        PERFORM create_notification(
            v_created_by,
            'success',
            'Görev Tamamlandı',
            v_completed_by_name || ' "' || v_task_title || '" görevini tamamladı.',
            jsonb_build_object(
                'task_id', NEW.task_id,
                'assignment_id', NEW.id,
                'completed_by', NEW.assigned_to,
                'completed_at', NEW.completed_at
            ),
            '/dashboard/tasks'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER task_completed_notification
    AFTER UPDATE ON task_assignments
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_completed();

-- Yeni görev atandığında bildirim oluştur
CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER AS $$
DECLARE
    v_task_title TEXT;
    v_assigned_by_name TEXT;
BEGIN
    -- Görev bilgilerini al
    SELECT t.title INTO v_task_title
    FROM tasks t
    WHERE t.id = NEW.task_id;
    
    -- Atayan kişinin adını al
    SELECT p.name INTO v_assigned_by_name
    FROM profiles p
    WHERE p.id = NEW.assigned_by;
    
    -- Atanan kişiye bildirim gönder
    PERFORM create_notification(
        NEW.assigned_to,
        'info',
        'Yeni Görev',
        v_assigned_by_name || ' size yeni bir görev atadı: "' || v_task_title || '"',
        jsonb_build_object(
            'task_id', NEW.task_id,
            'assignment_id', NEW.id
        ),
        '/dashboard/my-tasks'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER task_assigned_notification
    AFTER INSERT ON task_assignments
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_assigned();

-- Aktivite log kaydetme fonksiyonu
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_entity_name TEXT,
    p_description TEXT,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_log_id UUID;
    v_user_name TEXT;
    v_user_role TEXT;
    v_org_id UUID;
BEGIN
    -- Kullanıcı bilgilerini al
    SELECT p.name, om.role, om.organization_id
    INTO v_user_name, v_user_role, v_org_id
    FROM profiles p
    LEFT JOIN organization_members om ON p.id = om.user_id AND om.is_active = true
    WHERE p.id = p_user_id;
    
    -- Log kaydet
    INSERT INTO activity_logs (
        organization_id,
        user_id,
        user_name,
        user_role,
        action,
        entity_type,
        entity_id,
        entity_name,
        description,
        old_values,
        new_values
    ) VALUES (
        v_org_id,
        p_user_id,
        v_user_name,
        v_user_role,
        p_action,
        p_entity_type,
        p_entity_id,
        p_entity_name,
        p_description,
        p_old_values,
        p_new_values
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- 12. COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE tasks IS 'Dernek başkanı tarafından oluşturulan görevler';
COMMENT ON TABLE task_assignments IS 'Görevlerin çalışanlara atamaları ve durum takibi';
COMMENT ON TABLE activity_logs IS 'Kullanıcıların uygulama içindeki tüm aktiviteleri (audit log)';
COMMENT ON FUNCTION log_activity IS 'Kullanıcı aktivitesini kaydetmek için kullanılır';
