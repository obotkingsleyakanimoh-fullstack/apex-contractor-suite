-- One-time Super Admin bootstrap for the approved Zitso Energy operations mailbox.
-- This file intentionally contains NO password or Supabase service-role credential.
-- The Auth account must be created/invited in Supabase Auth and its email verified.
-- When the verified account appears (or is verified later), the trigger grants
-- super_admin once, then consumes the allowlist entry.

begin;

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

create table if not exists private.super_admin_bootstrap_allowlist (
  email text primary key,
  purpose text not null default 'Initial Zitso Energy Super Admin bootstrap',
  created_at timestamptz not null default now()
);

alter table private.super_admin_bootstrap_allowlist enable row level security;
revoke all on table private.super_admin_bootstrap_allowlist from public, anon, authenticated;

insert into private.super_admin_bootstrap_allowlist (email)
values ('zitsoglobal@gmail.com')
on conflict (email) do nothing;

create or replace function private.grant_zitso_bootstrap_super_admin(
  target_user_id uuid,
  target_email text,
  target_metadata jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(btrim(coalesce(target_email, '')));
  resolved_name text;
begin
  -- Strictly bind this bootstrap to the single approved mailbox.
  if normalized_email <> 'zitsoglobal@gmail.com' then
    return;
  end if;

  if not exists (
    select 1
    from private.super_admin_bootstrap_allowlist a
    where lower(a.email) = normalized_email
  ) then
    return;
  end if;

  resolved_name := coalesce(
    nullif(btrim(target_metadata ->> 'full_name'), ''),
    nullif(btrim(target_metadata ->> 'name'), ''),
    'Zitso Global Super Admin'
  );

  insert into public.profiles (id, email, full_name)
  values (target_user_id, target_email, resolved_name)
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name);

  insert into public.user_roles (user_id, role)
  values (target_user_id, 'super_admin'::public.app_role)
  on conflict (user_id, role) do nothing;

  -- Match the app's role-management behaviour: a Super Admin has one role.
  delete from public.user_roles
  where user_id = target_user_id
    and role <> 'super_admin'::public.app_role;

  -- Consume the allowlist entry so it cannot bootstrap a replacement account later.
  delete from private.super_admin_bootstrap_allowlist
  where lower(email) = normalized_email;
end;
$$;

revoke all on function private.grant_zitso_bootstrap_super_admin(uuid, text, jsonb) from public, anon, authenticated;

create or replace function private.handle_zitso_super_admin_bootstrap()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only a verified email can receive the one-time role grant.
  if new.email_confirmed_at is not null then
    perform private.grant_zitso_bootstrap_super_admin(
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data, '{}'::jsonb)
    );
  end if;

  return new;
end;
$$;

revoke all on function private.handle_zitso_super_admin_bootstrap() from public, anon, authenticated;

drop trigger if exists trg_zitso_super_admin_bootstrap on auth.users;
create trigger trg_zitso_super_admin_bootstrap
after insert or update of email, email_confirmed_at on auth.users
for each row
execute function private.handle_zitso_super_admin_bootstrap();

-- Also supports the case where the account was already created and verified
-- before this migration was applied.
do $$
declare
  existing_user record;
begin
  select id, email, raw_user_meta_data
    into existing_user
  from auth.users
  where lower(email) = 'zitsoglobal@gmail.com'
    and email_confirmed_at is not null
  limit 1;

  if found then
    perform private.grant_zitso_bootstrap_super_admin(
      existing_user.id,
      existing_user.email,
      coalesce(existing_user.raw_user_meta_data, '{}'::jsonb)
    );
  end if;
end;
$$;

commit;
