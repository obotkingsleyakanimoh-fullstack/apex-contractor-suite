-- =============== ENUMS ===============
CREATE TYPE public.app_role AS ENUM ('super_admin','admin','editor');
CREATE TYPE public.quote_status AS ENUM ('new','contacted','inspection_required','quote_prepared','negotiation','approved','rejected','completed','cancelled');
CREATE TYPE public.message_status AS ENUM ('unread','read','responded','closed');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','admin'));
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "roles readable by staff" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Zitso Energy',
  tagline text,
  description text,
  logo_url text,
  favicon_url text,
  phone text,
  phone_secondary text,
  whatsapp text,
  whatsapp_default_message text DEFAULT 'Hello, I would like to request a quotation.',
  email text,
  address text,
  city text,
  state text,
  country text DEFAULT 'Nigeria',
  rc_number text,
  emergency_contact text,
  currency text NOT NULL DEFAULT 'NGN',
  currency_symbol text NOT NULL DEFAULT '₦',
  site_title text,
  site_description text,
  default_og_image text,
  footer_description text,
  copyright_text text,
  max_upload_mb integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.company_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.company_settings TO authenticated;
GRANT ALL ON public.company_settings TO service_role;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company public read" ON public.company_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "company staff write" ON public.company_settings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER t_company_updated BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week smallint NOT NULL UNIQUE,
  label text NOT NULL,
  open_time text,
  close_time text,
  is_closed boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.business_hours TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.business_hours TO authenticated;
GRANT ALL ON public.business_hours TO service_role;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hours public read" ON public.business_hours FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "hours staff write" ON public.business_hours FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.office_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  state text,
  country text DEFAULT 'Nigeria',
  latitude double precision,
  longitude double precision,
  google_maps_url text,
  service_radius_km numeric NOT NULL DEFAULT 50,
  is_primary boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.office_locations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.office_locations TO authenticated;
GRANT ALL ON public.office_locations TO service_role;
ALTER TABLE public.office_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "office public read" ON public.office_locations FOR SELECT TO anon, authenticated USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "office staff write" ON public.office_locations FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER t_office_updated BEFORE UPDATE ON public.office_locations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_categories TO authenticated;
GRANT ALL ON public.service_categories TO service_role;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cat public read" ON public.service_categories FOR SELECT TO anon, authenticated USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "cat staff write" ON public.service_categories FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER t_cat_updated BEFORE UPDATE ON public.service_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL,
  short_description text,
  full_description text,
  hero_image_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  process_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  starting_price numeric,
  show_price boolean NOT NULL DEFAULT false,
  cta_text text DEFAULT 'Request a Quote',
  seo_title text,
  seo_description text,
  og_image_url text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_services_published ON public.services(published);
CREATE INDEX idx_services_category ON public.services(category_id);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services public read" ON public.services FOR SELECT TO anon, authenticated USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "services staff write" ON public.services FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER t_services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL,
  location text,
  city text,
  state text,
  client_type text,
  description text,
  scope_of_work text,
  outcome text,
  services_provided jsonb NOT NULL DEFAULT '[]'::jsonb,
  hero_image_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  before_image_url text,
  after_image_url text,
  project_date date,
  completion_date date,
  seo_title text,
  seo_description text,
  og_image_url text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_projects_published ON public.projects(published);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects public read" ON public.projects FOR SELECT TO anon, authenticated USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "projects staff write" ON public.projects FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER t_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_company text,
  customer_location text,
  customer_photo_url text,
  content text NOT NULL,
  rating smallint,
  is_demo boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testi public read" ON public.testimonials FOR SELECT TO anon, authenticated USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "testi staff write" ON public.testimonials FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER t_testi_updated BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faq public read" ON public.faqs FOR SELECT TO anon, authenticated USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "faq staff write" ON public.faqs FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER t_faq_updated BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  state text,
  area text,
  description text,
  available boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_areas TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_areas TO authenticated;
