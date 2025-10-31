import { useState, useCallback } from "react";
import AddressBar from "@/components/AddressBar";
import TabBar from "@/components/TabBar";
import BrowserFrame from "@/components/BrowserFrame";
import type { Tab } from "@shared/schema";

export default function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', url: 'about:blank', title: 'New Tab', isLoading: false },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [history, setHistory] = useState<{ [tabId: string]: string[] }>({
    '1': ['about:blank'],
  });
  const [historyIndex, setHistoryIndex] = useState<{ [tabId: string]: number }>({
    '1': 0,
  });

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

  const handleLoadStart = useCallback((tabId: string) => {
    updateTab(tabId, { isLoading: true });
  }, [updateTab]);

  const handleLoadEnd = useCallback((tabId: string) => {
    updateTab(tabId, { isLoading: false });
  }, [updateTab]);

  const handleTitleChange = useCallback((tabId: string, title: string) => {
    updateTab(tabId, { title });
  }, [updateTab]);

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
            onLoadStart={() => handleLoadStart(tab.id)}
            onLoadEnd={() => handleLoadEnd(tab.id)}
            onTitleChange={(title) => handleTitleChange(tab.id, title)}
          />
        ))}
      </div>
    </div>
  );
}
