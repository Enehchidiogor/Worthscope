
-- 1) Roles infrastructure
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2) Curated jobs table
CREATE TABLE IF NOT EXISTS public.jobs_curated (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  company_logo_url TEXT,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL,
  career_paths TEXT[] NOT NULL DEFAULT '{}',
  salary_range TEXT,
  description TEXT NOT NULL,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  apply_url TEXT NOT NULL,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.jobs_curated TO authenticated;
GRANT ALL ON public.jobs_curated TO service_role;

ALTER TABLE public.jobs_curated ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read active jobs" ON public.jobs_curated
  FOR SELECT TO authenticated USING (is_active = TRUE);

CREATE POLICY "admins manage jobs" ON public.jobs_curated
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_jobs_curated_updated_at
  BEFORE UPDATE ON public.jobs_curated
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Seed jobs
INSERT INTO public.jobs_curated (title, company, location, job_type, career_paths, salary_range, description, requirements, apply_url)
VALUES
('Product Designer', 'Flutterwave', 'Lagos, Nigeria', 'full-time',
  ARRAY['creative','design','product-designer','ui-ux'],
  '₦200k–₦350k/month',
  'Design intuitive product experiences for Flutterwave''s payment platform. Collaborate with PMs and engineers to ship features that millions of users rely on daily.',
  ARRAY['UI Design','Prototyping','User Research','Design Thinking','Problem Solving'],
  'https://flutterwave.com/careers'),
('UI/UX Design Intern', 'Paystack', 'Lagos, Nigeria', 'internship',
  ARRAY['creative','design','ui-ux','product-designer'],
  '₦80k–₦120k/month',
  'Join Paystack''s design team as an intern. Help shape merchant tools and dashboards used across Africa.',
  ARRAY['UI Design','Communication','Prototyping','Design Thinking'],
  'https://paystack.com/careers'),
('Frontend Developer Intern', 'Kuda Bank', 'Lagos, Nigeria', 'internship',
  ARRAY['tech','frontend','software-engineer','developer'],
  '₦60k–₦100k/month',
  'Build features for Kuda''s mobile-first banking experience. Work in React Native alongside senior engineers.',
  ARRAY['Technical Tools','Problem Solving','Systems Thinking','Communication'],
  'https://kuda.com/careers'),
('Junior Product Manager', 'Cowrywise', 'Remote', 'remote',
  ARRAY['business','product-manager','strategy'],
  '₦180k–₦280k/month',
  'Own product discovery and delivery for one of Cowrywise''s investment surfaces. Partner with design, engineering and growth.',
  ARRAY['Strategic Thinking','Communication','Research','Data Literacy','Problem Solving'],
  'https://cowrywise.com/careers'),
('Junior Content Writer', 'TechCabal', 'Remote', 'remote',
  ARRAY['communication','writing','content','journalism'],
  '₦150k–₦220k/month',
  'Write clear, engaging stories about Africa''s tech ecosystem. Cover product launches, funding rounds and founder interviews.',
  ARRAY['Writing','Storytelling','Research','Media Strategy','Communication'],
  'https://techcabal.com/jobs');