GRANT ALL ON public.service_areas TO service_role;
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "areas public read" ON public.service_areas FOR SELECT TO anon, authenticated USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "areas staff write" ON public.service_areas FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER t_areas_updated BEFORE UPDATE ON public.service_areas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  company_name text,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  service_label text,
  project_description text NOT NULL,
  project_location text,
  property_type text,
  preferred_date date,
  budget_range text,
  additional_requirements text,
  preferred_contact text,
  consent boolean NOT NULL DEFAULT false,
  status public.quote_status NOT NULL DEFAULT 'new',
  internal_notes text,
  customer_notes text,
  estimated_value numeric,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  follow_up_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quotes_status ON public.quote_requests(status);
CREATE INDEX idx_quotes_created ON public.quote_requests(created_at DESC);
GRANT INSERT ON public.quote_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quotes public insert" ON public.quote_requests FOR INSERT TO anon, authenticated WITH CHECK (consent = true);
CREATE POLICY "quotes staff read" ON public.quote_requests FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "quotes staff update" ON public.quote_requests FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "quotes admin delete" ON public.quote_requests FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER t_quotes_updated BEFORE UPDATE ON public.quote_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.quote_request_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id uuid NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text,
  file_type text,
  file_size integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.quote_request_files TO anon, authenticated;
GRANT SELECT, DELETE ON public.quote_request_files TO authenticated;
GRANT ALL ON public.quote_request_files TO service_role;
ALTER TABLE public.quote_request_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qfiles public insert" ON public.quote_request_files FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "qfiles staff read" ON public.quote_request_files FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "qfiles staff delete" ON public.quote_request_files FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  status public.message_status NOT NULL DEFAULT 'unread',
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_status ON public.contact_messages(status);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg public insert" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "msg staff read" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "msg staff update" ON public.contact_messages FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "msg admin delete" ON public.contact_messages FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER t_msg_updated BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  is_external boolean NOT NULL DEFAULT false,
  visible boolean NOT NULL DEFAULT true,
  protected boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.navigation_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.navigation_items TO authenticated;
GRANT ALL ON public.navigation_items TO service_role;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nav public read" ON public.navigation_items FOR SELECT TO anon, authenticated USING (visible = true OR public.is_staff(auth.uid()));
CREATE POLICY "nav staff write" ON public.navigation_items FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.footer_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  label text NOT NULL,
  url text NOT NULL,
  is_external boolean NOT NULL DEFAULT false,
  visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.footer_links TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.footer_links TO authenticated;
GRANT ALL ON public.footer_links TO service_role;
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "footer public read" ON public.footer_links FOR SELECT TO anon, authenticated USING (visible = true OR public.is_staff(auth.uid()));
CREATE POLICY "footer staff write" ON public.footer_links FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_links TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT ALL ON public.social_links TO service_role;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social public read" ON public.social_links FOR SELECT TO anon, authenticated USING (visible = true OR public.is_staff(auth.uid()));
CREATE POLICY "social staff write" ON public.social_links FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content public read" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "content staff write" ON public.site_content FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER t_content_updated BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text NOT NULL,
  public_url text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  file_size integer,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_library TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media_library TO authenticated;
GRANT ALL ON public.media_library TO service_role;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media public read" ON public.media_library FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "media staff write" ON public.media_library FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  entity text,
  entity_id text,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_logs_created ON public.admin_activity_logs(created_at DESC);
GRANT SELECT, INSERT ON public.admin_activity_logs TO authenticated;
GRANT ALL ON public.admin_activity_logs TO service_role;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs staff read" ON public.admin_activity_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "logs staff insert" ON public.admin_activity_logs FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- storage object policies
CREATE POLICY "media read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
CREATE POLICY "media staff insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "media staff update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "media staff delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "quote upload insert" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'quote-uploads');
CREATE POLICY "quote upload staff read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'quote-uploads' AND public.is_staff(auth.uid()));
CREATE POLICY "quote upload staff delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'quote-uploads' AND public.is_staff(auth.uid()));

