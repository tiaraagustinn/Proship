"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/app/components/user/Header';
import Footer from '@/app/components/user/Footer';

type RuleDetail = {
  idx: number;
  antecedent: number[];
  degrees: Array<number | null>;
  ruleStrength: number;
  weighted: number;
};

type JadwalDetail = {
  id_jadwal: number;
  asal: string;
  tujuan: string;
  armada: string;
  tanggal: string;
  jam: string;
  status_jadwal: string;
  tingkat_keselamatan: string | null;
  kondisi_cuaca: string | null;
  input_gelombang: number | null;
  input_angin: number | null;
  input_arus: number | null;
  skor_fuzzy: number | null;
  kondisi_detail: string | null;
  peringatan: string | null;
  arah_angin: string | null;
  gelombang_desc: string | null;
  waktu_cuaca: string | null;
  isEstimasi: boolean;
  ruleDetails: RuleDetail[];
};

type FuzzyFallback = {
  inputs: { wave: number; wind: number; current: number } | null;
  score: number | null;
  category: string | null;
  ruleDetails: RuleDetail[];
};

type CategoryKey = 'AMAN' | 'WASPADA' | 'BAHAYA';

const CATEGORY_CONFIG: Record<CategoryKey, {
  bg: string;
  border: string;
  text: string;
  textLight: string;
  badge: string;
  icon: string;
  desc: string;
  gradient: string;
  glow: string;
  bgGlow: string;
}> = {
  AMAN: {
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/10',
    border: 'border-emerald-150 dark:border-emerald-800/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    textLight: 'text-emerald-600 dark:text-emerald-500',
    badge: 'bg-emerald-500',
    icon: '🟢',
    desc: 'Kondisi perairan sangat bersahabat dan aman untuk kapal besar.',
    gradient: 'from-emerald-500 via-teal-500 to-emerald-600',
    glow: 'shadow-emerald-500/20',
    bgGlow: 'bg-emerald-500/10',
  },
  WASPADA: {
    bg: 'bg-amber-50/80 dark:bg-amber-950/10',
    border: 'border-amber-150 dark:border-amber-800/30',
    text: 'text-amber-700 dark:text-amber-450',
    textLight: 'text-amber-600 dark:text-amber-500',
    badge: 'bg-amber-500',
    icon: '⚠️',
    desc: 'Perlu kehati-hatian ekstra saat berlayar. Kapal kecil disarankan menunda.',
    gradient: 'from-amber-400 via-orange-400 to-amber-500',
    glow: 'shadow-amber-500/20',
    bgGlow: 'bg-amber-500/10',
  },
  BAHAYA: {
    bg: 'bg-rose-50/80 dark:bg-rose-950/10',
    border: 'border-rose-150 dark:border-rose-800/30',
    text: 'text-rose-700 dark:text-rose-400',
    textLight: 'text-rose-600 dark:text-rose-500',
    badge: 'bg-rose-500',
    icon: '🚨',
    desc: 'Kondisi cuaca ekstrem. Pelayaran tidak disarankan demi keselamatan.',
    gradient: 'from-rose-500 via-red-500 to-rose-600',
    glow: 'shadow-rose-500/20',
    bgGlow: 'bg-rose-500/10',
  },
};

const DEFAULT_CONFIG = {
  bg: 'bg-slate-50/85',
  border: 'border-slate-200',
  text: 'text-slate-600',
  textLight: 'text-slate-500',
  badge: 'bg-slate-400',
  icon: '🌊',
  desc: 'Menghubungkan ke stasiun BMKG...',
  gradient: 'from-slate-400 via-slate-500 to-slate-600',
  glow: 'shadow-slate-500/10',
  bgGlow: 'bg-slate-500/5',
};

function normalizeCategory(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const up = raw.toUpperCase();
  if (up.includes('AMAN')) return 'AMAN';
  if (up.includes('WASPADA')) return 'WASPADA';
  if (up.includes('BAHAYA')) return 'BAHAYA';
  return null;
}

