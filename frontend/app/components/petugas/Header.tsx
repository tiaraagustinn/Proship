"use client";

import { useState, useEffect } from 'react';
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

  const handleProfileClick = () => {
    router.push('/petugas/profil');
  };

  return (
    <div className="bg-#EEEEEE pt-10 pb-2 px-8 pr-20">
      <div className="flex justify-between items-center">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>

        {/* User Profile */}
        <div className="flex items-center gap-1">
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
          <select 
            className=" rounded px-1 py-1.5 cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            onChange={(e) => {
              if (e.target.value === 'profil') {
                handleProfileClick();
              }
            }}
            value="current"
          >
            <option value="current" hidden>{currentUser}</option>
            <option value="profil">Lihat Profil</option>
          </select>
        </div>
      </div>
    </div>
  );
}