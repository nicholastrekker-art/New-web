import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrowserFrameProps {
  url: string;
  isActive: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onTitleChange?: (title: string) => void;
}

export default function BrowserFrame({
  url,
  isActive,
  onLoadStart,
  onLoadEnd,
  onTitleChange,
}: BrowserFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (url && url !== 'about:blank') {
      setIsLoading(true);
      setHasError(false);
      onLoadStart?.();
    }
  }, [url, onLoadStart]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoadEnd?.();

    try {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow?.document?.title) {
        onTitleChange?.(iframe.contentWindow.document.title);
      }
    } catch (e) {
      console.log('Cannot access iframe title due to CORS');
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setErrorMessage("Failed to load the page. The website may not allow embedding.");
    onLoadEnd?.();
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  };

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

  return (
    <div className={`relative w-full h-full ${isActive ? 'block' : 'hidden'}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loader-page" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto px-4">
            <AlertCircle className="w-16 h-16 text-destructive" />
            <h2 className="text-lg font-semibold">Unable to Load Page</h2>
            <p className="text-sm text-muted-foreground text-center">
              {errorMessage}
            </p>
            <Button onClick={handleRetry} data-testid="button-retry">
              Try Again
            </Button>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        data-testid="iframe-browser"
      />
    </div>
  );
}
