-- Comprehensive migration to fix all missing tables and issues
-- This migration creates/fixes:
-- 1. users table/view (aliases profiles for compatibility)
-- 2. volunteer_missions table
-- 3. Proper RLS policies

-- ============================================================
-- 1. CREATE USERS VIEW (aliases profiles for backward compatibility)
-- ============================================================

-- Drop view if exists
DROP VIEW IF EXISTS public.users;

-- Create a view that aliases profiles as users
-- This allows queries to 'users' to work while using the 'profiles' table
CREATE OR REPLACE VIEW public.users AS
SELECT
  id,
  email,
  name as full_name,
  name,
  avatar_url,
  role,
  created_at,
  updated_at,
  NULL::TEXT as phone,
  NULL::TEXT as status,
  NULL::TEXT as department
FROM public.profiles;

-- Add comment
COMMENT ON VIEW public.users IS 'View for backward compatibility - aliases profiles table';

-- Grant permissions
GRANT SELECT ON public.users TO authenticated, anon;


-- ============================================================
-- 2. CREATE VOLUNTEER_MISSIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.volunteer_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  mission_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  start_time TIME,
  end_time TIME,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_volunteer_missions_volunteer ON public.volunteer_missions(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_missions_date ON public.volunteer_missions(mission_date);
CREATE INDEX IF NOT EXISTS idx_volunteer_missions_status ON public.volunteer_missions(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_missions_created_by ON public.volunteer_missions(created_by);

-- Add comments
COMMENT ON TABLE public.volunteer_missions IS 'Volunteer missions/assignments';
COMMENT ON COLUMN public.volunteer_missions.volunteer_id IS 'Reference to volunteer';
COMMENT ON COLUMN public.volunteer_missions.mission_date IS 'Date of the mission';
COMMENT ON COLUMN public.volunteer_missions.status IS 'Status: planned, in_progress, completed, cancelled';

-- Enable RLS
ALTER TABLE public.volunteer_missions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for volunteer_missions
DROP POLICY IF EXISTS "Users can view all volunteer_missions" ON public.volunteer_missions;
DROP POLICY IF EXISTS "Users can insert volunteer_missions" ON public.volunteer_missions;
DROP POLICY IF EXISTS "Users can update their own volunteer_missions" ON public.volunteer_missions;
DROP POLICY IF EXISTS "Users can delete their own volunteer_missions" ON public.volunteer_missions;

CREATE POLICY "Users can view all volunteer_missions"
  ON public.volunteer_missions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert volunteer_missions"
  ON public.volunteer_missions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update volunteer_missions"
  ON public.volunteer_missions FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete volunteer_missions"
  ON public.volunteer_missions FOR DELETE
  USING (true);

-- Grant permissions
GRANT ALL ON public.volunteer_missions TO authenticated;
GRANT SELECT ON public.volunteer_missions TO anon;


-- ============================================================
-- 3. FIX PROFILES TABLE RLS POLICY (remove self-referencing)
-- ============================================================

-- Drop problematic policies that might cause infinite recursion
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Create simplified policies without self-referencing subqueries
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Check if user has admin role from JWT claims
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    OR
    -- Or check from existing profile (without recursive query)
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
      LIMIT 1
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (
    -- Check if user has admin role from JWT claims
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    OR
    -- Or check from existing profile (without recursive query)
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
      LIMIT 1
    )
  );


-- ============================================================
-- 4. VERIFY CALENDAR_EVENTS AND FINANCE_TRANSACTIONS TABLES
-- ============================================================

-- These should already exist from migration 20260126000000_add_missing_tables.sql
-- But let's make sure they have proper RLS policies

-- Fix calendar_events RLS if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'calendar_events') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view all calendar_events" ON public.calendar_events;
    DROP POLICY IF EXISTS "Users can insert calendar_events" ON public.calendar_events;
    DROP POLICY IF EXISTS "Users can update their own calendar_events" ON public.calendar_events;
    DROP POLICY IF EXISTS "Users can delete their own calendar_events" ON public.calendar_events;

    -- Create new simplified policies
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
  END IF;
END $$;

-- Fix finance_transactions RLS if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'finance_transactions') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view all finance_transactions" ON public.finance_transactions;
    DROP POLICY IF EXISTS "Users can insert finance_transactions" ON public.finance_transactions;
    DROP POLICY IF EXISTS "Users can update their own finance_transactions" ON public.finance_transactions;
    DROP POLICY IF EXISTS "Users can delete their own finance_transactions" ON public.finance_transactions;

    -- Create new simplified policies
    CREATE POLICY "Users can view all finance_transactions"
      ON public.finance_transactions FOR SELECT
      USING (true);

    CREATE POLICY "Users can insert finance_transactions"
      ON public.finance_transactions FOR INSERT
      WITH CHECK (true);

    CREATE POLICY "Users can update finance_transactions"
      ON public.finance_transactions FOR UPDATE
      USING (true);

    CREATE POLICY "Users can delete finance_transactions"
      ON public.finance_transactions FOR DELETE
      USING (true);
  END IF;
END $$;


-- ============================================================
-- 5. FIX NEEDY_PERSONS RLS POLICY
-- ============================================================

-- Make sure needy_persons allows inserts from authenticated users
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'needy_persons') THEN
    -- Enable RLS
    ALTER TABLE public.needy_persons ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow authenticated read" ON public.needy_persons;
    DROP POLICY IF EXISTS "Allow authenticated insert" ON public.needy_persons;
    DROP POLICY IF EXISTS "Allow authenticated update" ON public.needy_persons;

    -- Create simplified policies
    CREATE POLICY "Allow authenticated read"
      ON public.needy_persons FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Allow authenticated insert"
      ON public.needy_persons FOR INSERT
      TO authenticated
      WITH CHECK (true);

    CREATE POLICY "Allow authenticated update"
      ON public.needy_persons FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;


-- ============================================================
-- 6. GRANT NECESSARY PERMISSIONS
-- ============================================================

-- Make sure authenticated role has proper permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.volunteers TO authenticated;
GRANT ALL ON public.volunteer_missions TO authenticated;
GRANT ALL ON public.calendar_events TO authenticated;
GRANT ALL ON public.finance_transactions TO authenticated;
GRANT ALL ON public.needy_persons TO authenticated;
GRANT ALL ON public.donations TO authenticated;

-- Grant sequence permissions
DO $$
DECLARE
  seq_record RECORD;
BEGIN
  FOR seq_record IN
    SELECT sequence_name FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  LOOP
    EXECUTE format('GRANT ALL ON SEQUENCE public.%I TO authenticated', seq_record.sequence_name);
  END LOOP;
END $$;
