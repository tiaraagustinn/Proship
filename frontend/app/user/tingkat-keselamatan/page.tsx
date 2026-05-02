"use client";
import React, { useEffect, useState } from 'react';
import Header from '@/app/components/user/Header';
import Footer from '@/app/components/user/Footer';

type RuleDetail = {
  idx: number;
  antecedent: number[];
  degrees: Array<number | null>;
  ruleStrength: number;
  weighted: number;
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

function ScoreBar({ score }: { score: number | null }) {
  const pct = score != null ? Math.min(Math.max((score / 100) * 100, 0), 100) : 0;
  const color = score == null ? 'bg-gray-300'
    : score >= 70 ? 'bg-emerald-500'
    : score >= 40 ? 'bg-amber-500'
    : 'bg-red-500';
  return (
    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
      <div
        className={`h-3 rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function TingkatKeselamatanPage() {
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [inputs, setInputs]     = useState<{ wave: number; wind: number; current: number } | null>(null);
  const [score, setScore]       = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [rules, setRules]       = useState<RuleDetail[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:5000/api/fuzzy/evaluate');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setInputs(data.inputs ?? null);
        setScore(data.score ?? null);
        setCategory(data.category ?? null);
        setRules(data.ruleDetails ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cfg = category
    ? (CATEGORY_CONFIG[category as CategoryKey] ?? DEFAULT_CONFIG)
    : DEFAULT_CONFIG;

  const now     = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tingkat Keselamatan Pelayaran</h1>

          {/* Status utama */}
          <div className={`rounded-2xl border overflow-hidden ${cfg.border}`}>
            {/* Gradient header */}
            <div className={`bg-gradient-to-r ${cfg.gradient} px-6 py-5 text-white`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-white/80 text-sm">{dateStr}</p>
                  <p className="font-semibold mt-0.5">Rute: Ulee Lheue (Banda Aceh) — Balohan (Sabang)</p>
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

            {/* Body */}
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
                      Halaman ini akan otomatis menampilkan hasil saat koneksi ke BMKG pulih.
                    </p>
                  </div>
                </div>
              ) : (
                <p className={`text-sm font-medium ${cfg.text}`}>{cfg.desc}</p>
              )}
            </div>
          </div>

          {/* Parameter & Skor */}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Gelombang */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-lg">🌊</div>
                    <p className="text-sm font-semibold text-gray-700">Tinggi Gelombang</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{inputs?.wave ?? '—'}<span className="text-base font-normal text-gray-400 ml-1">m</span></p>
                </div>

                {/* Angin */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-lg">💨</div>
                    <p className="text-sm font-semibold text-gray-700">Kecepatan Angin</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{inputs?.wind ?? '—'}<span className="text-base font-normal text-gray-400 ml-1">kt</span></p>
                </div>

                {/* Arus */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-lg">🌀</div>
                    <p className="text-sm font-semibold text-gray-700">Kecepatan Arus</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{inputs?.current ?? '—'}<span className="text-base font-normal text-gray-400 ml-1">cm/s</span></p>
                </div>
              </div>

              {/* Skor */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Skor Keselamatan (Fuzzy)</p>
                    <p className={`text-5xl font-extrabold ${cfg.text}`}>{score != null ? score.toFixed(1) : '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Rules yang aktif</p>
                    <p className="text-3xl font-bold text-gray-800">{rules.length}</p>
                    <p className="text-xs text-gray-400">dari total rules</p>
                  </div>
                </div>
                <ScoreBar score={score} />
                <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                  <span>BAHAYA</span>
                  <span>WASPADA</span>
                  <span>AMAN</span>
                </div>
              </div>

              {/* Detail rules */}
              {rules.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800">Detail Rule Fuzzy</h2>
                    <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
                      Menampilkan {Math.min(rules.length, 12)} dari {rules.length} rules
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {rules.slice(0, 12).map((r, i) => (
                          <tr key={r.idx} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                            <td className="px-5 py-2.5 text-center text-gray-400 font-mono text-xs">{r.idx}</td>
                            <td className="px-5 py-2.5 font-mono text-xs text-gray-700">{r.antecedent.join(', ')}</td>
                            <td className="px-5 py-2.5 text-xs text-gray-500">
                              {r.degrees.map(d => d == null ? '—' : d.toFixed(3)).join(', ')}
                            </td>
                            <td className="px-5 py-2.5 text-center">
                              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                {r.ruleStrength}
                              </span>
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
              <div key={key} className={`rounded-xl border p-4 ${val.bg} ${val.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{val.icon}</span>
                  <span className={`font-bold text-sm ${val.text}`}>{key}</span>
                </div>
                <p className="text-xs text-gray-600">{val.desc}</p>
              </div>
            ))}
          </div>

          {/* Catatan metode */}
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
