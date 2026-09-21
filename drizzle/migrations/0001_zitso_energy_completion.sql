-- Zitso Energy completion migration
-- Adds storage buckets, starter media mappings and a protected admin role-management RPC.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif','image/gif']),
  ('quote-uploads', 'quote-uploads', false, 10485760, array['image/jpeg','image/png','image/webp','image/avif','image/gif','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.set_user_role(target_user uuid, new_role public.app_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_is_super boolean;
  caller_is_admin boolean;
  target_has_super boolean;
begin
  caller_is_super := public.has_role(auth.uid(), 'super_admin');
  caller_is_admin := public.is_admin(auth.uid());

  if not caller_is_admin then
    raise exception 'Administrator access required';
  end if;

  if new_role = 'super_admin' and not caller_is_super then
    raise exception 'Only a super administrator can grant super administrator access';
  end if;

  if new_role is null then
    if target_user = auth.uid() then
      raise exception 'You cannot remove your own last role';
    end if;
    if public.has_role(target_user, 'super_admin') and not caller_is_super then
      raise exception 'Only a super administrator can remove a super administrator';
    end if;
    delete from public.user_roles where user_id = target_user;
    return;
  end if;

  if public.has_role(target_user, 'super_admin') and not caller_is_super then
    raise exception 'Only a super administrator can change a super administrator';
  end if;

  if public.has_role(target_user, 'super_admin') and new_role is distinct from 'super_admin' then
    if (select count(*) from public.user_roles where role = 'super_admin') <= 1 then
      raise exception 'At least one super administrator must remain';
    end if;
  end if;

  if new_role = 'super_admin' then
    insert into public.user_roles (user_id, role)
    values (target_user, 'super_admin')
    on conflict (user_id, role) do nothing;
    delete from public.user_roles where user_id = target_user and role <> 'super_admin';
  else
    delete from public.user_roles where user_id = target_user;
    insert into public.user_roles (user_id, role)
    values (target_user, new_role)
    on conflict (user_id, role) do nothing;
  end if;

  select exists(
    select 1 from public.user_roles where user_id = target_user and role = 'super_admin'
  ) into target_has_super;

  if target_has_super and not caller_is_super then
    raise exception 'Insufficient privileges';
  end if;
end;
$$;

revoke all on function public.set_user_role(uuid, public.app_role) from public;
grant execute on function public.set_user_role(uuid, public.app_role) to authenticated;

-- Starter content should use local images even when the initial migration is applied to an existing database.
update public.company_settings
set company_name = 'Zitso Energy',
    logo_url = '/images/zitso-energy-mark.svg',
    favicon_url = '/images/zitso-energy-mark.svg',
    site_title = coalesce(nullif(site_title, ''), 'Zitso Energy — Solar, Painting & Flooring Solutions'),
    site_description = coalesce(nullif(site_description, ''), 'Professional solar, electrical, painting, epoxy flooring and property improvement services.')
where company_name = 'Zitso Energy';

update public.site_content
set value = jsonb_set(value, '{image_url}', to_jsonb('/images/solar-installation.webp'::text))
where key = 'homepage_hero';

update public.site_content
set value = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(value, '{items,0,value}', '"25+"'::jsonb),
      '{items,1,value}', '"5+"'::jsonb
    ),
    '{items,2,value}', '"6+"'::jsonb
  ),
  '{items,3,value}', '"80%"'::jsonb
)
where key = 'homepage_stats';

update public.site_content
set value = jsonb_set(value, '{note}', '"Starter figures — edit these in the admin dashboard."'::jsonb)
where key = 'homepage_stats';

update public.services set hero_image_url = '/images/solar-installation.webp'
where slug in ('solar-installation','solar-system-maintenance','solar-panel-installation');
update public.services set hero_image_url = '/images/inverter-installation.webp'
where slug = 'inverter-installation';
update public.services set hero_image_url = '/images/electrical-works.webp'
where slug = 'electrical-works';
update public.services set hero_image_url = '/images/painting-services.webp'
where slug in ('contract-painting','interior-exterior-painting');
update public.services set hero_image_url = '/images/epoxy-flooring.webp'
where slug in ('epoxy-flooring','industrial-epoxy-flooring');
update public.services set hero_image_url = '/images/property-improvement.webp'
where slug = 'building-property-improvement';

update public.projects set hero_image_url = '/images/solar-installation.webp'
where slug in ('5kw-residential-solar-installation','office-solar-backup-system');
update public.projects set hero_image_url = '/images/epoxy-flooring.webp'
where slug = 'commercial-epoxy-floor-warehouse';
update public.projects set hero_image_url = '/images/painting-services.webp'
where slug = 'residential-exterior-repainting';

-- No fabricated testimonials are published by default.
update public.testimonials set published = false where is_demo = true;

UPDATE public.projects SET
  gallery = '["/images/solar-installation.webp","/images/inverter-installation.webp"]'::jsonb
WHERE slug IN ('5kw-residential-solar-installation','office-solar-backup-system');

UPDATE public.projects SET
  gallery = '["/images/epoxy-flooring.webp","/images/epoxy-after.webp"]'::jsonb,
  before_image_url = '/images/epoxy-before.webp',
  after_image_url = '/images/epoxy-after.webp'
WHERE slug = 'commercial-epoxy-floor-warehouse';

UPDATE public.projects SET
  gallery = '["/images/painting-services.webp","/images/painting-after.webp"]'::jsonb,
  before_image_url = '/images/painting-before.webp',
  after_image_url = '/images/painting-after.webp'
WHERE slug = 'residential-exterior-repainting';
