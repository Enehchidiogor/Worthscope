-- ============================================================================
-- Admin role + admin read-all access, and database-backed Live Classes.
--
-- After this runs, to make yourself an admin, run once (as the project owner,
-- in the SQL editor):
--   UPDATE public.profiles SET role = 'admin' WHERE id = '<your auth.users id>';
-- (Find your id under Authentication → Users in the Supabase dashboard.)
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ---------- Admin role ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role text NOT NULL DEFAULT 'user';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- SECURITY DEFINER so this can be called from inside RLS policies on
-- `profiles` itself without recursing back into those same policies.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()), false);
$$;

-- Admin can read every row on the tables that matter for the dashboard.
-- (Existing self-only policies are untouched — this only ADDS visibility.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'admin read all profiles') THEN
    CREATE POLICY "admin read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_lessons' AND policyname = 'admin read all lessons') THEN
    CREATE POLICY "admin read all lessons" ON public.mission_lessons FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_projects' AND policyname = 'admin read all projects') THEN
    CREATE POLICY "admin read all projects" ON public.mission_projects FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'career_feedback' AND policyname = 'admin read all feedback') THEN
    CREATE POLICY "admin read all feedback" ON public.career_feedback FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'career_intelligence_profiles')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'career_intelligence_profiles' AND policyname = 'admin read all ci profiles') THEN
    CREATE POLICY "admin read all ci profiles" ON public.career_intelligence_profiles FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'discovery_sessions')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'discovery_sessions' AND policyname = 'admin read all discovery sessions') THEN
    CREATE POLICY "admin read all discovery sessions" ON public.discovery_sessions FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
END $$;

-- ---------- Live Classes (replaces the hardcoded src/lib/liveClasses.ts array) ----------
CREATE TABLE IF NOT EXISTS public.live_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  format text NOT NULL CHECK (format IN ('online', 'physical')),
  host text NOT NULL DEFAULT 'WorthScope',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  location text,
  join_url text,
  career_tags text[] NOT NULL DEFAULT '{}',
  apply_url text,
  apply_email text,
  seats_note text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS live_classes_starts_at_idx ON public.live_classes (starts_at);

GRANT SELECT ON public.live_classes TO authenticated;
GRANT ALL ON public.live_classes TO service_role;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'live_classes' AND policyname = 'live classes public read') THEN
    CREATE POLICY "live classes public read" ON public.live_classes FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'live_classes' AND policyname = 'live classes admin write') THEN
    CREATE POLICY "live classes admin write" ON public.live_classes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'live_classes_updated_at') THEN
    CREATE TRIGGER live_classes_updated_at BEFORE UPDATE ON public.live_classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ---------- Live Class applications ----------
CREATE TABLE IF NOT EXISTS public.live_class_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  applicant_name text,
  applicant_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS live_class_applications_class_idx ON public.live_class_applications (class_id, created_at DESC);

GRANT SELECT, INSERT ON public.live_class_applications TO authenticated;
GRANT ALL ON public.live_class_applications TO service_role;
ALTER TABLE public.live_class_applications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'live_class_applications' AND policyname = 'applications self insert') THEN
    CREATE POLICY "applications self insert" ON public.live_class_applications FOR INSERT TO authenticated WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'live_class_applications' AND policyname = 'applications self read') THEN
    CREATE POLICY "applications self read" ON public.live_class_applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'live_class_applications' AND policyname = 'admin read all applications') THEN
    CREATE POLICY "admin read all applications" ON public.live_class_applications FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
END $$;
