-- Create function to get storage statistics (MD only)
create or replace function public.get_storage_stats()
returns jsonb
language plpgsql
security definer
set search_path = public, storage
as $$
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

  -- Get applications by status (combine loans + accounts)
  select jsonb_object_agg(status, cnt) into status_stats
  from (
    select status::text, sum(cnt)::int as cnt
    from (
      select status, count(*)::int as cnt
      from public.loan_applications
      group by status
      union all
      select status, count(*)::int as cnt
      from public.account_applications
      group by status
    ) combined
    group by status
  ) sub;

  return jsonb_build_object(
    'totalFiles', total_files,
    'byBucket', coalesce(bucket_stats, '{}'::jsonb),
    'byStatus', coalesce(status_stats, '{}'::jsonb)
  );
end;
$$;