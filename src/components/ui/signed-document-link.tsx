import { useState } from 'react';
import { FileText, ExternalLink, Loader2 } from 'lucide-react';
import { getSignedUrl } from '@/hooks/useSignedUrl';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SignedDocumentLinkProps {
  storedPath: string | undefined | null;
  bucket?: string;
  label: string;
  className?: string;
}

/**
 * Document link component that generates signed URLs on-click
 * for secure access to private storage buckets.
 */
export function SignedDocumentLink({
  storedPath,
  bucket = 'loan-uploads',
  label,
  className,
}: SignedDocumentLinkProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!storedPath) {
      toast.error('Document not available');
      return;
    }

    setIsLoading(true);
    try {
      const signedUrl = await getSignedUrl(storedPath, bucket, 3600);
      if (signedUrl) {
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Unable to access document');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      toast.error('Failed to open document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || !storedPath}
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors w-full text-left',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <FileText className="h-4 w-4 text-primary" />
      <span className="flex-1 text-sm">{label}</span>
      {isLoading ? (
        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
      ) : (
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}
