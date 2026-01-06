import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSignedUrlOptions {
  bucket?: string;
  expiresIn?: number; // seconds, default 1 hour
}

/**
 * Hook to generate signed URLs for private storage buckets.
 * Converts stored file paths to signed URLs for display.
 * 
 * @param storedPath - The stored file path or URL
 * @param options - Configuration options
 * @returns { signedUrl, isLoading, error }
 */
export function useSignedUrl(
  storedPath: string | undefined | null,
  options: UseSignedUrlOptions = {}
) {
  const { bucket = 'loan-uploads', expiresIn = 3600 } = options;
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storedPath) {
      setSignedUrl(null);
      return;
    }

    // If it's already a signed URL or external URL, use it directly
    if (storedPath.includes('token=') || !storedPath.includes('supabase')) {
      // Check if it's a public URL from our supabase (old format)
      if (storedPath.includes('/storage/v1/object/public/')) {
        // Extract the path from the public URL and create signed URL
        const match = storedPath.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
        if (match) {
          const [, extractedBucket, filePath] = match;
          generateSignedUrl(extractedBucket, filePath);
          return;
        }
      }
      // External URL or already signed, use as-is
      setSignedUrl(storedPath);
      return;
    }

    // Extract path from Supabase URL if it's a full URL
    if (storedPath.includes('/storage/v1/object/')) {
      const match = storedPath.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)/);
      if (match) {
        const [, extractedBucket, filePath] = match;
        generateSignedUrl(extractedBucket, filePath);
        return;
      }
    }

    // Assume it's a direct path
    generateSignedUrl(bucket, storedPath);
  }, [storedPath, bucket, expiresIn]);

  const generateSignedUrl = async (targetBucket: string, filePath: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signError } = await supabase.storage
        .from(targetBucket)
        .createSignedUrl(filePath, expiresIn);

      if (signError) {
        console.error('Error creating signed URL:', signError);
        setError(signError.message);
        // Fallback to the stored path (may not work but better than nothing)
        setSignedUrl(storedPath || null);
      } else {
        setSignedUrl(data.signedUrl);
      }
    } catch (err) {
      console.error('Failed to generate signed URL:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSignedUrl(storedPath || null);
    } finally {
      setIsLoading(false);
    }
  };

  return { signedUrl, isLoading, error };
}

/**
 * Utility function to generate signed URL on-demand (for use outside React components)
 */
export async function getSignedUrl(
  storedPath: string,
  bucket: string = 'loan-uploads',
  expiresIn: number = 3600
): Promise<string | null> {
  if (!storedPath) return null;

  // If it's already a signed URL or external URL, return as-is
  if (storedPath.includes('token=') || !storedPath.includes('supabase')) {
    // Check if it's a public URL from our supabase (old format)
    if (storedPath.includes('/storage/v1/object/public/')) {
      const match = storedPath.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
      if (match) {
        const [, extractedBucket, filePath] = match;
        const { data, error } = await supabase.storage
          .from(extractedBucket)
          .createSignedUrl(filePath, expiresIn);
        
        if (error) {
          console.error('Error creating signed URL:', error);
          return storedPath; // Fallback
        }
        return data.signedUrl;
      }
    }
    return storedPath;
  }

  // Extract path from Supabase URL
  let targetBucket = bucket;
  let filePath = storedPath;

  if (storedPath.includes('/storage/v1/object/')) {
    const match = storedPath.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)/);
    if (match) {
      [, targetBucket, filePath] = match;
    }
  }

  const { data, error } = await supabase.storage
    .from(targetBucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error('Error creating signed URL:', error);
    return storedPath; // Fallback
  }

  return data.signedUrl;
}

/**
 * Extract the file path from a stored URL for database storage
 * (stores path only, not full URL)
 */
export function extractFilePath(url: string): string {
  if (!url) return url;
  
  // If it's already just a path (no protocol), return as-is
  if (!url.startsWith('http')) return url;
  
  // Extract path from Supabase URL
  const match = url.match(/\/storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+?)(?:\?|$)/);
  if (match) {
    return match[1];
  }
  
  return url;
}
