'use client';

import React from 'react';

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
}

const WeatherForecastSection = () => {
  const forecastData: ForecastCard[] = [
    {
      day: 'Rab',
      date: '17 Sep',
      time: '16.00',
      hoursFromNow: 0,
      condition: 'Berawan',
      conditionIcon: '☁️',
      windDirection: 'Barat Daya',
      windStrength: 'Sedang',
      windSpeed: '17 - 31 knot',
      currentSpeed: '62 cm/s',
      currentDirection: 'Barat',
      temperature: 29,
      humidity: 79
    },
    {
      day: 'Rab',
      date: '17 Sep',
      time: '17.00',
      hoursFromNow: 1,
      condition: 'Berawan Tebal',
      conditionIcon: '☁️',
      windDirection: 'Barat Daya',
      windStrength: 'Sedang',
      windSpeed: '17 - 30 knot',
      currentSpeed: '60 cm/s',
      currentDirection: 'Barat',
      temperature: 28,
      humidity: 80
    },
    {
      day: 'Rab',
      date: '17 Sep',
      time: '18.00',
      hoursFromNow: 2,
      condition: 'Berawan Tebal',
      conditionIcon: '☁️',
      windDirection: 'Barat Daya',
      windStrength: 'Sedang',
      windSpeed: '16 - 28 knot',
      currentSpeed: '58 cm/s',
      currentDirection: 'Barat',
      temperature: 28,
      humidity: 81
    }
  ];

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Perairan Sabang Banda Aceh</h2>
          <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
            Lebih detail &gt;
          </a>
        </div>

        {/* Main Forecast Card */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl p-6 text-white relative overflow-hidden">
            {/* Background texture effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Perairan Sabang Banda Aceh</h3>
                  <p className="text-blue-200 text-sm">Prakiraan Cuaca Perairan</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-blue-200">Mulai:</span>
                  <span className="font-medium">Rab, 17 Sep, 16.00 WIB</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-blue-200">Sampai:</span>
                  <span className="font-medium">Sab, 20 Sep, 10.00 WIB</span>
                </div>
              </div>
              
              <p className="text-blue-200 text-sm">Geser untuk melihat prakiraan</p>
            </div>
          </div>
        </div>

        {/* Hourly Forecast Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forecastData.map((forecast, index) => (
            <div key={index} className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{forecast.conditionIcon}</span>
                    <span className="font-semibold text-gray-800">{forecast.condition}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {forecast.day}, {forecast.date}, {forecast.time}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    {forecast.hoursFromNow} jam lagi
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Wind */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Angin:</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{forecast.windDirection}</p>
                    <p className="text-xs text-gray-600">{forecast.windStrength} ({forecast.windSpeed})</p>
                  </div>
                </div>

                {/* Current */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Arus:</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{forecast.currentSpeed}</p>
                    <p className="text-xs text-gray-600">dari {forecast.currentDirection}</p>
                  </div>
                </div>

                {/* Temperature */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Suhu:</span>
                  <span className="text-lg font-bold text-gray-800">{forecast.temperature}°C</span>
                </div>

                {/* Humidity */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Kelembapan:</span>
                  <span className="text-sm font-medium text-gray-800">{forecast.humidity}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeatherForecastSection;


