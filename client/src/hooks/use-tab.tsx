import { createContext, useContext, useState, ReactNode } from 'react';
import { TabType } from '@/types';

interface TabContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>('feed');

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTab(): TabContextType {
  const context = useContext(TabContext);
  
  if (context === undefined) {
    throw new Error('useTab must be used within a TabProvider');
  }
  
  return context;
}