"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check role dari localStorage
    const role = localStorage.getItem('role');
    
    if (role === 'petugas') {
      setIsAuthorized(true);
    } else if (role === 'admin') {
      // Redirect admin ke halaman admin
      router.push('/admin/dashboard');
      setIsAuthorized(false);
    } else {
      // Redirect ke login jika tidak ada role
      router.push('/login');
      setIsAuthorized(false);
    }
  }, [router]);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    );
  }

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