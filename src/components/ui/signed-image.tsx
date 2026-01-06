import { useSignedUrl } from '@/hooks/useSignedUrl';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SignedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  storedPath: string | undefined | null;
  bucket?: string;
  fallback?: React.ReactNode;
}

/**
 * Image component that automatically converts stored file paths to signed URLs
 * for display from private storage buckets.
 */
export function SignedImage({
  storedPath,
  bucket = 'loan-uploads',
  fallback,
  className,
  alt = 'Image',
  ...props
}: SignedImageProps) {
  const { signedUrl, isLoading, error } = useSignedUrl(storedPath, { bucket });

  if (isLoading) {
    return (
      <Skeleton 
        className={cn('bg-muted', className)} 
        style={{ width: props.width, height: props.height }}
      />
    );
  }

  if (error || !signedUrl) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div 
        className={cn('bg-muted flex items-center justify-center text-muted-foreground text-xs', className)}
        style={{ width: props.width, height: props.height }}
      >
        Image unavailable
      </div>
    );
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
      {...props}
    />
  );
}
