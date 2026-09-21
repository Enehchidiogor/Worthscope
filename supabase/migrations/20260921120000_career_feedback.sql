-- ============================================================================
-- Tester feedback on career predictions ("Was Koko's read right?").
-- Anyone signed in can submit; each user can read only their own rows. The team
-- reads all rows from the Supabase dashboard (service role).
-- Idempotent: safe to re-run.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.career_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  verdict text NOT NULL CHECK (verdict IN ('spot-on', 'partly', 'not-really')),
  top_pick text,
  directions jsonb,
  expected_career text,
  comment text,
  confidence text,
  profile jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS career_feedback_created_idx ON public.career_feedback (created_at DESC);

GRANT SELECT, INSERT ON public.career_feedback TO authenticated;
GRANT ALL ON public.career_feedback TO service_role;
ALTER TABLE public.career_feedback ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'career_feedback' AND policyname = 'feedback self insert') THEN
    CREATE POLICY "feedback self insert" ON public.career_feedback FOR INSERT TO authenticated WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'career_feedback' AND policyname = 'feedback self read') THEN
    CREATE POLICY "feedback self read" ON public.career_feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
