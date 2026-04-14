"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { usePageTitle } from '@/app/petugas/layout';
import Image from 'next/image';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ProfileData {
  id_petugas?: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
}

const API_URL = 'http://localhost:5000/api';

export default function ProfilPage() {
  const { setTitle } = usePageTitle();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    id_petugas: '',
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: '',
    avatar: null,
  });

  useEffect(() => {
    setTitle('Profil');
    
    // Load data from localStorage (from login)
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const username = localStorage.getItem('username');
    const userEmail = localStorage.getItem('email');
    const userRole = localStorage.getItem('role');
    const savedProfile = localStorage.getItem('userProfile');
    const savedAvatar = localStorage.getItem('userAvatar');

    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setProfileData(prev => ({
        ...prev,
        ...profile,
        id_petugas: userId || profile.id_petugas,
        username: username || profile.username,
        fullName: userName || profile.fullName,
        email: userEmail || profile.email,
        role: userRole || profile.role,
      }));
    } else {
      // Use login data as default
      setProfileData(prev => ({
        ...prev,
        id_petugas: userId || '',
        username: username || '',
        fullName: userName || '',
        email: userEmail || '',
        role: userRole || '',
      }));
    }

    if (savedAvatar) {
      setProfileData(prev => ({ ...prev, avatar: savedAvatar }));
    }
  }, [setTitle]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 2000);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setProfileData(prev => ({ ...prev, avatar: imageUrl }));
        localStorage.setItem('userAvatar', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    localStorage.setItem('userName', profileData.fullName);
    localStorage.setItem('email', profileData.email);
    showNotification('success', 'Profil berhasil disimpan!');
    setIsEditing(false);
  };

  return (
    <div className="p-8 m-7 bg-white rounded-lg shadow">
      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' 
            ? <CheckCircle className="w-5 h-5" />
            : <AlertCircle className="w-5 h-5" />
          }
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex gap-8">
        {/* Left Sidebar - Profile Card */}
        <div className="w-80">
          <div className="p-6">
            <h3 className="text-xl font-bold text-center mb-4">{profileData.fullName}</h3>
            
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mb-4">
                {profileData.avatar ? (
                  <Image
                    src={profileData.avatar}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                ) : (
                  <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <label className="px-4 py-2 bg-gray-200 text-gray-700 rounded cursor-pointer hover:bg-gray-300 transition">
                Change Picture
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Menu Tabs */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('personal')}
                className={`w-full px-4 py-2 text-left rounded transition ${
                  activeTab === 'personal' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Personal Information
              </button>
            </div>
          </div>
        </div>

        {/* Right Content - Personal Information */}
        <div className="flex-1">
          {activeTab === 'personal' && (
            <div className="bg-gray-100 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
              
              <div className="space-y-4">
                {/* ID Petugas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Petugas
                  </label>
                  <input
                    type="text"
                    value={profileData.id_petugas || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-200 text-gray-700 cursor-not-allowed"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileData.username || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-200 text-gray-700 cursor-not-allowed"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={profileData.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-200 text-gray-700 cursor-not-allowed"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-white disabled:text-gray-700"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-white disabled:text-gray-700"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-white disabled:text-gray-700"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 flex justify-end">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-8 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                  >
                    Edit Profil
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}