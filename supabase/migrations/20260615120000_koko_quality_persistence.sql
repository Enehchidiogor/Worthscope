-- ============================================================================
-- Koko quality & persistence fixes
--  - mission_lessons.status        (not_started | in_progress | completed | skipped)
--  - mission_projects.attempt_count
--  - profiles.last_welcomed_at     (once-per-day welcome gating)
--  - koko_chat_messages            (persistent Koko chat history)
-- Idempotent: uses IF NOT EXISTS / guards so it is safe to re-run.
-- ============================================================================

-- FIX 1: mission lesson status + project attempt tracking
ALTER TABLE public.mission_lessons
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'not_started';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mission_lessons_status_check'
  ) THEN
    ALTER TABLE public.mission_lessons
      ADD CONSTRAINT mission_lessons_status_check
      CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped'));
  END IF;
END $$;

ALTER TABLE public.mission_projects
  ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 0;

-- FIX 2: once-per-day welcome gating
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_welcomed_at timestamptz;

-- FIX 3: persistent Koko chat history
CREATE TABLE IF NOT EXISTS public.koko_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context text NOT NULL,                 -- 'dashboard' or 'mission:<mission_id>'
  role text NOT NULL CHECK (role IN ('user', 'koko')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS koko_chat_messages_user_context_idx
  ON public.koko_chat_messages (user_id, context, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.koko_chat_messages TO authenticated;
GRANT ALL ON public.koko_chat_messages TO service_role;
ALTER TABLE public.koko_chat_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'koko_chat_messages' AND policyname = 'chat self read') THEN
    CREATE POLICY "chat self read"   ON public.koko_chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'koko_chat_messages' AND policyname = 'chat self insert') THEN
    CREATE POLICY "chat self insert" ON public.koko_chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'koko_chat_messages' AND policyname = 'chat self delete') THEN
    CREATE POLICY "chat self delete" ON public.koko_chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
