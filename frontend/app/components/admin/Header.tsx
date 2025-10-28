"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';

interface HeaderProps {
  title: string;
  userName?: string;
}

export default function AdminHeader({ title, userName = 'Tiara Agustin' }: HeaderProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(userName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
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
    router.push('/admin/profil');
  };

  return (
    <div className="bg-black pt-10 pb-2 px-8 pr-20">
      <div className="flex justify-between items-center">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-white">{title}</h1>

        {/* User Profile */}
        <div className="flex items-center gap-1">
          {/* Avatar */}
          <div 
            className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden"
            onClick={handleProfileClick}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>

          {/* User Dropdown */}
          <select 
            className="rounded px-1 py-1.5 bg-black cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-white"
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