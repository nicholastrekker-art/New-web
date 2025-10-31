
import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface BrowserFrameProps {
  url: string;
  isActive: boolean;
  onTitleChange: (title: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function BrowserFrame({ url, isActive, onTitleChange, onLoadingChange }: BrowserFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const previousUrlRef = useRef<string>('');
  const hasInitializedRef = useRef(false);

  // Memoize the title change handler to prevent infinite loops
  const handleTitleChange = useCallback((title: string) => {
    onTitleChange(title);
  }, [onTitleChange]);

  // Memoize the loading change handler - only call parent when value actually changes
  const handleLoadingChange = useCallback((loading: boolean) => {
    console.log(`[BrowserFrame] URL: ${url} - Loading state changing to: ${loading}`);
    setIsLoading(loading);
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [onLoadingChange, url]);

  useEffect(() => {
    // Only update loading state when URL actually changes
    if (url !== previousUrlRef.current && url !== 'about:blank') {
      console.log(`[BrowserFrame] 🌐 Navigating: ${previousUrlRef.current || 'blank'} → ${url}`);
      handleLoadingChange(true);
      setHasError(false);
      previousUrlRef.current = url;
      hasInitializedRef.current = true;
    }
  }, [url, handleLoadingChange]);

  // Track iframe URL changes via polling (for when user clicks links inside iframe)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !isActive) return;

    let lastKnownUrl = url;
    const pollInterval = setInterval(() => {
      try {
        // Try to access the iframe's current location
        const currentUrl = iframe.contentWindow?.location.href;
        if (currentUrl && currentUrl !== lastKnownUrl && currentUrl !== 'about:blank') {
          console.log(`[BrowserFrame] 🔄 Navigation detected: ${lastKnownUrl} -> ${currentUrl}`);
          lastKnownUrl = currentUrl;
          // Note: We don't update title here to avoid infinite loops
          // Title will be updated on the load event instead
        }
      } catch (e) {
        // CORS restriction - cannot access iframe location
        // This is normal for cross-origin iframes
      }
    }, 1000); // Poll every 1 second

    return () => clearInterval(pollInterval);
  }, [url, isActive]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      console.log(`[BrowserFrame] ✅ Page loaded: ${url}`);
      handleLoadingChange(false);
      
      // Only process title changes after initial load
      if (!hasInitializedRef.current) {
        console.log(`[BrowserFrame] ⏭️  Skipping title update - not initialized`);
        return;
      }
      
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        let pageTitle = url;
        
        if (iframeDoc) {
          pageTitle = iframeDoc.title || new URL(url).hostname;
          console.log(`[BrowserFrame] 📄 Document accessible - Title: "${pageTitle}"`);
          
          // Log cookies for debugging authentication
          try {
            const cookies = iframeDoc.cookie;
            if (cookies) {
              console.log(`[BrowserFrame] 🍪 Cookies found:`, cookies.split(';').length, 'cookies');
            } else {
              console.log(`[BrowserFrame] 🍪 No cookies present`);
            }
          } catch (cookieError) {
            console.log(`[BrowserFrame] 🔒 Cannot access cookies (CORS protection)`);
          }
          
          // Log localStorage for session tracking
          try {
            const storageKeys = Object.keys(iframeDoc.defaultView?.localStorage || {});
            console.log(`[BrowserFrame] 💾 LocalStorage keys:`, storageKeys.length);
          } catch (storageError) {
            console.log(`[BrowserFrame] 🔒 Cannot access localStorage (CORS protection)`);
          }
        } else {
          pageTitle = new URL(url).hostname;
          console.log(`[BrowserFrame] 🔒 CORS blocked - Cannot access document for: ${pageTitle}`);
        }
        
        // Update title
        handleTitleChange(pageTitle);
        
        // Store session data for persistence
        try {
          const sessionKey = `browser_session_${btoa(url).substring(0, 50)}`;
          const sessionData = {
            url,
            title: pageTitle,
            timestamp: Date.now(),
          };
          localStorage.setItem(sessionKey, JSON.stringify(sessionData));
          
          // Keep a master list of all sessions
          const sessionsKey = 'browser_all_sessions';
          const existingSessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]');
          const updatedSessions = existingSessions.filter((s: any) => s.url !== url);
          updatedSessions.push(sessionData);
          localStorage.setItem(sessionsKey, JSON.stringify(updatedSessions));
          console.log(`[BrowserFrame] Session data stored for: ${url}`);
        } catch (storageError) {
          console.warn('[BrowserFrame] Failed to store session data:', storageError);
        }
      } catch (e) {
        console.log('[BrowserFrame] Cannot access iframe title due to CORS');
        try {
          const hostname = new URL(url).hostname;
          handleTitleChange(hostname);
        } catch (urlError) {
          console.error('[BrowserFrame] Invalid URL:', urlError);
          handleTitleChange('Unknown');
        }
      }
    };

    const handleError = (event?: Event) => {
      console.error(`[BrowserFrame] ❌ Failed to load: ${url}`, event);
      console.log(`[BrowserFrame] 💡 Common causes: X-Frame-Options, CSP headers, or network issues`);
      handleLoadingChange(false);
      setHasError(true);
      handleTitleChange('Failed to load');
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [url, handleTitleChange, handleLoadingChange]);

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
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals allow-storage-access-by-user-activation allow-top-navigation allow-top-navigation-by-user-activation allow-presentation allow-orientation-lock"
        allow="camera *; microphone *; geolocation *; payment *; autoplay *; encrypted-media *; clipboard-read *; clipboard-write *; storage-access *; publickey-credentials-get *; display-capture *"
        referrerPolicy="no-referrer-when-downgrade"
        title="Browser content"
        loading="eager"
        credentialless={false}
      />
    </div>
  );
}
