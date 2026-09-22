-- Zitso Energy: animated, admin-configurable blog hero.
begin;

insert into public.site_content (key, value)
values
('blog_hero', jsonb_build_object(
  'eyebrow','Zitso Energy Journal',
  'headline','Solar knowledge for better energy decisions.',
  'subheadline','Practical articles about solar PV, hybrid inverters, battery storage, maintenance and energy planning.',
  'primary_cta','Get a solar assessment',
  'primary_cta_url','/request-quote',
  'secondary_cta','Explore articles',
  'secondary_cta_url','#blog-articles',
  'autoplay_seconds',4.5,
  'slides',jsonb_build_array(
    jsonb_build_object('image_url','/images/solar-installation.webp','eyebrow','Zitso Energy Journal','headline','Solar knowledge for better energy decisions.','subheadline','Practical articles about solar PV, hybrid inverters, battery storage, maintenance and energy planning.'),
    jsonb_build_object('image_url','/images/inverter-installation.webp','eyebrow','Inverter • Battery • Backup','headline','Understand the systems behind dependable backup power.','subheadline','Explore practical guidance on hybrid inverters, battery sizing, backup loads and everyday energy use.'),
    jsonb_build_object('image_url','/images/commercial-project.webp','eyebrow','Solar • Commercial • Industrial','headline','Ideas and insights for smarter energy planning.','subheadline','Learn about solar installations, maintenance, energy assessments and solutions for homes and businesses.')
  )
))
on conflict (key) do nothing;

commit;
