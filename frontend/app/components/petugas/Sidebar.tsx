"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { usePageTitle } from '@/app/petugas/layout';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setTitle, sidebarOpen, setSidebarOpen } = usePageTitle();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/petugas/dashboard', title: 'Dashboard' },
    { name: 'Input Historis Angkutan', path: '/petugas/input-historis', title: 'Input Historis Angkutan' },
    { name: 'Input Jadwal', path: '/petugas/input-jadwal', title: 'Input Jadwal' },
    { name: 'Historis Angkutan', path: '/petugas/historis-angkutan', title: 'Historis Angkutan' },
    { name: 'Profil', path: '/petugas/profil', title: 'Profil' },
  ];

  const handleConfirmLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.clear();
    setShowLogoutModal(false);
    router.push('/login');
  };

  const handleMenuClick = (item: typeof menuItems[0]) => {
    setTitle(item.title);
    setSidebarOpen(false);
    router.push(item.path);
  };

  return (
    <>
    <aside
      className={`
        fixed top-0 left-0 h-screen w-64 bg-white shadow-lg p-6 flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:sticky md:top-0 md:translate-x-0 md:flex md:shrink-0
      `}
    >
      {/* Logo */}
      <div className="relative mb-8 h-[60px] w-[150px]">
        <Image
          src="/images/dishub-aceh-black.png"
          alt="Dishub Aceh Logo"
          fill
          sizes="150px"
          priority
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleMenuClick(item)}
            className={`block w-full px-4 py-2.5 text-left rounded transition-colors text-sm ${
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
        className="w-full px-4 py-2.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors mt-4 font-medium text-sm"
      >
        Logout
      </button>
    </aside>

    {showLogoutModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl px-8 py-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Logout</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Apakah Anda yakin ingin logout dari akun ini?
          </p>
          <div className="flex justify-end gap-3 mt-7">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmLogout}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
