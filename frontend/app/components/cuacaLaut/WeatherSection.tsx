// components/WeatherSection.tsx

"use client";

import React from 'react';
import { useWeather } from '@/lib/hooks/useWeather';

interface WeatherSectionProps {
  pelabuhan: 'balohan' | 'ulee-lheue';
  title: string;
  icon: string;
}

export const WeatherSection: React.FC<WeatherSectionProps> = ({ pelabuhan, title, icon }) => {
  const { data, loading, error } = useWeather(pelabuhan);

  // Fungsi untuk hitung status keselamatan
  const getStatusKeselamatan = (ws: number | undefined) => {
    if (!ws) return { status: 'N/A', color: 'bg-gray-100 text-gray-800' };
    if (ws < 15) return { status: 'AMAN', color: 'bg-green-100 text-green-800' };
    if (ws < 25) return { status: 'WASPADA', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'BAHAYA', color: 'bg-red-100 text-red-800' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <span className="text-3xl mr-3">{icon}</span>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <span className="text-3xl mr-3">{icon}</span>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="text-sm">⚠️ Gagal mengambil data: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <span className="text-3xl mr-3">{icon}</span>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-500 text-center py-4">Data tidak tersedia</p>
      </div>
    );
  }

  // Debug: Log struktur data
  console.log('📊 Full data object:', data);

  // Handle berbagai struktur data yang mungkin
  let dataArray: any[] = [];
  let lokasi: any = {};

  // Cek struktur 1: data.data
  if (data.data && Array.isArray(data.data)) {
    dataArray = data.data;
    lokasi = data.lokasi || {};
  }
  // Cek struktur 2: data.result.data
  else if ((data as any).result && (data as any).result.data) {
    dataArray = (data as any).result.data;
    lokasi = data.lokasi || {};
  }

  if (!dataArray || dataArray.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <span className="text-3xl mr-3">{icon}</span>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-500 text-center py-4">Tidak ada data cuaca</p>
        <pre className="bg-gray-100 p-2 text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  const dataSekarang = dataArray[0];
  console.log('🔍 Current data item:', dataSekarang);

  // Extract nilai dengan fallback
  const suhu = dataSekarang?.t ?? 'N/A';
  const kelembapan = dataSekarang?.hu ?? 'N/A';
  const kecAngin = dataSekarang?.ws ?? 0;
  const arahAngin = dataSekarang?.wd ?? 'N/A';
  const cuaca = dataSekarang?.weather_desc ?? 'N/A';
  const waktu = dataSekarang?.local_datetime ?? new Date().toISOString();

  const { status, color } = getStatusKeselamatan(kecAngin);

  // Format waktu
  const formatWaktu = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-blue-600">
        <div className="flex items-center">
          <span className="text-4xl mr-3">{icon}</span>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">
              {lokasi?.kelurahan || 'Lokasi'}, {lokasi?.kota || 'Kota'}
            </p>
          </div>
        </div>
      </div>

      {/* Status Keselamatan */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${color}`}>
          Status: {status}
        </span>
      </div>

      {/* Weather Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Suhu */}
        <div className="bg-blue-50 p-3 rounded-lg hover:bg-blue-100 transition-colors">
          <p className="text-xs text-gray-600 font-semibold">🌡️ Suhu</p>
          <p className="text-2xl font-bold text-blue-600">
            {typeof suhu === 'number' ? `${suhu}°C` : suhu}
          </p>
        </div>

        {/* Kelembapan */}
        <div className="bg-cyan-50 p-3 rounded-lg hover:bg-cyan-100 transition-colors">
          <p className="text-xs text-gray-600 font-semibold">💧 Kelembapan</p>
          <p className="text-2xl font-bold text-cyan-600">
            {typeof kelembapan === 'number' ? `${kelembapan}%` : kelembapan}
          </p>
        </div>

        {/* Kecepatan Angin */}
        <div className="bg-purple-50 p-3 rounded-lg hover:bg-purple-100 transition-colors">
          <p className="text-xs text-gray-600 font-semibold">💨 Kec. Angin</p>
          <p className="text-2xl font-bold text-purple-600">
            {typeof kecAngin === 'number' ? `${kecAngin} km/h` : kecAngin}
          </p>
        </div>

        {/* Arah Angin */}
        <div className="bg-orange-50 p-3 rounded-lg hover:bg-orange-100 transition-colors">
          <p className="text-xs text-gray-600 font-semibold">🧭 Arah</p>
          <p className="text-2xl font-bold text-orange-600">{arahAngin}</p>
        </div>

        {/* Cuaca */}
        <div className="bg-gray-50 p-3 rounded-lg col-span-2 hover:bg-gray-100 transition-colors">
          <p className="text-xs text-gray-600 font-semibold">🌧️ Kondisi</p>
          <p className="text-lg font-bold text-gray-700">{cuaca}</p>
        </div>
      </div>


      {/* Update Time */}
      <p className="text-xs text-gray-400 mt-4 text-right">
        Update: {formatWaktu(waktu)}
      </p>
    </div>
  );
};