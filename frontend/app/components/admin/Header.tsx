"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Menu } from 'lucide-react';
import { usePageTitle } from '@/app/admin/layout';

interface HeaderProps {
  title: string;
  userName?: string;
}

export default function AdminHeader({ title, userName = 'Tiara Agustin' }: HeaderProps) {
  const router = useRouter();
  const { setSidebarOpen } = usePageTitle();
  const [currentUser, setCurrentUser] = useState(userName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('userName');
    const storedAvatar = sessionStorage.getItem('userAvatar');

    if (storedUser) {
      setCurrentUser(storedUser);
    }

    if (storedAvatar) {
      setAvatarUrl(storedAvatar);
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.clear();
    setShowLogoutModal(false);
    router.push('/login');
  };

  return (
    <div className="bg-[#0A1542] pt-6 md:pt-10 pb-2 px-4 md:px-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Hamburger button - mobile only */}
          <button
            className="md:hidden p-2 rounded-lg text-white hover:bg-gray-700 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page Title */}
          <h1 className="text-xl md:text-4xl font-bold text-white truncate">{title}</h1>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-1 relative" ref={dropdownRef}>
          {/* Avatar */}
          <div
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
            )}
          </div>

          {/* User Dropdown */}
          <button
            type="button"
            className="hidden sm:flex items-center gap-1 rounded px-2 py-1.5 cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-white"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <span className="max-w-[120px] truncate">{currentUser}</span>
            <svg className="w-4 h-4 text-gray-300 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 rounded-lg bg-white shadow-lg border border-gray-200 overflow-hidden z-20">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-sm md:max-w-[540px] rounded-[18px] shadow-2xl px-6 md:px-8 py-7 md:py-9 border border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Logout</h2>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Apakah Anda yakin ingin logout dari akun ini?
            </p>

            <div className="flex justify-end gap-3 mt-6 md:mt-8">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 md:px-6 py-2.5 md:py-3 bg-[#D1D5DB] text-gray-900 rounded-md text-sm md:text-base font-medium hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 md:px-6 py-2.5 md:py-3 bg-[#E30613] text-white rounded-md text-sm md:text-base font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
