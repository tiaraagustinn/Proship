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

export default function TingkatKeselatamanPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputs, setInputs] = useState<{ wave:number, wind:number, current:number } | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [rules, setRules] = useState<RuleDetail[]>([]);

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
      } catch (err:any) {
        setError(String(err.message || err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        {/* Main Title */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tingkat Keselamatan</h1>
        </div>

        {/* Info Box (uses fuzzy category) */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className={`border rounded-lg p-4 flex justify-between items-center ${category === 'AMAN' ? 'bg-green-100 border-green-300' : category === 'WASPADA' ? 'bg-yellow-100 border-yellow-300' : category === 'BAHAYA' ? 'bg-red-100 border-red-300' : 'bg-gray-100 border-gray-200'}`}>
            <div>
              <div className="font-semibold text-gray-700">{new Date().toLocaleString(undefined, { weekday: 'long' })}</div>
              <div className="text-gray-600">{new Date().toLocaleDateString()}</div>
            </div>
            <div className={`${category === 'AMAN' ? 'text-green-700' : category === 'WASPADA' ? 'text-yellow-700' : category === 'BAHAYA' ? 'text-red-700' : 'text-gray-700'} font-bold text-lg`}>{loading ? '—' : (category ?? '—')}</div>
            <div className="text-gray-700">Banda Aceh - Sabang<br /><span className="text-sm">08.00</span></div>
          </div>
        </div>

        {/* Fuzzy Result Summary */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3">Hasil Evaluasi Keselamatan</h2>
            {loading && <p className="text-gray-600">Memuat data...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <h3 className="font-medium">Inputs</h3>
                  <ul className="text-gray-700">
                    <li>Gelombang (m): <strong>{inputs?.wave ?? '-'}</strong></li>
                    <li>Angin (kt): <strong>{inputs?.wind ?? '-'}</strong></li>
                    <li>Arus (cm/s): <strong>{inputs?.current ?? '-'}</strong></li>
                  </ul>
                </div>
                <div className="col-span-1">
                  <h3 className="font-medium">Skor</h3>
                  <p className="text-2xl font-bold text-gray-900">{score ?? '-'}</p>
                  <p className="text-sm text-gray-600">Kategori: <strong>{category ?? '-'}</strong></p>
                </div>
                <div className="col-span-1">
                  <h3 className="font-medium">Ringkasan Rules</h3>
                  <p className="text-gray-700">Menampilkan {rules.length} rule, preview 12 teratas.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Original Table (static/example) */}
        <div className="max-w-5xl mx-auto mb-8">
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="px-2 py-2 text-left">Waktu (WIB)</th>
                <th className="px-2 py-2 text-left">Cuaca</th>
                <th className="px-2 py-2 text-left">Angin dari</th>
                <th className="px-2 py-2 text-left">Gelombang</th>
                <th className="px-2 py-2 text-left">Arah Arus</th>
                <th className="px-2 py-2 text-left">Jarak Pandang</th>
                <th className="px-2 py-2 text-left">Suhu (°C)</th>
                <th className="px-2 py-2 text-left">Kelembaban (%)</th>
              </tr>
            </thead>
            <tbody className="bg-white text-gray-700">
              {/* Contoh data statis */}
              <tr>
                <td className="px-2 py-2 border">17 Sep 25, 15:00</td>
                <td className="px-2 py-2 border flex items-center gap-2"><span>☀️</span>Cerah</td>
                <td className="px-2 py-2 border">Barat Daya 16 kt<br /><span className="text-xs text-gray-500">Gust: 25 kt</span></td>
                <td className="px-2 py-2 border">0.3 m<br /><span className="text-xs text-blue-500">Tenang</span></td>
                <td className="px-2 py-2 border">Timur Laut<br /><span className="text-xs text-gray-500">4.50 cm/s</span></td>
                <td className="px-2 py-2 border">10 km</td>
                <td className="px-2 py-2 border">30 °C</td>
                <td className="px-2 py-2 border">73 %</td>
              </tr>
              <tr>
                <td className="px-2 py-2 border">17 Sep 25, 16:00</td>
                <td className="px-2 py-2 border flex items-center gap-2"><span>☀️</span>Cerah</td>
                <td className="px-2 py-2 border">Barat Daya 16 kt<br /><span className="text-xs text-gray-500">Gust: 25 kt</span></td>
                <td className="px-2 py-2 border">0.2 m<br /><span className="text-xs text-blue-500">Tenang</span></td>
                <td className="px-2 py-2 border">Timur Laut<br /><span className="text-xs text-gray-500">4.90 cm/s</span></td>
                <td className="px-2 py-2 border">10 km</td>
                <td className="px-2 py-2 border">30 °C</td>
                <td className="px-2 py-2 border">74 %</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rules preview table */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Preview Rule Details</h3>
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border px-2 py-2">#</th>
                      <th className="border px-2 py-2">Antecedent</th>
                      <th className="border px-2 py-2">Degrees</th>
                      <th className="border px-2 py-2">Strength</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.slice(0, 12).map(r => (
                      <tr key={r.idx}>
                        <td className="border px-2 py-2">{r.idx}</td>
                        <td className="border px-2 py-2">{r.antecedent.join(',')}</td>
                        <td className="border px-2 py-2">{r.degrees.map(d => d==null ? '-' : d.toFixed(3)).join(',')}</td>
                        <td className="border px-2 py-2">{r.ruleStrength}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {loading && <p className="text-gray-600">Memuat rule...</p>}
            {error && <p className="text-red-500">Tidak dapat memuat rule: {error}</p>}
          </div>
        </div>

        {/* Keterangan */}
        <div className="max-w-5xl mx-auto bg-gray-200 rounded-lg p-6 min-h-[150px]">
          <h2 className="font-semibold mb-2">Keterangan</h2>
          <p className="text-gray-700">Halaman ini menggabungkan evaluasi fuzzy (skor & kategori) dengan tabel cuaca contoh. Data fuzzy diambil dari endpoint backend yang berjalan di http://localhost:5000/api/fuzzy/evaluate</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}