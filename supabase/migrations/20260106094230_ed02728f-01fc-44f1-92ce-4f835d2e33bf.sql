
-- Drop and recreate the view with SECURITY INVOKER explicitly
-- This ensures the view respects the underlying table's RLS policies
DROP VIEW IF EXISTS public.account_applications_masked;

-- Recreate as SECURITY INVOKER view (explicitly stated for clarity)
-- The view will respect RLS on the underlying account_applications table
CREATE VIEW public.account_applications_masked
WITH (security_invoker = true)
AS SELECT 
    id,
    user_id,
    application_id,
    full_name,
    account_type,
    status,
    CASE WHEN bvn IS NOT NULL THEN '***' || RIGHT(bvn, 4) ELSE NULL END AS bvn,
    CASE WHEN nin IS NOT NULL THEN '***' || RIGHT(nin, 4) ELSE NULL END AS nin,
    CASE WHEN phone_number IS NOT NULL THEN '***' || RIGHT(phone_number, 4) ELSE NULL END AS phone_number,
    CASE WHEN address IS NOT NULL THEN LEFT(address, 20) || '...' ELSE NULL END AS address,
    NULL::text AS nin_document_url,
    NULL::text AS passport_photo_url,
    NULL::text AS signature_url,
    CASE WHEN referee1_name IS NOT NULL THEN LEFT(referee1_name, 10) || '...' ELSE NULL END AS referee1_name,
    '***'::text AS referee1_phone,
    NULL::text AS referee1_address,
    CASE WHEN referee2_name IS NOT NULL THEN LEFT(referee2_name, 10) || '...' ELSE NULL END AS referee2_name,
    '***'::text AS referee2_phone,
    NULL::text AS referee2_address,
    notes,
    created_at,
    updated_at
FROM account_applications;

-- Grant access to authenticated users only (not public/anon)
REVOKE ALL ON public.account_applications_masked FROM anon;
REVOKE ALL ON public.account_applications_masked FROM public;
GRANT SELECT ON public.account_applications_masked TO authenticated;

-- Add a comment explaining the security model
COMMENT ON VIEW public.account_applications_masked IS 
'Masked view of account applications with sensitive data redacted. 
Uses SECURITY INVOKER so RLS policies on account_applications are enforced. 
Only authenticated users with appropriate RLS permissions can access data.';
