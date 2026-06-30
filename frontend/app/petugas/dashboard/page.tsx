"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

function buildTrendData(historisList: { tanggal: string; jmlh_penumpang: number }[]): TrendPoint[] {
  const map: Record<string, number> = {};
  historisList.forEach(item => {
    const datePart = String(item.tanggal).substring(0, 7); // "YYYY-MM"
    map[datePart] = (map[datePart] || 0) + (item.jmlh_penumpang || 0);
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
          fetch(API_BASE + '/pelabuhan'),
          fetch(API_BASE + '/kapal'),
          fetch(API_BASE + '/historis'),
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

  const handleInputJadwal = () => {
    router.push('/petugas/input-jadwal');
  };

  const handleProfil = () => {
    router.push('/petugas/profil');
  };

  return (
    <div className="m-3 md:m-7 space-y-6">
      <section className="rounded-[28px] bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Dashboard Petugas</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Halo, {userName}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Pantau data pelabuhan, kapal, dan perjalanan dengan tampilan yang ringan dan mudah dibaca.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Pelabuhan</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">{stats.jumlahPelabuhan}</p>
            </div>
            <div className="rounded-3xl bg-slate-100 p-3 text-slate-700">
              <Anchor className="w-6 h-6" strokeWidth={2} />
            </div>
          </div>
          <button
            onClick={handleInputJadwal}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Tambah jadwal →
          </button>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Kapal</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">{stats.jumlahKapal}</p>
            </div>
            <div className="rounded-3xl bg-slate-100 p-3 text-slate-700">
              <Ship className="w-6 h-6" strokeWidth={2} />
            </div>
          </div>
          <button
            onClick={handleInputJadwal}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Tambah jadwal →
          </button>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Perjalanan</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">{stats.jumlahPerjalanan}</p>
            </div>
            <div className="rounded-3xl bg-slate-100 p-3 text-slate-700">
              <ClipboardList className="w-6 h-6" strokeWidth={2} />
            </div>
          </div>
          <button
            onClick={() => router.push('/petugas/historis-pelayaran')}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Lihat historis →
          </button>
        </div>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tren Jumlah Penumpang</h2>
            <p className="mt-1 text-sm text-slate-600">Grafik sederhana untuk memahami pergerakan penumpang.</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          {trendData.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-slate-400 text-sm">
              Belum ada data historis pelayaran
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                  labelStyle={{ color: '#0f172a' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