-- =============== SEED DATA ===============
INSERT INTO public.company_settings (company_name, tagline, description, phone, whatsapp, email, address, city, state, country, site_title, site_description, footer_description, copyright_text)
VALUES (
  'Zitso Energy',
  'Solar, Painting, Epoxy & Electrical Contracting',
  'We deliver professional solar installations, industrial epoxy flooring, contract painting and electrical works for homes, offices and industrial facilities across Nigeria.',
  '+234 800 000 0000',
  '2348000000000',
  'info@zitsoenergy.com',
  'Ikeja, Lagos, Nigeria',
  'Ikeja',
  'Lagos',
  'Nigeria',
  'Zitso Energy — Solar, Painting & Epoxy Flooring',
  'Professional solar installation, epoxy flooring, contract painting and electrical works across Lagos and Nigeria.',
  'A Nigerian engineering and property-improvement contractor delivering dependable solar, painting, flooring and electrical solutions.',
  '© Zitso Energy. All rights reserved.'
);

INSERT INTO public.business_hours (day_of_week, label, open_time, close_time, is_closed, sort_order) VALUES
 (1,'Monday','08:00','17:00',false,1),
 (2,'Tuesday','08:00','17:00',false,2),
 (3,'Wednesday','08:00','17:00',false,3),
 (4,'Thursday','08:00','17:00',false,4),
 (5,'Friday','08:00','17:00',false,5),
 (6,'Saturday','09:00','14:00',false,6),
 (0,'Sunday',NULL,NULL,true,7);

INSERT INTO public.office_locations (name, address, city, state, country, latitude, longitude, google_maps_url, service_radius_km, is_primary, published)
VALUES ('Head Office','Ikeja, Lagos, Nigeria','Ikeja','Lagos','Nigeria',6.6018,3.3515,'https://www.google.com/maps/search/?api=1&query=6.6018,3.3515',60,true,true);

INSERT INTO public.service_categories (name, slug, sort_order) VALUES
 ('Solar & Energy','solar-energy',1),
 ('Painting','painting',2),
 ('Epoxy Flooring','epoxy-flooring',3),
 ('Electrical','electrical',4),
 ('Construction','construction',5),
 ('Maintenance','maintenance',6);

INSERT INTO public.services (title, slug, category_id, short_description, full_description, features, benefits, process_steps, featured, published, sort_order)
SELECT v.title, v.slug, c.id, v.short_desc, v.full_desc, v.features::jsonb, v.benefits::jsonb,
 '["Site assessment","Design & proposal","Installation","Testing & handover"]'::jsonb,
 v.featured, true, v.sort_order
