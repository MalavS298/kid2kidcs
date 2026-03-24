ALTER TABLE public.meetings ADD COLUMN teacher_joined boolean NOT NULL DEFAULT false;
ALTER TABLE public.meetings ADD COLUMN student_joined boolean NOT NULL DEFAULT false;