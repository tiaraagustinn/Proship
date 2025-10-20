// ...existing code...
'use client';

import React from 'react';

interface WeatherCardProps {
  location: string;
  city: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  time: string;
  condition: string;
  weatherIcon?: React.ReactNode;
  backgroundImage?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  location,
  city,
  temperature,
  windSpeed,
  humidity,
  time,
  condition,
  weatherIcon = '☀️',
  backgroundImage
}) => {
  return (
    <div
      className="relative text-white w-full min-h-[200px]"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4 p-6 md:p-8">
        <div className="flex-1">
          <h4 className="text-sm font-semibold uppercase tracking-wider">{location}</h4>
          <p className="text-xs opacity-90">{city}</p>
        </div>

        <div className="flex-1 text-left md:text-center">
          <div className="text-4xl md:text-6xl font-bold leading-tight">{temperature}°C</div>
          <div className="text-sm opacity-90 mt-1">{time}</div>
        </div>

        <div className="flex-1 flex items-center justify-end md:justify-center relative">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
            <div className="text-4xl">{weatherIcon}</div>
          </div>
          <div className="hidden md:block ml-4 text-sm font-medium">{condition}</div>
        </div>
      </div>

      <div className="relative px-6 md:px-8 pb-6">
          <div className="flex justify-between text-sm">
            <div className="text-[13px] text-white/90">Angin: {windSpeed} km/jam</div>
            <div className="text-[13px] text-white/90">Kelembapan: {humidity}%</div>
          </div>
      </div>
    </div>
  );
};

export default WeatherCard;
// ...existing code...