FROM (VALUES
 ('Solar Installation','solar-installation','solar-energy','Complete solar power systems for homes, offices and industrial facilities.','We design and install complete solar power systems sized to your actual energy demand, with quality panels, inverters and batteries, professional cabling and full commissioning.','["Load audit and system sizing","Tier-1 panels and inverters","Battery and hybrid configurations","Certified installation and commissioning"]','["Reliable power supply","Lower monthly energy cost","Quiet, fuel-free operation","Long-term warranty support"]',true,1),
 ('Solar System Maintenance','solar-system-maintenance','maintenance','Scheduled servicing, diagnostics and repair for existing solar installations.','Keep your solar investment performing. We handle panel cleaning, battery health checks, inverter diagnostics, wiring inspection and fault repair.','["Performance diagnostics","Battery health testing","Panel cleaning","Fault repair"]','["Extended system lifespan","Fewer unexpected failures","Better energy yield"]',false,2),
 ('Inverter Installation','inverter-installation','solar-energy','Inverter and backup power installation with proper load balancing.','Professional inverter supply and installation with correct load distribution, change-over configuration and safety protection.','["Load distribution design","Change-over installation","Battery bank setup","Safety protection"]','["Seamless power backup","Protected appliances","Clean installation"]',true,3),
 ('Solar Panel Installation','solar-panel-installation','solar-energy','Roof and ground-mounted solar panel mounting and wiring.','Structural mounting, orientation optimisation and weatherproof wiring for rooftop and ground-mounted solar arrays.','["Structural mounting","Orientation optimisation","Weatherproof wiring"]','["Maximum energy yield","Safe, durable mounting"]',false,4),
 ('Electrical Works','electrical-works','electrical','Wiring, distribution boards, industrial and commercial electrical installation.','From new wiring to distribution board upgrades and industrial electrical installation, delivered to standard and properly tested.','["New wiring and rewiring","Distribution board upgrades","Industrial installation","Testing and certification"]','["Safe, compliant installations","Reduced fire risk","Documented testing"]',false,5),
 ('Contract Painting','contract-painting','painting','Large-scale painting contracts for estates, offices and industrial facilities.','Managed painting contracts with surface preparation, quality materials, supervised crews and scheduled delivery.','["Surface preparation","Supervised crews","Scheduled delivery","Quality materials"]','["Consistent finish at scale","Predictable timelines","Minimal disruption"]',true,6),
 ('Interior & Exterior Painting','interior-exterior-painting','painting','Premium interior and exterior finishes for homes and commercial buildings.','Careful preparation, filling, priming and finishing with durable interior and weather-resistant exterior coatings.','["Crack filling and priming","Texture and feature walls","Weather-resistant exteriors"]','["Clean, premium finish","Long-lasting protection"]',false,7),
 ('Epoxy Flooring','epoxy-flooring','epoxy-flooring','Seamless, durable epoxy floor coatings for commercial and residential spaces.','Seamless epoxy floor systems with proper substrate preparation, moisture control and hard-wearing topcoats.','["Substrate grinding and repair","Moisture control","Anti-slip options","Seamless finish"]','["Easy to clean","Highly durable","Modern appearance"]',true,8),
 ('Industrial Epoxy Flooring','industrial-epoxy-flooring','epoxy-flooring','Heavy-duty epoxy systems for factories, warehouses and workshops.','Heavy-duty epoxy and polyurethane systems engineered for forklift traffic, chemical exposure and washdown environments.','["Heavy-duty build coats","Chemical resistance","Line marking","Anti-slip aggregates"]','["Withstands heavy traffic","Safer work environment","Low maintenance"]',false,9),
 ('Building & Property Improvement','building-property-improvement','construction','Renovation, remedial works and general property upgrade services.','General building, renovation and remedial works to upgrade residential and commercial property.','["Renovation and remedial works","Partitioning and finishing","Project supervision"]','["One accountable contractor","Clean project delivery"]',false,10)
) AS v(title, slug, cat_slug, short_desc, full_desc, features, benefits, featured, sort_order)
JOIN public.service_categories c ON c.slug = v.cat_slug;

INSERT INTO public.projects (title, slug, category_id, location, city, state, client_type, description, scope_of_work, outcome, featured, published, sort_order, project_date)
SELECT v.title, v.slug, c.id, v.location, v.city, v.state, v.client_type, v.description, v.scope, v.outcome, v.featured, true, v.sort_order, v.pdate::date
FROM (VALUES
 ('5kW Residential Solar Installation','5kw-residential-solar-installation','solar-energy','Lekki','Lekki','Lagos','Residential','A complete 5kW hybrid solar system installed for a family home requiring uninterrupted power.','Energy audit, hybrid inverter installation, lithium battery bank, rooftop array mounting and commissioning.','The household now runs essential and comfort loads without generator dependence.',true,1,'2025-03-12'),
 ('Commercial Epoxy Floor — Warehouse','commercial-epoxy-floor-warehouse','epoxy-flooring','Ikeja','Ikeja','Lagos','Commercial','Heavy-duty epoxy floor system installed across a distribution warehouse.','Substrate grinding, crack repair, moisture barrier, build coats, line marking.','A seamless, forklift-rated floor that is easy to clean and clearly zoned.',true,2,'2025-05-20'),
 ('Residential Exterior Repainting','residential-exterior-repainting','painting','Ajah','Ajah','Lagos','Residential','Full exterior repaint of a duplex including surface repair and weatherproof coating.','Pressure washing, crack filling, priming, two-coat weather-resistant finish.','Restored kerb appeal with a finish built for coastal weather.',false,3,'2025-06-02'),
 ('Office Solar Backup System','office-solar-backup-system','solar-energy','Central Business District','Abuja','FCT','Commercial','Solar backup system supporting critical office loads during grid outages.','Load segregation, inverter and battery installation, distribution board works.','Uninterrupted operation for workstations, servers and lighting.',false,4,'2025-07-15')
) AS v(title, slug, cat_slug, location, city, state, client_type, description, scope, outcome, featured, sort_order, pdate)
JOIN public.service_categories c ON c.slug = v.cat_slug;

