"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/app/components/petugas/Sidebar';
import Header from '@/app/components/petugas/Header';

interface PageContextType {
  title: string;
  setTitle: (title: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const PageContext = createContext<PageContextType>({
  title: 'Dashboard',
  setTitle: () => {},
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

export const usePageTitle = () => useContext(PageContext);

export default function Layout({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const role = sessionStorage.getItem('role');
    if (role === 'petugas') {
      setIsAuthorized(true);
    } else if (role === 'admin') {
      router.push('/admin/dashboard');
      setIsAuthorized(false);
    } else {
      router.push('/login');
      setIsAuthorized(false);
    }
  }, [router]);

  // Tutup sidebar saat navigasi
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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
    <PageContext.Provider value={{ title, setTitle, sidebarOpen, setSidebarOpen }}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar />
        <div className="flex-1 flex flex-col bg-[#EEEEEE] min-w-0 md:ml-0">
          <Header title={title} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </PageContext.Provider>
  );
}
