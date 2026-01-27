-- Add missing tables for messaging system
-- This migration creates:
-- 1. donors table
-- 2. email_messages table
-- 3. sms_messages table
-- 4. events table (calendar_events alternative)

-- ============================================================
-- 1. CREATE DONORS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  donor_type TEXT DEFAULT 'individual' CHECK (donor_type IN ('individual', 'corporate', 'foundation', 'other')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  total_donated NUMERIC DEFAULT 0,
  last_donation_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_donors_email ON public.donors(email);
CREATE INDEX IF NOT EXISTS idx_donors_phone ON public.donors(phone);
CREATE INDEX IF NOT EXISTS idx_donors_status ON public.donors(status);

-- Enable RLS
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view all donors" ON public.donors;
DROP POLICY IF EXISTS "Users can insert donors" ON public.donors;
DROP POLICY IF EXISTS "Users can update donors" ON public.donors;
DROP POLICY IF EXISTS "Users can delete donors" ON public.donors;

CREATE POLICY "Users can view all donors"
  ON public.donors FOR SELECT
  USING (true);

CREATE POLICY "Users can insert donors"
  ON public.donors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update donors"
  ON public.donors FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete donors"
  ON public.donors FOR DELETE
  USING (true);

-- Grant permissions
GRANT ALL ON public.donors TO authenticated;
GRANT SELECT ON public.donors TO anon;

COMMENT ON TABLE public.donors IS 'Stores donor information for messaging and tracking';


-- ============================================================
-- 2. CREATE EMAIL_MESSAGES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('needy', 'volunteer', 'donor', 'custom')),
  recipient_ids UUID[],
  recipient_emails TEXT[],
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMPTZ,
  failed_reason TEXT,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_email_messages_status ON public.email_messages(status);
CREATE INDEX IF NOT EXISTS idx_email_messages_recipient_type ON public.email_messages(recipient_type);
CREATE INDEX IF NOT EXISTS idx_email_messages_created_at ON public.email_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_email_messages_created_by ON public.email_messages(created_by);

-- Enable RLS
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view all email_messages" ON public.email_messages;
DROP POLICY IF EXISTS "Users can insert email_messages" ON public.email_messages;
DROP POLICY IF EXISTS "Users can update email_messages" ON public.email_messages;
DROP POLICY IF EXISTS "Users can delete email_messages" ON public.email_messages;

CREATE POLICY "Users can view all email_messages"
  ON public.email_messages FOR SELECT
  USING (true);

CREATE POLICY "Users can insert email_messages"
  ON public.email_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update email_messages"
  ON public.email_messages FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete email_messages"
  ON public.email_messages FOR DELETE
  USING (true);

-- Grant permissions
GRANT ALL ON public.email_messages TO authenticated;
GRANT SELECT ON public.email_messages TO anon;

COMMENT ON TABLE public.email_messages IS 'Stores email message logs and status';


-- ============================================================
-- 3. CREATE SMS_MESSAGES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('needy', 'volunteer', 'donor', 'custom')),
  recipient_ids UUID[],
  recipient_phones TEXT[],
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMPTZ,
  failed_reason TEXT,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  sms_provider TEXT DEFAULT 'twilio',
  cost NUMERIC DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_sms_messages_status ON public.sms_messages(status);
CREATE INDEX IF NOT EXISTS idx_sms_messages_recipient_type ON public.sms_messages(recipient_type);
CREATE INDEX IF NOT EXISTS idx_sms_messages_created_at ON public.sms_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_sms_messages_created_by ON public.sms_messages(created_by);

-- Enable RLS
ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view all sms_messages" ON public.sms_messages;
DROP POLICY IF EXISTS "Users can insert sms_messages" ON public.sms_messages;
DROP POLICY IF EXISTS "Users can update sms_messages" ON public.sms_messages;
DROP POLICY IF EXISTS "Users can delete sms_messages" ON public.sms_messages;

CREATE POLICY "Users can view all sms_messages"
  ON public.sms_messages FOR SELECT
  USING (true);

CREATE POLICY "Users can insert sms_messages"
  ON public.sms_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update sms_messages"
  ON public.sms_messages FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete sms_messages"
  ON public.sms_messages FOR DELETE
  USING (true);

-- Grant permissions
GRANT ALL ON public.sms_messages TO authenticated;
GRANT SELECT ON public.sms_messages TO anon;

COMMENT ON TABLE public.sms_messages IS 'Stores SMS message logs and status';


