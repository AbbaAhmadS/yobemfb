
-- =============================================
-- FIX 1: Make loan-uploads bucket private
-- =============================================
UPDATE storage.buckets SET public = false WHERE id = 'loan-uploads';

-- Remove the public access policy
DROP POLICY IF EXISTS "Anyone can view loan uploads" ON storage.objects;

-- Add proper SELECT policy for loan-uploads with ownership check
CREATE POLICY "Users can view their own loan uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'loan-uploads' 
  AND (
    (auth.uid())::text = (storage.foldername(name))[2]
    OR public.is_admin(auth.uid())
  )
);

-- =============================================
-- FIX 2: Make passport-photos bucket private
-- =============================================
UPDATE storage.buckets SET public = false WHERE id = 'passport-photos';

-- Remove the public access policy
DROP POLICY IF EXISTS "Anyone can view passport photos" ON storage.objects;

-- Add proper SELECT policy for passport-photos with ownership check
CREATE POLICY "Users can view their own passport photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'passport-photos' 
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.is_admin(auth.uid())
  )
);

-- =============================================
-- FIX 3: Restrict guarantor data access
-- =============================================

-- Drop the existing permissive policy that exposes all guarantor data
DROP POLICY IF EXISTS "Users can view guarantors for their applications" ON guarantors;

-- Create a new restricted policy: users can only view guarantors for DRAFT applications
-- This limits exposure to only during the application process
CREATE POLICY "Users can view guarantors for their draft applications"
ON guarantors FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM loan_applications
    WHERE loan_applications.id = guarantors.loan_application_id
    AND loan_applications.user_id = auth.uid()
    AND loan_applications.is_draft = TRUE
  )
);

-- Create a masked view for guarantor data that applicants can use
-- This hides sensitive financial data from applicants
CREATE OR REPLACE VIEW public.guarantors_masked
WITH (security_invoker = true)
AS SELECT 
    id,
    loan_application_id,
    full_name,
    organization,
    position,
    employee_id,
    -- Mask sensitive financial data
    CASE 
      WHEN salary IS NOT NULL THEN 
        CASE 
          WHEN salary < 100000 THEN 'Below ₦100k'
          WHEN salary < 300000 THEN '₦100k - ₦300k'
          WHEN salary < 500000 THEN '₦300k - ₦500k'
          WHEN salary < 1000000 THEN '₦500k - ₦1M'
          ELSE 'Above ₦1M'
        END
      ELSE NULL 
    END AS salary_range,
    -- Mask BVN completely for non-admins
    CASE WHEN bvn IS NOT NULL THEN '***********' ELSE NULL END AS bvn,
    -- Mask phone number
    CASE WHEN phone_number IS NOT NULL THEN '***' || RIGHT(phone_number, 4) ELSE NULL END AS phone_number,
    -- Mask address
    CASE WHEN address IS NOT NULL THEN LEFT(address, 15) || '...' ELSE NULL END AS address,
    -- Don't expose signature URL to applicants
    NULL::text AS signature_url,
    acknowledged,
    created_at,
    updated_at
FROM guarantors;

-- Grant access only to authenticated users (RLS on underlying table still applies)
REVOKE ALL ON public.guarantors_masked FROM anon;
REVOKE ALL ON public.guarantors_masked FROM public;
GRANT SELECT ON public.guarantors_masked TO authenticated;

COMMENT ON VIEW public.guarantors_masked IS 
'Masked view of guarantor data with sensitive PII redacted. 
Uses SECURITY INVOKER so RLS policies on guarantors table are enforced.
Salary shown as ranges, BVN fully masked, contact info partially masked.';

-- =============================================
-- Create function for admins to get full guarantor data
-- =============================================
CREATE OR REPLACE FUNCTION public.get_full_guarantor(guarantor_id uuid)
RETURNS SETOF guarantors
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can see full guarantor data
  IF public.is_admin(auth.uid()) THEN
    RETURN QUERY SELECT * FROM guarantors WHERE id = guarantor_id;
  ELSE
    RETURN;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.get_full_guarantor IS 
'Returns full guarantor data including sensitive PII. Only accessible by admins.';
