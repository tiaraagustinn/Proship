'use client';

import React from 'react';
import WeatherCard from './WeatherCard';

const WeatherSection = () => {
  return (
    <section className="py-12 bg-gray-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Ulee Lheue Card - Stormy */}
          <WeatherCard
            location="ULEE LHEUE"
            city="Banda Aceh"
            temperature={26}
            windSpeed={70}
            humidity={80}
            time="10.30 AM"
            condition="Hujan Badai"
            weatherIcon="⛈️"
            backgroundImage="/images/storm-bg.png"
          />

          {/* Balohan Card - Sunny */}
          <WeatherCard
            location="Balohan"
            city="Sabang"
            temperature={34}
            windSpeed={7}
            humidity={30}
            time="10.30 AM"
            condition="Cerah"
            weatherIcon="☀️"
            backgroundImage="/images/sunny-bg.png"
          />
        </div>
      </div>
    </section>
  );
};

export default WeatherSection;


