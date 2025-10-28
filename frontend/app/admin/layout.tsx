"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  // Skip layout for login page
  const isLoginPage = pathname === '/admin' || pathname === '/admin/login';

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