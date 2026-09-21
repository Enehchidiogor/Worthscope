-- ============================================================================
-- Koko discovery sessions — records the outcome of a chat or voice
-- career-discovery conversation (src/pages/DiscoverChat.tsx / DiscoverVoice.tsx).
-- Idempotent: uses IF NOT EXISTS / guards so it is safe to re-run.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.discovery_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('voice', 'chat')),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  answers jsonb,
  emotional_notes text,               -- voice-only: tone/enthusiasm Koko picked up on
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS discovery_sessions_user_idx
  ON public.discovery_sessions (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discovery_sessions TO authenticated;
GRANT ALL ON public.discovery_sessions TO service_role;
ALTER TABLE public.discovery_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'discovery_sessions' AND policyname = 'discovery self read') THEN
    CREATE POLICY "discovery self read"   ON public.discovery_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'discovery_sessions' AND policyname = 'discovery self insert') THEN
    CREATE POLICY "discovery self insert" ON public.discovery_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'discovery_sessions' AND policyname = 'discovery self update') THEN
    CREATE POLICY "discovery self update" ON public.discovery_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
