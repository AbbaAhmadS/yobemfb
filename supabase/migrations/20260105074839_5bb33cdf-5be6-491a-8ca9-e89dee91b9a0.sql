-- Create a public storage bucket for loan application uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('loan-uploads', 'loan-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the loan-uploads bucket
CREATE POLICY "Anyone can view loan uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'loan-uploads');

CREATE POLICY "Authenticated users can upload to loan-uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'loan-uploads' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'loan-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'loan-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Admins can manage all uploads"
ON storage.objects FOR ALL
USING (
  bucket_id = 'loan-uploads' 
  AND is_admin(auth.uid())
);