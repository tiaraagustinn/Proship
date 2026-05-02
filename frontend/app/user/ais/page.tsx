'use client';

import dynamic from 'next/dynamic';
import Header from '@/app/components/user/Header';
import Footer from '@/app/components/user/Footer';

const AisMap = dynamic(() => import('@/app/components/user/ais/AisMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[560px] flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">Memuat peta AIS...</p>
      </div>
    </div>
  ),
});

export default function AisPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AIS Tracker</h1>
            <p className="text-gray-500 text-sm mt-1">
              Posisi kapal real-time di perairan Sabang – Banda Aceh via MarineTraffic
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header card */}
            <div className="px-5 py-4 bg-gradient-to-r from-blue-800 to-cyan-700 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">Peta Pergerakan Kapal</h2>
                <p className="text-blue-100 text-xs mt-0.5">Klik ikon kapal untuk melihat detail informasi</p>
              </div>
              <span className="text-xs bg-white/20 border border-white/30 rounded-full px-3 py-1 self-start sm:self-auto">
                Sumber: MarineTraffic
              </span>
            </div>

            <AisMap />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
