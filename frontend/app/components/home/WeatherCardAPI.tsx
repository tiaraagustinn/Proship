// components/WeatherCardAPI.tsx

"use client";

import React from 'react';
import { useWeather } from '@/lib/hooks/useWeather';
import WeatherCard from './WeatherCard'; // Import WeatherCard yang sudah ada

interface WeatherCardAPIProps {
  pelabuhan: 'balohan' | 'ulee-lheue';
  location: string;
  city: string;
  backgroundImage?: string;
}

export const WeatherCardAPI: React.FC<WeatherCardAPIProps> = ({ 
  pelabuhan, 
  location, 
  city,
  backgroundImage 
}) => {
  const { data, loading, error } = useWeather(pelabuhan);

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <span className="ml-4">Memuat data {location}...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-500 to-red-700 text-white rounded-lg p-8">
        <div className="text-center">
          <p className="text-xl font-bold mb-2">⚠️ Error</p>
          <p className="text-sm">Gagal memuat data {location}</p>
          <p className="text-xs mt-2 opacity-75">{error}</p>
        </div>
      </div>
    );
  }

  // No data
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-500 to-gray-700 text-white rounded-lg p-8">
        <div className="text-center">
          <p className="text-xl font-bold mb-2">📭 Data Tidak Tersedia</p>
          <p className="text-sm">Tidak ada data cuaca untuk {location}</p>
        </div>
      </div>
    );
  }

  // Extract data - BMKG structure: data[0].cuaca[0][0]
  const lokasi = data.lokasi;
  const dataWrapper = data.data[0];
  
  console.log('🔍 DEBUG WeatherCardAPI:', pelabuhan);
  console.log('📦 Full data:', data);
  console.log('📦 dataWrapper:', dataWrapper);
  
  // Data cuaca ada di dalam array "cuaca"
  const cuacaArray = dataWrapper?.cuaca || [];
  console.log('📦 cuacaArray:', cuacaArray);
  console.log('📦 cuacaArray[0]:', cuacaArray[0]);
  
  // BMKG structure is nested array: cuaca[0][0]
  let dataSekarang = null;
  
  // Coba akses nested array
  if (Array.isArray(cuacaArray) && cuacaArray.length > 0) {
    if (Array.isArray(cuacaArray[0]) && cuacaArray[0].length > 0) {
      // Struktur: cuaca[0][0] (nested array)
      dataSekarang = cuacaArray[0][0];
      console.log('✅ Using nested array: cuaca[0][0]');
    } else {
      // Struktur: cuaca[0] (direct object)
      dataSekarang = cuacaArray[0];
      console.log('✅ Using direct object: cuaca[0]');
    }
  }
  
  console.log('📦 dataSekarang:', dataSekarang);
  console.log('📦 dataSekarang type:', typeof dataSekarang);
  console.log('📦 dataSekarang keys:', dataSekarang ? Object.keys(dataSekarang) : 'null');

  // Kalau tidak ada data cuaca
  if (!dataSekarang) {
    return (
      <div className="bg-gradient-to-br from-gray-500 to-gray-700 text-white rounded-lg p-8">
        <div className="text-center">
          <p className="text-xl font-bold mb-2">📭 Data Cuaca Kosong</p>
          <p className="text-sm">Tidak ada prakiraan cuaca untuk {location}</p>
          <pre className="text-xs mt-4 bg-black/30 p-2 rounded overflow-auto max-h-48">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // Extract values dengan fallback
  const temperature = dataSekarang?.t ?? dataSekarang?.temp ?? 0;
  const windSpeed = dataSekarang?.ws ?? dataSekarang?.wind_speed ?? 0;
  const humidity = dataSekarang?.hu ?? dataSekarang?.humidity ?? 0;
  const condition = dataSekarang?.weather_desc ?? dataSekarang?.weather ?? 'Tidak Diketahui';
  const localDateTime = dataSekarang?.local_datetime ?? dataSekarang?.datetime ?? dataSekarang?.utc_datetime ?? new Date().toISOString();
  
  console.log('✅ Extracted values:', {
    temperature,
    windSpeed,
    humidity,
    condition,
    localDateTime
  });
  console.log('✅ dataSekarang.t:', dataSekarang.t);
  console.log('✅ dataSekarang.ws:', dataSekarang.ws);
  console.log('✅ dataSekarang.hu:', dataSekarang.hu);

  // Format waktu
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Waktu tidak valid';
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Waktu tidak valid';
    }
  };

  // Tentukan weather icon berdasarkan kondisi
  const getWeatherIcon = (weatherDesc: string): string => {
    const desc = weatherDesc.toLowerCase();
    if (desc.includes('cerah')) return '☀️';
    if (desc.includes('berawan')) return '⛅';
    if (desc.includes('hujan')) return '🌧️';
    if (desc.includes('petir')) return '⛈️';
    if (desc.includes('kabut')) return '🌫️';
    return '🌤️';
  };

  return (
    <WeatherCard
      location={location}
      city={lokasi?.kelurahan || city}
      temperature={temperature}
      windSpeed={windSpeed}
      humidity={humidity}
      time={new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    })}
      condition={condition}
      weatherIcon={getWeatherIcon(condition)}
      backgroundImage={backgroundImage}
    />
  );
};