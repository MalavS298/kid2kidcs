
-- Applications table for both students and volunteers
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('student', 'volunteer')),
  name text NOT NULL,
  age integer NOT NULL,
  email text NOT NULL,
  school text,
  prior_experience text,
  why_join text,
  acknowledge_true_info boolean NOT NULL DEFAULT false,
  acknowledge_commitment boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert applications" ON public.applications FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read applications" ON public.applications FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update applications" ON public.applications FOR UPDATE TO public USING (true);

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
