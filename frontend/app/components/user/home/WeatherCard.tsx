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
  weatherIcon,
  backgroundImage,
}) => {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg text-white h-full min-h-[220px]"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/20" />

      <div className="relative h-full flex flex-col justify-between p-5">
        {/* Top — lokasi & waktu */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">⚓ {location}</p>
            <p className="text-sm font-medium text-white/90 mt-0.5">{city}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white/90 font-medium">
            {time} WIB
          </div>
        </div>

        {/* Middle — suhu & ikon */}
        <div className="flex items-center justify-between my-3">
          <div>
            <div className="flex items-end gap-1">
              <span className="text-6xl font-extrabold leading-none">{temperature}</span>
              <span className="text-2xl font-light mb-1 text-white/80">°C</span>
            </div>
            <p className="text-sm text-white/80 mt-1">{condition}</p>
          </div>
          <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-5xl shadow-inner">
            {weatherIcon}
          </div>
        </div>

        {/* Bottom — detail */}
        <div className="flex items-center gap-4 border-t border-white/20 pt-3">
          <div className="flex items-center gap-1.5">
            <span className="text-base">💨</span>
            <div>
              <p className="text-[10px] text-white/60 leading-none">Angin</p>
              <p className="text-xs font-semibold">{windSpeed} km/j</p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex items-center gap-1.5">
            <span className="text-base">💧</span>
            <div>
              <p className="text-[10px] text-white/60 leading-none">Kelembapan</p>
              <p className="text-xs font-semibold">{humidity}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
