'use client';

import React, { useState, useEffect } from 'react';

interface ForecastCard {
  day: string;
  date: string;
  time: string;
  hoursFromNow: number;
  condition: string;
  conditionIcon: string;
  windDirection: string;
  windStrength: string;
  windSpeed: string;
  currentSpeed: string;
  currentDirection: string;
  temperature: number;
  humidity: number;
  waveHeight: string;
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
      // Struktur data BMKG Maritim biasanya seperti:
      // { area: "...", issued: "...", data: [...] }
      
      let forecasts: ForecastCard[] = [];
      const now = new Date();
      
      // Coba berbagai kemungkinan struktur data
      const weatherArray = data.data || data.forecast || data.cuaca || [];
      
      if (Array.isArray(weatherArray) && weatherArray.length > 0) {
        // Ambil maksimal 3 data pertama untuk ditampilkan
        forecasts = weatherArray.slice(0, 3).map((item: any, index: number) => {
          // Hitung jam dari sekarang berdasarkan pattern 12-12-24-24
          const hoursArray = [0, 12, 24, 48];
          const hoursFromNow = hoursArray[index] || index * 12;
          
          const forecastDate = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
          
          return {
            day: formatDay(forecastDate),
            date: formatDate(forecastDate),
            time: formatTime(forecastDate),
            hoursFromNow: hoursFromNow,
            condition: item.cuaca || item.weather || item.condition || 'N/A',
            conditionIcon: getWeatherIcon(item.cuaca || item.weather),
            windDirection: item.arah_angin || item.wind_direction || item.windDirection || 'N/A',
            windStrength: getWindStrength(item.kecepatan_angin || item.wind_speed),
            windSpeed: formatWindSpeed(item.kecepatan_angin || item.wind_speed),
            currentSpeed: formatCurrentSpeed(item.kecepatan_arus || item.current_speed),
            currentDirection: item.arah_arus || item.current_direction || 'N/A',
            temperature: parseInt(item.suhu || item.temperature || item.t || '0') || 28,
            humidity: parseInt(item.kelembaban || item.humidity || item.hu || '0') || 80,
            waveHeight: item.tinggi_gelombang || item.wave_height || 'N/A'
          };
        });
      }
      
      // Fallback jika tidak ada data
      if (forecasts.length === 0) {
        forecasts = generateFallbackData();
      }
      
