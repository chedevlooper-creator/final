-- Security fixes for functions and views based on advisor findings

-- 1. Fix Security Definer View
DROP VIEW IF EXISTS public.needy_card_summary;
CREATE VIEW public.needy_card_summary WITH (security_invoker = true) AS
SELECT np.id,
    np.file_number,
    np.first_name,
    np.last_name,
    np.identity_number,
    np.phone,
    np.status,
    np.is_active,
    np.created_at,
    c.name AS category_name,
    p.name AS partner_name,
    co.name AS country_name,
    ci.name AS city_name,
    ( SELECT count(*) AS count
           FROM needy_dependents nd
          WHERE nd.needy_person_id = np.id) AS dependent_count,
    ( SELECT count(*) AS count
           FROM needy_aids_received nar
          WHERE nar.needy_person_id = np.id) AS aids_received_count,
    ( SELECT max(nar.aid_date) AS max
           FROM needy_aids_received nar
          WHERE nar.needy_person_id = np.id) AS last_aid_date
   FROM needy_persons np
     LEFT JOIN categories c ON np.category_id = c.id
     LEFT JOIN partners p ON np.partner_id = p.id
     LEFT JOIN countries co ON np.country_id = co.id
     LEFT JOIN cities ci ON np.city_id = ci.id;

-- 2. Fix Function Search Path Mutable
ALTER FUNCTION public.get_dashboard_stats() SET search_path = public;
ALTER FUNCTION public.get_donation_source_distribution() SET search_path = public;
ALTER FUNCTION public.get_donation_trends(text) SET search_path = public;
ALTER FUNCTION public.get_top_donors(integer) SET search_path = public;
ALTER FUNCTION public.get_user_hierarchy_level(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_role() SET search_path = public;
ALTER FUNCTION public.get_user_role(uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;
ALTER FUNCTION public.is_admin_or_moderator(uuid) SET search_path = public;
ALTER FUNCTION public.is_moderator_or_above() SET search_path = public;
ALTER FUNCTION public.is_muhasebe_or_above() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.user_has_permission(uuid, varchar) SET search_path = public;
