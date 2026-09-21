-- ============================================================================
-- Career Intelligence profiles — the structured signals collected by the
-- new post-sign-in onboarding flow (src/pages/Discover.tsx). One row per
-- user. Kept separate from student_state/koko_roadmaps/discovery_sessions,
-- which the existing voice-conversation and static-assessment paths still
-- use unchanged.
-- Idempotent: uses IF NOT EXISTS / guards so it is safe to re-run.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.career_intelligence_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  career_intent text,
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  prediction jsonb,
  assessment_status text NOT NULL DEFAULT 'in_progress' CHECK (assessment_status IN ('in_progress', 'completed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS career_intelligence_profiles_user_idx
  ON public.career_intelligence_profiles (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_intelligence_profiles TO authenticated;
GRANT ALL ON public.career_intelligence_profiles TO service_role;
ALTER TABLE public.career_intelligence_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'career_intelligence_profiles' AND policyname = 'ci profile self read') THEN
    CREATE POLICY "ci profile self read"   ON public.career_intelligence_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'career_intelligence_profiles' AND policyname = 'ci profile self insert') THEN
    CREATE POLICY "ci profile self insert" ON public.career_intelligence_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'career_intelligence_profiles' AND policyname = 'ci profile self update') THEN
    CREATE POLICY "ci profile self update" ON public.career_intelligence_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'career_intelligence_profiles_updated_at') THEN
    CREATE TRIGGER career_intelligence_profiles_updated_at
      BEFORE UPDATE ON public.career_intelligence_profiles
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
