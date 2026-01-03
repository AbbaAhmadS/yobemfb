import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadProps {
  bucket: string;
  folder: string;
  accept?: string;
  label: string;
  description?: string;
  value?: string;
  onChange: (url: string) => void;
  maxSizeMB?: number;
}

export function FileUpload({
  bucket,
  folder,
  accept = 'image/*',
  label,
  description,
  value,
  onChange,
  maxSizeMB = 5,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setPreview(urlData.publicUrl);
      onChange(urlData.publicUrl);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
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

  const isImage = accept.includes('image');

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
          {isImage ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 rounded-lg mx-auto object-contain"
            />
          ) : (
            <div className="flex items-center gap-3">
              <FileText className="h-10 w-10 text-primary" />
              <span className="text-sm truncate">Document uploaded</span>
            </div>
          )}
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
            {isImage ? (
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">
              {isUploading ? 'Uploading...' : 'Click to upload'}
            </p>
            <p className="text-xs text-muted-foreground">
              Max size: {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
