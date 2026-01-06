-- Create a SECURITY DEFINER function for operations to get masked data
CREATE OR REPLACE FUNCTION public.get_account_applications_for_operations()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  application_id text,
  full_name text,
  account_type text,
  status text,
  bvn text,
  nin text,
  phone_number text,
  address text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only operations can use this function
  IF NOT public.has_role(auth.uid(), 'operations') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY 
  SELECT 
    a.id,
    a.user_id,
    a.application_id,
    a.full_name,
    a.account_type::text,
    a.status::text,
    CASE WHEN a.bvn IS NOT NULL THEN '***' || RIGHT(a.bvn, 4) ELSE NULL END,
    CASE WHEN a.nin IS NOT NULL THEN '***' || RIGHT(a.nin, 4) ELSE NULL END,
    CASE WHEN a.phone_number IS NOT NULL THEN '***' || RIGHT(a.phone_number, 4) ELSE NULL END,
    CASE WHEN a.address IS NOT NULL THEN LEFT(a.address, 20) || '...' ELSE NULL END,
    a.notes,
    a.created_at,
    a.updated_at
  FROM account_applications a
  ORDER BY a.created_at DESC;
END;
$$;