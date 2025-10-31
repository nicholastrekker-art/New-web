import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tab } from "@shared/schema";

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewTab,
}: TabBarProps) {
  return (
    <div className="flex items-center gap-1 px-2 h-10 bg-card border-b overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`
            group flex items-center gap-2 px-3 h-8 min-w-[120px] max-w-[200px] rounded-t-md cursor-pointer
            ${activeTabId === tab.id ? 'bg-background border-t border-l border-r' : 'bg-card hover-elevate'}
          `}
          onClick={() => onTabSelect(tab.id)}
          data-testid={`tab-${tab.id}`}
        >
          <span className="flex-1 text-sm truncate" data-testid={`tab-title-${tab.id}`}>
            {tab.title || 'New Tab'}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
            data-testid={`button-close-tab-${tab.id}`}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}
      <Button
        size="icon"
        variant="ghost"
        onClick={onNewTab}
        className="h-8 w-8"
        data-testid="button-new-tab"
        aria-label="New tab"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