function formatTanggal(iso: string | null) {
  if (!iso) return '—';
  const datePart = iso.includes('T') ? iso.split('T')[0] : iso;
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) {
    return new Date(iso).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return localDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ----------------------------------------------------
// UI SUBCOMPONENTS FOR PREMIUM LOOKS
// ----------------------------------------------------

function RouteIllustration({ asal, tujuan }: { asal: string; tujuan: string }) {
  return (
    <div className="relative w-full py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between px-6 overflow-hidden mt-4 shadow-inner">
      {/* Background soft lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-16 bg-blue-500/10 blur-2xl rounded-full pointer-events-none" />

      <div className="z-10 flex flex-col text-left">
        <span className="text-[9px] text-white/55 uppercase tracking-widest font-extrabold flex items-center gap-1">
          ⚓ Asal
        </span>
        <span className="font-black text-white text-base sm:text-lg tracking-tight mt-0.5">{asal}</span>
      </div>

      {/* Animated Path & Ferry */}
      <div className="flex-1 px-4 relative flex items-center justify-center">
        <div className="w-full relative h-1 border-t-2 border-dashed border-white/20">
          <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex items-center justify-center">
            <span className="text-xl animate-[floatShip_3s_ease-in-out_infinite] -mt-4 drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
              🚢
            </span>
          </div>
        </div>
      </div>

      <div className="z-10 flex flex-col text-right items-end">
        <span className="text-[9px] text-white/55 uppercase tracking-widest font-extrabold flex items-center gap-1">
          🏁 Tujuan
        </span>
        <span className="font-black text-white text-base sm:text-lg tracking-tight mt-0.5">{tujuan}</span>
      </div>
    </div>
  );
}

function CircularGauge({ score, category, isEstimasi }: { score: number | null; category: string | null; isEstimasi: boolean }) {
  const value = score != null ? Math.min(Math.max(score, 0), 100) : 0;

  // SVG Configurations
  const radius = 64;
  const strokeWidth = 10;
  const sqSize = 170;
  const circumference = 2 * Math.PI * radius;
  // We want to draw a 3/4 circle (270 degrees) starting from bottom-left to bottom-right
  // 3/4 of circumference
  const arcLength = circumference * 0.75;
  const strokeDasharray = `${arcLength} ${circumference}`;
  const strokeDashoffset = arcLength - (value / 100) * arcLength;

  const colors = {
    AMAN: { stroke: 'stroke-emerald-500', glow: 'drop-shadow-[0_0_12px_rgba(16,185,129,0.45)]', text: 'text-emerald-500', textLight: 'text-emerald-600' },
    WASPADA: { stroke: 'stroke-amber-500', glow: 'drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]', text: 'text-amber-500', textLight: 'text-amber-600' },
    BAHAYA: { stroke: 'stroke-rose-500', glow: 'drop-shadow-[0_0_12px_rgba(244,63,94,0.45)]', text: 'text-rose-500', textLight: 'text-rose-600' },
    DEFAULT: { stroke: 'stroke-slate-300', glow: '', text: 'text-slate-400', textLight: 'text-slate-500' }
  };
  const theme = (category && colors[category as CategoryKey]) || colors.DEFAULT;

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      {/* Decorative ambient background mesh */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-slate-50 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-slate-50 rounded-full blur-2xl pointer-events-none" />

      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Indeks Keselamatan</p>

      <div className="relative" style={{ width: sqSize, height: sqSize }}>
        <svg className="w-full h-full transform rotate-[135deg]" viewBox={`0 0 ${sqSize} ${sqSize}`}>
          {/* Gray background track */}
          <circle
            className="stroke-slate-100 fill-none"
            cx={sqSize / 2}
            cy={sqSize / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          />
          {/* Glowing gradient color stroke */}
          <circle
            className={`fill-none transition-all duration-1000 ease-out ${theme.stroke} ${theme.glow}`}
            cx={sqSize / 2}
            cy={sqSize / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Text values inside the circular meter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center -mt-2">
          {isEstimasi ? (
            <>
              <span className="text-sm font-bold text-slate-400 tracking-tight text-center px-4">ESTIMASI</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Data Historis</span>
            </>
          ) : (
            <>
              <span className="text-4xl font-black text-slate-800 tracking-tight select-none">
                {score != null ? score.toFixed(1) : '—'}
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Skor Fuzzy</span>
            </>
          )}
        </div>
      </div>

      {category && (
        <div className="mt-2 text-center space-y-1.5 z-10">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border ${category === 'AMAN' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
              category === 'WASPADA' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
            {category}
          </span>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {category === 'AMAN' ? 'Pelayaran Aman' : category === 'WASPADA' ? 'Hati-hati pelayaran' : 'Bahaya pelayaran'}
          </p>
        </div>
      )}
    </div>
  );
}

function PageContent() {
  const searchParams = useSearchParams();
  const jadwalId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detail, setDetail] = useState<JadwalDetail | null>(null);
  const [fallback, setFallback] = useState<FuzzyFallback | null>(null);
  const [showTech, setShowTech] = useState(false);
  const [activeTab, setActiveTab] = useState<'umum' | 'nelayan'>('umum');

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (jadwalId) {
      fetch(`${API_BASE}/jadwal/${jadwalId}/detail`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(data => setDetail(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      fetch(API_BASE + '/fuzzy/evaluate')
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(data => setFallback({
          inputs: data.inputs ?? null,
          score: data.score ?? null,
          category: data.category ?? null,
          ruleDetails: data.ruleDetails ?? [],
        }))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [jadwalId]);

  const category = detail
    ? normalizeCategory(detail.tingkat_keselamatan)
    : normalizeCategory(fallback?.category);

  const toNum = (v: unknown) => { const n = parseFloat(String(v)); return Number.isFinite(n) ? n : null; };
  const score = detail ? toNum(detail.skor_fuzzy) : fallback?.score ?? null;
  const wave = detail ? toNum(detail.input_gelombang) : fallback?.inputs?.wave ?? null;
  const wind = detail ? toNum(detail.input_angin) : fallback?.inputs?.wind ?? null;
  const current = detail ? toNum(detail.input_arus) : fallback?.inputs?.current ?? null;
  const isEstimasi = detail?.isEstimasi ?? false;

  const cfg = category ? (CATEGORY_CONFIG[category as CategoryKey] ?? DEFAULT_CONFIG) : DEFAULT_CONFIG;

  const headerInfo = detail
    ? `${detail.asal} — ${detail.tujuan}`
    : 'Ulee Lheue (Banda Aceh) — Balohan (Sabang)';
  const dateInfo = detail
    ? formatTanggal(detail.tanggal)
    : new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Custom keyframe speed values based on physics parameters
  const waveDuration = wave != null ? Math.max(0.8, 6.0 - (wave * 1.6)) : 3.5;
  const windDuration = wind != null ? Math.max(0.4, 9.0 - (wind * 0.25)) : 4.0;
  const currentDuration = current != null ? Math.max(0.5, 7.0 - (current * 0.06)) : 3.0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100">

      {/* Inject custom CSS keyframes seamlessly */}
      <style>{`
        @keyframes floatShip {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(1.5deg); }
        }
        @keyframes wavesMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes currentFlow {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pulseRadar {
          0% { transform: scale(0.9); opacity: 0.95; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes spinTurbine {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes flowDash {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

      <Header />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Breadcrumb & Header Title */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest">
              <span>Keselamatan</span>
              <span>•</span>
              <span className="text-slate-400">Analisis Fuzzy</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Tingkat Keselamatan Pelayaran
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Hasil kalkulasi tingkat risiko cuaca maritim real-time penyeberangan Selat Benggala
            </p>
          </div>

          {/* Status Utama - Premium Glassmorphism Card */}
          <div className={`relative rounded-3xl overflow-hidden shadow-2xl border ${cfg.border} transition-all duration-300 hover:shadow-xl`}>
            {/* Ambient colorful gradients matching the status */}
            <div className={`absolute inset-0 bg-gradient-to-tr ${cfg.gradient} opacity-95`} />

            {/* Glass Container */}
            <div className="relative px-6 py-8 sm:px-10 sm:py-10 backdrop-blur-[4px] text-white flex flex-col md:flex-row md:items-center md:justify-between gap-8 z-10">
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm border border-white/10">
                    📅 {dateInfo}
                  </span>
                  {detail?.jam && (
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm border border-white/10">
                      🕒 Keberangkatan {detail.jam.slice(0, 5)} WIB
                    </span>
                  )}
                  {detail?.armada && (
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm border border-white/10">
                      🚢 Kapal: {detail.armada}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 leading-none">
                  {headerInfo}
                </h2>

                {/* Visual Route Representation */}
                <RouteIllustration asal={detail?.asal || "Pelabuhan Ulee Lheue"} tujuan={detail?.tujuan || "Pelabuhan Balohan"} />
              </div>

              {/* Pulsing Status Capsule Tag */}
              <div className="flex items-center gap-4 bg-black/15 border border-white/10 rounded-2xl p-5 shadow-lg self-start md:self-center">
                <div className="relative flex items-center justify-center w-12 h-12">
                  {/* Glowing Radar Pulse Effect */}
                  <span className="absolute flex h-full w-full">
                    <span className={`animate-[pulseRadar_2.2s_infinite] absolute inline-flex h-full w-full rounded-full opacity-60 ${category === 'AMAN' ? 'bg-emerald-400' :
                        category === 'WASPADA' ? 'bg-amber-400' : 'bg-rose-450'
                      }`} />
                  </span>
                  <span className={`relative inline-flex items-center justify-center rounded-full h-12 w-12 text-2xl bg-white/10 border border-white/20 shadow-inner select-none`}>
                    {cfg.icon}
                  </span>
                </div>
                <div>
                  <p className="text-[9px] text-white/70 uppercase tracking-widest font-black leading-none mb-1">Tingkat Keselamatan</p>
                  <span className="font-black text-2xl tracking-wider text-white drop-shadow-sm">{category ?? 'Stasiun BMKG'}</span>
                </div>
              </div>
            </div>

            {/* Recommendation Bottom Bar */}
            <div className="relative bg-white/95 dark:bg-slate-900/95 px-6 py-4.5 sm:px-10 border-t border-slate-100 flex items-center gap-3.5">
              <span className="flex h-3.5 w-3.5 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${category === 'AMAN' ? 'bg-emerald-400' :
                    category === 'WASPADA' ? 'bg-amber-400' : 'bg-rose-400'
                  }`} />
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${category === 'AMAN' ? 'bg-emerald-500' :
                    category === 'WASPADA' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
              </span>
              <p className={`text-sm font-extrabold tracking-wide ${cfg.text}`}>{cfg.desc}</p>
            </div>
          </div>

          {!loading && !error && (
            <>
              {/* Prakiraan Cuaca BMKG */}
              {detail && (detail.kondisi_cuaca || detail.kondisi_detail || detail.peringatan) && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8 space-y-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌦️</span>
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Informasi Prakiraan BMKG Maritim</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {detail.kondisi_cuaca && (
                      <span className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 border border-sky-100/80 rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition-transform duration-300 hover:scale-[1.02]">
                        ☁️ Cuaca: <span className="font-black capitalize">{detail.kondisi_cuaca}</span>
                      </span>
                    )}
                    {detail.arah_angin && (
                      <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100/80 rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition-transform duration-300 hover:scale-[1.02]">
                        🧭 Angin Dari: <span className="font-black capitalize">{detail.arah_angin}</span>
                      </span>
                    )}
                    {detail.gelombang_desc && (
                      <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100/80 rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition-transform duration-300 hover:scale-[1.02]">
                        🌊 Kategori Laut: <span className="font-black capitalize">{detail.gelombang_desc}</span>
                      </span>
                    )}
                  </div>
                  {detail.kondisi_detail && (
                    <p className="text-sm text-slate-650 leading-relaxed font-semibold">{detail.kondisi_detail}</p>
                  )}
                  {detail.peringatan && (
                    <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4 shadow-sm">
                      <span className="text-rose-500 text-xl mt-0.5">🚨</span>
                      <div>
                        <p className="text-[10px] font-black text-rose-550 uppercase tracking-wider mb-0.5">Peringatan Dini Cuaca Ekstrem</p>
                        <p className="text-sm text-rose-900 font-extrabold leading-relaxed">{detail.peringatan}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notifikasi Estimasi Jadwal Lama */}
              {isEstimasi && (
                <div className="flex items-start gap-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl px-5 py-4.5 shadow-sm">
                  <span className="text-blue-500 text-xl mt-0.5">ℹ️</span>
                  <div>
                    <p className="text-[10px] font-black text-blue-550 uppercase tracking-wider mb-0.5">Informasi Estimasi Historis</p>
                    <p className="text-sm text-blue-900 font-bold leading-relaxed">
                      Jadwal lama ini menggunakan data cuaca estimasi historis (diimpor sebelum integrasi API otomatis). Nilai parameter di bawah adalah prakiraan rata-rata.
                    </p>
                  </div>
                </div>
              )}

              {/* Layout Dashboard: Kolom 1 (Gauge Score) & Kolom 2 (Cards Inputs) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

                {/* Gauge Indeks Keselamatan */}
                <div className="md:col-span-1">
                  <CircularGauge score={score} category={category} isEstimasi={isEstimasi} />
                </div>

                {/* 3 Parameter Utama */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">

                  {/* Tinggi Gelombang */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black shadow-sm group-hover:scale-105 transition-transform duration-300">🌊</span>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tinggi Gelombang</p>
                      </div>
                      <div>
                        <p className="text-4xl font-black text-slate-800 tracking-tight leading-none">
                          {wave != null ? wave.toFixed(2) : '—'}
                          <span className="text-sm font-extrabold text-slate-400 ml-1">meter</span>
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">BMKG Wave Height Max</p>
                      </div>
                    </div>

                    {wave != null && (
                      <div className="mt-4 space-y-2">
                        {/* Gauge Horizontal */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider">
                            <span>Aman: &lt;1.25m</span>
                            <span>Batas: 4m</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                            <div className={`h-1.5 rounded-full transition-all duration-500 ${wave < 1.25 ? 'bg-emerald-500' :
                                wave < 2.5 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} style={{ width: `${Math.min((wave / 4.0) * 100, 100)}%` }} />
                          </div>
                        </div>

                        {/* Animated Wave SVG Illustration */}
                        <div className="relative w-full h-7 overflow-hidden bg-slate-50 rounded-lg shadow-inner">
                          <svg className="absolute bottom-0 left-0 w-[200%] h-8 flex" viewBox="0 0 200 24" preserveAspectRatio="none">
                            <path
                              d="M0,10 C30,10 30,5 60,5 C90,5 90,10 120,10 C150,10 150,5 180,5 C210,5 210,10 240,10 L240,24 L0,24 Z"
                              className="fill-blue-400/25"
                              style={{ animation: `wavesMove ${waveDuration}s linear infinite` }}
                            />
                            <path
                              d="M0,13 C35,13 35,8 70,8 C105,8 105,13 140,13 C175,13 175,8 210,8 L210,24 L0,24 Z"
                              className="fill-blue-500/40"
                              style={{ animation: `wavesMove ${waveDuration * 0.7}s linear infinite` }}
                            />
                          </svg>
                        </div>

                        {/* Badge Tag */}
                        <div className={`text-center py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${wave < 1.25 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                            wave < 2.5 ? 'text-amber-700 bg-amber-50 border-amber-100' :
                              'text-rose-700 bg-rose-50 border-rose-100'
                          }`}>
                          {wave < 1.25 ? '🟢 Rendah (Aman)' :
                            wave < 2.5 ? '🟡 Sedang (Waspada)' :
                              '🔴 Tinggi (Bahaya)'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Kecepatan Angin */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-sm font-black shadow-sm group-hover:scale-105 transition-transform duration-300">💨</span>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Kecepatan Angin</p>
                      </div>
                      <div>
                        <p className="text-4xl font-black text-slate-800 tracking-tight leading-none">
                          {wind != null ? (wind * 1.852).toFixed(1) : '—'}
                          <span className="text-sm font-extrabold text-slate-400 ml-1">km/jam</span>
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">BMKG Wind Velocity</p>
                      </div>
                    </div>

                    {wind != null && (
                      <div className="mt-4 space-y-2">
                        {/* Gauge Horizontal */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider">
                            <span>Aman: &lt;19 km/jam</span>
                            <span>Batas: 46 km/jam</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                            <div className={`h-1.5 rounded-full transition-all duration-500 ${wind < 10 ? 'bg-emerald-500' :
                                wind < 20 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} style={{ width: `${Math.min((wind * 1.852 / 46.3) * 100, 100)}%` }} />
                          </div>
                        </div>

                        {/* Animated Wind SVG Illustration (Windmill / Wind lines) */}
                        <div className="relative w-full h-7 overflow-hidden bg-slate-50 rounded-lg shadow-inner flex items-center justify-between px-3">
                          {/* Flow lines */}
                          <svg className="w-16 h-6 text-sky-400/30" viewBox="0 0 100 24">
                            <line x1="0" y1="6" x2="100" y2="6" stroke="currentColor" strokeWidth="2" strokeDasharray="8 6" style={{ animation: `currentFlow ${windDuration * 0.8}s linear infinite` }} />
                            <line x1="0" y1="18" x2="100" y2="18" stroke="currentColor" strokeWidth="2" strokeDasharray="12 6" style={{ animation: `currentFlow ${windDuration}s linear infinite` }} />
                          </svg>

                          {/* Small Windmill */}
                          <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24">
                            {/* Tower */}
                            <path d="M11 24 L13 24 L12.5 12 L11.5 12 Z" className="fill-slate-300" />
                            {/* Spinning Rotor */}
                            <g transform="translate(12, 12)">
                              <g style={{ animation: `spinTurbine ${windDuration}s linear infinite`, transformOrigin: '0px 0px' }}>
                                <circle cx="0" cy="0" r="1.5" className="fill-slate-400" />
                                <path d="M-1 -1.5 L1 -1.5 L0.5 -10 L-0.5 -10 Z" className="fill-slate-400" />
                                <path d="M-1.5 -1 L-1.5 1 L-10 0.5 L-10 -0.5 Z" transform="rotate(120)" className="fill-slate-400" />
                                <path d="M-1.5 -1 L-1.5 1 L-10 0.5 L-10 -0.5 Z" transform="rotate(240)" className="fill-slate-400" />
                              </g>
                            </g>
                          </svg>
                        </div>

                        {/* Badge Tag */}
                        <div className={`text-center py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${wind < 10 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                            wind < 20 ? 'text-amber-700 bg-amber-50 border-amber-100' :
                              'text-rose-700 bg-rose-50 border-rose-100'
                          }`}>
                          {wind < 10 ? `🟢 Tenang — ${(wind * 1.852).toFixed(1)} km/jam` :
                            wind < 20 ? `🟡 Sedang — ${(wind * 1.852).toFixed(1)} km/jam` :
                              `🔴 Kencang — ${(wind * 1.852).toFixed(1)} km/jam`}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Kecepatan Arus */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-sm font-black shadow-sm group-hover:scale-105 transition-transform duration-300">🌀</span>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Kecepatan Arus</p>
                      </div>
                      <div>
                        <p className="text-4xl font-black text-slate-800 tracking-tight leading-none">
                          {current != null ? current.toFixed(1) : '—'}
                          <span className="text-sm font-extrabold text-slate-400 ml-1">cm/s</span>
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">BMKG Current Speed</p>
                      </div>
                    </div>

                    {current != null && (
                      <div className="mt-4 space-y-2">
                        {/* Gauge Horizontal */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider">
                            <span>Aman: &lt;25cm/s</span>
                            <span>Batas: 100cm/s</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                            <div className={`h-1.5 rounded-full transition-all duration-500 ${current < 25 ? 'bg-emerald-500' :
                                current < 75 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} style={{ width: `${Math.min((current / 100.0) * 100, 100)}%` }} />
                          </div>
                        </div>

                        {/* Animated Current Speed Flow */}
                        <div className="relative w-full h-7 overflow-hidden bg-slate-50 rounded-lg shadow-inner flex items-center">
                          <svg className="w-full h-4 text-teal-400" viewBox="0 0 160 16">
                            <path
                              d="M0,8 H160"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeDasharray="10 8"
                              style={{ animation: `currentFlow ${currentDuration}s linear infinite` }}
                            />
                            <path
                              d="M0,3 H160"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeDasharray="6 10"
                              style={{ animation: `currentFlow ${currentDuration * 1.3}s linear infinite` }}
                            />
                            <path
                              d="M0,13 H160"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeDasharray="8 6"
                              style={{ animation: `currentFlow ${currentDuration * 0.8}s linear infinite` }}
                            />
                          </svg>
                        </div>

                        {/* Badge Tag */}
                        <div className={`text-center py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${current < 25 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                            current < 75 ? 'text-amber-700 bg-amber-50 border-amber-100' :
                              'text-rose-700 bg-rose-50 border-rose-100'
                          }`}>
                          {current < 25 ? '🟢 Lambat (Aman)' :
                            current < 75 ? '🟡 Sedang (Waspada)' :
                              '🔴 Cepat (Bahaya)'}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Rekomendasi Tindakan Publik - Tabbed & Modern UI */}
              {category && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden transition-all duration-300">
                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Publik</p>
                      <h3 className="text-base font-black text-slate-800">Rekomendasi Keselamatan Pelayaran</h3>
                    </div>
                    {/* Tab Navigation buttons */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => setActiveTab('umum')}
                        className={`px-4 py-2 text-xs font-black rounded-lg transition-all duration-200 ${activeTab === 'umum' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        🚢 Penumpang Umum
                      </button>
                      <button
                        onClick={() => setActiveTab('nelayan')}
                        className={`px-4 py-2 text-xs font-black rounded-lg transition-all duration-200 ${activeTab === 'nelayan' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        🎣 Nelayan & Kapal Kecil
                      </button>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    {activeTab === 'umum' ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">👨‍👩‍👦‍👦</span>
                          <div>
                            <h4 className="text-sm font-black text-slate-800">Panduan untuk Penumpang Kapal Feri / Penyeberangan</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Keselamatan Publik Selat Benggala</p>
                          </div>
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                          {category === 'AMAN' && (
                            <>
                              <li className="flex items-start gap-2 bg-emerald-50/30 p-3.5 border border-emerald-100/50 rounded-2xl">
                                <span className="text-emerald-500 text-sm">✓</span>
                                <span>Penyeberangan berjalan normal sesuai jadwal reguler Syahbandar.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-emerald-50/30 p-3.5 border border-emerald-100/50 rounded-2xl">
                                <span className="text-emerald-500 text-sm">✓</span>
                                <span>Kondisi gelombang dan angin sangat tenang, cocok untuk bepergian.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-emerald-50/30 p-3.5 border border-emerald-100/50 rounded-2xl">
                                <span className="text-emerald-500 text-sm">✓</span>
                                <span>Tetap ikuti arahan petugas pelabuhan saat boarding ke dalam kapal.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-emerald-50/30 p-3.5 border border-emerald-100/50 rounded-2xl">
                                <span className="text-emerald-500 text-sm">✓</span>
                                <span>Gunakan waktu bersantai ini untuk menikmati keindahan laut dengan aman.</span>
                              </li>
                            </>
                          )}
                          {category === 'WASPADA' && (
                            <>
                              <li className="flex items-start gap-2 bg-amber-50/30 p-3.5 border border-amber-100/50 rounded-2xl">
                                <span className="text-amber-550 text-sm">⚠️</span>
                                <span>Kapal tetap berlayar namun berpotensi mengalami guncangan gelombang sedang.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-amber-50/30 p-3.5 border border-amber-100/50 rounded-2xl">
                                <span className="text-amber-550 text-sm">⚠️</span>
                                <span>Penumpang yang rentan mabuk laut disarankan meminum obat pencegah mabuk sebelum berangkat.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-amber-50/30 p-3.5 border border-amber-100/50 rounded-2xl">
                                <span className="text-amber-550 text-sm">⚠️</span>
                                <span>Perhatikan letak jaket pelampung (life jacket) terdekat di dalam deck kapal.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-amber-50/30 p-3.5 border border-amber-100/50 rounded-2xl">
                                <span className="text-amber-550 text-sm">⚠️</span>
                                <span>Harap patuhi instruksi awak kapal dan hindari berdiri di dekat pagar tepi deck.</span>
                              </li>
                            </>
                          )}
                          {category === 'BAHAYA' && (
                            <>
                              <li className="flex items-start gap-2 bg-rose-50/30 p-3.5 border border-rose-100/50 rounded-2xl text-rose-950">
                                <span className="text-rose-500 text-sm">🛑</span>
                                <span className="font-extrabold text-rose-800">Tunda Perjalanan! Jadwal keberangkatan feri kemungkinan besar dibatalkan atau ditunda secara resmi.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-rose-50/30 p-3.5 border border-rose-100/50 rounded-2xl text-rose-950">
                                <span className="text-rose-500 text-sm">🛑</span>
                                <span>Harap tetap berada di terminal penumpang pelabuhan dan tunggu pengumuman dari pihak Syahbandar/DISHUB.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-rose-50/30 p-3.5 border border-rose-100/50 rounded-2xl text-rose-950">
                                <span className="text-rose-500 text-sm">🛑</span>
                                <span>Gelombang tinggi berisiko mengakibatkan kecelakaan laut yang membahayakan nyawa.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-rose-50/30 p-3.5 border border-rose-100/50 rounded-2xl text-rose-950">
                                <span className="text-rose-500 text-sm">🛑</span>
                                <span>Pantau pembaruan status pelayaran berkala di halaman sistem monitoring ini.</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🛶</span>
                          <div>
                            <h4 className="text-sm font-black text-slate-800">Panduan untuk Nelayan Tradisional & Kapal Motor Kecil</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Keselamatan Nelayan Selat Benggala</p>
                          </div>
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                          {category === 'AMAN' && (
                            <>
                              <li className="flex items-start gap-2 bg-emerald-50/30 p-3.5 border border-emerald-100/50 rounded-2xl">
                                <span className="text-emerald-500 text-sm">✓</span>
                                <span>Aktivitas melaut mencari ikan aman dilakukan tanpa kendala cuaca.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-emerald-50/30 p-3.5 border border-emerald-100/50 rounded-2xl">
                                <span className="text-emerald-500 text-sm">✓</span>
                                <span>Kondisi arus laut lambat dan mempermudah pemasangan jaring ikan.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-emerald-50/30 p-3.5 border border-emerald-100/50 rounded-2xl">
                                <span className="text-emerald-500 text-sm">✓</span>
                                <span>Pastikan radio komunikasi kapal berfungsi dengan baik sebelum berangkat.</span>
                              </li>
                            </>
                          )}
                          {category === 'WASPADA' && (
                            <>
                              <li className="flex items-start gap-2 bg-amber-50/30 p-3.5 border border-amber-100/50 rounded-2xl text-amber-950">
                                <span className="text-amber-550 text-sm">⚠️</span>
                                <span className="font-extrabold text-amber-800">Kapal ukuran di bawah 15 GT sangat direkomendasikan tidak melaut terlalu jauh ke tengah laut bebas.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-amber-50/30 p-3.5 border border-amber-100/50 rounded-2xl">
                                <span className="text-amber-550 text-sm">⚠️</span>
                                <span>Kondisi hembusan angin sewaktu-waktu dapat meningkat mendadak memicu ombak pecah.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-amber-50/30 p-3.5 border border-amber-100/50 rounded-2xl">
                                <span className="text-amber-550 text-sm">⚠️</span>
                                <span>Wajib membawa pelampung keselamatan (life jacket) bagi seluruh kru perahu nelayan.</span>
                              </li>
                            </>
                          )}
                          {category === 'BAHAYA' && (
                            <>
                              <li className="flex items-start gap-2 bg-rose-50/30 p-3.5 border border-rose-100/50 rounded-2xl text-rose-950">
                                <span className="text-rose-500 text-sm">🛑</span>
                                <span className="font-black text-rose-800">LARANGAN MELAUT! Kapal nelayan dan perahu kecil dilarang keras berlayar di perairan ini.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-rose-50/30 p-3.5 border border-rose-100/50 rounded-2xl text-rose-950">
                                <span className="text-rose-500 text-sm">🛑</span>
                                <span>Risiko terbalik akibat terhempas gelombang tinggi ekstrem dan tarikan arus bawah laut yang sangat kuat.</span>
                              </li>
                              <li className="flex items-start gap-2 bg-rose-50/30 p-3.5 border border-rose-100/50 rounded-2xl text-rose-950">
                                <span className="text-rose-500 text-sm">🛑</span>
                                <span>Tambatkan perahu Anda dengan kuat di pelabuhan tambatan masing-masing agar aman dari benturan ombak pasang.</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </>
          )}

          {/* Kategori Legenda Cuaca */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {(Object.entries(CATEGORY_CONFIG) as [CategoryKey, typeof CATEGORY_CONFIG[CategoryKey]][]).map(([key, val]) => (
              <div key={key} className={`rounded-3xl border p-6 transition-all duration-300 hover:shadow-md ${val.bg} ${val.border} ${category === key ? 'ring-2 ring-offset-2 ring-blue-500 shadow-md scale-[1.01]' : ''}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{val.icon}</span>
                  <span className={`font-black text-sm tracking-widest ${val.text}`}>{key}</span>
                  {category === key && (
                    <span className="ml-auto text-[8px] font-black bg-white text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                      STATUS SAAT INI
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-650 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>

          {/* Info Metodologi / Footer Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-350 leading-relaxed flex flex-col sm:flex-row items-center gap-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="text-4xl select-none animate-[floatShip_3s_ease-in-out_infinite]">⚓</div>
            <div className="text-left flex-1 space-y-1.5 z-10">
              <p className="font-black text-white text-base tracking-wide">Metodologi Integrasi Sistem</p>
              <p className="text-slate-400 text-xs sm:text-sm font-semibold">
                Sistem monitoring ini terintegrasi langsung ke satelit BMKG Maritim untuk wilayah Pelayaran Selat Benggala. Nilai parameter diperbarui secara otomatis setiap 6 jam untuk memberikan data prakiraan cuaca yang akurat dan andal bagi keselamatan masyarakat.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TingkatKeselamatanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}
