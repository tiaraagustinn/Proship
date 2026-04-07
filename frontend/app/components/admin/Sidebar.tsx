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
    { name: 'Manajemen Akun Petugas', path: '/admin/manajemen-akun', title: 'Manajemen Akun Petugas' },
    { name: 'Data Master', path: '/admin/data-master', title: 'Data Master' },
    { name: 'Input Jadwal', path: '/admin/input-jadwal', title: 'Jadwal' },
    { name: 'Historis Pelayaran', path: '/admin/historis-pelayaran', title: 'Historis Pelayaran' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    router.push('/login');
  };

  const handleMenuClick = (item: typeof menuItems[0]) => {
    setTitle(item.title);
    router.push(item.path);
  };

  return (
    <aside className="w-64 bg-[#838383] shadow-lg p-6 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/images/dishub-aceh-white.png"
          alt="Dishub Aceh Logo"
          width={150}
          height={60}
          priority
        />
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