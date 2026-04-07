"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { usePageTitle } from '@/app/petugas/layout';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setTitle } = usePageTitle();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/petugas/dashboard', title: 'Dashboard' },
    { name: 'Input Historis Pelayaran', path: '/petugas/input-historis', title: 'Input Historis Pelayaran' },
    { name: 'Input Jadwal', path: '/petugas/input-jadwal', title: 'Input Jadwal' },
    { name: 'Historis Pelayaran', path: '/petugas/historis-pelayaran', title: 'Historis Pelayaran' },
    { name: 'Profil', path: '/petugas/profil', title: 'Profil' },
  ];

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    setShowLogoutModal(false);
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
        onClick={() => setShowLogoutModal(true)}
        className="w-full px-4 py-2.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors mt-4 font-medium"
      >
        Logout
      </button>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-[540px] rounded-[18px] shadow-2xl px-8 py-9 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Logout</h2>
            <p className="text-base text-gray-600 leading-relaxed max-w-[430px]">
              Apakah Anda yakin ingin logout dari akun ini?
            </p>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="min-w-[96px] px-6 py-3 bg-[#D1D5DB] text-gray-900 rounded-md text-base font-medium hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="min-w-[96px] px-6 py-3 bg-[#E30613] text-white rounded-md text-base font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}