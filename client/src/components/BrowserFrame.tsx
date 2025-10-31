
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface BrowserFrameProps {
  url: string;
  isActive: boolean;
  onTitleChange: (title: string) => void;
}

export default function BrowserFrame({ url, isActive, onTitleChange }: BrowserFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const previousUrlRef = useRef<string>('');

  useEffect(() => {
    // Only update loading state when URL actually changes
    if (url !== previousUrlRef.current && url !== 'about:blank') {
      setIsLoading(true);
      setHasError(false);
      previousUrlRef.current = url;
    }
  }, [url]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoading(false);
      
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const title = iframeDoc.title || url;
          onTitleChange(title);
        } else {
          // Fallback for CORS-restricted iframes
          const hostname = new URL(url).hostname;
          onTitleChange(hostname);
        }
        
        // Store session data for this URL regardless of CORS
        try {
          const sessionKey = `browser_session_${btoa(url).substring(0, 50)}`;
          localStorage.setItem(sessionKey, JSON.stringify({
            url,
            title: iframeDoc?.title || new URL(url).hostname,
            timestamp: Date.now()
          }));
        } catch (storageError) {
          console.warn('Failed to store session data');
        }
      } catch (e) {
        console.log('Cannot access iframe title due to CORS');
        try {
          onTitleChange(new URL(url).hostname);
        } catch (urlError) {
          onTitleChange('Unknown');
        }
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      onTitleChange('Failed to load');
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [url, onTitleChange]);

  if (!url || url === 'about:blank') {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Welcome to Browser</h2>
            <p className="text-sm text-muted-foreground">
              Enter a URL in the address bar to start browsing
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center h-full bg-background ${isActive ? 'block' : 'hidden'}`}>
        <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Failed to Load</h2>
            <p className="text-sm text-muted-foreground mb-2">
              This website cannot be displayed in an iframe.
            </p>
            <p className="text-xs text-muted-foreground">
              Many websites block embedding for security reasons (X-Frame-Options).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${isActive ? 'block' : 'hidden'}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loader-page" />
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full border-0"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        allow="camera; microphone; geolocation; payment; autoplay; encrypted-media; clipboard-read; clipboard-write; storage-access"
        title="Browser content"
        loading="eager"
        credentialless="false"
      />
    </div>
  );
}
