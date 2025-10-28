// app/components/cuacaLaut/WeatherSection.tsx

"use client";

import React from 'react';
import { WeatherCardAPI } from '@/app/components/user/home/WeatherCardAPI';

interface WeatherSectionProps {
  pelabuhan: 'balohan' | 'ulee-lheue';
  title: string;
  icon: string;
  city?: string;
  backgroundImage?: string;
}

export default function WeatherSection({ 
  pelabuhan, 
  title, 
  city,
  backgroundImage 
}: WeatherSectionProps) {
  return (
    <div className="mb-8">
      <WeatherCardAPI
        pelabuhan={pelabuhan}
        location={title}
        city={city || title}
        backgroundImage={backgroundImage}
      />
    </div>
  );
}