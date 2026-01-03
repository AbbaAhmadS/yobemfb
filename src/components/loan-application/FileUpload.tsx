'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/integrations/supabase/client'; // Adjust if your Supabase client path is different

const supabase = createClient();

interface FileUploadProps {
  bucket: string;
  folder?: string;
  accept: string;
  label: string;
  description: string;
  value?: string;
  onChange: (url: string) => void;
}

export function FileUpload({
  bucket,
  folder,
  accept,
  label,
  description,
  value,
  onChange,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    // Validate: image only
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        description: 'Only image files are allowed.',
      });
      return;
    }

    // Validate: < 1MB only (no resolution check!)
    if (file.size >= 1 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        description: 'Image must be less than 1MB.',
      });
      return;
    }

    setIsUploading(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

      onChange(urlData.publicUrl);

      toast({
        description: 'Image uploaded successfully!',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        description: err.message || 'Upload failed. Try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label>{label}</Label>
      <p className="text-sm text-muted-foreground">{description}</p>

      {value ? (
        <div className="relative mt-4 inline-block">
          <img
            src={value}
            alt={label}
            className="max-h-64 rounded-md object-contain border"
          />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <Label htmlFor={`upload-${label}`} className="cursor-pointer">
              <Button size="sm" variant="secondary" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Change Image'}
              </Button>
            </Label>
          </div>
        </div>
      ) : (
        <Label
          htmlFor={`upload-${label}`}
          className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary"
        >
          <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isUploading ? 'Uploading...' : 'Click to upload image'}
          </p>
        </Label>
      )}

      <Input
        id={`upload-${label}`}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />
    </div>
  );
}
