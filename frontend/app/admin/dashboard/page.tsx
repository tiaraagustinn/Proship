"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePageTitle } from '@/app/admin/layout';
import { Users, Ship, Anchor } from 'lucide-react';

interface DashboardStats {
  petugasAktif: number;
  jumlahPelabuhan: number;
  jumlahKapal: number;
}

export default function AdminDashboardPage() {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const [userName, setUserName] = useState('Admin');
  
  useEffect(() => {
    setTitle('Dashboard');
    
    // Get logged-in user data
    const storedName = sessionStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, [setTitle]);

  const [stats, setStats] = useState<DashboardStats>({
    petugasAktif: 0,
    jumlahPelabuhan: 0,
    jumlahKapal: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [petugasRes, pelabuhanRes, kapalRes] = await Promise.all([
          fetch('http://localhost:5000/api/petugas'),
          fetch('http://localhost:5000/api/pelabuhan'),
          fetch('http://localhost:5000/api/kapal'),
        ]);
        const petugasJson = await petugasRes.json();
        const pelabuhanJson = await pelabuhanRes.json();
        const kapalJson = await kapalRes.json();

        const petugasList = petugasJson.data || [];
        const aktif = petugasList.filter((p: { status: string }) =>
          p.status?.toLowerCase() === 'aktif'
        ).length;

        setStats({
          petugasAktif: aktif,
          jumlahPelabuhan: (pelabuhanJson.data || []).length,
          jumlahKapal: (kapalJson.data || []).length,
        });
      } catch (err) {
        console.error('Gagal fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleDetailPetugas = () => {
    router.push('/admin/manajemen-akun');
  };

  const handleDetailPelabuhan = () => {
    router.push('/admin/data-master?tab=pelabuhan');
  };

  const handleDetailKapal = () => {
    router.push('/admin/data-master?tab=kapal');
  };

  return (
    <div className="m-3 md:m-7 p-4 md:p-8 bg-[#838383] rounded-lg shadow">
      {/* Greeting Section */}
      <div className="mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-300">
        <h1 className="text-2xl md:text-4xl font-bold text-white">Selamat Datang, {userName}! 👋</h1>
        <p className="text-gray-100 mt-2 text-sm md:text-base">Berikut adalah ringkasan sistem manajemen pelayaran</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Card 1 - Petugas Aktif */}
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5 md:p-8 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-3">
                  {stats.petugasAktif}
                </div>
                <div className="text-white text-sm font-medium">
                  Petugas aktif
                </div>
                <div
                  onClick={handleDetailPetugas}
                  className="text-white text-xs mt-3 md:mt-4 hover:underline cursor-pointer"
                >
                  Detail →
                </div>
              </div>
              <div className="bg-white/20 rounded-full p-3 md:p-4 flex-shrink-0">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 - Jumlah Pelabuhan */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5 md:p-8 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-3">
                  {stats.jumlahPelabuhan}
                </div>
                <div className="text-white text-sm font-medium">
                  Jumlah pelabuhan
                </div>
                <div
                  onClick={handleDetailPelabuhan}
                  className="text-white text-xs mt-3 md:mt-4 hover:underline cursor-pointer"
                >
                  Detail →
                </div>
              </div>
              <div className="bg-white/20 rounded-full p-3 md:p-4 flex-shrink-0">
                <Anchor className="w-6 h-6 md:w-8 md:h-8 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 - Jumlah Kapal */}
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg overflow-hidden sm:col-span-2 lg:col-span-1">
          <div className="p-5 md:p-8 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-3">
                  {stats.jumlahKapal}
                </div>
                <div className="text-white text-sm font-medium">
                  Jumlah kapal
                </div>
                <div
                  onClick={handleDetailKapal}
                  className="text-white text-xs mt-3 md:mt-4 hover:underline cursor-pointer"
                >
                  Detail →
                </div>
              </div>
              <div className="bg-white/20 rounded-full p-3 md:p-4 flex-shrink-0">
                <Ship className="w-6 h-6 md:w-8 md:h-8 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}