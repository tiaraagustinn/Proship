'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface ForecastCard {
  validFrom: string;
  validTo: string;
  timeDesc: string;
  weather: string;
  weatherDesc: string;
  warningDesc: string;
  waveCat: string;
  waveDesc: string;
  windFrom: string;
  windTo: string;
  windSpeedMin: number;
  windSpeedMax: number;
  currentSpeedMin: number;
  currentSpeedMax: number;
  waveMin: number;
  waveMax: number;
  weatherIcon: string;
}

interface LocationInfo {
  name: string;
  issued: string;
  code?: string;
  info?: string;
}

const daysLong = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const monthsLong = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const parseUtcToWib = (utcDateTime: string): Date | null => {
  if (!utcDateTime) return null;

  try {
    const [datePart, timePart] = utcDateTime.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = (timePart || '00:00').split(':').map(Number);

    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    return new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
  } catch {
    return null;
  }
};

const toDateKey = (utcDateTime: string): string => {
  const date = parseUtcToWib(utcDateTime);
  if (!date) return '';

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDateTime = (utcDateTime: string): string => {
  const date = parseUtcToWib(utcDateTime);
  if (!date) return utcDateTime;

  const dayName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getUTCDay()];
  const dayNum = date.getUTCDate();
  const monthName = monthsShort[date.getUTCMonth()];
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${dayName}, ${dayNum} ${monthName} ${date.getUTCFullYear()}, ${hours}.${minutes}`;
};

const formatIssuedDate = (utcDateTime: string): string => {
  const date = parseUtcToWib(utcDateTime);
  if (!date) return utcDateTime;

  const dayName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getUTCDay()];
  const dayNum = date.getUTCDate();
  const monthName = monthsLong[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${dayName}, ${dayNum} ${monthName} ${year} pukul ${hours}.${minutes} WIB`;
};

