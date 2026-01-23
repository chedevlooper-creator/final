-- Optimized PostgreSQL Functions for Dashboard Stats
-- These functions run on the database server for much better performance

-- Function: calculate_donation_stats
-- Returns aggregated donation statistics in a single query
CREATE OR REPLACE FUNCTION calculate_donation_stats(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(
  today BIGINT,
  this_month BIGINT,
  all_time BIGINT,
  count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_today TIMESTAMP WITH TIME ZONE := DATE_TRUNC('day', CURRENT_TIMESTAMP);
  v_month_start TIMESTAMP WITH TIME ZONE := DATE_TRUNC('month', CURRENT_TIMESTAMP);
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN d.donation_date >= v_today THEN d.amount ELSE 0 END), 0) as today,
    COALESCE(SUM(CASE WHEN d.donation_date >= v_month_start THEN d.amount ELSE 0 END), 0) as this_month,
    COALESCE(SUM(d.amount), 0) as all_time,
    COUNT(*) as count
  FROM donations d
  WHERE d.payment_status = 'approved'
    AND (p_start_date IS NULL OR d.donation_date >= p_start_date)
    AND (p_end_date IS NULL OR d.donation_date <= p_end_date);
END;
$$;

-- Function: search_needy_persons
-- Full-text search with Turkish character support
CREATE OR REPLACE FUNCTION search_needy_persons(
  p_search_text TEXT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  identity_number TEXT,
  status TEXT,
  city_name TEXT,
  category_name TEXT,
  rank REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    np.id,
    np.first_name,
    np.last_name,
    CONCAT(np.first_name, ' ', np.last_name) as full_name,
    np.identity_number,
    np.status,
    c.name as city_name,
    cat.name as category_name,
    -- Similarity ranking
    COALESCE(
      SIMILARITY(CONCAT(np.first_name, ' ', np.last_name), p_search_text) +
      SIMILARITY(np.identity_number::TEXT, p_search_text),
      0
    ) as rank
  FROM needy_persons np
  LEFT JOIN cities c ON np.city_id = c.id
  LEFT JOIN categories cat ON np.category_id = cat.id
  WHERE
    -- Fast full-text search using pg_trgm
    CONCAT(np.first_name, ' ', np.last_name) % p_search_text
    OR np.identity_number::TEXT % p_search_text
  ORDER BY rank DESC, np.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function: get_dashboard_summary
-- Single query for all dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS TABLE(
  total_donations BIGINT,
  total_aids BIGINT,
  active_needy INT,
  active_volunteers INT,
  pending_applications INT,
  this_month_donations BIGINT,
  today_donations BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_month_start TIMESTAMP WITH TIME ZONE := DATE_TRUNC('month', CURRENT_TIMESTAMP);
  v_today TIMESTAMP WITH TIME ZONE := DATE_TRUNC('day', CURRENT_TIMESTAMP);
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE payment_status = 'approved') as total_donations,
    (SELECT COALESCE(SUM(amount), 0) FROM aids WHERE status = 'distributed') as total_aids,
    (SELECT COUNT(*) FROM needy_persons WHERE status = 'active') as active_needy,
    (SELECT COUNT(*) FROM volunteers WHERE status = 'active') as active_volunteers,
    (SELECT COUNT(*) FROM applications WHERE status = 'pending') as pending_applications,
    (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE payment_status = 'approved' AND donation_date >= v_month_start) as this_month_donations,
    (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE payment_status = 'approved' AND donation_date >= v_today) as today_donations;
END;
$$;

-- Function: get_recent_activities
-- Get recent activities across all tables
CREATE OR REPLACE FUNCTION get_recent_activities(
  p_limit INT DEFAULT 10
)
RETURNS TABLE(
  id TEXT,
  type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Recent donations
  RETURN QUERY
  SELECT
    d.id::TEXT,
    'donation' as type,
    CONCAT('Bağış: ', d.donor_name, ' - ', d.amount, ' TL') as description,
    d.created_at
  FROM donations d
  WHERE d.payment_status = 'approved'
  ORDER BY d.created_at DESC
  LIMIT p_limit;
  
  -- Recent aids (union with donations would be better, but this is simpler)
  RETURN QUERY
  SELECT
    a.id::TEXT,
    'aid' as type,
    CONCAT('Yardım: ', a.aid_type, ' - ', np.first_name, ' ', np.last_name) as description,
    a.created_at
  FROM aids a
  JOIN needy_persons np ON a.needy_person_id = np.id
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_donation_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_needy_persons TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_summary TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_recent_activities TO anon, authenticated;

-- Add comments
COMMENT ON FUNCTION calculate_donation_stats IS 'Optimized donation statistics with single query';
COMMENT ON FUNCTION search_needy_persons IS 'Full-text search with pg_trgm and ranking';
COMMENT ON FUNCTION get_dashboard_summary IS 'Dashboard summary with all key metrics';
COMMENT ON FUNCTION get_recent_activities IS 'Recent activities from all tables';
