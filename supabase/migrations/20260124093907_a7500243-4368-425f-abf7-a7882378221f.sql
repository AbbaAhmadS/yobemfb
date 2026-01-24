-- Create admin settings table for Managing Director only
create table if not exists public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_by uuid references auth.users(id),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.admin_settings enable row level security;

-- MD can view and manage all settings
create policy "Managing director can manage settings"
on public.admin_settings
for all
to authenticated
using (has_role(auth.uid(), 'managing_director'))
with check (has_role(auth.uid(), 'managing_director'));

-- Trigger for updated_at
create trigger update_admin_settings_updated_at
before update on public.admin_settings
for each row
execute function public.update_updated_at_column();

-- Insert default retention policy setting (enabled by default)
insert into public.admin_settings (key, value, description)
values (
  'retention_policy',
  '{"enabled": true, "declined_retention_days": 5}'::jsonb,
  'Auto-delete uploads for declined applications after X days'
)
on conflict (key) do nothing;