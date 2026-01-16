-- Fix account_applications UPDATE policies: they were created as RESTRICTIVE, which makes multiple policies AND together,
-- preventing Operations from updating rows unless they also satisfy the user policy.

DROP POLICY IF EXISTS "Operations can update account applications" ON public.account_applications;
DROP POLICY IF EXISTS "Users can update their own pending account applications" ON public.account_applications;

-- Operations Department: can update any account application
CREATE POLICY "Operations can update account applications"
ON public.account_applications
AS PERMISSIVE
FOR UPDATE
USING (has_role(auth.uid(), 'operations'::app_role))
WITH CHECK (has_role(auth.uid(), 'operations'::app_role));

-- Applicants: can update their own application only while still pending
CREATE POLICY "Users can update their own pending account applications"
ON public.account_applications
AS PERMISSIVE
FOR UPDATE
USING (
  auth.uid() = user_id
  AND status = 'pending'::application_status
)
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'::application_status
);
