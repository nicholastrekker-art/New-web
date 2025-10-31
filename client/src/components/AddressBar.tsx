import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Home, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddressBarProps {
  currentUrl: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onHome: () => void;
}

export default function AddressBar({
  currentUrl,
  isLoading,
  canGoBack,
  canGoForward,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  onHome,
}: AddressBarProps) {
  const [inputValue, setInputValue] = useState(currentUrl);

  useEffect(() => {
    setInputValue(currentUrl);
  }, [currentUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      let url = inputValue.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      onNavigate(url);
    }
  };

  const handleClear = () => {
    setInputValue("");
  };

  return (
    <header className="flex items-center gap-2 px-4 h-14 border-b bg-background">
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={onBack}
          disabled={!canGoBack}
          data-testid="button-back"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onForward}
          disabled={!canGoForward}
          data-testid="button-forward"
          aria-label="Go forward"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onRefresh}
          data-testid="button-refresh"
          aria-label="Refresh page"
          className={isLoading ? "animate-spin" : ""}
        >
          <RotateCw className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onHome}
          data-testid="button-home"
          aria-label="Go home"
        >
          <Home className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 max-w-4xl">
        <div className="relative">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter URL or search..."
            className="w-full h-10 px-4 pr-8 rounded-lg text-sm"
            data-testid="input-url"
            aria-label="Address bar"
          />
          {inputValue && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              data-testid="button-clear-url"
              type="button"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>

      {isLoading && (
        <div className="absolute left-0 right-0 top-14 h-0.5 bg-primary overflow-hidden">
          <div className="h-full w-1/3 bg-primary animate-pulse" />
        </div>
      )}
    </header>
  );
}
