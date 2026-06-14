"use client";

import Header from "@/app/components/user/Header";
import Footer from "@/app/components/user/Footer";
import DatePicker from "react-datepicker";
import {
  PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer, Legend,
} from "recharts";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const PIE_COLORS  = ["#22c55e", "#0369a1"];
const BAR_COLORS  = ["#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#f97316"];

interface Summary {
  total_penumpang: number;
  total_kend_r2: number;
  total_kend_r4: number;
  total_muatan: number;
}

interface ByRute {
  asal: string;
  tujuan: string;
  penumpang: number;
  kend_r2: number;
  kend_r4: number;
  muatan: number;
}

interface KapalBulan {
  bulan: string;
  sort_key: string;
  [kapal: string]: number | string;
}

interface Trend {
  bulan: string;
  penumpang: number;
  kend_r2: number;
  kend_r4: number;
}

interface DashboardData {
  summary: Summary;
  by_rute: ByRute[];
  kapal_bulan: KapalBulan[];
  kapal_list: string[];
  trend: Trend[];
}

const EMPTY: DashboardData = {
  summary: { total_penumpang: 0, total_kend_r2: 0, total_kend_r4: 0, total_muatan: 0 },
  by_rute: [],
  kapal_bulan: [],
  kapal_list: [],
  trend: [],
};

function fmt(n: number): string {
  return Number(n).toLocaleString('id-ID');
}

function toDateStr(d: Date | null): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

