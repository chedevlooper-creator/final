-- Add performance indexes for foreign keys and common search columns

-- Enable pg_trgm for text search if not enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Indexes for needy_persons
CREATE INDEX IF NOT EXISTS idx_needy_persons_category_id ON needy_persons(category_id);
CREATE INDEX IF NOT EXISTS idx_needy_persons_country_id ON needy_persons(country_id);
CREATE INDEX IF NOT EXISTS idx_needy_persons_city_id ON needy_persons(city_id);
CREATE INDEX IF NOT EXISTS idx_needy_persons_district_id ON needy_persons(district_id);
CREATE INDEX IF NOT EXISTS idx_needy_persons_first_name_trgm ON needy_persons USING gin (first_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_needy_persons_last_name_trgm ON needy_persons USING gin (last_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_needy_persons_identity_number ON needy_persons(identity_number);

-- Indexes for aid_applications
CREATE INDEX IF NOT EXISTS idx_aid_applications_needy_id ON aid_applications(needy_id);
CREATE INDEX IF NOT EXISTS idx_aid_applications_status ON aid_applications(status);
CREATE INDEX IF NOT EXISTS idx_aid_applications_created_at ON aid_applications(created_at DESC);

-- Indexes for donations
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_category_id ON donations(category_id);
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(date DESC);

-- Indexes for orphans
CREATE INDEX IF NOT EXISTS idx_orphans_needy_id ON orphans(needy_id);
CREATE INDEX IF NOT EXISTS idx_orphans_status ON orphans(status);

-- Indexes for beneficiaries
CREATE INDEX IF NOT EXISTS idx_beneficiaries_needy_id ON beneficiaries(needy_id);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_needy_id ON payments(needy_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date DESC);
