-- Drop functions that reference account_applications
DROP FUNCTION IF EXISTS public.get_full_account_application(uuid);
DROP FUNCTION IF EXISTS public.get_all_full_account_applications();
DROP FUNCTION IF EXISTS public.get_account_applications_for_operations();

-- Drop the masked view
DROP VIEW IF EXISTS public.account_applications_masked;

-- Drop the account_applications table (this will also drop its RLS policies)
DROP TABLE IF EXISTS public.account_applications;

-- Update get_storage_stats function to remove account_applications references
CREATE OR REPLACE FUNCTION public.get_storage_stats()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'storage'
AS $function$
declare
  total_files int;
  bucket_stats jsonb;
  status_stats jsonb;
begin
  -- Check if caller is MD
  if not has_role(auth.uid(), 'managing_director') then
    raise exception 'Access denied: Managing Director only';
  end if;

  -- Get total files count
  select count(*)::int into total_files
  from storage.objects
  where bucket_id in ('documents', 'signatures', 'loan-uploads', 'passport-photos');

  -- Get files by bucket
  select jsonb_object_agg(bucket_id, cnt) into bucket_stats
  from (
    select bucket_id, count(*)::int as cnt
    from storage.objects
    where bucket_id in ('documents', 'signatures', 'loan-uploads', 'passport-photos')
    group by bucket_id
  ) sub;

  -- Get applications by status (only loan applications now)
  select jsonb_object_agg(status, cnt) into status_stats
  from (
    select status::text, count(*)::int as cnt
    from public.loan_applications
    group by status
  ) sub;

  return jsonb_build_object(
    'totalFiles', total_files,
    'byBucket', coalesce(bucket_stats, '{}'::jsonb),
    'byStatus', coalesce(status_stats, '{}'::jsonb)
  );
end;
$function$;

-- Drop the account_type enum if no longer used
DROP TYPE IF EXISTS public.account_type;