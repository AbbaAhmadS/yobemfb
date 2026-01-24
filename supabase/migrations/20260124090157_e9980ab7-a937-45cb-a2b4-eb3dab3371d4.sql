-- Remove guarantor feature completely
-- Drop dependent objects first
DROP VIEW IF EXISTS public.guarantors_masked;
DROP FUNCTION IF EXISTS public.get_full_guarantor(uuid);

-- Drop the table (CASCADE removes policies, grants, and dependent constraints)
DROP TABLE IF EXISTS public.guarantors CASCADE;