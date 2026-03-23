
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text NOT NULL,
  sender_role text NOT NULL,
  receiver_name text NOT NULL,
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert messages"
  ON public.messages FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read messages"
  ON public.messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update messages"
  ON public.messages FOR UPDATE
  TO public
  USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
