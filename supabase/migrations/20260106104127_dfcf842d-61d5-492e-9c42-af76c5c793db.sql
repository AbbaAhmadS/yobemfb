-- Add storage policies for authenticated users to upload files

-- Passport photos bucket policies
CREATE POLICY "Authenticated users can upload passport photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'passport-photos');

CREATE POLICY "Authenticated users can view passport photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'passport-photos');

CREATE POLICY "Authenticated users can update their passport photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'passport-photos');

CREATE POLICY "Authenticated users can delete their passport photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'passport-photos');

-- Documents bucket policies
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can update their documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can delete their documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents');

-- Signatures bucket policies
CREATE POLICY "Authenticated users can upload signatures"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Authenticated users can view signatures"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'signatures');

CREATE POLICY "Authenticated users can update their signatures"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'signatures');

CREATE POLICY "Authenticated users can delete their signatures"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'signatures');

-- Loan uploads bucket policies
CREATE POLICY "Authenticated users can upload loan documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'loan-uploads');

CREATE POLICY "Authenticated users can view loan documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'loan-uploads');

CREATE POLICY "Authenticated users can update their loan documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'loan-uploads');

CREATE POLICY "Authenticated users can delete their loan documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'loan-uploads');