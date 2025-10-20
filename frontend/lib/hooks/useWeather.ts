// lib/hooks/useWeather.ts

"use client";

import { useState, useEffect } from 'react';

interface WeatherData {
  lokasi: {
    adm1?: string;
    adm2?: string;
    adm3?: string;
    adm4?: string;
    provinsi: string;
    kota?: string;
    kotkab?: string;
    kecamatan?: string;
    desa?: string;
    kelurahan?: string;
    lon?: number;
    lat?: number;
    timezone?: string;
  };
  data: Array<{
    lokasi?: any;
    cuaca: Array<{
      datetime?: string;
      local_datetime?: string;
      utc_datetime?: string;
      t?: number;
      hu?: number;
      weather?: string;
      weather_desc?: string;
      weather_desc_en?: string;
      ws?: number;
      wd?: string;
      wd_deg?: number;
      wd_to?: string;
      tcc?: number;
      tp?: number;
      vs?: number;
      vs_text?: string;
      time_index?: number;
      analysis_date?: string;
      image?: string;
    }>;
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
        console.log(`📋 Full JSON:`, JSON.stringify(result, null, 2));
        console.log(`🔍 Keys:`, Object.keys(result));
        console.log(`🔍 Has data?`, result.data);
        console.log(`🔍 First item:`, result.data ? result.data[0] : 'No data');
        console.log(`🔍 First item keys:`, result.data && result.data[0] ? Object.keys(result.data[0]) : 'No keys');
        
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