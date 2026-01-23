-- Enable RLS on tables that have it disabled
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiary_family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_kind_aids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.needy_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.needy_income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.needy_tags ENABLE ROW LEVEL SECURITY;

-- Add basic read policies (Allow authenticated users to read)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'roles', 'role_permissions', 'permissions', 'user_permissions', 
            'role_audit_logs', 'referrals', 'hospitals', 'hospital_appointments', 
            'treatment_costs', 'treatment_outcomes', 'beneficiary_family_members', 
            'in_kind_aids', 'needy_diseases', 'needy_income_sources', 'needy_tags'
        )
    LOOP
        EXECUTE format('CREATE POLICY "Allow authenticated read on %I" ON public.%I FOR SELECT TO authenticated USING (true);', t, t);
    END LOOP;
END $$;
