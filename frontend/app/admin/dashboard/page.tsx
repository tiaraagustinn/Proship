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
  
  useEffect(() => {
    setTitle('Dashboard');
  }, [setTitle]);

  // Data Akun Petugas untuk hitung aktif
  const akunData = [
    { id: 1, status: 'AKTIF' },
    { id: 2, status: 'Nonaktif' },
    { id: 3, status: 'AKTIF' },
    { id: 4, status: 'Nonaktif' },
    { id: 5, status: 'AKTIF' },
    { id: 6, status: 'Nonaktif' },
    { id: 7, status: 'AKTIF' },
    { id: 8, status: 'Nonaktif' },
    { id: 9, status: 'AKTIF' },
    { id: 10, status: 'Nonaktif' },
    { id: 11, status: 'AKTIF' },
  ];

  // Data Kapal
  const kapalData = [
    { id: 1, nama: 'KMP. BRR', type: 'Ferry', kapasitas: 500, status: 'AKTIF' },
    { id: 2, nama: 'KMP. Aceh Hebat', type: 'Ferry', kapasitas: 650, status: 'AKTIF' },
    { id: 3, nama: 'KMP. Seulawah', type: 'Ferry', kapasitas: 400, status: 'Nonaktif' },
  ];

  // Data Pelabuhan
  const pelabuhanData = [
    { id: 1, nama: 'Pelabuhan Banda Aceh', lokasi: 'Banda Aceh', kapasitas: 20, status: 'AKTIF' },
    { id: 2, nama: 'Pelabuhan Sabang', lokasi: 'Sabang', kapasitas: 15, status: 'AKTIF' },
  ];

  const petugasAktifCount = akunData.filter(item => item.status === 'AKTIF').length;

  const [stats, setStats] = useState<DashboardStats>({
    petugasAktif: petugasAktifCount,
    jumlahPelabuhan: pelabuhanData.length,
    jumlahKapal: kapalData.length
  });

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
    <div className="m-7 p-8 bg-[#838383] rounded-lg h-screen shadow">
      <div className="grid grid-cols-3 gap-6">
        {/* Card 1 - Petugas Aktif */}
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-5xl font-bold text-white mb-3">
                  {stats.petugasAktif}
                </div>
                <div className="text-white text-sm font-medium">
                  Petugas aktif
                </div>
                <div 
                  onClick={handleDetailPetugas}
                  className="text-white text-xs mt-4 hover:underline cursor-pointer"
                >
                  Detail →
                </div>
              </div>
              <div className="bg-white/20 rounded-full p-4 flex-shrink-0">
                <Users className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 - Jumlah Pelabuhan */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-5xl font-bold text-white mb-3">
                  {stats.jumlahPelabuhan}
                </div>
                <div className="text-white text-sm font-medium">
                  Jumlah pelabuhan
                </div>
                <div 
                  onClick={handleDetailPelabuhan}
                  className="text-white text-xs mt-4 hover:underline cursor-pointer"
                >
                  Detail →
                </div>
              </div>
              <div className="bg-white/20 rounded-full p-4 flex-shrink-0">
                <Anchor className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 - Jumlah Kapal */}
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-5xl font-bold text-white mb-3">
                  {stats.jumlahKapal}
                </div>
                <div className="text-white text-sm font-medium">
                  Jumlah kapal
                </div>
                <div 
                  onClick={handleDetailKapal}
                  className="text-white text-xs mt-4 hover:underline cursor-pointer"
                >
                  Detail →
                </div>
              </div>
              <div className="bg-white/20 rounded-full p-4 flex-shrink-0">
                <Ship className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}