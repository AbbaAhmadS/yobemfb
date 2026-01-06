-- Create a masked view for operations role that hides sensitive PII
-- This view masks BVN, NIN, and excludes sensitive document URLs

CREATE OR REPLACE VIEW public.account_applications_masked AS
SELECT 
  id,
  user_id,
  application_id,
  full_name,
  account_type,
  status,
  CASE 
    WHEN bvn IS NOT NULL THEN '***' || RIGHT(bvn, 4)
    ELSE NULL 
  END AS bvn,
  CASE 
    WHEN nin IS NOT NULL THEN '***' || RIGHT(nin, 4)
    ELSE NULL 
  END AS nin,
  CASE 
    WHEN phone_number IS NOT NULL THEN '***' || RIGHT(phone_number, 4)
    ELSE NULL 
  END AS phone_number,
  CASE 
    WHEN address IS NOT NULL THEN LEFT(address, 20) || '...'
    ELSE NULL 
  END AS address,
  NULL::text AS nin_document_url,
  NULL::text AS passport_photo_url,
  NULL::text AS signature_url,
  CASE 
    WHEN referee1_name IS NOT NULL THEN LEFT(referee1_name, 10) || '...'
    ELSE NULL 
  END AS referee1_name,
  '***'::text AS referee1_phone,
  NULL::text AS referee1_address,
  CASE 
    WHEN referee2_name IS NOT NULL THEN LEFT(referee2_name, 10) || '...'
    ELSE NULL 
  END AS referee2_name,
  '***'::text AS referee2_phone,
  NULL::text AS referee2_address,
  notes,
  created_at,
  updated_at
FROM public.account_applications;

GRANT SELECT ON public.account_applications_masked TO authenticated;

CREATE OR REPLACE FUNCTION public.get_full_account_application(app_id uuid)
RETURNS SETOF public.account_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'managing_director') 
     OR public.has_role(auth.uid(), 'audit')
     OR EXISTS (SELECT 1 FROM account_applications WHERE id = app_id AND user_id = auth.uid())
  THEN
    RETURN QUERY SELECT * FROM account_applications WHERE id = app_id;
  ELSE
    RETURN;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_full_account_applications()
RETURNS SETOF public.account_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'managing_director') 
     OR public.has_role(auth.uid(), 'audit')
  THEN
    RETURN QUERY SELECT * FROM account_applications ORDER BY created_at DESC;
  ELSE
    RETURN;
  END IF;
END;
$$;

CREATE POLICY "Operations can view masked data only" 
ON public.account_applications 
AS RESTRICTIVE
FOR SELECT
USING (
  NOT public.has_role(auth.uid(), 'operations')
);

COMMENT ON VIEW public.account_applications_masked IS 
'Masked view for operations staff. Sensitive fields are hidden.';