CREATE TABLE public.pairings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_name text NOT NULL,
  student_name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pairings TO anon, authenticated;
GRANT ALL ON public.pairings TO service_role;

ALTER TABLE public.pairings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pairings" ON public.pairings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert pairings" ON public.pairings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update pairings" ON public.pairings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete pairings" ON public.pairings FOR DELETE USING (true);

CREATE TRIGGER update_pairings_updated_at
BEFORE UPDATE ON public.pairings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();