-- ============================================================
-- 4. CREATE EVENTS TABLE (if calendar_events doesn't exist)
-- ============================================================

-- Check if calendar_events exists, if not create events
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'calendar_events') THEN
    -- Create events table
    CREATE TABLE IF NOT EXISTS public.events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      event_type TEXT DEFAULT 'general' CHECK (event_type IN ('general', 'meeting', 'distribution', 'visit', 'appointment', 'holiday', 'other')),
      start_date TIMESTAMPTZ NOT NULL,
      end_date TIMESTAMPTZ,
      location TEXT,
      all_day BOOLEAN DEFAULT false,
      reminder_enabled BOOLEAN DEFAULT false,
      reminder_minutes INTEGER DEFAULT 30,
      status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
      participants UUID[],
      related_entity_type TEXT,
      related_entity_id UUID,
      color TEXT DEFAULT '#3B82F6',
      notes TEXT,
      created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Add indexes
    CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
    CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
    CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
    CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

    -- Enable RLS
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    CREATE POLICY "Users can view all events"
      ON public.events FOR SELECT
      USING (true);

    CREATE POLICY "Users can insert events"
      ON public.events FOR INSERT
      WITH CHECK (true);

    CREATE POLICY "Users can update events"
      ON public.events FOR UPDATE
      USING (true);

    CREATE POLICY "Users can delete events"
      ON public.events FOR DELETE
      USING (true);

    -- Grant permissions
    GRANT ALL ON public.events TO authenticated;
    GRANT SELECT ON public.events TO anon;

    COMMENT ON TABLE public.events IS 'Stores calendar events and appointments';
  END IF;
END $$;


-- ============================================================
-- 5. CREATE CALENDAR_EVENTS TABLE (standardized name)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'general' CHECK (event_type IN ('general', 'meeting', 'distribution', 'visit', 'appointment', 'holiday', 'other')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  all_day BOOLEAN DEFAULT false,
  reminder_enabled BOOLEAN DEFAULT false,
  reminder_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  participants UUID[],
  related_entity_type TEXT,
  related_entity_id UUID,
  color TEXT DEFAULT '#3B82F6',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON public.calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON public.calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON public.calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON public.calendar_events(created_by);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view all calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can insert calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete calendar_events" ON public.calendar_events;

CREATE POLICY "Users can view all calendar_events"
  ON public.calendar_events FOR SELECT
  USING (true);

CREATE POLICY "Users can insert calendar_events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update calendar_events"
  ON public.calendar_events FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete calendar_events"
  ON public.calendar_events FOR DELETE
  USING (true);

-- Grant permissions
GRANT ALL ON public.calendar_events TO authenticated;
GRANT SELECT ON public.calendar_events TO anon;

COMMENT ON TABLE public.calendar_events IS 'Stores calendar events and appointments';


-- ============================================================
-- 6. CREATE AIDS TABLE/VIEW (for backward compatibility)
-- ============================================================

-- Create a view that combines distributions and needy_aids_received
CREATE OR REPLACE VIEW public.aids AS
SELECT
  d.id,
  d.recipient_id AS needy_person_id,
  d.distribution_type AS aid_type,
  d.status,
  d.delivery_date AS aid_date,
  d.total_value AS amount,
  d.items,
  d.delivery_notes AS notes,
  d.created_at,
  d.updated_at,
  'distribution' AS source_table
FROM public.distributions d
WHERE d.status IN ('delivered', 'confirmed')

UNION ALL

SELECT
  nar.id,
  nar.needy_person_id,
  nar.aid_type,
  nar.delivery_status AS status,
  nar.delivery_date AS aid_date,
  nar.amount,
  NULL AS items,
  nar.notes,
  nar.created_at,
  nar.updated_at,
  'needy_aids_received' AS source_table
FROM public.needy_aids_received nar
WHERE nar.delivery_status IN ('delivered', 'pending');

-- Grant permissions on view
GRANT SELECT ON public.aids TO authenticated, anon;

COMMENT ON VIEW public.aids IS 'Unified view of distributed aids from distributions and needy_aids_received';


-- ============================================================
-- 7. CREATE APPLICATIONS VIEW (for backward compatibility)
-- ============================================================

-- Create a view that aliases aid_applications as applications
CREATE OR REPLACE VIEW public.applications AS
SELECT * FROM public.aid_applications;

-- Grant permissions on view
GRANT SELECT ON public.applications TO authenticated, anon;

COMMENT ON VIEW public.applications IS 'Backward compatibility view - aliases aid_applications table';


-- ============================================================
-- 8. UPDATE EXISTING TABLES
-- ============================================================

-- Update trigger for donors
CREATE OR REPLACE FUNCTION update_donors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_donors_updated_at ON public.donors;
CREATE TRIGGER set_donors_updated_at
  BEFORE UPDATE ON public.donors
  FOR EACH ROW
  EXECUTE FUNCTION update_donors_updated_at();

-- Update trigger for email_messages
DROP TRIGGER IF EXISTS set_email_messages_updated_at ON public.email_messages;
CREATE TRIGGER set_email_messages_updated_at
  BEFORE UPDATE ON public.email_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_donors_updated_at();

-- Update trigger for sms_messages
DROP TRIGGER IF EXISTS set_sms_messages_updated_at ON public.sms_messages;
CREATE TRIGGER set_sms_messages_updated_at
  BEFORE UPDATE ON public.sms_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_donors_updated_at();

-- Update trigger for calendar_events
DROP TRIGGER IF EXISTS set_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER set_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_donors_updated_at();
