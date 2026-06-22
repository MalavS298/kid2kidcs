
CREATE TABLE public.sandbox_snippets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  teacher_name TEXT,
  title TEXT NOT NULL DEFAULT 'Untitled',
  code TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sandbox_snippets TO anon, authenticated;
GRANT ALL ON public.sandbox_snippets TO service_role;

ALTER TABLE public.sandbox_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sandbox snippets" ON public.sandbox_snippets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sandbox snippets" ON public.sandbox_snippets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sandbox snippets" ON public.sandbox_snippets FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete sandbox snippets" ON public.sandbox_snippets FOR DELETE USING (true);

CREATE TRIGGER update_sandbox_snippets_updated_at
BEFORE UPDATE ON public.sandbox_snippets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_sandbox_snippets_student ON public.sandbox_snippets(student_name);
CREATE INDEX idx_sandbox_snippets_teacher ON public.sandbox_snippets(teacher_name);
