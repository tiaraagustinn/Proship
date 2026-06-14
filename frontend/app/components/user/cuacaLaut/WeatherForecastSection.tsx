'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface ForecastItem {
  validFrom: string;
  validTo: string;
  weather: string;
  weatherDesc: string;
  warningDesc: string;
  waveCat: string;
  waveDesc: string;
  windFrom: string;
  windTo: string;
  windSpeedMin: number;
  windSpeedMax: number;
}

interface LocationInfo {
  name: string;
  issued: string;
  code?: string;
  info?: string;
}

const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const monthsLong = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const daysShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const parseUtcToWib = (s: string): Date | null => {
  if (!s) return null;
  try {
    const [datePart, timePart] = s.split(' ');
    const [y, mo, d] = datePart.split('-').map(Number);
    const [h, mi] = (timePart || '00:00').split(':').map(Number);
    return new Date(Date.UTC(y, mo - 1, d, h, mi) + 7 * 3600 * 1000);
  } catch { return null; }
};

const parseUtcMs = (s: string): number | null => {
  if (!s) return null;
  try {
    const [datePart, timePart] = s.split(' ');
    const [y, mo, d] = datePart.split('-').map(Number);
    const [h, mi] = (timePart || '00:00').split(':').map(Number);
    return Date.UTC(y, mo - 1, d, h, mi);
  } catch { return null; }
};

const addHoursToUtcString = (utcStr: string, hours: number): string => {
  if (!utcStr) return '';
  try {
    const d = new Date(utcStr.replace(' UTC', 'Z'));
    if (isNaN(d.getTime())) return utcStr;
    d.setUTCHours(d.getUTCHours() + hours);
    const y = d.getUTCFullYear();
    const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
    const date = String(d.getUTCDate()).padStart(2, '0');
    const h = String(d.getUTCHours()).padStart(2, '0');
    const mi = String(d.getUTCMinutes()).padStart(2, '0');
    return `${y}-${mo}-${date} ${h}:${mi} UTC`;
  } catch { return utcStr; }
};

