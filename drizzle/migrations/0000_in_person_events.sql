CREATE TABLE public.in_person_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.in_person_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.in_person_events TO authenticated;
GRANT ALL ON public.in_person_events TO service_role;

ALTER TABLE public.in_person_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read in person events" ON public.in_person_events FOR SELECT USING (true);
CREATE POLICY "Anyone can insert in person events" ON public.in_person_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update in person events" ON public.in_person_events FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete in person events" ON public.in_person_events FOR DELETE USING (true);

CREATE TRIGGER update_in_person_events_updated_at
BEFORE UPDATE ON public.in_person_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.in_person_events(id);
ALTER TABLE public.sandbox_snippets ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.in_person_events(id);
CREATE INDEX IF NOT EXISTS sandbox_snippets_event_id_idx ON public.sandbox_snippets(event_id);
