CREATE TABLE IF NOT EXISTS public.parent_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
  student_email text NOT NULL,
  parent_name text NOT NULL,
  parent_email text NOT NULL,
  parent_phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.parent_contacts TO service_role;
ALTER TABLE public.parent_contacts ENABLE ROW LEVEL SECURITY;
