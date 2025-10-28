"use client";

import { useEffect, useState } from "react";

interface WeatherItem {
  time_desc: string;
  weather: string;
  weather_desc: string;
  wave_cat: string;
  wave_desc: string;
  wind_from: string;
  wind_to: string;
  wind_speed_min: number;
  wind_speed_max: number;
}

export default function WeatherDetail() {
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/detail/detail-cuaca") // ganti sesuai endpoint backend kamu
      .then((res) => res.json())
      .then((data) => setWeatherData(data))
      .catch((err) => console.error("Error fetching weather:", err));
  }, []);

  if (!weatherData) {
    return <p className="text-center py-10 text-gray-500">Loading data...</p>;
  }

  // pastikan `weatherData.data` adalah array
  const list = weatherData.data || [];

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4 text-center">
        {weatherData.name}
      </h2>
      <p className="text-center text-sm text-gray-500 mb-6">
        Dikeluarkan: {weatherData.issued}
      </p>

      {Array.isArray(list) ? (
        list.map((item: WeatherItem, index: number) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-xl p-4 mb-3 border border-gray-100"
          >
            <h3 className="text-lg font-semibold">{item.time_desc}</h3>
            <p className="text-gray-600">{item.weather_desc}</p>
            <p className="text-sm mt-2">
              🌊 Gelombang: <b>{item.wave_cat}</b> ({item.wave_desc}) <br />
              💨 Angin: {item.wind_from} → {item.wind_to} (
              {item.wind_speed_min}–{item.wind_speed_max} knot)
            </p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">Tidak ada data cuaca</p>
      )}
    </div>
  );
}