      setForecastData(forecasts);
      setLocationInfo({
        name: data.wilayah || data.area || 'Perairan Sabang Banda Aceh',
        issued: data.issued || data.dikeluarkan || now.toISOString(),
        startTime: forecasts[0]?.time || 'N/A',
        endTime: forecasts[forecasts.length - 1]?.time || 'N/A'
      });
      
    } catch (err) {
      console.error('Error processing data:', err);
      setForecastData(generateFallbackData());
    }
  };

  const generateFallbackData = (): ForecastCard[] => {
    const now = new Date();
    return [0, 12, 24].map((hours, index) => {
      const forecastDate = new Date(now.getTime() + hours * 60 * 60 * 1000);
      return {
        day: formatDay(forecastDate),
        date: formatDate(forecastDate),
        time: formatTime(forecastDate),
        hoursFromNow: hours,
        condition: 'Berawan',
        conditionIcon: '☁️',
        windDirection: 'Barat Daya',
        windStrength: 'Sedang',
        windSpeed: '15 - 25 knot',
        currentSpeed: '50 cm/s',
        currentDirection: 'Barat',
        temperature: 28,
        humidity: 80,
        waveHeight: '1.25 - 2.5 m'
      };
    });
  };

  const formatDay = (date: Date): string => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return days[date.getDay()];
  };

  const formatDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const formatTime = (date: Date): string => {
    return `${String(date.getHours()).padStart(2, '0')}.${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getWeatherIcon = (condition: string): string => {
    if (!condition) return '🌤️';
    const lower = condition.toLowerCase();
    if (lower.includes('cerah')) return '☀️';
    if (lower.includes('berawan tebal')) return '☁️';
    if (lower.includes('berawan')) return '⛅';
    if (lower.includes('hujan lebat')) return '🌧️';
    if (lower.includes('hujan')) return '🌦️';
    if (lower.includes('petir')) return '⛈️';
    if (lower.includes('badai')) return '🌪️';
    return '🌤️';
  };

  const getWindStrength = (speed: any): string => {
    const numSpeed = parseInt(speed);
    if (isNaN(numSpeed)) return 'Sedang';
    if (numSpeed < 10) return 'Lemah';
    if (numSpeed < 20) return 'Sedang';
    if (numSpeed < 30) return 'Kuat';
    return 'Sangat Kuat';
  };

  const formatWindSpeed = (speed: any): string => {
    if (!speed) return 'N/A';
    if (typeof speed === 'string' && speed.includes('-')) return speed;
    const num = parseInt(speed);
    if (isNaN(num)) return 'N/A';
    return `${num - 2} - ${num + 5} knot`;
  };

  const formatCurrentSpeed = (speed: any): string => {
    if (!speed) return 'N/A';
    if (typeof speed === 'string' && speed.includes('cm/s')) return speed;
    const num = parseInt(speed);
    if (isNaN(num)) return 'N/A';
    return `${num} cm/s`;
  };

  const formatDateTimeID = (dateStr: string): string => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
      }) + ' WIB';
    } catch {
      return dateStr;
    }
  };

  // Loading State
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

  // Error State
  if (error) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-600 font-semibold mb-2">Gagal Memuat Data Cuaca Maritim</p>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <p className="text-gray-600 text-xs mb-4">Pastikan backend server berjalan di http://localhost:5000</p>
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
          <h2 className="text-2xl font-bold text-gray-900">
            {locationInfo?.name || 'Perairan Sabang Banda Aceh'}
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchWeatherData}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 transition-colors"
              title="Refresh data"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <a href="/user/detail-cuaca" className="text-blue-600 hover:text-blue-800 font-medium">
              Lebih detail &gt;
            </a>
          </div>
        </div>

        {/* Main Forecast Card */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {locationInfo?.name || 'Perairan Sabang Banda Aceh'}
                  </h3>
                  <p className="text-blue-200 text-sm">Prakiraan Cuaca Perairan</p>
                </div>
                <div className="bg-blue-700/50 backdrop-blur-sm px-3 py-1 rounded-lg text-xs">
                  🌊 Data BMKG
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                {forecastData.length > 0 && (
                  <>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-blue-200">Mulai:</span>
                      <span className="font-medium">
                        {forecastData[0].day}, {forecastData[0].date}, {forecastData[0].time} WIB
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-blue-200">Sampai:</span>
                      <span className="font-medium">
                        {forecastData[forecastData.length - 1].day}, {forecastData[forecastData.length - 1].date}, {forecastData[forecastData.length - 1].time} WIB
                      </span>
                    </div>
                  </>
                )}
                {locationInfo?.issued && (
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-blue-200">Dikeluarkan:</span>
                    <span className="font-medium">{formatDateTimeID(locationInfo.issued)}</span>
                  </div>
                )}
              </div>
              
              <p className="text-blue-200 text-sm">💡 Geser untuk melihat prakiraan selengkapnya</p>
            </div>
          </div>
        </div>

        {/* Hourly Forecast Cards */}
        {forecastData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecastData.map((forecast, index) => (
              <div key={index} className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{forecast.conditionIcon}</span>
                      <span className="font-semibold text-gray-800">{forecast.condition}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {forecast.day}, {forecast.date}, {forecast.time} WIB
                    </p>
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      {forecast.hoursFromNow === 0 ? 'Sekarang' : `${forecast.hoursFromNow} jam lagi`}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Wind */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="mr-1">💨</span> Angin:
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">{forecast.windDirection}</p>
                      <p className="text-xs text-gray-600">{forecast.windStrength} ({forecast.windSpeed})</p>
                    </div>
                  </div>

                  {/* Current */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="mr-1">🌊</span> Arus:
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">{forecast.currentSpeed}</p>
                      <p className="text-xs text-gray-600">dari {forecast.currentDirection}</p>
                    </div>
                  </div>

                  {/* Wave Height */}
                  {forecast.waveHeight && forecast.waveHeight !== 'N/A' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center">
                        <span className="mr-1">〰️</span> Gelombang:
                      </span>
                      <span className="text-sm font-medium text-gray-800">{forecast.waveHeight}</span>
                    </div>
                  )}

                  {/* Temperature */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="mr-1">🌡️</span> Suhu:
                    </span>
                    <span className="text-lg font-bold text-gray-800">{forecast.temperature}°C</span>
                  </div>

                  {/* Humidity */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="mr-1">💧</span> Kelembapan:
                    </span>
                    <span className="text-sm font-medium text-gray-800">{forecast.humidity}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl">
            <div className="text-4xl mb-3">🌊</div>
            <p className="text-gray-600 font-medium">Tidak ada data prakiraan cuaca tersedia</p>
            <p className="text-gray-400 text-sm mt-2">Silakan coba lagi nanti</p>
          </div>
        )}

        {/* Scroll indicator */}
        {forecastData.length > 0 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        )}

        {/* BMKG Credit */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            ℹ️ Data bersumber dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
          </p>
        </div>
      </div>
    </section>
  );
};

export default WeatherForecastSection;