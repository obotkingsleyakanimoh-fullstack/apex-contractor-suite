-- Zitso Energy: solar-only public website
-- Keep legacy contractor records for admin/history, but remove non-solar offerings from the public site.
begin;

update public.services
set published = false,
    featured = false,
    updated_at = now()
where not (
  lower(title) like '%solar%'
  or lower(title) like '%inverter%'
  or lower(title) like '%battery%'
  or lower(title) like '%energy storage%'
  or lower(title) like '%backup power%'
  or lower(title) like '%photovoltaic%'
  or lower(title) like '%pv %'
  or lower(title) like '%maintenance%'
  or lower(title) like '%hybrid%'
);

update public.projects
set published = false,
    featured = false,
    updated_at = now()
where not (
  lower(title) like '%solar%'
  or lower(title) like '%inverter%'
  or lower(title) like '%battery%'
  or lower(title) like '%energy%'
  or lower(title) like '%photovoltaic%'
  or lower(title) like '%pv %'
  or lower(title) like '%hybrid%'
);

update public.service_categories
set published = false,
    updated_at = now()
where not (
  lower(name) like '%solar%'
  or lower(name) like '%inverter%'
  or lower(name) like '%battery%'
  or lower(name) like '%energy%'
  or lower(name) like '%electrical%'
);

update public.company_settings
set tagline = 'Solar power, battery storage and dependable energy systems',
    description = 'Zitso Energy designs, installs and maintains solar power, hybrid inverter and battery storage systems for homes and businesses across Nigeria.',
    footer_description = 'Solar power systems designed around your real energy needs, from assessment and installation to maintenance.',
    site_title = 'Zitso Energy | Solar Power & Energy Storage',
    site_description = 'Solar power, hybrid inverter, battery storage and solar maintenance solutions for homes and businesses across Nigeria.',
    updated_at = now();

update public.site_content
set value = jsonb_build_object(
  'eyebrow','Solar energy • Battery storage • Inverter systems',
  'headline','Power your home with energy you can depend on.',
  'subheadline','We design and install dependable solar power systems that reduce generator dependence, protect your essential loads and give you greater control over your energy.',
  'primary_cta','Get a solar assessment',
  'primary_cta_url','/request-quote',
  'secondary_cta','Explore solar solutions',
  'secondary_cta_url','/services',
  'image_url','/images/solar-installation.webp',
  'autoplay_seconds',4.5,
  'slides',jsonb_build_array(
    jsonb_build_object('eyebrow','Solar energy • Battery storage • Inverter systems','headline','Power your home with energy you can depend on.','subheadline','We design and install dependable solar power systems that reduce generator dependence, protect your essential loads and give you greater control over your energy.','image_url','/images/solar-installation.webp'),
    jsonb_build_object('eyebrow','Smart power • Hybrid inverters • Backup','headline','Keep essential power running when the grid cannot.','subheadline','Hybrid inverter and battery systems designed around the appliances and loads that matter most to you.','image_url','/images/inverter-installation.webp'),
    jsonb_build_object('eyebrow','Residential • Commercial • Industrial','headline','Build an energy system around the way you operate.','subheadline','From assessment and sizing to installation and maintenance, Zitso Energy delivers complete solar solutions.','image_url','/images/commercial-project.webp')
  )
), updated_at = now()
where key = 'homepage_hero';

commit;
