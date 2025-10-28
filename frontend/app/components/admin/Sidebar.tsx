"use client";

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { usePageTitle } from '@/app/admin/layout';

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setTitle } = usePageTitle();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', title: 'Dashboard' },
    { name: 'Manajemen Akun Petugas', path: '/admin/manajemen-petugas', title: 'Manajemen Akun Petugas' },
    { name: 'Data Master', path: '/admin/data-master', title: 'Data Master' },
    { name: 'Input Jadwal', path: '/admin/input-jadwal', title: 'Jadwal' },
    { name: 'Historis Pelayaran', path: '/admin/historis-pelayaran', title: 'Historis Pelayaran' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    router.push('/admin/login');
  };

  const handleMenuClick = (item: typeof menuItems[0]) => {
    setTitle(item.title);
    router.push(item.path);
  };

  return (
    <aside className="w-64 bg-[#838383] shadow-lg p-6 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 text-white">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-2">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="3"/>
              <path d="M50 10 L50 90 M20 50 L80 50" stroke="black" strokeWidth="2"/>
              <circle cx="50" cy="50" r="15" fill="black"/>
              <path d="M30 30 Q50 45 70 30" stroke="black" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-xl">DISHUB</div>
            <div className="font-bold text-xl">ACEH</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleMenuClick(item)}
            className={`block w-full px-4 py-3 text-left rounded-lg transition-colors ${
              pathname === item.path
                ? 'bg-white text-gray-800 font-medium'
                : 'text-white hover:bg-gray-500'
            }`}
          >
            {item.name}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors mt-4 font-medium"
      >
        Logout
      </button>
    </aside>
  );
}