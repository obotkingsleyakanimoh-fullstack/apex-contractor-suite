-- Zitso Energy: request-quote hero + persistent global website appearance.
begin;

-- ------------------------------------------------------------
-- Request Quote hero
-- ------------------------------------------------------------
insert into public.site_content (key, value)
values
('request_quote_hero', jsonb_build_object(
  'eyebrow','Free solar assessment',
  'headline','Request a Quote',
  'subheadline','Tell us what you want to power and we will help you plan the right solar, inverter and battery solution.',
  'primary_cta','Submit your enquiry',
  'primary_cta_url','/request-quote#quote-form',
  'secondary_cta','Explore solar solutions',
  'secondary_cta_url','/services',
  'autoplay_seconds',4.5,
  'slides',jsonb_build_array(
    jsonb_build_object(
      'image_url','/images/solar-installation.webp',
      'eyebrow','Free solar assessment',
      'headline','Request a Quote',
      'subheadline','Tell us what you want to power and we will help you plan the right solar, inverter and battery solution.'
    ),
    jsonb_build_object(
      'image_url','/images/inverter-installation.webp',
      'eyebrow','Inverter • Battery • Backup',
      'headline','Request a Quote',
      'subheadline','Share your backup goals, essential loads and location so we can understand the system you need.'
    ),
    jsonb_build_object(
      'image_url','/images/commercial-project.webp',
      'eyebrow','Residential • Commercial • Industrial',
      'headline','Request a Quote',
      'subheadline','Start with an assessment for a solar energy system designed around the way your home or business operates.'
    )
  )
))
on conflict (key) do nothing;

-- ------------------------------------------------------------
-- Global website appearance
-- ------------------------------------------------------------
create table if not exists public.website_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'Zitso Energy',
  primary_color text not null default '#17634e',
  secondary_color text not null default '#edf7f2',
  accent_color text not null default '#f6c453',
  background_color text not null default '#f9faf5',
  surface_color text not null default '#f4f5ef',
  text_color text not null default '#33413b',
  heading_color text not null default '#102019',
  muted_text_color text not null default '#52605a',
  border_color text not null default '#dfe5df',
  navbar_background text not null default '#ffffff',
  footer_background text not null default '#071a16',
  hero_overlay_color text not null default '#06120f',
  hero_overlay_opacity numeric(4,3) not null default 0.780 check (hero_overlay_opacity >= 0 and hero_overlay_opacity <= 1),
  body_font text not null default 'Source Sans 3',
  heading_font text not null default 'Archivo',
  accent_font text not null default 'Manrope',
  body_font_size integer not null default 16 check (body_font_size between 12 and 24),
  h1_font_size integer not null default 64 check (h1_font_size between 28 and 96),
  h2_font_size integer not null default 40 check (h2_font_size between 22 and 64),
  h3_font_size integer not null default 30 check (h3_font_size between 18 and 48),
  h4_font_size integer not null default 24 check (h4_font_size between 16 and 40),
  nav_font_size integer not null default 14 check (nav_font_size between 11 and 20),
  button_font_size integer not null default 14 check (button_font_size between 11 and 20),
  small_text_size integer not null default 12 check (small_text_size between 9 and 18),
  heading_font_weight integer not null default 700 check (heading_font_weight in (400,500,600,700,800)),
  body_font_weight integer not null default 400 check (body_font_weight in (400,500,600,700,800)),
  nav_font_weight integer not null default 600 check (nav_font_weight in (400,500,600,700,800)),
  button_font_weight integer not null default 600 check (button_font_weight in (400,500,600,700,800)),
  singleton boolean not null default true unique,
  updated_at timestamptz not null default now()
);

drop trigger if exists website_settings_updated_at on public.website_settings;
create trigger website_settings_updated_at
before update on public.website_settings
for each row execute function public.set_updated_at();

insert into public.website_settings (
  singleton, site_name, primary_color, secondary_color, accent_color,
  background_color, surface_color, text_color, heading_color, muted_text_color,
  border_color, navbar_background, footer_background, hero_overlay_color, hero_overlay_opacity,
  body_font, heading_font, accent_font, body_font_size, h1_font_size, h2_font_size,
  h3_font_size, h4_font_size, nav_font_size, button_font_size, small_text_size,
  heading_font_weight, body_font_weight, nav_font_weight, button_font_weight
)
values (
  true, 'Zitso Energy', '#17634e', '#edf7f2', '#f6c453',
  '#f9faf5', '#f4f5ef', '#33413b', '#102019', '#52605a',
  '#dfe5df', '#ffffff', '#071a16', '#06120f', 0.780,
  'Source Sans 3', 'Archivo', 'Manrope', 16, 64, 40,
  30, 24, 14, 14, 12, 700, 400, 600, 600
)
on conflict (singleton) do nothing;

grant select on public.website_settings to anon, authenticated;
grant all on public.website_settings to service_role;

alter table public.website_settings enable row level security;

drop policy if exists "appearance public read" on public.website_settings;
create policy "appearance public read"
on public.website_settings
for select
to anon, authenticated
using (true);

drop policy if exists "appearance staff write" on public.website_settings;
create policy "appearance staff write"
on public.website_settings
for all
to authenticated
using (public.is_staff(auth.uid()))
with check (public.is_staff(auth.uid()));

commit;
