-- Add new columns for account applications
ALTER TABLE public.account_applications 
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS local_government text,
ADD COLUMN IF NOT EXISTS date_of_birth text,
ADD COLUMN IF NOT EXISTS next_of_kin_name text,
ADD COLUMN IF NOT EXISTS next_of_kin_address text,
ADD COLUMN IF NOT EXISTS next_of_kin_phone text;

-- Make referee2 columns nullable since we now use next_of_kin instead
ALTER TABLE public.account_applications 
ALTER COLUMN referee2_name DROP NOT NULL,
ALTER COLUMN referee2_phone DROP NOT NULL,
ALTER COLUMN referee2_address DROP NOT NULL;

-- Set defaults for referee2 columns
ALTER TABLE public.account_applications 
ALTER COLUMN referee2_name SET DEFAULT '',
ALTER COLUMN referee2_phone SET DEFAULT '',
ALTER COLUMN referee2_address SET DEFAULT '';

-- Drop and recreate the RPC function with new columns
DROP FUNCTION IF EXISTS public.get_account_applications_for_operations();

CREATE FUNCTION public.get_account_applications_for_operations()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  application_id text,
  full_name text,
  phone_number text,
  address text,
  bvn text,
  nin text,
  account_type public.account_type,
  status public.application_status,
  created_at timestamptz,
  updated_at timestamptz,
  passport_photo_url text,
  nin_document_url text,
  signature_url text,
  referee1_name text,
  referee1_phone text,
  referee1_address text,
  referee2_name text,
  referee2_phone text,
  referee2_address text,
  notes text,
  state text,
  local_government text,
  date_of_birth text,
  next_of_kin_name text,
  next_of_kin_address text,
  next_of_kin_phone text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only operations/account opening department can call this
  IF NOT has_role(auth.uid(), 'operations') THEN
    RAISE EXCEPTION 'Access denied: Account Opening Department only';
  END IF;

  RETURN QUERY
  SELECT 
    a.id,
    a.user_id,
    a.application_id,
    a.full_name,
    a.phone_number,
    a.address,
    a.bvn,
    a.nin,
    a.account_type,
    a.status,
    a.created_at,
    a.updated_at,
    a.passport_photo_url,
    a.nin_document_url,
    a.signature_url,
    a.referee1_name,
    a.referee1_phone,
    a.referee1_address,
    a.referee2_name,
    a.referee2_phone,
    a.referee2_address,
    a.notes,
    a.state,
    a.local_government,
    a.date_of_birth,
    a.next_of_kin_name,
    a.next_of_kin_address,
    a.next_of_kin_phone
  FROM public.account_applications a
  ORDER BY a.created_at DESC;
END;
$$;