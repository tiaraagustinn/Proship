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
          fetch(${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/petugas'),
          fetch(${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/pelabuhan'),
          fetch(${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/kapal'),
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
    <div className="m-3 md:m-7 space-y-6">
      <section className="rounded-[28px] bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Dashboard Admin</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Selamat datang, {userName}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Ringkas dan jelas: lihat data pelabuhan, kapal, dan petugas dari satu tampilan.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Petugas aktif</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">{stats.petugasAktif}</p>
            </div>
            <div className="rounded-3xl bg-slate-100 p-3 text-slate-700">
              <Users className="w-6 h-6" strokeWidth={2} />
            </div>
          </div>
          <button
            onClick={handleDetailPetugas}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Lihat petugas →
          </button>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Jumlah pelabuhan</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">{stats.jumlahPelabuhan}</p>
            </div>
            <div className="rounded-3xl bg-slate-100 p-3 text-slate-700">
              <Anchor className="w-6 h-6" strokeWidth={2} />
            </div>
          </div>
          <button
            onClick={handleDetailPelabuhan}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Lihat pelabuhan →
          </button>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Jumlah kapal</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">{stats.jumlahKapal}</p>
            </div>
            <div className="rounded-3xl bg-slate-100 p-3 text-slate-700">
              <Ship className="w-6 h-6" strokeWidth={2} />
            </div>
          </div>
          <button
            onClick={handleDetailKapal}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Lihat kapal →
          </button>
        </div>
      </div>
    </div>
  );
}