INSERT INTO public.faqs (question, answer, category, sort_order, published) VALUES
 ('How do I request a quotation?','Use the Request a Quote page, describe your project and attach any site photos or drawings. Our team reviews the request and responds with next steps.','General',1,true),
 ('Do you carry out site inspections?','Yes. For most solar, flooring and painting projects we schedule a site inspection before issuing a firm quotation.','General',2,true),
 ('Which areas do you cover?','Our published service areas are listed on the Locations page. If your location is not listed, contact us to confirm availability.','General',3,true),
 ('How long does a solar installation take?','Timelines depend on system size and site conditions. Most residential installations are completed within a few working days after materials are on site.','Solar',4,true),
 ('Is epoxy flooring suitable for my space?','Epoxy suits warehouses, workshops, showrooms, garages and many residential spaces. Suitability depends on substrate condition and moisture levels, which we assess on site.','Flooring',5,true);

INSERT INTO public.service_areas (city, state, area, description, priority, published) VALUES
 ('Lagos','Lagos','Ikeja','Head office coverage area with fastest response times.',1,true),
 ('Lagos','Lagos','Lekki','Residential and commercial coverage.',2,true),
 ('Lagos','Lagos','Ajah','Residential coverage.',3,true),
 ('Lagos','Lagos','Victoria Island','Commercial and corporate coverage.',4,true),
 ('Lagos','Lagos','Surulere','Residential and small commercial coverage.',5,true),
 ('Abuja','FCT','Central Business District','Project-based coverage.',6,true);

-- Testimonials are intentionally left empty until real customer feedback is entered by an administrator.

INSERT INTO public.navigation_items (label, url, sort_order, protected) VALUES
 ('Home','/',1,true),
 ('Services','/services',2,true),
 ('Projects','/projects',3,false),
 ('About','/about',4,false),
 ('Locations','/locations',5,false),
 ('FAQ','/faq',6,false),
 ('Contact','/contact',7,true);

INSERT INTO public.footer_links (section, label, url, sort_order) VALUES
 ('Quick Links','About Us','/about',1),
 ('Quick Links','Projects','/projects',2),
 ('Quick Links','Service Areas','/locations',3),
 ('Quick Links','FAQ','/faq',4),
 ('Useful Links','Request a Quote','/request-quote',1),
 ('Useful Links','Contact','/contact',2),
 ('Useful Links','Privacy Policy','/privacy',3),
 ('Useful Links','Terms & Conditions','/terms',4);

INSERT INTO public.social_links (platform, url, sort_order) VALUES
 ('facebook','https://facebook.com',1),
 ('instagram','https://instagram.com',2),
 ('linkedin','https://linkedin.com',3);

