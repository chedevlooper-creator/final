-- Performance Optimization: Database Indexes
-- These indexes will significantly improve query performance

-- Index for needy persons table
CREATE INDEX IF NOT EXISTS idx_needy_persons_search ON needy_persons(
  COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') || ' ' || COALESCE(national_id, '')
) gin (gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_needy_persons_status ON needy_persons(status);
CREATE INDEX IF NOT EXISTS idx_needy_persons_created_at ON needy_persons(created_at DESC);

-- Index for donations
CREATE INDEX IF NOT EXISTS idx_donations_date_amount ON donations(donation_date DESC, amount);
CREATE INDEX IF NOT EXISTS idx_donations_donor_info ON donations(
  COALESCE(donor_name, '') || ' ' || COALESCE(donor_phone, '')
) gin (gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_donations_status_type ON donations(status, donation_type);

-- Index for aids
CREATE INDEX IF NOT EXISTS idx_aids_date_status ON aids(aid_date DESC, status);
CREATE INDEX IF NOT EXISTS idx_aids_type ON aids(aid_type);
CREATE INDEX IF NOT EXISTS idx_aids_recipient ON aids(needy_person_id);

-- Index for volunteers
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_volunteers_name ON volunteers(
  COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')
) gin (gin_trgm_ops);

-- Index for orphans
CREATE INDEX IF NOT EXISTS idx_orphans_sponsor_status ON orphans(sponsor_id, status);
CREATE INDEX IF NOT EXISTS idx_orphans_dob ON orphans(date_of_birth);

-- Index for skills
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

-- Partial indexes for better performance (only index active records)
CREATE INDEX IF NOT EXISTS idx_needy_persons_active 
  ON needy_persons(created_at DESC) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_donations_approved 
  ON donations(donation_date DESC) 
  WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_aids_pending 
  ON aids(aid_date DESC) 
  WHERE status = 'pending';

-- Covering indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_donations_covering 
  ON donations(status, donation_date, amount, donor_name);

-- Enable pg_trgm extension for text search if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Comment on indexes for documentation
COMMENT ON INDEX idx_needy_persons_search IS 'Full-text search index for needy persons';
COMMENT ON INDEX idx_donations_date_amount IS 'Optimized index for donation reports';
COMMENT ON INDEX idx_needy_persons_active IS 'Partial index for active needy persons only';
