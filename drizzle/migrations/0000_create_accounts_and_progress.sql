-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- user_progress
CREATE TABLE public.user_progress (
  user_id uuid PRIMARY KEY,
  xp integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_progress TO authenticated;
GRANT ALL ON public.user_progress TO service_role;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress select" ON public.user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own progress insert" ON public.user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own progress update" ON public.user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- completed_drills
CREATE TABLE public.completed_drills (
  user_id uuid NOT NULL,
  drill_id text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, drill_id)
);
GRANT SELECT, INSERT, DELETE ON public.completed_drills TO authenticated;
GRANT ALL ON public.completed_drills TO service_role;
ALTER TABLE public.completed_drills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own drills select" ON public.completed_drills FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own drills insert" ON public.completed_drills FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own drills delete" ON public.completed_drills FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- practice_sessions
CREATE TABLE public.practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date text NOT NULL,
  minutes numeric NOT NULL DEFAULT 0,
  lesson_id text NOT NULL,
  accuracy integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX practice_sessions_user_idx ON public.practice_sessions (user_id, date);
GRANT SELECT, INSERT ON public.practice_sessions TO authenticated;
GRANT ALL ON public.practice_sessions TO service_role;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions select" ON public.practice_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own sessions insert" ON public.practice_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- auto-create profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'display_name', ''),
             NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
             NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
             split_part(COALESCE(NEW.email, 'player'), '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_progress (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();