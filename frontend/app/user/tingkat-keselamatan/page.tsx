"use client";
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
  bg: string; border: string; text: string; badge: string;
  icon: string; desc: string; gradient: string;
}> = {
  AMAN: {
    bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700',
    badge: 'bg-emerald-500', icon: '✅', desc: 'Kondisi perairan aman untuk berlayar.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  WASPADA: {
    bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700',
    badge: 'bg-amber-500', icon: '⚠️', desc: 'Perlu kehati-hatian ekstra saat berlayar.',
    gradient: 'from-amber-400 to-orange-500',
  },
  BAHAYA: {
    bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700',
    badge: 'bg-red-500', icon: '🚨', desc: 'Tidak dianjurkan untuk berlayar.',
    gradient: 'from-red-500 to-rose-600',
  },
};

const DEFAULT_CONFIG = {
  bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600',
  badge: 'bg-gray-400', icon: '🌊', desc: 'Menunggu data cuaca dari BMKG...',
  gradient: 'from-gray-400 to-gray-500',
};

function normalizeCategory(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const up = raw.toUpperCase();
  if (up.includes('AMAN'))    return 'AMAN';
  if (up.includes('WASPADA')) return 'WASPADA';
  if (up.includes('BAHAYA'))  return 'BAHAYA';
  return null;
}

