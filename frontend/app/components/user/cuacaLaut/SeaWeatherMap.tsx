'use client';

import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">Memuat peta interaktif...</p>
      </div>
    </div>
  ),
});

const SeaWeatherMap = () => {
  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg">

          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-teal-600 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-t-2xl">
            <div>
              <h2 className="text-lg font-bold">Peta Cuaca Perairan Sabang — Banda Aceh</h2>
              <p className="text-blue-100 text-xs mt-0.5">Klik lingkaran pada peta untuk melihat detail kondisi cuaca laut</p>
            </div>
            <span className="text-xs bg-white/20 border border-white/30 rounded-full px-3 py-1 self-start sm:self-auto">
              Sumber: BMKG Maritim
            </span>
          </div>

          {/* Map + Legend (rendered inside LeafletMap) */}
          <LeafletMap />

        </div>
      </div>
    </section>
  );
};

export default SeaWeatherMap;
