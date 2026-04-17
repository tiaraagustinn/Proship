"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/app/components/admin/Sidebar';
import AdminHeader from '@/app/components/admin/Header';

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

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/admin' || pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      const role = sessionStorage.getItem('role');
      if (role === 'admin') {
        setIsAuthorized(true);
      } else if (role === 'petugas') {
        router.push('/petugas/dashboard');
        setIsAuthorized(false);
      } else {
        router.push('/login');
        setIsAuthorized(false);
      }
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, isLoginPage, router]);

  // Tutup sidebar saat navigasi
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!isLoginPage && isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!isAuthorized && !isLoginPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white">Redirecting...</p>
      </div>
    );
  }

  if (isLoginPage) return <>{children}</>;

  return (
    <PageContext.Provider value={{ title, setTitle, sidebarOpen, setSidebarOpen }}>
      <div className="flex min-h-screen">
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <AdminSidebar />
        <div className="flex-1 flex flex-col bg-black min-w-0 md:ml-0">
          <AdminHeader title={title} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </PageContext.Provider>
  );
}
