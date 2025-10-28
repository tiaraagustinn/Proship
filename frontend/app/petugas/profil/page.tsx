"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { usePageTitle } from '@/app/petugas/layout';
import Image from 'next/image';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  aboutMe: string;
  avatar: string | null;
}

export default function ProfilPage() {
  const { setTitle } = usePageTitle();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: 'Tiara Agustin',
    email: 'tiara@gmail.com',
    phone: '082211110005',
    company: 'Construction Professional Inc.',
    jobTitle: 'Construction Manager',
    aboutMe: 'Construction professional with 10+ years of experience. Passionate about sustainable building practices and reducing construction waste through material reuse.',
    avatar: null,
  });

  useEffect(() => {
    setTitle('Profil');
    
    // Load data from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
  }, [setTitle]);

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
    alert('Profil berhasil disimpan!');
    setIsEditing(false);
  };

  return (
    <div className="p-8 m-7 bg-white rounded-lg shadow">
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
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full px-4 py-2 text-left rounded transition ${
                  activeTab === 'security' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Account Security
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full px-4 py-2 text-left rounded transition ${
                  activeTab === 'notifications' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`w-full px-4 py-2 text-left rounded transition ${
                  activeTab === 'payment' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Payment Methods
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`w-full px-4 py-2 text-left rounded transition ${
                  activeTab === 'shipping' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Shipping Information
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full px-4 py-2 text-left rounded transition ${
                  activeTab === 'privacy' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Privacy Settings
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

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={profileData.company}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-white disabled:text-gray-700"
                  />
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title (Optional)
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={profileData.jobTitle}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-white disabled:text-gray-700"
                  />
                </div>

                {/* About Me */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About Me (Optional)
                  </label>
                  <textarea
                    name="aboutMe"
                    value={profileData.aboutMe}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-white disabled:text-gray-700 resize-none"
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

          {/* Other tabs placeholder */}
          {activeTab !== 'personal' && (
            <div className="bg-gray-100 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">
                {activeTab === 'security' && 'Account Security'}
                {activeTab === 'notifications' && 'Notifications'}
                {activeTab === 'payment' && 'Payment Methods'}
                {activeTab === 'shipping' && 'Shipping Information'}
                {activeTab === 'privacy' && 'Privacy Settings'}
              </h2>
              <p className="text-gray-600">Content for this section will be available soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}