export default function DashboardMonitoringPage() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate]     = useState<Date | null>(null);
  const [data, setData]           = useState<DashboardData>(EMPTY);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchDashboard = useCallback(async (from?: string | null, to?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to)   params.set('to', to);
      const res = await fetch(`${API}/manifes/dashboard?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) setData(json);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Terjadi kesalahan");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleFilter = () => {
    fetchDashboard(toDateStr(startDate), toDateStr(endDate));
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    fetchDashboard();
  };

  const pieData = [
    { name: 'Roda 2', value: Number(data.summary.total_kend_r2) },
    { name: 'Roda 4', value: Number(data.summary.total_kend_r4) },
  ];

  const hasKapalData = data.kapal_bulan.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-cyan-50 to-blue-50">
      <Header />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-black">
          <h1 className="text-3xl font-bold mb-6 tracking-tight">Dashboard Monitoring</h1>

          {/* Filter */}
          <div className="bg-white/90 backdrop-blur rounded-xl border border-sky-100 shadow-sm p-4 sm:p-5 mb-8">
            <p className="text-sm font-semibold text-slate-700 mb-3">Filter Periode</p>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium mb-1 text-slate-500">Dari tanggal</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate ?? undefined}
                  endDate={endDate ?? undefined}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  placeholderText="Pilih tanggal"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <span className="text-slate-400 text-sm hidden sm:block mb-2">—</span>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium mb-1 text-slate-500">Hingga tanggal</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate ?? undefined}
                  endDate={endDate ?? undefined}
                  minDate={startDate ?? undefined}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 text-sm"
                  placeholderText="Pilih tanggal"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleFilter}
                  disabled={!startDate || !endDate || loading}
                  className="px-6 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed text-sm h-[38px] whitespace-nowrap"
                >
                  Terapkan
                </button>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm h-[38px] whitespace-nowrap"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
              Gagal memuat data: {error}
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Jumlah Penumpang', value: fmt(data.summary.total_penumpang), unit: 'orang' },
              { label: 'Kendaraan Roda 2', value: fmt(data.summary.total_kend_r2), unit: 'unit' },
              { label: 'Kendaraan Roda 4', value: fmt(data.summary.total_kend_r4), unit: 'unit' },
              { label: 'Berat Muatan', value: fmt(data.summary.total_muatan), unit: 'ton' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-medium mb-1 text-slate-600">{label}</h3>
                {loading
                  ? <div className="h-8 bg-slate-100 rounded animate-pulse w-24 mt-1" />
                  : <p className="text-2xl font-bold text-slate-900">{value} <span className="text-sm font-normal text-slate-400">{unit}</span></p>
                }
              </div>
            ))}
          </div>

          {/* Tabel per rute */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">Rekapitulasi per Rute</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Pelabuhan Asal</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Tujuan</th>
                    <th className="px-6 py-3 text-right whitespace-nowrap">Penumpang</th>
                    <th className="px-6 py-3 text-right whitespace-nowrap">Kend. Roda 2</th>
                    <th className="px-6 py-3 text-right whitespace-nowrap">Kend. Roda 4</th>
                    <th className="px-6 py-3 text-right whitespace-nowrap">Muatan (Ton)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Memuat data...</td>
                    </tr>
                  ) : data.by_rute.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Belum ada data historis</td>
                    </tr>
                  ) : (
                    data.by_rute.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'hover:bg-slate-50 transition-colors' : 'bg-slate-50 hover:bg-slate-100 transition-colors'}>
                        <td className="px-6 py-4">{row.asal}</td>
                        <td className="px-6 py-4">{row.tujuan}</td>
                        <td className="px-6 py-4 text-right">{fmt(row.penumpang)}</td>
                        <td className="px-6 py-4 text-right">{fmt(row.kend_r2)}</td>
                        <td className="px-6 py-4 text-right">{fmt(row.kend_r4)}</td>
                        <td className="px-6 py-4 text-right">{fmt(row.muatan)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts baris 1 — Pie + Grouped Bar berdampingan */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Pie — distribusi kendaraan */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold mb-4">Distribusi Kendaraan</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      outerRadius={110}
                      dataKey="value"
                      label={(props: { name?: string; value?: number | string }) =>
                      `${props.name}: ${fmt(Number(props.value ?? 0))}`
                      }
                      labelLine={true}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grouped Bar — penumpang per kapal per bulan */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold mb-4">Penumpang per Kapal</h3>
              <div className="h-[300px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">Memuat data...</div>
                ) : !hasKapalData ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">Belum ada data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.kapal_bulan} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} barCategoryGap="25%" barGap={3}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="bulan" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v: number) => [fmt(v), 'Penumpang']} />
                      <Legend iconType="circle" iconSize={8} />
                      {data.kapal_list.map((kapal, i) => (
                        <Bar
                          key={kapal}
                          dataKey={kapal}
                          name={kapal}
                          fill={BAR_COLORS[i % BAR_COLORS.length]}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Area — tren pergerakan */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-semibold text-slate-800">Tren Pergerakan Angkutan</h3>
                <p className="text-xs text-slate-400 mt-0.5">Jumlah penumpang dan kendaraan per bulan</p>
              </div>
              {/* Mini legend chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  { color: '#6366f1', label: 'Penumpang', key: 'penumpang' as const },
                  { color: '#10b981', label: 'Kend. Roda 2', key: 'kend_r2' as const },
                  { color: '#f59e0b', label: 'Kend. Roda 4', key: 'kend_r4' as const },
                ].map(({ color, label, key }) => {
                  const total = data.trend.reduce((s, d) => s + Number(d[key] ?? 0), 0);
                  return (
                    <div key={key} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-xs text-slate-500">{label}</span>
                      <span className="text-xs font-bold text-slate-700">{fmt(total)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-[300px]">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Memuat data...</div>
              ) : data.trend.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  <p className="text-sm">Belum ada data tren</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradPenumpang" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradR2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradR4" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      formatter={(v: number, name: string) => {
                        const labels: Record<string, string> = { penumpang: 'Penumpang', kend_r2: 'Kend. Roda 2', kend_r4: 'Kend. Roda 4' };
                        return [fmt(v), labels[name] ?? name];
                      }}
                    />
                    <Area type="monotone" dataKey="penumpang" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradPenumpang)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
                    <Area type="monotone" dataKey="kend_r2"   stroke="#10b981" strokeWidth={2}   fill="url(#gradR2)"        dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
                    <Area type="monotone" dataKey="kend_r4"   stroke="#f59e0b" strokeWidth={2}   fill="url(#gradR4)"        dot={false} activeDot={{ r: 4, fill: '#f59e0b' }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
