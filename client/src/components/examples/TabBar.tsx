import TabBar from '../TabBar';
import type { Tab } from '@shared/schema';

export default function TabBarExample() {
  const tabs: Tab[] = [
    { id: '1', url: 'https://example.com', title: 'Example Domain', isLoading: false },
    { id: '2', url: 'https://github.com', title: 'GitHub', isLoading: false },
    { id: '3', url: '', title: 'New Tab', isLoading: false },
  ];

  return (
    <TabBar
      tabs={tabs}
      activeTabId="1"
      onTabSelect={(id) => console.log('Select tab:', id)}
      onTabClose={(id) => console.log('Close tab:', id)}
      onNewTab={() => console.log('New tab')}
    />
  );
}
