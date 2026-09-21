-- ============================================================================
-- Curriculum reference — source-of-truth curriculum per career path.
-- Populated once by scripts/ingest_curriculum.ts from Worthscope_FEED.pdf.
-- Koko (koko-chat edge function) reads this to teach from the real curriculum
-- instead of generic LLM knowledge.
-- Idempotent: uses IF NOT EXISTS / guards so it is safe to re-run.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.curriculum_reference (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_slug  text NOT NULL UNIQUE,        -- e.g. "frontend-developer"
  career_path  text NOT NULL,               -- display name, e.g. "Frontend Developer"
  full_content text NOT NULL,               -- complete extracted curriculum text
  sections     jsonb,                        -- optional structured breakdown (1.1, 2.1, ...)
  is_complete  boolean NOT NULL DEFAULT true,-- false for careers not yet in the PDF
  source_pages text,                         -- e.g. "1-46" (traceability)
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_curriculum_career_slug
  ON public.curriculum_reference (career_slug);

GRANT SELECT ON public.curriculum_reference TO authenticated;
GRANT ALL    ON public.curriculum_reference TO service_role;
ALTER TABLE public.curriculum_reference ENABLE ROW LEVEL SECURITY;

-- Read-only reference data: any authenticated user may read it.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'curriculum_reference' AND policyname = 'curriculum read'
  ) THEN
    CREATE POLICY "curriculum read"
      ON public.curriculum_reference FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
