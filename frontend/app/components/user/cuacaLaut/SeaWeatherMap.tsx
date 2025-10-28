'use client';

import React, { useState } from 'react';

interface WaveData {
  id: string;
  lat: number;
  lng: number;
  height: number;
  color: string;
  windSpeed: number;
  windDirection: string;
  temperature: number;
}

const SeaWeatherMap = () => {
  const [selectedLayer, setSelectedLayer] = useState('wave');
  const [selectedPoint, setSelectedPoint] = useState<WaveData | null>(null);
  const [zoom, setZoom] = useState(1);

  const waveData: WaveData[] = [
    { id: '1', lat: 5.5, lng: 95.3, height: 2.2, color: 'bg-red-500', windSpeed: 25, windDirection: 'Barat Daya', temperature: 28 },
    { id: '2', lat: 6.0, lng: 96.0, height: 2.4, color: 'bg-red-600', windSpeed: 28, windDirection: 'Barat', temperature: 27 },
    { id: '3', lat: 4.8, lng: 95.8, height: 2.1, color: 'bg-red-500', windSpeed: 24, windDirection: 'Barat Daya', temperature: 29 },
    { id: '4', lat: 6.2, lng: 97.2, height: 1.8, color: 'bg-orange-500', windSpeed: 20, windDirection: 'Barat Laut', temperature: 28 },
    { id: '5', lat: 5.0, lng: 97.0, height: 1.1, color: 'bg-yellow-400', windSpeed: 15, windDirection: 'Tenggara', temperature: 30 },
    { id: '6', lat: 4.5, lng: 96.5, height: 1.5, color: 'bg-yellow-500', windSpeed: 18, windDirection: 'Selatan', temperature: 29 },
    { id: '7', lat: 5.8, lng: 98.0, height: 1.6, color: 'bg-yellow-500', windSpeed: 19, windDirection: 'Tenggara', temperature: 28 },
    { id: '8', lat: 4.0, lng: 95.0, height: 0.8, color: 'bg-green-400', windSpeed: 12, windDirection: 'Timur', temperature: 31 },
    { id: '9', lat: 5.2, lng: 98.5, height: 0.4, color: 'bg-green-300', windSpeed: 8, windDirection: 'Timur Laut', temperature: 32 },
    { id: '10', lat: 6.5, lng: 98.8, height: 0.1, color: 'bg-blue-300', windSpeed: 5, windDirection: 'Utara', temperature: 33 },
  ];

  const getWaveColor = (height: number) => {
    if (height >= 2.0) return 'bg-red-500';
    if (height >= 1.5) return 'bg-orange-500';
    if (height >= 1.0) return 'bg-yellow-400';
    if (height >= 0.5) return 'bg-green-400';
    return 'bg-blue-300';
  };

  const handlePointClick = (point: WaveData) => {
    setSelectedPoint(point);
  };

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Map Header */}
          <div className="p-4 bg-blue-600 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Peta Gelombang Model Inawaves</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded text-sm">
                  Ke Peta
                </button>
                <button className="px-3 py-1 bg-orange-500 hover:bg-orange-400 rounded text-sm">
                  Peringatan Gelombang Tinggi
                </button>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative h-[600px] bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 overflow-hidden">
            {/* Base Map - Ocean */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400">
              {/* Wave patterns */}
              <svg className="absolute inset-0 w-full h-full opacity-30">
                <defs>
                  <pattern id="wavePattern" x="0" y="0" width="100" height="50" patternUnits="userSpaceOnUse">
                    <path d="M0,25 Q25,15 50,25 T100,25" stroke="#3B82F6" strokeWidth="2" fill="none" opacity="0.5" />
                    <path d="M0,30 Q25,20 50,30 T100,30" stroke="#60A5FA" strokeWidth="1" fill="none" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#wavePattern)" />
              </svg>
            </div>

            {/* Wave Height Data Points */}
            {waveData.map((wave) => {
              // Convert lat/lng to pixel coordinates (simplified mapping)
              const x = ((wave.lng - 95) * 100) + 50;
              const y = ((6 - wave.lat) * 80) + 50;
              
              return (
                <div
                  key={wave.id}
                  onClick={() => handlePointClick(wave)}
                  className={`absolute w-16 h-16 ${getWaveColor(wave.height)} rounded-full opacity-85 flex items-center justify-center text-xs font-bold text-white shadow-lg cursor-pointer hover:scale-110 transition-transform border-2 border-white`}
                  style={{
                    left: `${Math.max(0, Math.min(x, 90))}%`,
                    top: `${Math.max(0, Math.min(y, 90))}%`,
                  }}
                >
                  {wave.height}m
                </div>
              );
            })}

            {/* Geographic Labels */}
            <div className="absolute top-8 left-8 text-sm font-semibold text-gray-700 bg-white/95 px-3 py-2 rounded shadow-lg border">
              <div className="font-bold">Aceh</div>
              <div className="text-xs text-gray-600">Indonesia</div>
            </div>
            <div className="absolute top-16 left-16 text-sm font-semibold text-gray-700 bg-white/95 px-3 py-2 rounded shadow-lg border">
              <div className="font-bold">Banda Aceh</div>
              <div className="text-xs text-gray-600">Pelabuhan</div>
            </div>
            <div className="absolute top-12 right-20 text-sm font-semibold text-gray-700 bg-white/95 px-3 py-2 rounded shadow-lg border">
              <div className="font-bold">Sabang</div>
              <div className="text-xs text-gray-600">Pelabuhan</div>
            </div>
            <div className="absolute bottom-32 left-32 text-sm font-semibold text-gray-700 bg-white/95 px-3 py-2 rounded shadow-lg border">
              <div className="font-bold">Medan</div>
              <div className="text-xs text-gray-600">Sumatra Utara</div>
            </div>
            <div className="absolute bottom-16 right-32 text-sm font-semibold text-gray-700 bg-white/95 px-3 py-2 rounded shadow-lg border">
              <div className="font-bold">Malaysia</div>
              <div className="text-xs text-gray-600">Peninsula</div>
            </div>
            <div className="absolute bottom-8 right-16 text-sm font-semibold text-gray-700 bg-white/95 px-3 py-2 rounded shadow-lg border">
              <div className="font-bold">Thailand</div>
              <div className="text-xs text-gray-600">Phuket</div>
            </div>

            {/* Layer Controls */}
            <div className="absolute top-4 right-4 bg-white/95 rounded-lg shadow-lg p-2">
              <div className="space-y-2">
                <button 
                  onClick={() => setSelectedLayer('wave')}
                  className={`w-full px-3 py-2 text-sm rounded ${selectedLayer === 'wave' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Gelombang
                </button>
                <button 
                  onClick={() => setSelectedLayer('wind')}
                  className={`w-full px-3 py-2 text-sm rounded ${selectedLayer === 'wind' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Angin
                </button>
                <button 
                  onClick={() => setSelectedLayer('current')}
                  className={`w-full px-3 py-2 text-sm rounded ${selectedLayer === 'current' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Arus
                </button>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 bg-white/95 rounded-lg shadow-lg p-2">
              <div className="flex flex-col space-y-1">
                <button 
                  onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
                >
                  +
                </button>
                <button 
                  onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
                >
                  -
                </button>
              </div>
            </div>

            {/* Fullscreen Button */}
            <button className="absolute top-4 left-4 p-2 bg-white/90 hover:bg-white text-gray-600 hover:text-blue-600 transition-colors rounded-lg shadow">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          {/* Legend */}
          <div className="p-4 bg-gray-50 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Legenda Tinggi Gelombang</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">≥ 2.0m (Sangat Tinggi)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">1.5 - 2.0m (Tinggi)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-600">1.0 - 1.5m (Sedang)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">0.5 - 1.0m (Rendah)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
                <span className="text-sm text-gray-600">&lt; 0.5m (Sangat Rendah)</span>
              </div>
            </div>
          </div>

          {/* Data Detail Card */}
          {selectedPoint && (
            <div className="p-4 bg-blue-50 border-t">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Data Cuaca Laut</h3>
                  <p className="text-sm text-gray-600">Koordinat: {selectedPoint.lat}°N, {selectedPoint.lng}°E</p>
                </div>
                <button 
                  onClick={() => setSelectedPoint(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-white p-3 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Tinggi Gelombang</p>
                  <p className="text-xl font-bold text-blue-600">{selectedPoint.height}m</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Kecepatan Angin</p>
                  <p className="text-xl font-bold text-green-600">{selectedPoint.windSpeed} knot</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Arah Angin</p>
                  <p className="text-lg font-bold text-orange-600">{selectedPoint.windDirection}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Suhu Air</p>
                  <p className="text-xl font-bold text-red-600">{selectedPoint.temperature}°C</p>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari kawasan laut, pelabuhan, atau koordinat..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeaWeatherMap;
