-- Create storage bucket for notebook files
INSERT INTO storage.buckets (id, name, public) VALUES ('notebooks', 'notebooks', true);

-- Allow authenticated users to upload notebooks
CREATE POLICY "Teachers can upload notebooks" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'notebooks');

-- Allow anyone to read notebooks (students need to view them)
CREATE POLICY "Anyone can read notebooks" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'notebooks');

-- Allow authenticated users to delete notebooks
CREATE POLICY "Teachers can delete notebooks" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'notebooks');

-- Allow authenticated users to update notebooks
CREATE POLICY "Teachers can update notebooks" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'notebooks');