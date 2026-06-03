
-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  age integer,
  education_level text,
  career_path text,
  overall_progress integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self read"   ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, age, education_level)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',
    NULLIF(NEW.raw_user_meta_data ->> 'age','')::integer,
    NEW.raw_user_meta_data ->> 'education_level'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- mission_lessons
CREATE TABLE public.mission_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id text NOT NULL,
  mission_title text,
  lesson_md text,
  completed_at timestamptz,
  learning_signal text NOT NULL DEFAULT 'on track',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_lessons TO authenticated;
GRANT ALL ON public.mission_lessons TO service_role;
ALTER TABLE public.mission_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons self read"   ON public.mission_lessons FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "lessons self insert" ON public.mission_lessons FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lessons self update" ON public.mission_lessons FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lessons self delete" ON public.mission_lessons FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER mission_lessons_updated_at BEFORE UPDATE ON public.mission_lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- mission_projects
CREATE TABLE public.mission_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id text NOT NULL,
  brief_md text,
  submission text,
  assessment_md text,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_projects TO authenticated;
GRANT ALL ON public.mission_projects TO service_role;
ALTER TABLE public.mission_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects self read"   ON public.mission_projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "projects self insert" ON public.mission_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects self update" ON public.mission_projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects self delete" ON public.mission_projects FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER mission_projects_updated_at BEFORE UPDATE ON public.mission_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
