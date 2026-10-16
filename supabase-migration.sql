create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  avatar_url text,
  cover_photo_url text,
  bio text not null default '',
  location text not null default '',
  community_category text not null default 'general',
  privacy_settings jsonb not null default '{"public_posts": true, "show_email": false}'::jsonb,
  role text not null default 'student' check (role in ('student', 'business', 'resident')),
  account_role text not null default 'member' check (account_role in ('member', 'moderator', 'admin')),
  marketplace_shop_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
grant select, insert, update on public.profiles to authenticated;
revoke all on public.profiles from anon;

drop policy if exists "Profiles are readable by their owner" on public.profiles;
create policy "Profiles are readable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are insertable by their owner" on public.profiles;
create policy "Profiles are insertable by their owner"
  on public.profiles for insert
  with check (auth.uid() = id and account_role = 'member');

drop policy if exists "Profiles are updatable by their owner" on public.profiles;
create policy "Profiles are updatable by their owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null then
    new.account_role := old.account_role;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_role_escalation on public.profiles;
create trigger prevent_profile_role_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_profile_role_escalation();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id, username, full_name, email, phone, role, community_category, location
  ) values (
    new.id,
    lower(new.raw_user_meta_data ->> 'username'),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    coalesce(new.raw_user_meta_data ->> 'community_category', 'general'),
    coalesce(new.raw_user_meta_data ->> 'location', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

create or replace function public.is_username_available(candidate_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select candidate_username ~ '^[a-z0-9_]{3,30}$'
    and not exists (
      select 1 from public.profiles
      where username = lower(candidate_username)
        and (auth.uid() is null or id <> auth.uid())
    );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;