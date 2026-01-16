import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadProps {
  bucket?: string;
  folder?: string;
  accept?: string;
  label: string;
  description?: string;
  value?: string;
  applicationId?: string;
  onChange: (path: string) => void;
}

// Maximum file size: 200KB (204,800 bytes)
const MAX_FILE_SIZE = 204800;

// Accepted file types - ONLY images (JPG, JPEG, PNG)
const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export function FileUpload({
  bucket = 'loan-uploads',
  folder = 'uploads',
  accept = 'image/jpeg,image/jpg,image/png',
  label,
  description,
  value,
  applicationId,
  onChange,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate signed URL for preview when value changes
  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    // Generate signed URL for the stored path
    const generatePreview = async () => {
      try {
        // Extract path from URL if it's a full URL (legacy data)
        let filePath = value;
        if (value.includes('/storage/v1/object/')) {
          const match = value.match(/\/storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+?)(?:\?|$)/);
          if (match) {
            filePath = match[1];
          }
        }

        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, 3600);

        if (error) {
          console.error('Error creating preview URL:', error);
          setPreview(value); // Fallback to stored value
        } else {
          setPreview(data.signedUrl);
        }
      } catch (err) {
        console.error('Failed to generate preview:', err);
        setPreview(value);
      }
    };

    generatePreview();
  }, [value, bucket]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size - 200KB max
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 200KB.');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    // Validate file type - ONLY jpg, jpeg, png
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG images are allowed.');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename with organized folder structure
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const basePath = applicationId
        ? `uploads/loan-applications/${applicationId}`
        : folder;
      const fileName = `${basePath}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Generate signed URL for preview
      const { data: signedData, error: signError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(data.path, 3600);

      if (signError) {
        console.error('Error creating signed URL:', signError);
        toast.error('File uploaded but preview unavailable');
      } else {
        setPreview(signedData.signedUrl);
      }
      
      // Store the PATH only, not the full URL
      onChange(data.path);
      toast.success('File uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error?.message?.includes('Bucket not found')) {
        toast.error('Storage not configured. Please contact support.');
      } else {
        toast.error('Failed to upload file. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {preview ? (
        <div className="relative rounded-lg border bg-muted/30 p-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 rounded-lg mx-auto object-contain"
          />
        </div>
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            'hover:border-primary hover:bg-primary/5',
            isUploading && 'opacity-50 pointer-events-none'
          )}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isUploading ? 'Uploading...' : 'Click to upload'}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, JPEG, PNG only
            </p>
          </div>
        </div>
      )}
      <p className="text-[10px] text-muted-foreground/70 leading-tight">
        Scanned documents preferred. Max 200KB. If using a phone, use lower resolution or compress the file.
      </p>
    </div>
  );
}