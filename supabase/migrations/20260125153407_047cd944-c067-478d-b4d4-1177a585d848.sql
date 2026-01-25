-- Step 1: Delete user_roles entries with 'operations' role
DELETE FROM user_roles WHERE role = 'operations';

-- Step 2: Drop the Operations policy on profiles
DROP POLICY IF EXISTS "Operations can view all profiles for customer service" ON public.profiles;

-- Step 3: Drop all policies that depend on app_role
DROP POLICY IF EXISTS "Managing director can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Credit can view all loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Credit can update loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Credit can create loan applications on behalf" ON public.loan_applications;
DROP POLICY IF EXISTS "Audit can view all loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Audit can update loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "COO can view all loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "COO can update loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Managing director can view all loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Managing director can view all action logs" ON public.admin_actions;
DROP POLICY IF EXISTS "Managing director can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Credit can view profiles for loan processing" ON public.profiles;
DROP POLICY IF EXISTS "Audit can view profiles for compliance" ON public.profiles;
DROP POLICY IF EXISTS "Managing director can view profile access logs" ON public.profile_access_logs;
DROP POLICY IF EXISTS "Managing director can manage settings" ON public.admin_settings;

-- Step 4: Drop the has_role function
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Step 5: Create a new enum without 'operations'
CREATE TYPE public.app_role_new AS ENUM ('credit', 'audit', 'coo', 'managing_director');

-- Step 6: Update the user_roles table to use the new enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role_new 
  USING role::text::public.app_role_new;

-- Step 7: Drop the old enum and rename the new one
DROP TYPE public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Step 8: Recreate the has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = TRUE
      AND (locked_until IS NULL OR locked_until < NOW())
  )
$function$;

-- Step 9: Update the is_admin function without 'operations'
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('managing_director', 'audit', 'coo', 'credit')
      AND is_active = TRUE
      AND (locked_until IS NULL OR locked_until < NOW())
  )
$function$;

-- Step 10: Recreate all RLS policies (without operations)
CREATE POLICY "Managing director can manage all roles" ON public.user_roles
FOR ALL USING (has_role(auth.uid(), 'managing_director'));

CREATE POLICY "Credit can view all loan applications" ON public.loan_applications
FOR SELECT USING (has_role(auth.uid(), 'credit'));

CREATE POLICY "Credit can update loan applications" ON public.loan_applications
FOR UPDATE USING (has_role(auth.uid(), 'credit'));

CREATE POLICY "Credit can create loan applications on behalf" ON public.loan_applications
FOR INSERT WITH CHECK (has_role(auth.uid(), 'credit'));

CREATE POLICY "Audit can view all loan applications" ON public.loan_applications
FOR SELECT USING (has_role(auth.uid(), 'audit'));

CREATE POLICY "Audit can update loan applications" ON public.loan_applications
FOR UPDATE USING (has_role(auth.uid(), 'audit'));

CREATE POLICY "COO can view all loan applications" ON public.loan_applications
FOR SELECT USING (has_role(auth.uid(), 'coo'));

CREATE POLICY "COO can update loan applications" ON public.loan_applications
FOR UPDATE USING (has_role(auth.uid(), 'coo'));

CREATE POLICY "Managing director can view all loan applications" ON public.loan_applications
FOR SELECT USING (has_role(auth.uid(), 'managing_director'));

CREATE POLICY "Managing director can view all action logs" ON public.admin_actions
FOR SELECT USING (has_role(auth.uid(), 'managing_director'));

CREATE POLICY "Managing director can view all profiles" ON public.profiles
FOR SELECT USING (has_role(auth.uid(), 'managing_director'));

CREATE POLICY "Credit can view profiles for loan processing" ON public.profiles
FOR SELECT USING (has_role(auth.uid(), 'credit') AND EXISTS (
  SELECT 1 FROM loan_applications la WHERE la.user_id = profiles.user_id
));

CREATE POLICY "Audit can view profiles for compliance" ON public.profiles
FOR SELECT USING (has_role(auth.uid(), 'audit'));

CREATE POLICY "Managing director can view profile access logs" ON public.profile_access_logs
FOR SELECT USING (has_role(auth.uid(), 'managing_director'));

CREATE POLICY "Managing director can manage settings" ON public.admin_settings
FOR ALL USING (has_role(auth.uid(), 'managing_director'))
WITH CHECK (has_role(auth.uid(), 'managing_director'));