"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/app/components/admin/Sidebar';
import AdminHeader from '@/app/components/admin/Header';

interface PageContextType {
  title: string;
  setTitle: (title: string) => void;
}

const PageContext = createContext<PageContextType>({
  title: 'Dashboard',
  setTitle: () => {},
});

export const usePageTitle = () => useContext(PageContext);

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Dashboard');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Skip layout for login page
  const isLoginPage = pathname === '/admin' || pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      // Check role dari localStorage
      const role = localStorage.getItem('role');
      
      if (role === 'admin') {
        setIsAuthorized(true);
      } else if (role === 'petugas') {
        // Redirect petugas ke halaman petugas
        router.push('/petugas/dashboard');
        setIsAuthorized(false);
      } else {
        // Redirect ke login jika tidak ada role
        router.push('/login');
        setIsAuthorized(false);
      }
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, isLoginPage, router]);

  // Loading state
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

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <PageContext.Provider value={{ title, setTitle }}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col bg-black">
          <AdminHeader title={title} />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </PageContext.Provider>
  );
}