INSERT INTO public.site_content (key, value) VALUES
 ('homepage_hero','{"eyebrow":"Licensed Nigerian Contracting Company","headline":"Professional Solar, Painting & Flooring Solutions","subheadline":"We install, maintain and finish the systems and surfaces that keep homes, offices and industrial facilities running — delivered by supervised crews to a documented standard.","primary_cta":"Request a Quote","primary_cta_url":"/request-quote","secondary_cta":"Explore Our Services","secondary_cta_url":"/services","image_url":"/images/solar-installation.webp","trust_points":["Supervised in-house crews","Documented testing & handover","Nationwide project delivery"]}'::jsonb),
 ('homepage_stats','{"items":[{"label":"Projects delivered","value":"25+"},{"label":"Years of experience","value":"5+"},{"label":"Service areas","value":"6+"},{"label":"Repeat clients","value":"80%"}],"note":"Starter figures — edit these in the admin dashboard."}'::jsonb),
 ('homepage_why','{"title":"Why clients choose us","items":[{"title":"Technical competence","body":"Systems are sized, installed and tested by people who understand the engineering, not just the fitting."},{"title":"Transparent quotations","body":"Clear scope, clear materials, clear pricing. No surprises midway through the project."},{"title":"Supervised delivery","body":"Every project has an accountable supervisor from mobilisation to handover."},{"title":"Aftercare","body":"Maintenance and support after handover, not just at the point of sale."}]}'::jsonb),
 ('homepage_process','{"title":"How we work","items":[{"title":"Consultation","body":"We discuss your requirement and constraints."},{"title":"Site assessment","body":"We inspect and measure before quoting."},{"title":"Proposal","body":"You receive a detailed scope and price."},{"title":"Execution","body":"Supervised crews deliver to schedule."},{"title":"Handover","body":"Testing, documentation and aftercare."}]}'::jsonb),
 ('homepage_cta','{"title":"Ready to start your project?","body":"Tell us what you need and we will respond with clear next steps.","cta":"Request a Quote","cta_url":"/request-quote"}'::jsonb),
 ('page_about','{"title":"About the company","body":"We are a Nigerian engineering and property-improvement contractor delivering solar energy, electrical works, contract painting and epoxy flooring. Update this text from the admin dashboard to describe your company history, capability and team."}'::jsonb),
 ('page_privacy','{"title":"Privacy Policy","body":"This page is managed from the admin dashboard. Replace this text with your organisation''s privacy policy covering what customer data you collect, how quotation and contact submissions are stored, how long records are kept, and how customers can request deletion."}'::jsonb),
 ('page_terms','{"title":"Terms & Conditions","body":"This page is managed from the admin dashboard. Replace this text with your organisation''s terms covering quotations, project scope, payment terms, warranties, site access and liability."}'::jsonb);


-- =============== ZITSO ENERGY STARTER MEDIA ===============
-- Local WebP assets are shipped in public/images so the starter content never depends on remote image hosts.
UPDATE public.services SET hero_image_url = '/images/solar-installation.webp'
WHERE slug IN ('solar-installation','solar-system-maintenance','solar-panel-installation');
UPDATE public.services SET hero_image_url = '/images/inverter-installation.webp'
WHERE slug = 'inverter-installation';
UPDATE public.services SET hero_image_url = '/images/electrical-works.webp'
WHERE slug = 'electrical-works';
UPDATE public.services SET hero_image_url = '/images/painting-services.webp'
WHERE slug IN ('contract-painting','interior-exterior-painting');
UPDATE public.services SET hero_image_url = '/images/epoxy-flooring.webp'
WHERE slug IN ('epoxy-flooring','industrial-epoxy-flooring');
UPDATE public.services SET hero_image_url = '/images/property-improvement.webp'
WHERE slug = 'building-property-improvement';

UPDATE public.projects SET hero_image_url = '/images/solar-installation.webp'
WHERE slug IN ('5kw-residential-solar-installation','office-solar-backup-system');
UPDATE public.projects SET hero_image_url = '/images/epoxy-flooring.webp'
WHERE slug = 'commercial-epoxy-floor-warehouse';
UPDATE public.projects SET hero_image_url = '/images/painting-services.webp'
WHERE slug = 'residential-exterior-repainting';

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
