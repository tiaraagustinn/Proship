"use client";

import { useState, useEffect } from 'react';
import { usePageTitle } from '@/app/admin/layout';
import { Users, Ship, Anchor } from 'lucide-react';

interface DashboardStats {
  petugasAktif: number;
  jumlahPelabuhan: number;
  jumlahKapal: number;
}

export default function AdminDashboardPage() {
  const { setTitle } = usePageTitle();
  
  useEffect(() => {
    setTitle('Dashboard');
  }, [setTitle]);

  const [stats, setStats] = useState<DashboardStats>({
    petugasAktif: 2,
    jumlahPelabuhan: 6,
    jumlahKapal: 2
  });

  const handleDetailClick = (type: string) => {
    alert(`Detail untuk ${type}`);
  };

  return (
    <div className="m-7 p-8 bg-[#838383] rounded-lg h-screen shadow">
      {/* <div className="bg-gray-400 rounded-xl p-8"> */}
        <div className="grid grid-cols-3 gap-6">
          {/* Card 1 - Petugas Aktif */}
          <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-6xl font-bold text-white mb-2">
                    {stats.petugasAktif}
                  </div>
                  <div className="text-white text-lg font-medium">
                    Petugas aktif
                  </div>
                </div>
                <div className="text-white/40">
                  <Users className="w-16 h-16" strokeWidth={1.5} />
                </div>
              </div>
              <button 
                onClick={() => handleDetailClick('Petugas Aktif')}
                className="w-full py-2 bg-cyan-700 text-white rounded hover:bg-cyan-800 transition font-medium"
              >
                Detail ↗
              </button>
            </div>
          </div>

          {/* Card 2 - Jumlah Pelabuhan */}
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-6xl font-bold text-white mb-2">
                    {stats.jumlahPelabuhan}
                  </div>
                  <div className="text-white text-lg font-medium">
                    Jumlah pelabuhan
                  </div>
                </div>
                <div className="text-white/40">
                  <Anchor className="w-16 h-16" strokeWidth={1.5} />
                </div>
              </div>
              <button 
                onClick={() => handleDetailClick('Pelabuhan')}
                className="w-full py-2 bg-green-800 text-white rounded hover:bg-green-900 transition font-medium"
              >
                Detail ↗
              </button>
            </div>
          </div>

          {/* Card 3 - Jumlah Kapal */}
          <div className="bg-gradient-to-br from-[#F39C12] to-orange-400 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-6xl font-bold text-white mb-2">
                    {stats.jumlahKapal}
                  </div>
                  <div className="text-white text-lg font-medium">
                    Jumlah kapal
                  </div>
                </div>
                <div className="text-white/50">
                  <Ship className="w-16 h-16" strokeWidth={1.5} />
                </div>
              </div>
              <button 
                onClick={() => handleDetailClick('Kapal')}
                className="w-full py-2 bg-[#BE7809] text-white rounded hover:bg-[#924413] transition font-medium"
              >
                Detail ↗
              </button>
            </div>
          </div>
        </div>
      {/* </div> */}
    </div>
  );
}