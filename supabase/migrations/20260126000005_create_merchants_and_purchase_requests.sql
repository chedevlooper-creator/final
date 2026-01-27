-- Create merchants and purchase_requests tables, and fix users/RLS issues

-- ============================================================
-- 1. Ensure users relation has full_name and safe RLS policies
-- ============================================================
DO $$
DECLARE
  has_users_table boolean;
  has_users_view boolean;
  has_name boolean;
  has_first_name boolean;
  has_last_name boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users' AND table_type = 'BASE TABLE'
  ) INTO has_users_table;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public' AND table_name = 'users'
  ) INTO has_users_view;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name'
  ) INTO has_name;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'first_name'
  ) INTO has_first_name;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_name'
  ) INTO has_last_name;

  IF has_users_table THEN
    -- Add full_name column if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name'
    ) THEN
      EXECUTE 'ALTER TABLE public.users ADD COLUMN full_name TEXT';
    END IF;

    -- Backfill full_name using available columns
    IF has_name THEN
      EXECUTE 'UPDATE public.users SET full_name = COALESCE(full_name, name) WHERE full_name IS NULL';
    ELSIF has_first_name OR has_last_name THEN
      EXECUTE 'UPDATE public.users SET full_name = COALESCE(full_name, trim(concat_ws('' '', first_name, last_name))) WHERE full_name IS NULL';
    ELSE
      EXECUTE 'UPDATE public.users SET full_name = COALESCE(full_name, email) WHERE full_name IS NULL';
    END IF;

    -- Ensure RLS enabled
    EXECUTE 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY';

    -- Drop potentially recursive or invalid policies
    EXECUTE 'DROP POLICY IF EXISTS "Users can view all users" ON public.users';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view users" ON public.users';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profile" ON public.users';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own account" ON public.users';
    EXECUTE 'DROP POLICY IF EXISTS "Service role can manage users" ON public.users';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage users" ON public.users';

    -- Safe policies (no self-referencing joins)
    EXECUTE 'CREATE POLICY "Users can view users" ON public.users FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Admins can manage users" ON public.users FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = ''admin'')) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = ''admin''))';
  ELSIF has_users_view THEN
    -- Ensure users view has full_name
    EXECUTE '
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
      FROM public.profiles
    ';
  ELSE
    -- Create users view for backward compatibility
    EXECUTE '
      CREATE VIEW public.users AS
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
      FROM public.profiles
    ';
  END IF;
END $$;

-- ============================================================
-- 2. Create merchants table (if missing)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tax_number TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchants_status ON public.merchants(status);
CREATE INDEX IF NOT EXISTS idx_merchants_name ON public.merchants(name);

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.merchants;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.merchants;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.merchants;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.merchants;

CREATE POLICY "Allow authenticated read" ON public.merchants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.merchants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.merchants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete" ON public.merchants FOR DELETE TO authenticated USING (true);

GRANT ALL ON public.merchants TO authenticated;

-- ============================================================
-- 3. Create purchase_requests table (missing)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT,
  title TEXT NOT NULL DEFAULT '',
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
  requested_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TRY',
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  required_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'ordered', 'delivered', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  item_description TEXT,
  quantity NUMERIC,
  estimated_cost NUMERIC,
  approved_amount NUMERIC,
  approval_date DATE,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON public.purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_requested_date ON public.purchase_requests(requested_date);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_merchant_id ON public.purchase_requests(merchant_id);

ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.purchase_requests;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.purchase_requests;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.purchase_requests;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.purchase_requests;

CREATE POLICY "Allow authenticated read" ON public.purchase_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.purchase_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.purchase_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete" ON public.purchase_requests FOR DELETE TO authenticated USING (true);

GRANT ALL ON public.purchase_requests TO authenticated;

-- ============================================================
-- 4. Fix RLS policies blocking inserts for core tables
-- ============================================================
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['needy_persons','volunteers','donations','aid_applications','finance_transactions','notifications']
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated read" ON public.%I', t);
      EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated insert" ON public.%I', t);
      EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated update" ON public.%I', t);
      EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated delete" ON public.%I', t);

      EXECUTE format('CREATE POLICY "Allow authenticated read" ON public.%I FOR SELECT TO authenticated USING (true)', t);
      EXECUTE format('CREATE POLICY "Allow authenticated insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (true)', t);
      EXECUTE format('CREATE POLICY "Allow authenticated update" ON public.%I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', t);
      EXECUTE format('CREATE POLICY "Allow authenticated delete" ON public.%I FOR DELETE TO authenticated USING (true)', t);
    END IF;
  END LOOP;
END $$;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.needy_persons TO authenticated;
GRANT ALL ON public.volunteers TO authenticated;
GRANT ALL ON public.donations TO authenticated;
GRANT ALL ON public.aid_applications TO authenticated;
GRANT ALL ON public.finance_transactions TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
