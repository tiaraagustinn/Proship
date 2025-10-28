"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import Sidebar from '@/app/components/petugas/Sidebar';
import Header from '@/app/components/petugas/Header';

interface PageContextType {
  title: string;
  setTitle: (title: string) => void;
}

const PageContext = createContext<PageContextType>({
  title: 'Dashboard',
  setTitle: () => {},
});

export const usePageTitle = () => useContext(PageContext);

export default function Layout({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Dashboard');

  return (
    <PageContext.Provider value={{ title, setTitle }}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar - Fixed Width */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#EEEEEE]">
          {/* Header - Full width of content area */}
          <Header title={title} />
          
          {/* Page Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </PageContext.Provider>
  );
}