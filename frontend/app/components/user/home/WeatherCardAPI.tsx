'use client';

import React from 'react';
import { useWeather } from '@/lib/hooks/useWeather';
import WeatherCard from './WeatherCard';

interface WeatherCardAPIProps {
  pelabuhan: 'balohan' | 'ulee-lheue';
  location: string;
  city: string;
  backgroundImage?: string;
}

function getWeatherIcon(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes('petir'))   return '⛈️';
  if (d.includes('hujan'))   return '🌧️';
  if (d.includes('kabut'))   return '🌫️';
  if (d.includes('berawan')) return '⛅';
  if (d.includes('cerah'))   return '☀️';
  return '🌤️';
}

const Skeleton = ({ location }: { location: string }) => (
  <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-blue-600 to-cyan-500 min-h-[220px] flex flex-col justify-between p-5 animate-pulse">
    <div>
      <div className="h-3 w-24 bg-white/30 rounded mb-2" />
      <div className="h-4 w-32 bg-white/20 rounded" />
    </div>
    <div className="flex items-center justify-between">
      <div>
        <div className="h-14 w-24 bg-white/30 rounded mb-2" />
        <div className="h-3 w-20 bg-white/20 rounded" />
      </div>
      <div className="w-20 h-20 rounded-full bg-white/20" />
    </div>
    <div className="flex gap-4 border-t border-white/20 pt-3">
      <div className="h-3 w-16 bg-white/20 rounded" />
      <div className="h-3 w-20 bg-white/20 rounded" />
    </div>
    <p className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
      Memuat {location}...
    </p>
  </div>
);

const ErrorCard = ({ location }: { location: string }) => (
  <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-slate-600 to-slate-700 min-h-[220px] flex flex-col items-center justify-center p-5 text-white text-center">
    <span className="text-4xl mb-3">🌐</span>
    <p className="font-semibold text-sm">{location}</p>
    <p className="text-xs text-white/60 mt-1">Data cuaca tidak tersedia</p>
  </div>
);

export const WeatherCardAPI: React.FC<WeatherCardAPIProps> = ({
  pelabuhan,
  location,
  city,
  backgroundImage,
}) => {
  const { data, loading, error } = useWeather(pelabuhan);

  if (loading) return <Skeleton location={location} />;
  if (error)   return <ErrorCard location={location} />;

  const lokasi       = data?.lokasi;
  const cuacaArray   = data?.data?.[0]?.cuaca ?? [];
  const dataSekarang = Array.isArray(cuacaArray[0]) ? cuacaArray[0][0] : cuacaArray[0];

  if (!dataSekarang) return <ErrorCard location={location} />;

  const temperature = dataSekarang?.t       ?? dataSekarang?.temp        ?? 0;
  const windSpeed   = dataSekarang?.ws      ?? dataSekarang?.wind_speed   ?? 0;
  const humidity    = dataSekarang?.hu      ?? dataSekarang?.humidity     ?? 0;
  const condition   = dataSekarang?.weather_desc ?? dataSekarang?.weather ?? '—';

  return (
    <WeatherCard
      location={location}
      city={lokasi?.kelurahan || city}
      temperature={temperature}
      windSpeed={windSpeed}
      humidity={humidity}
      time={new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      condition={condition}
      weatherIcon={getWeatherIcon(condition)}
      backgroundImage={backgroundImage}
    />
  );
};