const fmtDate = (s: string): string => {
  const d = parseUtcToWib(s);
  if (!d) return '-';
  return `${daysShort[d.getUTCDay()]}, ${d.getUTCDate()} ${monthsShort[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

const fmtTime = (s: string): string => {
  const d = parseUtcToWib(s);
  if (!d) return '-';
  return `${String(d.getUTCHours()).padStart(2, '0')}.${String(d.getUTCMinutes()).padStart(2, '0')}`;
};

const fmtIssued = (s: string): string => {
  const d = parseUtcToWib(s);
  if (!d) return s;
  return `${daysShort[d.getUTCDay()]}, ${d.getUTCDate()} ${monthsLong[d.getUTCMonth()]} ${d.getUTCFullYear()} · ${String(d.getUTCHours()).padStart(2, '0')}.${String(d.getUTCMinutes()).padStart(2, '0')} WIB`;
};

const weatherIcon = (w: string): string => {
  const l = (w || '').toLowerCase();
  if (l.includes('cerah berawan')) return '⛅';
  if (l.includes('cerah')) return '☀️';
  if (l.includes('berawan tebal')) return '☁️';
  if (l.includes('berawan')) return '🌥️';
  if (l.includes('hujan lebat')) return '🌧️';
  if (l.includes('hujan ringan')) return '🌦️';
  if (l.includes('hujan')) return '🌧️';
  if (l.includes('petir')) return '⛈️';
  if (l.includes('badai')) return '🌪️';
  return '🌤️';
};

const waveStyle = (cat: string): { pill: string; bar: string; dot: string } => {
  const c = (cat || '').toLowerCase();
  if (c.includes('tinggi') || c.includes('bahaya') || c.includes('sangat'))
    return { pill: 'bg-red-100 text-red-700 border-red-200', bar: 'bg-red-500', dot: 'bg-red-500' };
  if (c.includes('sedang') || c.includes('rendah'))
    return { pill: 'bg-amber-100 text-amber-700 border-amber-200', bar: 'bg-amber-400', dot: 'bg-amber-400' };
  return { pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', dot: 'bg-emerald-500' };
};

const windLabel = (max: number): { text: string; color: string } => {
  if (max >= 35) return { text: 'Sangat Kencang', color: 'text-red-600' };
  if (max >= 22) return { text: 'Kencang', color: 'text-amber-600' };
  if (max >= 12) return { text: 'Sedang', color: 'text-blue-600' };
  return { text: 'Lemah', color: 'text-emerald-600' };
};

const WeatherForecastSection = () => {
  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const nowMs = useMemo(() => Date.now(), []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_BASE + '/maritim-weather/sabang-bandaAceh');
      if (!res.ok) throw new Error('Gagal mengambil data');
      const data = await res.json();

      const items: ForecastItem[] = [];

      if (Array.isArray(data.forecast_day1)) {
        data.forecast_day1.forEach((item: any) => {
          items.push({
            validFrom: item.time || '',
            validTo: addHoursToUtcString(item.time, 1),
            weather: item.weather || '',
            weatherDesc: item.weather || '',
            warningDesc: item.warning_desc || 'NIL',
            waveCat: item.wave_cat || '',
            waveDesc: item.wave_height != null ? `${item.wave_height.toFixed(1)} m` : (item.wave_desc || ''),
            windFrom: item.wind_from || '',
            windTo: item.wind_to || item.wind_from || '',
            windSpeedMin: item.wind_speed || 0,
            windSpeedMax: item.wind_gust || item.wind_speed || 0,
          });
        });
      }

      const key2_4 = 'forecast_day2-4';
      if (Array.isArray(data[key2_4])) {
        data[key2_4].forEach((item: any) => {
          items.push({
            validFrom: item.time || '',
            validTo: addHoursToUtcString(item.time, 3),
            weather: item.weather || '',
            weatherDesc: item.weather || '',
            warningDesc: item.warning_desc || 'NIL',
            waveCat: item.wave_cat || '',
            waveDesc: item.wave_height != null ? `${item.wave_height.toFixed(1)} m` : (item.wave_desc || ''),
            windFrom: item.wind_from || '',
            windTo: item.wind_to || item.wind_from || '',
            windSpeedMin: item.wind_speed || 0,
            windSpeedMax: item.wind_gust || item.wind_speed || 0,
          });
        });
      }

      setForecasts(items);
      setLocation({
        name: data.name || 'Perairan Sabang - Banda Aceh',
        issued: data.issued || '',
        code: data.code,
        info: data.info,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm text-slate-500">Memuat prakiraan cuaca maritim...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center">
            <p className="text-3xl mb-2">⚠️</p>
            <p className="font-semibold text-red-700">{error}</p>
            <button onClick={fetchData} className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm text-white hover:bg-red-700">
              Coba Lagi
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!forecasts.length || !location) return null;

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header row */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{location.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sumber: BMKG · Diterbitkan {fmtIssued(location.issued)}</p>
          </div>
          <Link
            href="/user/detail-cuaca"
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors whitespace-nowrap"
          >
            Lihat Detail
            <span>›</span>
          </Link>
        </div>

        {/* Scrollable cards */}
        <div className="overflow-x-auto pb-3">
          <div className="flex gap-4" style={{ minWidth: 'max-content' }}>

            {/* Aside / info card */}
            <aside
              className="relative w-72 flex-shrink-0 overflow-hidden rounded-3xl shadow-xl"
              style={{
                backgroundImage:
                  "linear-gradient(160deg, rgba(15,40,120,0.90) 0%, rgba(6,95,170,0.88) 100%), url('/images/balohan-bg3.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
              <div className="flex h-full flex-col justify-between p-6 text-white">
                <div>
                  <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                    <span>⚓</span> Prakiraan Cuaca
                  </div>
                  <h4 className="mt-3 text-xl font-extrabold leading-snug">{location.name}</h4>
                  <p className="mt-1 text-xs text-blue-200">Perairan Aceh</p>

                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Periode Prakiraan</p>
                      <div className="mt-3 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-blue-200">Mulai</span>
                          <span className="font-semibold">{fmtDate(forecasts[0].validFrom)}</span>
                        </div>
                        <div className="h-px bg-white/10" />
                        <div className="flex justify-between">
                          <span className="text-blue-200">Sampai</span>
                          <span className="font-semibold">{fmtDate(forecasts[forecasts.length - 1].validTo)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">Diterbitkan</p>
                      <p className="text-xs font-semibold leading-relaxed">{fmtIssued(location.issued)}</p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-blue-200 mt-4">← Geser untuk melihat prakiraan</p>
              </div>
            </aside>

            {/* Forecast cards */}
            {forecasts.map((fc, i) => {
              const fromMs = parseUtcMs(fc.validFrom);
              const toMs = parseUtcMs(fc.validTo);
              const isActive = fromMs !== null && toMs !== null && nowMs >= fromMs && nowMs <= toMs;
              const wave = waveStyle(fc.waveCat);
              const wind = windLabel(fc.windSpeedMax);
              const hasWarn = fc.warningDesc && fc.warningDesc !== 'NIL';

              return (
                <article
                  key={`${fc.validFrom}-${i}`}
                  className={`relative w-64 flex-shrink-0 overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
                    isActive ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-slate-200'
                  }`}
                >
                  {/* top color bar */}
                  <div className={`h-1 w-full ${isActive ? 'bg-emerald-500' : hasWarn ? 'bg-amber-400' : 'bg-blue-500'}`} />

                  <div className="p-5">
                    {/* Date header */}
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                          {fmtDate(fc.validFrom)}
                        </p>
                        <p className="text-sm font-semibold text-slate-600 mt-0.5">
                          {fmtTime(fc.validFrom)} – {fmtTime(fc.validTo)} WIB
                        </p>
                      </div>
                      {isActive && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Sekarang
                        </span>
                      )}
                    </div>

                    {/* Weather */}
                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-4xl leading-none">{weatherIcon(fc.weather)}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{fc.weather}</p>
                        {hasWarn && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                            <span>⚠️</span>{fc.warningDesc}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 mb-4" />

                    {/* Wind */}
                    <div className="mb-3 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50">
                        <span className="text-base">💨</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Angin</p>
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {fc.windFrom} → {fc.windTo || '-'}
                        </p>
                        <p className={`text-[10px] font-semibold ${wind.color}`}>
                          {fc.windSpeedMin}–{fc.windSpeedMax} kt · {wind.text}
                        </p>
                      </div>
                    </div>

                    {/* Wave */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                        <span className="text-base">🌊</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gelombang</p>
                        <p className="text-xs font-semibold text-slate-700">{fc.waveDesc}</p>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${wave.pill}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${wave.dot}`} />
                          {fc.waveCat || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default WeatherForecastSection;
