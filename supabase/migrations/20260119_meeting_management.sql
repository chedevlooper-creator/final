-- ============================================================================
-- Toplantı Yönetim Sistemi - Meeting Management System
-- ============================================================================
-- Bu migrasyon toplantı yönetim sistemi için gerekli tüm tabloları oluşturur
-- This migration creates all tables needed for the meeting management system
-- ============================================================================

-- ============================================================================
-- TABLOLAR / TABLES
-- ============================================================================

-- Toplantılar tablosu / Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Toplantı katılımcıları tablosu / Meeting participants table
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'confirmed', 'declined', 'attended')),
  availability_confirmed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- Görevler tablosu / Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Görev yorumları tablosu / Task comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Toplantı dosyaları tablosu / Meeting files table
CREATE TABLE IF NOT EXISTS meeting_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXLER / INDEXES
-- ============================================================================

-- Meetings indexes
CREATE INDEX IF NOT EXISTS idx_meetings_date_status ON meetings(meeting_date, status);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status) WHERE status != 'cancelled';

-- Meeting participants indexes
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON meeting_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_status ON meeting_participants(status);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_meeting_id ON tasks(meeting_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;

-- Task comments indexes
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at DESC);

-- Meeting files indexes
CREATE INDEX IF NOT EXISTS idx_meeting_files_meeting_id ON meeting_files(meeting_id);

-- ============================================================================
-- RLS (ROW LEVEL SECURITY) POLITIKALARI / POLICIES
-- ============================================================================

-- Meetings RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view meetings"
ON meetings FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create meetings"
ON meetings FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Meeting creator can update meetings"
ON meetings FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Meeting creator can delete meetings"
ON meetings FOR DELETE
USING (auth.uid() = created_by);

-- Meeting participants RLS
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view meeting participants"
ON meeting_participants FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage their own participation"
ON meeting_participants FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Meeting creator can manage participants"
ON meeting_participants FOR ALL
USING (
  auth.uid() IN (
    SELECT created_by FROM meetings WHERE id = meeting_participants.meeting_id
  )
);

-- Tasks RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view tasks"
ON tasks FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Meeting creator can create tasks"
ON tasks FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT created_by FROM meetings WHERE id = tasks.meeting_id
  )
);

CREATE POLICY "Task assignee can update their own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = assigned_to);

CREATE POLICY "Meeting creator can update any task"
ON tasks FOR UPDATE
USING (
  auth.uid() IN (
    SELECT created_by FROM meetings WHERE id = tasks.meeting_id
  )
);

-- Task comments RLS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view task comments"
ON task_comments FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create task comments"
ON task_comments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Comment author can update their own comments"
ON task_comments FOR UPDATE
USING (auth.uid() = user_id);

-- Meeting files RLS
ALTER TABLE meeting_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view meeting files"
ON meeting_files FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload files"
ON meeting_files FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "File uploader can delete their own files"
ON meeting_files FOR DELETE
USING (auth.uid() = uploaded_by);

-- ============================================================================
-- POSTGRESQL FONKSİYONLARI / FUNCTIONS
-- ============================================================================

-- Toplantı güncelleme zamanını otomatik güncelle / Auto-update meeting timestamp
CREATE OR REPLACE FUNCTION update_meeting_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_meeting_updated_at
BEFORE UPDATE ON meetings
FOR EACH ROW
EXECUTE FUNCTION update_meeting_updated_at();

-- Katılımcı güncelleme zamanını otomatik güncelle / Auto-update participant timestamp
CREATE OR REPLACE FUNCTION update_participant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_participant_updated_at
BEFORE UPDATE ON meeting_participants
FOR EACH ROW
EXECUTE FUNCTION update_participant_updated_at();

-- Toplantı istatistikleri getir / Get meeting statistics
CREATE OR REPLACE FUNCTION get_meeting_stats(p_meeting_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_participants', COUNT(DISTINCT mp.user_id),
    'confirmed_participants', COUNT(DISTINCT mp.user_id) FILTER (WHERE mp.status = 'confirmed'),
    'attended_participants', COUNT(DISTINCT mp.user_id) FILTER (WHERE mp.status = 'attended'),
    'total_tasks', COUNT(t.id),
    'completed_tasks', COUNT(t.id) FILTER (WHERE t.status = 'completed'),
    'pending_tasks', COUNT(t.id) FILTER (WHERE t.status = 'pending'),
    'high_priority_tasks', COUNT(t.id) FILTER (WHERE t.priority IN ('high', 'urgent'))
  ) INTO v_stats
  FROM meetings m
  LEFT JOIN meeting_participants mp ON mp.meeting_id = m.id
  LEFT JOIN tasks t ON t.meeting_id = m.id
  WHERE m.id = p_meeting_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının açık toplantılarını getir / Get user's available meetings
CREATE OR REPLACE FUNCTION get_available_meetings(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  location TEXT,
  is_confirmed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.meeting_date,
    m.status,
    m.location,
    COALESCE(mp.availability_confirmed, FALSE)
  FROM meetings m
  INNER JOIN meeting_participants mp ON mp.meeting_id = m.id AND mp.user_id = p_user_id
  WHERE m.meeting_date >= NOW() - INTERVAL '2 hours'
    AND m.meeting_date <= NOW() + INTERVAL '24 hours'
    AND m.status NOT IN ('completed', 'cancelled')
  ORDER BY m.meeting_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FULL-TEXT SEARCH / TAM METİN ARAMA
-- ============================================================================

-- Full-text search için trigger ve function
CREATE OR REPLACE FUNCTION meetings_search_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('turkish', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('turkish', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('turkish', coalesce(NEW.location, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvector_update_meetings
BEFORE INSERT OR UPDATE ON meetings
FOR EACH ROW
EXECUTE FUNCTION meetings_search_trigger();

CREATE INDEX idx_meetings_search ON meetings USING GIN(search_vector);

-- ============================================================================
-- REAL-TIME SUPPORT / GERÇEK ZAMANLI DESTEK
-- ============================================================================

-- Realtime için publication
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- ============================================================================
-- COMMENTLER / COMMENTS
-- ============================================================================

COMMENT ON TABLE meetings IS 'Toplantılar tablosu / Meetings table';
COMMENT ON TABLE meeting_participants IS 'Toplantı katılımcıları tablosu / Meeting participants table';
COMMENT ON TABLE tasks IS 'Görevler tablosu / Tasks table';
COMMENT ON TABLE task_comments IS 'Görev yorumları tablosu / Task comments table';
COMMENT ON TABLE meeting_files IS 'Toplantı dosyaları tablosu / Meeting files table';

COMMENT ON FUNCTION get_meeting_stats(UUID) IS 'Toplantı istatistiklerini hesaplar / Calculate meeting statistics';
COMMENT ON FUNCTION get_available_meetings(UUID) IS 'Kullanıcının açık toplantılarını getirir / Get user''s available meetings';