const formatTableTime = (utcDateTime: string): string => {
  const date = parseUtcToWib(utcDateTime);
  if (!date) return utcDateTime;

  const dayNum = date.getUTCDate();
  const monthName = monthsShort[date.getUTCMonth()];
  const year = String(date.getUTCFullYear()).slice(-2);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${dayNum} ${monthName} ${year}, ${hours}.${minutes}`;
};

const getWaveBadgeClass = (waveCat: string): string => {
  const cat = (waveCat || '').toLowerCase();
  if (cat.includes('tinggi') || cat.includes('bahaya')) return 'bg-red-100 text-red-700 border border-red-200';
  if (cat.includes('sedang')) return 'bg-amber-100 text-amber-700 border border-amber-200';
  return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
};

const getHourLabel = (index: number): string => {
  if (index === 0) return '0 jam lagi';
  return `${index} jam lagi`;
};

const WeatherForecastSection = () => {
  const [forecastData, setForecastData] = useState<ForecastCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/maritim-weather/sabang-bandaAceh');
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data cuaca maritim');
      }
      
      const data = await response.json();
      console.log('📦 Raw API Data:', data);
      
      processWeatherData(data);
      
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const processWeatherData = (data: any) => {
    try {
      const weatherArray = data.data || [];
      
      if (Array.isArray(weatherArray) && weatherArray.length > 0) {
        const forecasts = weatherArray.map((item: any) => ({
          validFrom: item.valid_from || '',
          validTo: item.valid_to || '',
          timeDesc: item.time_desc || '',
          weather: item.weather || 'N/A',
          weatherDesc: item.weather_desc || '',
          warningDesc: item.warning_desc || 'NIL',
          waveCat: item.wave_cat || '',
          waveDesc: item.wave_desc || 'N/A',
          windFrom: item.wind_from || 'N/A',
          windTo: item.wind_to || '',
          windSpeedMin: item.wind_speed_min || 0,
          windSpeedMax: item.wind_speed_max || 0,
          currentSpeedMin: item.current_speed_min || 0,
          currentSpeedMax: item.current_speed_max || 0,
          waveMin: item.wave_min || 0,
          waveMax: item.wave_max || 0,
          weatherIcon: getWeatherIcon(item.weather || ''),
        }));
        
        setForecastData(forecasts);
      }
      
      setLocationInfo({
        name: data.name || 'Perairan Sabang - Banda Aceh',
        issued: data.issued || '',
        code: data.code,
        info: data.info
      });
      
    } catch (err) {
      console.error('Error processing data:', err);
      setError('Gagal memproses data cuaca');
    }
  };

  const getWeatherIcon = (weather: string): string => {
    if (!weather) return '🌤️';
    const lower = weather.toLowerCase();
    if (lower.includes('cerah')) return '☀️';
    if (lower.includes('berawan tebal')) return '☁️';
    if (lower.includes('berawan')) return '⛅';
    if (lower.includes('hujan lebat')) return '🌧️';
    if (lower.includes('hujan ringan')) return '🌦️';
    if (lower.includes('hujan')) return '🌧️';
    if (lower.includes('petir')) return '⛈️';
    if (lower.includes('badai')) return '🌪️';
    return '🌤️';
  };

  const highlightedForecast = forecastData[0];

  if (loading) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">⚓ Memuat data cuaca maritim BMKG...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-600 font-semibold mb-2">Gagal Memuat Data Cuaca Maritim</p>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button
              onClick={fetchWeatherData}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Coba Lagi</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {forecastData.length > 0 && locationInfo && highlightedForecast ? (
          <>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-slate-700">{locationInfo.name}</h3>
              <Link
                href="/user/detail-cuaca"
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                Lebih detail
                <span aria-hidden="true">›</span>
              </Link>
            </div>

            <div className="overflow-x-auto pb-4">
              <div className="flex min-w-max gap-4">
                <aside
                  className="relative w-[320px] flex-shrink-0 overflow-hidden rounded-3xl border border-slate-700 shadow-lg"
                  style={{
                    backgroundImage: "linear-gradient(to bottom, rgba(51,65,85,0.82), rgba(15,23,42,0.96)), url('/images/balohan-bg3.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="flex min-h-[540px] flex-col justify-between p-6 text-white">
                    <div>
                      <div className="mb-8 flex items-start gap-3">
                        <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
                          <span className="text-2xl">🌊</span>
                        </div>
                        <div>
                          <h4 className="text-3xl font-bold leading-tight">{locationInfo.name}</h4>
                          <p className="mt-2 text-base text-slate-100">Prakiraan Cuaca Perairan</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                        <p className="text-lg font-semibold text-white">Periode Prakiraan</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-100">
                          <p>
                            <span className="block text-xs text-slate-300">Mulai</span>
                            <span className="font-semibold">{forecastData[0]?.timeDesc || '-'}</span>
                          </p>
                          <p>
                            <span className="block text-xs text-slate-300">Sampai</span>
                            <span className="font-semibold">{forecastData[forecastData.length - 1]?.timeDesc || '-'}</span>
                          </p>
                          <p>
                            <span className="block text-xs text-slate-300">Dikeluarkan</span>
                            <span className="font-semibold">{locationInfo.issued}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-base font-semibold text-slate-100">Geser ke samping untuk melihat prakiraan</p>
                  </div>
                </aside>

                {forecastData.map((forecast, index) => (
                  <article
                    key={`${forecast.validFrom}-${index}`}
                    className="w-[320px] flex-shrink-0 rounded-3xl border border-gray-200 bg-[#f8f8fb] p-5 shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <h4 className="text-xl font-bold text-slate-800">{forecast.timeDesc}</h4>
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                        {getHourLabel(index)}
                      </span>
                    </div>

                    <div className="mb-4 text-center">
                      <div className="text-4xl">{forecast.weatherIcon}</div>
                      <p className="mt-2 text-lg leading-tight text-slate-800">
                        {forecast.weatherDesc || forecast.weather}
                      </p>
                    </div>

                    <hr className="mb-4 border-gray-200" />

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-base text-slate-700">
                      <p className="font-semibold text-slate-500">Angin</p>
                      <p className="font-semibold text-slate-500">Gelombang</p>

                      <p>{forecast.windFrom} - {forecast.windTo || '-'}</p>
                      <p>
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getWaveBadgeClass(forecast.waveCat)}`}>
                          {forecast.waveCat || '-'}
                        </span>
                      </p>

                      <p>{forecast.windSpeedMin} - {forecast.windSpeedMax} knot</p>
                      <p>{forecast.waveDesc || '-'}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl">
            <div className="text-4xl mb-3">🌊</div>
            <p className="text-gray-600 font-medium">Tidak ada data prakiraan cuaca tersedia</p>
            <p className="text-gray-400 text-sm mt-2">Silakan coba lagi nanti</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default WeatherForecastSection;