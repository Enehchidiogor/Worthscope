
-- ============== parent_invites ==============
CREATE TABLE public.parent_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  parent_email text,
  parent_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '6 months'),
  revoked_at timestamptz,
  last_viewed_at timestamptz
);

CREATE INDEX parent_invites_student_idx ON public.parent_invites(student_user_id);
CREATE INDEX parent_invites_token_idx ON public.parent_invites(token);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_invites TO authenticated;
GRANT ALL ON public.parent_invites TO service_role;

ALTER TABLE public.parent_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view their own invites"
  ON public.parent_invites FOR SELECT
  TO authenticated
  USING (auth.uid() = student_user_id);

CREATE POLICY "Students create their own invites"
  ON public.parent_invites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_user_id);

CREATE POLICY "Students update their own invites"
  ON public.parent_invites FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_user_id)
  WITH CHECK (auth.uid() = student_user_id);

CREATE POLICY "Students delete their own invites"
  ON public.parent_invites FOR DELETE
  TO authenticated
  USING (auth.uid() = student_user_id);

-- ============== student_state ==============
CREATE TABLE public.student_state (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  chosen_career jsonb,
  assessment_results jsonb,
  signup_date date,
  current_streak integer NOT NULL DEFAULT 0,
  last_visit_date date,
  skills jsonb NOT NULL DEFAULT '{}'::jsonb,
  roadmap_done jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_missions jsonb NOT NULL DEFAULT '[]'::jsonb,
  active_career_module text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_state TO authenticated;
GRANT ALL ON public.student_state TO service_role;

ALTER TABLE public.student_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own state"
  ON public.student_state FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own state"
  ON public.student_state FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own state"
  ON public.student_state FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER student_state_updated_at
  BEFORE UPDATE ON public.student_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
