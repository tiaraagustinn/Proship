"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/app/petugas/layout';
import { usePageTitle } from '@/app/petugas/layout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Users, Minus, Ship } from 'lucide-react';

interface HistorisData {
  id: number;
  keberangkatan: string;
  tujuan: string;
  tanggal: string;
  penumpang: number;
  kendaraan: number;
  muatan: number;
  armada: string;
}

const trendData = [
  { name: 'Jul', value: 200 },
  { name: 'Aug', value: 300 },
  { name: 'Sep', value: 500 },
  { name: 'Oct', value: 750 },
  { name: 'Nov', value: 400 },
  { name: 'Dec', value: 600 },
  { name: 'Jan', value: 650 },
];

export default function DashboardPage() {
  const { setTitle } = usePageTitle();
  const router = useRouter();

  // Data Historis Pelayaran
  const [historisData] = useState<HistorisData[]>([
    { id: 1, keberangkatan: 'Banda Aceh', tujuan: 'Sabang', tanggal: '2024-01-15', penumpang: 450, kendaraan: 12, muatan: 2500, armada: 'KMP. BRR' },
    { id: 2, keberangkatan: 'Sabang', tujuan: 'Banda Aceh', tanggal: '2024-01-16', penumpang: 380, kendaraan: 10, muatan: 2200, armada: 'KMP. Aceh Hebat' },
    { id: 3, keberangkatan: 'Banda Aceh', tujuan: 'Sabang', tanggal: '2024-01-17', penumpang: 520, kendaraan: 15, muatan: 2800, armada: 'KMP. BRR' },
    { id: 4, keberangkatan: 'Sabang', tujuan: 'Banda Aceh', tanggal: '2024-01-18', penumpang: 410, kendaraan: 11, muatan: 2400, armada: 'KMP. Aceh Hebat' },
    { id: 5, keberangkatan: 'Banda Aceh', tujuan: 'Sabang', tanggal: '2024-01-19', penumpang: 490, kendaraan: 13, muatan: 2600, armada: 'KMP. BRR' },
  ]);

  const totalPenumpang = historisData.reduce((sum, item) => sum + item.penumpang, 0);
  const totalMuatan = historisData.reduce((sum, item) => sum + item.muatan, 0);
  const totalPerjalanan = historisData.length;

  const [stats] = useState({
    penumpang: totalPenumpang,
    muatan: totalMuatan,
    pelayaran: totalPerjalanan
  });

  const handleDetailClick = () => {
    router.push('/petugas/historis-pelayaran');
  };

  useEffect(() => {
    setTitle('Dashboard');
  }, [setTitle]);

  return (
    <div className="p-8 m-7 bg-white rounded-lg shadow">
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Card 1 - Penumpang */}
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-5xl font-bold text-white mb-3">
                  {stats.penumpang.toLocaleString()}
                </div>
                <div className="text-white text-sm font-medium">
                  Penumpang
                </div>
                <div 
                  onClick={handleDetailClick}
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

        {/* Card 2 - Berat Muatan */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-5xl font-bold text-white mb-3">
                  {(stats.muatan / 1000).toFixed(1)}K
                </div>
                <div className="text-white text-sm font-medium">
                  Berat muatan (kg)
                </div>
                <div 
                  onClick={handleDetailClick}
                  className="text-white text-xs mt-4 hover:underline cursor-pointer"
                >
                  Detail →
                </div>
              </div>
              <div className="bg-white/20 rounded-full p-4 flex-shrink-0">
                <Minus className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 - Jumlah Perjalanan */}
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-5xl font-bold text-white mb-3">
                  {stats.pelayaran}
                </div>
                <div className="text-white text-sm font-medium">
                  Perjalanan
                </div>
                <div 
                  onClick={handleDetailClick}
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

      {/* Chart */}
      <div className="bg-black p-6 rounded-xl shadow-md">
        <h3 className="text-white mb-6 text-lg font-semibold">
          Tren Pergerakan Jumlah Penumpang
        </h3>
        <AreaChart width={1080} height={400} data={trendData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="name" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#fff' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#3B82F6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </div>
    </div>
  );
}