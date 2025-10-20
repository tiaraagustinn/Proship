// lib/hooks/useWeather.ts

"use client";

import { useState, useEffect } from 'react';

interface WeatherData {
  lokasi: {
    provinsi: string;
    kota: string;
    kelurahan: string;
  };
  data: Array<{
    local_datetime: string;
    t: number;
    hu: number;
    weather_desc: string;
    ws: number;
    wd: string;
    tcc: number;
  }>;
}

export const useWeather = (endpoint: string) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiUrl = `http://localhost:5000/api/weather/${endpoint}`;
        
        console.log(`🔄 Fetching dari: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        
        console.log(`📊 Status Response: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        console.log(`✅ Data berhasil diambil:`, result);
        console.log(`📋 Struktur data:`, JSON.stringify(result, null, 2));
        console.log(`🔍 First item:`, result.data ? result.data[0] : 'No data array');
        
        setData(result);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error tidak diketahui';
        console.error(`❌ Error:`, errorMessage);
        
        setError(errorMessage);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};