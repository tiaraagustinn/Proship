"use client";

import { useEffect, useMemo, useState } from "react";

interface WeatherItem {
  valid_from: string;
  valid_to: string;
  time_desc: string;
  weather: string;
  weather_desc: string;
  warning_desc: string;
  wave_cat: string;
  wave_desc: string;
  wave_min?: number;
  wave_max?: number;
  wind_from: string;
  wind_to: string;
  wind_speed_min: number;
  wind_speed_max: number;
  current_speed_min?: number;
  current_speed_max?: number;
}

interface WeatherResponse {
  name: string;
  issued: string;
  code?: string;
  info?: string;
  data: WeatherItem[];
}

const daysLong = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const monthsLong = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const monthsShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const parseUtcToWib = (utcDateTime: string): Date | null => {
  if (!utcDateTime) return null;

  try {
    const [datePart, timePart] = utcDateTime.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = (timePart || "00:00").split(":").map(Number);

    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    return new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
  } catch {
    return null;
  }
};

const toDateKey = (utcDateTime: string): string => {
  const date = parseUtcToWib(utcDateTime);
  if (!date) return "";

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDateTime = (utcDateTime: string): string => {
  const date = parseUtcToWib(utcDateTime);
  if (!date) return utcDateTime;

  const dayName = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][date.getUTCDay()];
  const dayNum = date.getUTCDate();
  const monthName = monthsShort[date.getUTCMonth()];
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${dayName}, ${dayNum} ${monthName} ${date.getUTCFullYear()}, ${hours}.${minutes}`;
};

const formatIssuedDate = (utcDateTime: string): string => {
  const date = parseUtcToWib(utcDateTime);
  if (!date) return utcDateTime;

  const dayName = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][date.getUTCDay()];
  const dayNum = date.getUTCDate();
  const monthName = monthsLong[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${dayName}, ${dayNum} ${monthName} ${year} pukul ${hours}.${minutes} WIB`;
};

