import { useState, useCallback, useEffect } from "react";
import AddressBar from "@/components/AddressBar";
import TabBar from "@/components/TabBar";
import BrowserFrame from "@/components/BrowserFrame";
import type { Tab } from "@shared/schema";

const STORAGE_KEYS = {
  TABS: 'browser_tabs',
  ACTIVE_TAB: 'browser_active_tab',
  HISTORY: 'browser_history',
  HISTORY_INDEX: 'browser_history_index',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    const parsed = JSON.parse(item);
    
    // Validate the parsed data based on the key
    if (key === STORAGE_KEYS.TABS) {
      if (!Array.isArray(parsed)) return defaultValue;
      // Validate each tab has required properties
      const isValid = parsed.every(tab => 
        tab && 
        typeof tab.id === 'string' && 
        typeof tab.url === 'string' && 
        typeof tab.title === 'string' && 
        typeof tab.isLoading === 'boolean'
      );
      if (!isValid) return defaultValue;
    } else if (key === STORAGE_KEYS.HISTORY || key === STORAGE_KEYS.HISTORY_INDEX) {
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return defaultValue;
      }
    } else if (key === STORAGE_KEYS.ACTIVE_TAB) {
      if (typeof parsed !== 'string') return defaultValue;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export default function Browser() {
  // Initialize with restored session or default tab
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const savedTabs = loadFromStorage(STORAGE_KEYS.TABS, [
      { id: '1', url: 'about:blank', title: 'New Tab', isLoading: false },
    ]);
    // Clear loading states on restore
    return savedTabs.map(tab => ({ ...tab, isLoading: false }));
  });
  const [activeTabId, setActiveTabId] = useState(() => 
    loadFromStorage(STORAGE_KEYS.ACTIVE_TAB, '1')
  );
  const [history, setHistory] = useState<{ [tabId: string]: string[] }>(() =>
    loadFromStorage(STORAGE_KEYS.HISTORY, { '1': ['about:blank'] })
  );
  const [historyIndex, setHistoryIndex] = useState<{ [tabId: string]: number }>(() =>
    loadFromStorage(STORAGE_KEYS.HISTORY_INDEX, { '1': 0 })
  );

  // Persist tabs to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TABS, tabs);
  }, [tabs]);

  // Persist active tab to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVE_TAB, activeTabId);
  }, [activeTabId]);

  // Persist history to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.HISTORY, history);
  }, [history]);

  // Persist history index to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.HISTORY_INDEX, historyIndex);
  }, [historyIndex]);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, ...updates } : tab
    ));
  }, []);

  const handleNavigate = useCallback((url: string) => {
    if (!activeTabId) return;

    const currentHistory = history[activeTabId] || [];
    const currentIndex = historyIndex[activeTabId] || 0;
    
    const newHistory = [...currentHistory.slice(0, currentIndex + 1), url];
    
    setHistory(prev => ({ ...prev, [activeTabId]: newHistory }));
    setHistoryIndex(prev => ({ ...prev, [activeTabId]: newHistory.length - 1 }));
    
    updateTab(activeTabId, { url, isLoading: true });
  }, [activeTabId, history, historyIndex, updateTab]);

  const handleBack = useCallback(() => {
    if (!activeTabId) return;
    
    const currentIndex = historyIndex[activeTabId] || 0;
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const url = history[activeTabId][newIndex];
      
      setHistoryIndex(prev => ({ ...prev, [activeTabId]: newIndex }));
      updateTab(activeTabId, { url, isLoading: true });
    }
  }, [activeTabId, history, historyIndex, updateTab]);

  const handleForward = useCallback(() => {
    if (!activeTabId) return;
    
    const currentHistory = history[activeTabId] || [];
    const currentIndex = historyIndex[activeTabId] || 0;
    
    if (currentIndex < currentHistory.length - 1) {
      const newIndex = currentIndex + 1;
      const url = currentHistory[newIndex];
      
      setHistoryIndex(prev => ({ ...prev, [activeTabId]: newIndex }));
      updateTab(activeTabId, { url, isLoading: true });
    }
  }, [activeTabId, history, historyIndex, updateTab]);

  const handleRefresh = useCallback(() => {
    if (!activeTabId || !activeTab) return;
    updateTab(activeTabId, { isLoading: true });
  }, [activeTabId, activeTab, updateTab]);

  const handleHome = useCallback(() => {
    handleNavigate('about:blank');
  }, [handleNavigate]);

  const handleNewTab = useCallback(() => {
    const newTabId = Date.now().toString();
    const newTab: Tab = {
      id: newTabId,
      url: 'about:blank',
      title: 'New Tab',
      isLoading: false,
    };
    
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
    setHistory(prev => ({ ...prev, [newTabId]: ['about:blank'] }));
    setHistoryIndex(prev => ({ ...prev, [newTabId]: 0 }));
  }, []);

  const handleTabClose = useCallback((tabId: string) => {
    if (tabs.length === 1) {
      handleNewTab();
    }
    
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      if (activeTabId === tabId && filtered.length > 0) {
        setActiveTabId(filtered[filtered.length - 1].id);
      }
      return filtered;
    });
    
    setHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[tabId];
      return newHistory;
    });
    
    setHistoryIndex(prev => {
      const newIndex = { ...prev };
      delete newIndex[tabId];
      return newIndex;
    });
  }, [tabs.length, activeTabId, handleNewTab]);

  const handleTitleChange = useCallback((tabId: string, title: string) => {
    updateTab(tabId, { title });
  }, [updateTab]);

  // Load saved sessions on mount
  useEffect(() => {
    try {
      const sessionsKey = 'browser_all_sessions';
      const savedSessions = localStorage.getItem(sessionsKey);
      if (savedSessions) {
        console.log('Saved sessions available for restoration');
      }
    } catch (error) {
      console.warn('Failed to load saved sessions');
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+T or Cmd+T: New tab
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        handleNewTab();
      }
      // Ctrl+W or Cmd+W: Close current tab
      else if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        if (activeTabId) {
          handleTabClose(activeTabId);
        }
      }
      // Ctrl+Shift+Tab: Switch to previous tab (check before Ctrl+Tab)
      else if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
        if (currentIndex !== -1) {
          const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          setActiveTabId(tabs[prevIndex].id);
        }
      }
      // Ctrl+Tab: Switch to next tab
      else if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % tabs.length;
          setActiveTabId(tabs[nextIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, handleNewTab, handleTabClose]);

  const canGoBack = activeTabId ? (historyIndex[activeTabId] || 0) > 0 : false;
  const canGoForward = activeTabId ? 
    (historyIndex[activeTabId] || 0) < ((history[activeTabId] || []).length - 1) : false;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={setActiveTabId}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
      />
      
      <AddressBar
        currentUrl={activeTab?.url || ''}
        isLoading={activeTab?.isLoading || false}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onNavigate={handleNavigate}
        onBack={handleBack}
        onForward={handleForward}
        onRefresh={handleRefresh}
        onHome={handleHome}
      />

      <div className="flex-1 relative overflow-hidden">
        {tabs.map(tab => (
          <BrowserFrame
            key={tab.id}
            url={tab.url}
            isActive={tab.id === activeTabId}
            onTitleChange={(title) => handleTitleChange(tab.id, title)}
          />
        ))}
      </div>
    </div>
  );
}
