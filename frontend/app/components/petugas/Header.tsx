"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  userName?: string;
}

export default function Header({ title, userName = 'Tiara Agustin' }: HeaderProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(userName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('userName');
    const storedAvatar = localStorage.getItem('userAvatar');
    
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

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    router.push('/petugas/profil');
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    setShowLogoutModal(false);
    router.push('/login');
  };

  return (
    <div className="bg-[#EEEEEE] pt-10 pb-2 px-8 pr-20">
      <div className="flex justify-between items-center">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>

        {/* User Profile */}
        <div className="flex items-center gap-1 relative" ref={dropdownRef}>
          {/* Avatar - Default placeholder atau dari data profil */}
          <div 
            className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer overflow-hidden"
            onClick={handleProfileClick}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="User avatar"
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <svg 
                className="w-6 h-6 text-gray-600" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
          </div>

          {/* User Dropdown */}
            <button
              type="button"
              className="flex items-center gap-1 rounded px-2 py-1.5 cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <span>{currentUser}</span>
              <svg className="w-4 h-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-lg bg-white shadow-lg border border-gray-200 overflow-hidden z-20">
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Lihat Profil
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
        </div>
      </div>

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
    </div>
  );
}