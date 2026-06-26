
DROP POLICY IF EXISTS "Teachers can upload notebooks" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete notebooks" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read notebooks" ON storage.objects;

CREATE POLICY "Anyone can read notebooks" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'notebooks');

CREATE POLICY "Anyone can upload notebooks" ON storage.objects
  FOR INSERT TO public WITH CHECK (bucket_id = 'notebooks');

CREATE POLICY "Anyone can update notebooks" ON storage.objects
  FOR UPDATE TO public USING (bucket_id = 'notebooks') WITH CHECK (bucket_id = 'notebooks');

CREATE POLICY "Anyone can delete notebooks" ON storage.objects
  FOR DELETE TO public USING (bucket_id = 'notebooks');
