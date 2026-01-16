-- Drop the problematic RESTRICTIVE SELECT policy that blocks Operations from reading updated rows
DROP POLICY IF EXISTS "Operations can view masked data only" ON public.account_applications;

-- Recreate all SELECT policies as PERMISSIVE (which is the default behavior we want)
-- Drop and recreate to ensure clean state
DROP POLICY IF EXISTS "Operations can view all account applications" ON public.account_applications;
DROP POLICY IF EXISTS "Managing director can view all account applications" ON public.account_applications;
DROP POLICY IF EXISTS "Users can view their own account applications" ON public.account_applications;

-- Operations can view all account applications
CREATE POLICY "Operations can view all account applications"
ON public.account_applications
AS PERMISSIVE
FOR SELECT
USING (has_role(auth.uid(), 'operations'::app_role));

-- Managing director can view all account applications
CREATE POLICY "Managing director can view all account applications"
ON public.account_applications
AS PERMISSIVE
FOR SELECT
USING (has_role(auth.uid(), 'managing_director'::app_role));

-- Users can view their own account applications
CREATE POLICY "Users can view their own account applications"
ON public.account_applications
AS PERMISSIVE
FOR SELECT
USING (auth.uid() = user_id);