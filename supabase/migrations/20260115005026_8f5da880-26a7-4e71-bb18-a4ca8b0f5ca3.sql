-- Drop any conflicting policies first
DROP POLICY IF EXISTS "Admins can view all passport photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view passport photos" ON storage.objects;
DROP POLICY IF EXISTS "Operations can view passport photos" ON storage.objects;
DROP POLICY IF EXISTS "Credit can view passport photos" ON storage.objects;

-- Create policy for admins to view ALL passport photos
CREATE POLICY "Admins can view all passport photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'passport-photos' 
  AND is_admin(auth.uid())
);

-- Create policy for admins to view ALL signatures
DROP POLICY IF EXISTS "Admins can view all signatures" ON storage.objects;
CREATE POLICY "Admins can view all signatures"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'signatures' 
  AND is_admin(auth.uid())
);

-- Create policy for admins to view ALL loan uploads
DROP POLICY IF EXISTS "Admins can view all loan uploads" ON storage.objects;
CREATE POLICY "Admins can view all loan uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'loan-uploads' 
  AND is_admin(auth.uid())
);

-- Create policy for admins to view ALL documents
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND is_admin(auth.uid())
);