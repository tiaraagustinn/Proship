'use client';

import React, { useState, useEffect } from 'react';
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
  weatherIcon: string;
  windStrength: string;
}

const WeatherForecastSection = () => {
  const [forecastData, setForecastData] = useState<ForecastCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationInfo, setLocationInfo] = useState<any>(null);

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
          weatherIcon: getWeatherIcon(item.weather || ''),
          windStrength: getWindStrength(item.wind_speed_max || 0)
        }));
        
        setForecastData(forecasts);
      }
      
      setLocationInfo({
        name: data.name || 'Perairan Sabang - Banda Aceh',
        issued: data.issued || ''
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

  const getWindStrength = (maxSpeed: number): string => {
    if (maxSpeed < 10) return 'Lemah';
    if (maxSpeed < 20) return 'Sedang';
    if (maxSpeed < 30) return 'Kuat';
    return 'Sangat Kuat';
  };

  const formatDateTime = (utcDateTime: string): string => {
    if (!utcDateTime) return '';
    try {
      // Format: "2025-10-20 12:00 UTC"
      const [datePart, timePart] = utcDateTime.split(' ');
      const [year, month, day] = datePart.split('-');
      const [hour, minute] = timePart.split(':');
      
      const date = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      ));
      
      // Convert to WIB (UTC+7)
      const wibDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
      
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      
      const dayName = days[wibDate.getUTCDay()];
      const dayNum = wibDate.getUTCDate();
      const monthName = months[wibDate.getUTCMonth()];
      const hours = String(wibDate.getUTCHours()).padStart(2, '0');
      const minutes = String(wibDate.getUTCMinutes()).padStart(2, '0');
      
      return `${dayName}, ${dayNum} ${monthName}, ${hours}.${minutes}`;
    } catch (err) {
      console.error('Error formatting date:', err);
      return utcDateTime;
    }
  };

  const formatIssuedDate = (utcDateTime: string): string => {
    if (!utcDateTime) return '';
    try {
      const [datePart, timePart] = utcDateTime.split(' ');
      const [year, month, day] = datePart.split('-');
      const [hour, minute] = timePart.split(':');
      
      const date = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      ));
      
      const wibDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
      
      return wibDate.toLocaleString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      }) + ' WIB';
    } catch (err) {
      return utcDateTime;
    }
  };

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
        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Prakiraan Cuaca Maritim</h2>
        </div>

        {/* Location Info */}
        {locationInfo && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {locationInfo.name}
                {locationInfo.code && <span className="text-sm text-gray-500 ml-2">({locationInfo.code})</span>}
              </h3>
              <Link href="/user/detail-cuaca" className="text-blue-600 hover:text-blue-800 font-medium">
            Lebih detail &gt;
          </Link>
            </div>
            
            {locationInfo.issued && (
              <p className="text-sm text-gray-600">
                 {formatIssuedDate(locationInfo.issued)}
              </p>
            )}
            {locationInfo.info && (
              <p className="text-xs text-blue-600 mt-1">ℹ️ {locationInfo.info}</p>
            )}
          </div>
        )}

        {/* Horizontal Scrollable Cards */}
        {forecastData.length > 0 ? (
          <>
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex space-x-4 min-w-max">
                {forecastData.map((forecast, index) => (
                  <div 
                    key={index} 
                    className="bg-gradient-to-b from-yellow-50 to-white rounded-lg border-t-4 border-yellow-400 shadow-md hover:shadow-lg transition-shadow w-72 flex-shrink-0"
                  >
                    {/* Header dengan waktu */}
                    <div className="bg-white px-4 py-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatDateTime(forecast.validFrom)}
                      </p>
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        {forecast.timeDesc}
                      </p>
                    </div>

                    {/* Weather Icon & Condition */}
                    <div className="px-4 py-4 text-center border-b border-gray-200">
                      <div className="text-5xl mb-2">{forecast.weatherIcon}</div>
                      <p className="font-semibold text-gray-800 text-sm">{forecast.weather}</p>
                    </div>

                    {/* Wind & Wave Info */}
                    <div className="px-4 py-3 space-y-2">
                      {/* Labels */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-2">💨</span>
                          <span className="text-sm text-gray-600">Angin</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">〰️</span>
                          <span className="text-sm text-gray-600">Gelombang</span>
                        </div>
                      </div>

                      {/* Direction & Height */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <p className="text-sm font-medium text-gray-800">
                            {forecast.windFrom}
                            {forecast.windTo && forecast.windTo !== forecast.windFrom && (
                              <span className="text-gray-600"> - {forecast.windTo}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex-1 text-right pl-2">
                          <p className="text-sm font-medium text-gray-800">{forecast.waveDesc}</p>
                        </div>
                      </div>

                      {/* Strength Badge & Wave Category */}
                      <div className="flex items-center justify-between">
                        <span className="inline-block bg-yellow-200 text-yellow-800 text-xs font-semibold px-3 py-1 rounded">
                          {forecast.windStrength}
                        </span>
                        {forecast.waveCat && (
                          <span className="text-xs text-gray-600">
                            Gelombang: {forecast.waveCat}
                          </span>
                        )}
                      </div>

                      {/* Speed details */}
                      <div className="text-xs text-gray-600">
                        <p>💨 {forecast.windSpeedMin} - {forecast.windSpeedMax} knot</p>
                      </div>
                    </div>

                    {/* Weather Description */}
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {forecast.weatherDesc}
                      </p>
                      {forecast.warningDesc && forecast.warningDesc !== 'NIL' && (
                        <div className="mt-2 bg-red-50 border border-red-200 rounded px-2 py-1">
                          <p className="text-xs text-red-700 font-semibold">
                            ⚠️ {forecast.warningDesc}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
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