"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { usePageTitle } from '@/app/petugas/layout';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setTitle } = usePageTitle();

  const menuItems = [
    { name: 'Dashboard', path: '/petugas/dashboard', title: 'Dashboard' },
    { name: 'Input Historis Pelayaran', path: '/petugas/input-historis', title: 'Input Historis Pelayaran' },
    { name: 'Input Jadwal', path: '/petugas/input-jadwal', title: 'Input Jadwal' },
    { name: 'Historis Pelayaran', path: '/petugas/historis-pelayaran', title: 'Historis Pelayaran' },
    { name: 'Profil', path: '/petugas/profil', title: 'Profil' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    router.push('/login');
  };

  const handleMenuClick = (item: typeof menuItems[0]) => {
    setTitle(item.title); // Update title di header
    router.push(item.path);
  };

  return (
    <aside className="w-64 bg-white shadow-lg p-6 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/images/dishub-logo-black.png"
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
            className={`block w-full px-4 py-2.5 text-left rounded transition-colors ${
              pathname === item.path
                ? 'bg-black text-white font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.name}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full px-4 py-2.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors mt-4 font-medium"
      >
        Logout
      </button>
    </aside>
  );
}