-- Zitso Energy: configurable animated heroes for every primary public page.
begin;

insert into public.site_content (key, value)
values
('services_hero', jsonb_build_object('eyebrow','Solar solutions • Zitso Energy','headline','Power your home and business with energy you can depend on.','subheadline','From solar PV and hybrid inverters to battery storage and maintenance, we design practical energy systems around the way you use power.','primary_cta','Get a solar assessment','primary_cta_url','/request-quote','secondary_cta','Talk to Zitso Energy','secondary_cta_url','/contact','autoplay_seconds',4.5,'slides',jsonb_build_array(
 jsonb_build_object('image_url','/images/solar-installation.webp','eyebrow','Solar solutions • Zitso Energy','headline','Power your home and business with energy you can depend on.','subheadline','From solar PV and hybrid inverters to battery storage and maintenance, we design practical energy systems around the way you use power.'),
 jsonb_build_object('image_url','/images/inverter-installation.webp','eyebrow','Hybrid power • Battery storage','headline','Keep essential power running when the grid cannot.','subheadline','Intelligent inverter and battery systems designed around the loads that matter most to your home or business.'),
 jsonb_build_object('image_url','/images/commercial-project.webp','eyebrow','Residential • Commercial • Industrial','headline','A complete solar solution from assessment to after-sales care.','subheadline','We assess your energy needs, size the system, install it carefully and support its performance over time.')
)),
('projects_hero', jsonb_build_object('autoplay_seconds',4.5,'slides',jsonb_build_array(
 jsonb_build_object('image_url','/images/solar-installation.webp','eyebrow','Our solar work','headline','Solar projects that put power to work.','subheadline','Explore selected installations, inverter systems and energy-storage projects.'),
 jsonb_build_object('image_url','/images/commercial-project.webp','eyebrow','Commercial • Industrial','headline','Energy systems designed around real operating demands.','subheadline','From load assessment to installation and maintenance, every project starts with the way power is actually used.'),
 jsonb_build_object('image_url','/images/inverter-installation.webp','eyebrow','Inverter • Battery • Backup','headline','Practical systems for dependable everyday power.','subheadline','See how solar generation, battery storage and hybrid inverters work together in completed projects.')
)),
('about_hero', jsonb_build_object('autoplay_seconds',4.5,'slides',jsonb_build_array(
 jsonb_build_object('image_url','/images/solar-installation.webp','eyebrow','About Zitso Energy','headline','Building a more dependable way to power everyday life.','subheadline','We focus on practical solar energy systems that give households and businesses greater control over their electricity.'),
 jsonb_build_object('image_url','/images/inverter-installation.webp','eyebrow','Designed around real usage','headline','Solar systems sized for the loads that matter most.','subheadline','From assessment and sizing to installation and maintenance, we build around how you actually use power.'),
 jsonb_build_object('image_url','/images/commercial-project.webp','eyebrow','Residential • Commercial • Industrial','headline','Energy infrastructure built for long-term performance.','subheadline','Quality components, careful installation and ongoing support for dependable solar power.')
)),
('contact_hero', jsonb_build_object('autoplay_seconds',4.5,'slides',jsonb_build_array(
 jsonb_build_object('image_url','/images/solar-installation.webp','eyebrow','Talk to Zitso Energy','headline','Let''s plan the right solar system for your needs.','subheadline','Tell us what you want to power, where you are located and what kind of backup you need.'),
 jsonb_build_object('image_url','/images/inverter-installation.webp','eyebrow','Solar • Inverter • Battery','headline','Have a question about an existing system?','subheadline','Speak with our team about installation, diagnostics, maintenance or battery and inverter upgrades.'),
 jsonb_build_object('image_url','/images/commercial-project.webp','eyebrow','Homes • Businesses • Facilities','headline','Start with a conversation about your energy use.','subheadline','We can help you understand the next practical step before you commit to a system.')
)),
('page_about', jsonb_build_object('eyebrow','Our approach','headline','Solar should be designed around the customer, not the other way around.','body','We start by understanding your real energy usage, then size the generation, inverter and storage components around the loads that matter most to you.','cta','Let''s plan your solar system.','subheadline','Tell us what you need to power and where you are located.','primary_cta','Get a solar assessment','primary_cta_url','/request-quote'))
on conflict (key) do nothing;

commit;
