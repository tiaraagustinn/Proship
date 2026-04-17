"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePageTitle } from '@/app/petugas/layout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Ship, Anchor, ClipboardList } from 'lucide-react';

interface DashboardStats {
  jumlahPelabuhan: number;
  jumlahKapal: number;
  jumlahPerjalanan: number;
}

interface TrendPoint {
  name: string;
  value: number;
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function buildTrendData(historisList: { tanggal: string; jumlahPenumpang: number }[]): TrendPoint[] {
  const map: Record<string, number> = {};
  historisList.forEach(item => {
    const datePart = String(item.tanggal).substring(0, 7); // "YYYY-MM"
    map[datePart] = (map[datePart] || 0) + (item.jumlahPenumpang || 0);
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const [, month] = key.split('-');
      return { name: BULAN[parseInt(month, 10) - 1], value };
    });
}

export default function DashboardPage() {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const [userName, setUserName] = useState('Petugas');
  const [stats, setStats] = useState<DashboardStats>({
    jumlahPelabuhan: 0,
    jumlahKapal: 0,
    jumlahPerjalanan: 0,
  });
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);

  useEffect(() => {
    setTitle('Dashboard');
    const storedName = sessionStorage.getItem('userName');
    if (storedName) setUserName(storedName);
  }, [setTitle]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pelabuhanRes, kapalRes, historisRes] = await Promise.all([
          fetch('http://localhost:5000/api/pelabuhan'),
          fetch('http://localhost:5000/api/kapal'),
          fetch('http://localhost:5000/api/historis'),
        ]);
        const pelabuhanJson = await pelabuhanRes.json();
        const kapalJson = await kapalRes.json();
        const historisJson = await historisRes.json();

        const historisList = historisJson.data || [];
        setStats({
          jumlahPelabuhan: (pelabuhanJson.data || []).length,
          jumlahKapal: (kapalJson.data || []).length,
          jumlahPerjalanan: historisList.length,
        });
        setTrendData(buildTrendData(historisList));
      } catch (err) {
        console.error('Gagal fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-4 md:p-8 m-3 md:m-7 bg-white rounded-lg shadow">
      {/* Greeting */}
      <div className="mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-200">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800">Selamat Datang, {userName}! 👋</h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">Berikut adalah ringkasan aktivitas pelayaran</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Card 1 - Jumlah Pelabuhan */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5 md:p-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-3">{stats.jumlahPelabuhan}</div>
                <div className="text-white text-sm font-medium">Jumlah Pelabuhan</div>
                <div
                  onClick={() => router.push('/petugas/input-jadwal')}
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

        {/* Card 2 - Jumlah Kapal */}
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5 md:p-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-3">{stats.jumlahKapal}</div>
                <div className="text-white text-sm font-medium">Jumlah Kapal</div>
                <div
                  onClick={() => router.push('/petugas/input-jadwal')}
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

        {/* Card 3 - Jumlah Perjalanan */}
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg overflow-hidden sm:col-span-2 lg:col-span-1">
          <div className="p-5 md:p-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-3">{stats.jumlahPerjalanan}</div>
                <div className="text-white text-sm font-medium">Historis Perjalanan</div>
                <div
                  onClick={() => router.push('/petugas/historis-pelayaran')}
                  className="text-white text-xs mt-3 md:mt-4 hover:underline cursor-pointer"
                >
                  Detail →
                </div>
              </div>
              <div className="bg-white/20 rounded-full p-3 md:p-4 flex-shrink-0">
                <ClipboardList className="w-6 h-6 md:w-8 md:h-8 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-black p-4 md:p-6 rounded-xl shadow-md">
        <h3 className="text-white mb-4 md:mb-6 text-base md:text-lg font-semibold">
          Tren Pergerakan Jumlah Penumpang
        </h3>
        {trendData.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
            Belum ada data historis pelayaran
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 12 }} />
              <YAxis stroke="#666" tick={{ fontSize: 12 }} />
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
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
