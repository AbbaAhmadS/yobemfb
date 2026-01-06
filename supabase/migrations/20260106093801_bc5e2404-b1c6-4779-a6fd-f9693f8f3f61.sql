-- Fix the is_admin function to only include high-privilege roles
-- Currently it returns true for ANY role which is too permissive

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('managing_director', 'audit', 'operations', 'coo', 'credit')
      AND is_active = TRUE
      AND (locked_until IS NULL OR locked_until < NOW())
  )
$$;

-- Drop the overly broad admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create more specific policies for profile access
-- Only operations and managing_director need to view all profiles for customer service
CREATE POLICY "Operations can view all profiles for customer service" 
ON public.profiles 
FOR SELECT
USING (public.has_role(auth.uid(), 'operations'));

CREATE POLICY "Managing director can view all profiles" 
ON public.profiles 
FOR SELECT
USING (public.has_role(auth.uid(), 'managing_director'));

-- Credit role only needs to see profiles for loan applications they're processing
-- They should access profile data through the loan_applications join, not directly
-- But for now, allow limited access
CREATE POLICY "Credit can view profiles for loan processing" 
ON public.profiles 
FOR SELECT
USING (
  public.has_role(auth.uid(), 'credit') 
  AND EXISTS (
    SELECT 1 FROM loan_applications la 
    WHERE la.user_id = profiles.user_id
  )
);

-- Audit role can view profiles but only for compliance purposes
CREATE POLICY "Audit can view profiles for compliance" 
ON public.profiles 
FOR SELECT
USING (public.has_role(auth.uid(), 'audit'));

-- Create audit log table for profile access tracking
CREATE TABLE IF NOT EXISTS public.profile_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_user_id uuid NOT NULL,
  accessor_role text NOT NULL,
  accessed_profile_id uuid NOT NULL,
  access_type text NOT NULL DEFAULT 'view',
  accessed_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS on audit log
ALTER TABLE public.profile_access_logs ENABLE ROW LEVEL SECURITY;

-- Only managing_director can view audit logs
CREATE POLICY "Managing director can view profile access logs" 
ON public.profile_access_logs 
FOR SELECT
USING (public.has_role(auth.uid(), 'managing_director'));

-- Allow admins to insert audit logs
CREATE POLICY "Admins can create profile access logs" 
ON public.profile_access_logs 
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Create a function for admins to access profiles with logging
CREATE OR REPLACE FUNCTION public.get_profile_with_audit(profile_user_id uuid)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  accessor_role text;
BEGIN
  -- Get the accessor's highest role
  SELECT role::text INTO accessor_role
  FROM user_roles
  WHERE user_id = auth.uid() AND is_active = TRUE
  ORDER BY 
    CASE role 
      WHEN 'managing_director' THEN 1
      WHEN 'coo' THEN 2
      WHEN 'audit' THEN 3
      WHEN 'operations' THEN 4
      WHEN 'credit' THEN 5
    END
  LIMIT 1;
  
  -- Log the access
  INSERT INTO profile_access_logs (accessor_user_id, accessor_role, accessed_profile_id, access_type)
  VALUES (auth.uid(), COALESCE(accessor_role, 'unknown'), profile_user_id, 'view');
  
  -- Return the profile
  RETURN QUERY SELECT * FROM profiles WHERE user_id = profile_user_id;
END;
$$;