const formatTableTime = (utcDateTime: string): string => {
  const date = parseUtcToWib(utcDateTime);
  if (!date) return utcDateTime;

  const dayNum = date.getUTCDate();
  const monthName = monthsShort[date.getUTCMonth()];
  const year = String(date.getUTCFullYear()).slice(-2);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${dayNum} ${monthName} ${year}, ${hours}.${minutes}`;
};

const getWaveBadgeClass = (waveCat: string): string => {
  const cat = (waveCat || "").toLowerCase();
  if (cat.includes("tinggi") || cat.includes("bahaya")) return "bg-red-600 text-white";
  if (cat.includes("sedang")) return "bg-amber-500 text-white";
  return "bg-blue-600 text-white";
};

const getHourAhead = (index: number): string => {
  if (index === 0) return "0 jam kedepan";
  return `${index} jam kedepan`;
};

const getWeatherIcon = (weather: string): string => {
  if (!weather) return "🌤️";
  const lower = weather.toLowerCase();
  if (lower.includes("cerah")) return "☀️";
  if (lower.includes("berawan tebal")) return "☁️";
  if (lower.includes("berawan")) return "⛅";
  if (lower.includes("hujan lebat")) return "🌧️";
  if (lower.includes("hujan ringan")) return "🌦️";
  if (lower.includes("hujan")) return "🌧️";
  if (lower.includes("petir")) return "⛈️";
  if (lower.includes("badai")) return "🌪️";
  return "🌤️";
};

export default function WeatherDetail() {
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/detail/detail-cuaca")
      .then((res) => res.json())
      .then((data) => setWeatherData(data))
      .catch((err) => console.error("Error fetching weather:", err));
  }, []);

  const list = weatherData?.data || [];

  const dateTabs = useMemo(() => {
    const map = new Map<string, { key: string; day: string; date: string }>();

    list.forEach((item) => {
      const d = parseUtcToWib(item.valid_from);
      if (!d) return;

      const key = toDateKey(item.valid_from);
      if (map.has(key)) return;

      map.set(key, {
        key,
        day: daysLong[d.getUTCDay()],
        date: `${d.getUTCDate()} ${monthsLong[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
      });
    });

    return Array.from(map.values());
  }, [list]);

  useEffect(() => {
    if (dateTabs.length > 0 && !selectedDateKey) {
      setSelectedDateKey(dateTabs[0].key);
    }
  }, [dateTabs, selectedDateKey]);

  const filteredForecast = selectedDateKey
    ? list.filter((item) => toDateKey(item.valid_from) === selectedDateKey)
    : list;

  const highlightedForecast = filteredForecast[0] || list[0];

  if (!weatherData) {
    return <p className="py-10 text-center text-gray-500">Loading data...</p>;
  }

  if (!Array.isArray(list) || list.length === 0) {
    return <p className="py-10 text-center text-gray-500">Tidak ada data cuaca</p>;
  }

  if (!Array.isArray(list) || list.length === 0) {
    return <p className="py-10 text-center text-gray-500">Tidak ada data cuaca</p>;
  }

  return (
    <section className="bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {highlightedForecast ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-slate-700">{weatherData.name}</h2>
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
                Lebih detail
              </span>
            </div>

            <div
              className="mb-10 overflow-hidden rounded-2xl border border-blue-400/30 bg-blue-700 shadow-lg"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(30,64,175,0.35) 0%, rgba(29,78,216,0.7) 100%), url('/images/uleelheue-bg2.png')",
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              <div className="p-5 text-white">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">Prakiraan Cuaca Perairan</p>
                    <h3 className="mt-1 text-xl font-bold">{weatherData.name}</h3>
                  </div>
                  <div className="rounded-lg bg-white/15 px-4 py-2 text-xs font-medium text-blue-100">
                    Periode Valid: {formatIssuedDate(weatherData.issued)}
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <button className="rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">Download PDF</button>
                  <button className="rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">Download Infografis</button>
                </div>

                <p className="mb-5 text-sm font-semibold text-blue-100">{formatDateTime(highlightedForecast.valid_from)} WIB</p>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                    <span className="text-2xl">{getWeatherIcon(highlightedForecast.weather)}</span>
                    <div>
                      <p className="text-sm font-semibold">{highlightedForecast.weather}</p>
                      <p className="text-xs text-blue-100">{highlightedForecast.weather_desc || "-"}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-white/10 p-3">
                    <p className="text-xs text-blue-100">Angin dari</p>
                    <p className="text-sm font-semibold">{highlightedForecast.wind_from} {highlightedForecast.wind_speed_max} kt</p>
                    <p className="text-xs text-blue-100">Hembusan: {highlightedForecast.wind_speed_max} kt</p>
                  </div>

                  <div className="rounded-lg bg-white/10 p-3">
                    <p className="text-xs text-blue-100">Gelombang</p>
                    <p className="text-sm font-semibold">{highlightedForecast.wave_desc}</p>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getWaveBadgeClass(highlightedForecast.wave_cat)}`}>
                      {highlightedForecast.wave_cat || "-"}
                    </span>
                  </div>

                  <div className="rounded-lg bg-white/10 p-3">
                    <p className="text-xs text-blue-100">Arus ke</p>
                    <p className="text-sm font-semibold">{highlightedForecast.wind_to || "-"}</p>
                    <p className="text-xs text-blue-100">
                      {(highlightedForecast.current_speed_min ?? 0)} - {(highlightedForecast.current_speed_max ?? 0)} cm/s
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 flex justify-center">
              <div className="overflow-hidden rounded-xl border border-slate-400 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-3">
                  {dateTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedDateKey(tab.key)}
                      className={`min-w-[170px] border-r border-slate-400 px-6 py-2.5 text-center last:border-r-0 ${
                        selectedDateKey === tab.key ? "bg-indigo-900 text-white" : "bg-gray-100 text-slate-700"
                      }`}
                    >
                      <p className="text-xs font-bold">{tab.day}</p>
                      <p className="text-xs font-semibold">{tab.date}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white">
              <table className="min-w-[1100px] w-full border-collapse text-xs">
                <thead className="bg-green-700 text-white">
                  <tr>
                    <th className="border border-green-600 px-3 py-2 text-left">Waktu (WIB)</th>
                    <th className="border border-green-600 px-3 py-2 text-left">Cuaca</th>
                    <th className="border border-green-600 px-3 py-2 text-left">Angin dari</th>
                    <th className="border border-green-600 px-3 py-2 text-left">Gelombang</th>
                    <th className="border border-green-600 px-3 py-2 text-left">Arus ke</th>
                    <th className="border border-green-600 px-3 py-2 text-center">Jarak Pandang (km)</th>
                    <th className="border border-green-600 px-3 py-2 text-center">Suhu (°C)</th>
                    <th className="border border-green-600 px-3 py-2 text-center">Kelembaban (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForecast.map((item, index) => (
                    <tr key={`${item.valid_from}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="border border-gray-200 bg-blue-900 px-3 py-2 text-white">
                        <p className="font-semibold">{formatTableTime(item.valid_from)}</p>
                        <p className="text-[10px] text-blue-100">{getHourAhead(index)}</p>
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getWeatherIcon(item.weather)}</span>
                          <div>
                            <p className="text-xs font-semibold text-slate-700">{item.weather}</p>
                            <p className="text-xs text-slate-500">{item.weather_desc || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        <p className="font-semibold text-slate-700">{item.wind_from} {item.wind_speed_max} kt</p>
                        <p className="text-xs text-slate-500">Gust: {item.wind_speed_max} kt</p>
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        <p className="font-semibold text-slate-700">{item.wave_desc || `${item.wave_min ?? 0} - ${item.wave_max ?? 0} m`}</p>
                        <span className={`mt-1 inline-flex rounded px-2 py-0.5 text-xs font-semibold ${getWaveBadgeClass(item.wave_cat)}`}>
                          {item.wave_cat || "-"}
                        </span>
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        <p className="font-semibold text-slate-700">{item.wind_to || "-"}</p>
                        <p className="text-xs text-slate-500">{item.current_speed_min ?? 0} - {item.current_speed_max ?? 0} cm/s</p>
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-center text-slate-700">-</td>
                      <td className="border border-gray-200 px-3 py-2 text-center text-slate-700">-</td>
                      <td className="border border-gray-200 px-3 py-2 text-center text-slate-700">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="py-10 text-center text-gray-500">Tidak ada data cuaca</p>
        )}
      </div>
    </section>
  );
}