function ScoreBar({ score }: { score: number | null }) {
  const pct = score != null ? Math.min(Math.max((score / 100) * 100, 0), 100) : 0;
  const color = score == null ? 'bg-gray-300'
    : score >= 70 ? 'bg-emerald-500'
    : score >= 40 ? 'bg-amber-500'
    : 'bg-red-500';
  return (
    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
      <div className={`h-3 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function formatTanggal(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function PageContent() {
  const searchParams = useSearchParams();
  const jadwalId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [detail, setDetail]   = useState<JadwalDetail | null>(null);
  const [fallback, setFallback] = useState<FuzzyFallback | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (jadwalId) {
      fetch(`http://localhost:5000/api/jadwal/${jadwalId}/detail`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(data => setDetail(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      fetch('http://localhost:5000/api/fuzzy/evaluate')
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
  const score   = detail ? toNum(detail.skor_fuzzy)      : fallback?.score ?? null;
  const wave    = detail ? toNum(detail.input_gelombang) : fallback?.inputs?.wave ?? null;
  const wind    = detail ? toNum(detail.input_angin)     : fallback?.inputs?.wind ?? null;
  const current = detail ? toNum(detail.input_arus)      : fallback?.inputs?.current ?? null;
  const rules       = detail?.ruleDetails ?? fallback?.ruleDetails ?? [];
  const isEstimasi  = detail?.isEstimasi ?? false;

  const cfg = category ? (CATEGORY_CONFIG[category as CategoryKey] ?? DEFAULT_CONFIG) : DEFAULT_CONFIG;

  const headerInfo = detail
    ? `${detail.asal} — ${detail.tujuan} · ${detail.armada}`
    : 'Rute: Ulee Lheue (Banda Aceh) — Balohan (Sabang)';
  const dateInfo = detail
    ? formatTanggal(detail.tanggal)
    : new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tingkat Keselamatan Pelayaran</h1>

          {/* Status utama */}
          <div className={`rounded-2xl border overflow-hidden ${cfg.border}`}>
            <div className={`bg-gradient-to-r ${cfg.gradient} px-6 py-5 text-white`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-white/80 text-sm">{dateInfo}</p>
                  <p className="font-semibold mt-0.5">{headerInfo}</p>
                  {detail?.jam && (
                    <p className="text-white/70 text-sm mt-0.5">Jam keberangkatan: {detail.jam.slice(0, 5)}</p>
                  )}
                </div>
                {loading ? (
                  <div className="h-10 w-28 bg-white/20 rounded-full animate-pulse" />
                ) : (
                  <div className="flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-5 py-2">
                    <span className="text-xl">{cfg.icon}</span>
                    <span className="font-bold text-lg tracking-wide">{category ?? '—'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={`${cfg.bg} px-6 py-5`}>
              {loading ? (
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
                  <span className="text-sm">Menghitung tingkat keselamatan...</span>
                </div>
              ) : error ? (
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">⚠️</span>
                  <div>
                    <p className="font-semibold text-gray-800">Data belum tersedia</p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Sistem fuzzy belum dapat dievaluasi karena data cuaca dari BMKG sedang tidak bisa diakses.
                    </p>
                  </div>
                </div>
              ) : (
                <p className={`text-sm font-medium ${cfg.text}`}>{cfg.desc}</p>
              )}
            </div>
          </div>

          {!loading && !error && (
            <>
              {/* Kondisi cuaca dari BMKG */}
              {detail && (detail.kondisi_cuaca || detail.kondisi_detail || detail.peringatan) && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Kondisi Cuaca</h2>
                  <div className="flex flex-wrap gap-3">
                    {detail.kondisi_cuaca && (
                      <span className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-sky-700 rounded-full px-3 py-1 text-sm font-medium">
                        🌦 {detail.kondisi_cuaca.charAt(0).toUpperCase() + detail.kondisi_cuaca.slice(1)}
                      </span>
                    )}
                    {detail.arah_angin && (
                      <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-full px-3 py-1 text-sm">
                        🧭 Angin dari {detail.arah_angin}
                      </span>
                    )}
                    {detail.gelombang_desc && (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1 text-sm">
                        🌊 {detail.gelombang_desc}
                      </span>
                    )}
                  </div>
                  {detail.kondisi_detail && (
                    <p className="text-sm text-gray-600 leading-relaxed">{detail.kondisi_detail}</p>
                  )}
                  {detail.peringatan && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <span className="text-amber-500 mt-0.5">⚠️</span>
                      <p className="text-sm text-amber-800 font-medium">{detail.peringatan}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Notif jadwal lama */}
              {isEstimasi && (
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                  <span className="text-blue-500 mt-0.5">ℹ️</span>
                  <p className="text-sm text-blue-800">
                    Data input cuaca untuk jadwal ini tidak tersimpan lengkap (jadwal dibuat sebelum pembaruan sistem).
                    Nilai angin di bawah merupakan <strong>estimasi</strong> dari data yang tersimpan; skor tidak ditampilkan.
                  </p>
                </div>
              )}

              {/* Parameter input fuzzy */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-lg">🌊</div>
                    <p className="text-sm font-semibold text-gray-700">Tinggi Gelombang</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {wave != null ? wave.toFixed(2) : '—'}
                    <span className="text-base font-normal text-gray-400 ml-1">m</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Input fuzzy (wave_max BMKG)</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-lg">💨</div>
                    <p className="text-sm font-semibold text-gray-700">Kecepatan Angin</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {wind != null ? wind.toFixed(1) : '—'}
                    <span className="text-base font-normal text-gray-400 ml-1">knot</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isEstimasi ? 'Estimasi dari data tersimpan' : 'Input fuzzy (wind_speed_max BMKG)'}
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-lg">🌀</div>
                    <p className="text-sm font-semibold text-gray-700">Kecepatan Arus</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {current != null ? current.toFixed(1) : '—'}
                    <span className="text-base font-normal text-gray-400 ml-1">cm/s</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Input fuzzy (current_speed_max BMKG)</p>
                </div>
              </div>

              {/* Skor fuzzy */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Skor Keselamatan (Fuzzy Mamdani)</p>
                    {isEstimasi ? (
                      <p className="text-2xl font-bold text-gray-400 mt-1">Tidak Tersedia</p>
                    ) : (
                      <>
                        <p className={`text-5xl font-extrabold ${cfg.text}`}>
                          {score != null ? Number(score).toFixed(1) : '—'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {score != null
                            ? score >= 70 ? 'Score ≥ 70 → AMAN'
                            : score >= 40 ? 'Score 40–69 → WASPADA'
                            : 'Score < 40 → BAHAYA'
                            : ''}
                        </p>
                      </>
                    )}
                  </div>
                  {!isEstimasi && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Rules aktif</p>
                      <p className="text-3xl font-bold text-gray-800">{rules.length}</p>
                      <p className="text-xs text-gray-400">dari total rules</p>
                    </div>
                  )}
                </div>
                {!isEstimasi && (
                  <>
                    <ScoreBar score={score} />
                    <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                      <span>0 – BAHAYA</span>
                      <span>40 – WASPADA</span>
                      <span>70 – AMAN – 100</span>
                    </div>
                  </>
                )}
              </div>

              {/* Detail rules */}
              {rules.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800">Detail Rule Fuzzy</h2>
                    <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
                      {rules.length} rules
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="px-5 py-3 text-center w-12">#</th>
                          <th className="px-5 py-3 text-left">Antecedent</th>
                          <th className="px-5 py-3 text-left">Degrees</th>
                          <th className="px-5 py-3 text-center">Strength</th>
                          <th className="px-5 py-3 text-center">Weighted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {rules.map((r, i) => (
                          <tr key={r.idx} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                            <td className="px-5 py-2.5 text-center text-gray-400 font-mono text-xs">{r.idx}</td>
                            <td className="px-5 py-2.5 font-mono text-xs text-gray-700">[{r.antecedent.join(', ')}]</td>
                            <td className="px-5 py-2.5 text-xs text-gray-500">
                              {r.degrees.map(d => d == null ? '—' : d.toFixed(3)).join(', ')}
                            </td>
                            <td className="px-5 py-2.5 text-center">
                              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${r.ruleStrength > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                {r.ruleStrength.toFixed(4)}
                              </span>
                            </td>
                            <td className="px-5 py-2.5 text-center text-xs text-gray-600 font-mono">
                              {r.weighted.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Keterangan kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(Object.entries(CATEGORY_CONFIG) as [CategoryKey, typeof CATEGORY_CONFIG[CategoryKey]][]).map(([key, val]) => (
              <div key={key} className={`rounded-xl border p-4 ${val.bg} ${val.border} ${category === key ? 'ring-2 ring-offset-1 ring-current' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{val.icon}</span>
                  <span className={`font-bold text-sm ${val.text}`}>{key}</span>
                  {category === key && <span className="ml-auto text-xs font-semibold bg-white/70 px-2 py-0.5 rounded-full text-gray-600">Saat ini</span>}
                </div>
                <p className="text-xs text-gray-600">{val.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800 leading-relaxed">
            <strong>Metode:</strong> Tingkat keselamatan dihitung menggunakan <strong>logika fuzzy Mamdani</strong> berdasarkan
            tiga variabel input — tinggi gelombang, kecepatan angin, dan kecepatan arus laut.
            Data cuaca diambil otomatis dari <strong>BMKG Maritim</strong> setiap 6 jam.
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}
