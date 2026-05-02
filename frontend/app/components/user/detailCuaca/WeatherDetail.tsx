"use client";

import { useEffect, useMemo, useState } from "react";

interface WeatherItem {
  valid_from: string;
  valid_to: string;
  time_desc: string;
  weather: string;
  weather_desc: string;
  warning_desc: string;
  station_remark: string;
  wave_cat: string;
  wave_desc: string;
  wind_from: string;
  wind_to: string;
  wind_speed_min: number;
  wind_speed_max: number;
}

interface WeatherResponse {
  name: string;
  issued: string;
  code?: string;
  info?: string;
  data: WeatherItem[];
}

const daysLong   = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const monthsLong = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const monthsShort= ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

const parseUtcMs = (s: string): number | null => {
  if (!s) return null;
  try {
    const [dp, tp] = s.split(" ");
    const [y,mo,d] = dp.split("-").map(Number);
    const [h,mi]   = (tp||"00:00").split(":").map(Number);
    return Date.UTC(y, mo-1, d, h, mi);
  } catch { return null; }
};

const parseUtcToWib = (s: string): Date | null => {
  const ms = parseUtcMs(s);
  if (ms === null) return null;
  return new Date(ms + 7*3600*1000);
};

const toDateKey = (s: string) => {
  const d = parseUtcToWib(s);
  if (!d) return "";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
};

const fmtIssued = (s: string) => {
  const d = parseUtcToWib(s);
  if (!d) return s;
  return `${daysLong[d.getUTCDay()]}, ${d.getUTCDate()} ${monthsLong[d.getUTCMonth()]} ${d.getUTCFullYear()} · ${String(d.getUTCHours()).padStart(2,"0")}.${String(d.getUTCMinutes()).padStart(2,"0")} WIB`;
};

const fmtTime = (s: string) => {
  const d = parseUtcToWib(s);
  if (!d) return "-";
  return `${String(d.getUTCHours()).padStart(2,"0")}.${String(d.getUTCMinutes()).padStart(2,"0")}`;
};

const fmtDate = (s: string) => {
  const d = parseUtcToWib(s);
  if (!d) return "-";
  return `${d.getUTCDate()} ${monthsShort[d.getUTCMonth()]}`;
};

const periodLabel = (s: string): { label: string; icon: string; bg: string } => {
  const d = parseUtcToWib(s);
  if (!d) return { label: "—", icon: "🕐", bg: "bg-gray-100" };
  const h = d.getUTCHours();
  if (h >= 4  && h < 10) return { label: "Pagi",   icon: "🌅", bg: "bg-amber-50"  };
  if (h >= 10 && h < 15) return { label: "Siang",  icon: "☀️",  bg: "bg-yellow-50" };
  if (h >= 15 && h < 19) return { label: "Sore",   icon: "🌇", bg: "bg-orange-50" };
  return                         { label: "Malam",  icon: "🌙", bg: "bg-slate-100" };
};

const weatherIcon = (w: string): string => {
  const l = (w||"").toLowerCase();
  if (l.includes("cerah berawan")) return "⛅";
  if (l.includes("cerah"))         return "☀️";
  if (l.includes("berawan tebal")) return "☁️";
  if (l.includes("berawan"))       return "🌥️";
  if (l.includes("hujan lebat"))   return "🌧️";
  if (l.includes("hujan ringan"))  return "🌦️";
  if (l.includes("hujan"))         return "🌧️";
  if (l.includes("petir"))         return "⛈️";
  if (l.includes("badai"))         return "🌪️";
  return "🌤️";
};

// Arah mata angin → derajat (untuk ikon panah)
const windDirToDeg: Record<string, number> = {
  "Utara": 0, "Timur Laut": 45, "Timur": 90, "Tenggara": 135,
  "Selatan": 180, "Barat Daya": 225, "Barat": 270, "Barat Laut": 315,
};
const windDeg = (dir: string): number => {
  for (const [k, v] of Object.entries(windDirToDeg)) {
    if ((dir||"").includes(k)) return v;
  }
  return 0;
};

const waveStyle = (cat: string) => {
  const c = (cat||"").toLowerCase();
  if (c.includes("sangat tinggi") || c.includes("bahaya"))
    return { pill:"bg-red-100 text-red-700 border-red-200",    bar:"bg-red-500",    pct: 100, dot:"bg-red-500"    };
  if (c.includes("tinggi"))
    return { pill:"bg-orange-100 text-orange-700 border-orange-200", bar:"bg-orange-500", pct: 80,  dot:"bg-orange-500" };
  if (c.includes("sedang"))
    return { pill:"bg-amber-100 text-amber-700 border-amber-200",  bar:"bg-amber-400",  pct: 55,  dot:"bg-amber-400"  };
  if (c.includes("rendah"))
    return { pill:"bg-lime-100 text-lime-700 border-lime-200",    bar:"bg-lime-500",   pct: 30,  dot:"bg-lime-500"   };
  return   { pill:"bg-emerald-100 text-emerald-700 border-emerald-200", bar:"bg-emerald-500", pct: 12, dot:"bg-emerald-500" };
};

const windStyle = (max: number) => {
  if (max >= 35) return { label:"Sangat Kencang", color:"text-red-600",   bar:"bg-red-500",    pct: 100 };
  if (max >= 22) return { label:"Kencang",        color:"text-orange-600",bar:"bg-orange-400", pct: 70  };
  if (max >= 12) return { label:"Sedang",         color:"text-amber-600", bar:"bg-amber-400",  pct: 45  };
  return               { label:"Lemah",          color:"text-emerald-600",bar:"bg-emerald-500",pct: 20  };
};

export default function WeatherDetail() {
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/detail/detail-cuaca")
      .then(r => r.json())
      .then(d => { setWeatherData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const nowMs   = useMemo(() => Date.now(), []);
  const list    = weatherData?.data || [];

  const todayWib = useMemo(() => {
    const d = new Date(nowMs + 7*3600*1000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
  }, [nowMs]);

  const activeItem = useMemo(() =>
    list.find(it => {
      const f = parseUtcMs(it.valid_from), t = parseUtcMs(it.valid_to);
      return f !== null && t !== null && nowMs >= f && nowMs <= t;
    }) ?? list[0] ?? null,
  [list, nowMs]);

  const dateTabs = useMemo(() => {
    const map = new Map<string, { key:string; day:string; date:string; badge:string }>();
    list.forEach(it => {
      const d   = parseUtcToWib(it.valid_from);
      const key = toDateKey(it.valid_from);
      if (!d || map.has(key)) return;
      const [ty,tm,td] = todayWib.split("-").map(Number);
      const diff = Math.round((Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()) - Date.UTC(ty,tm-1,td)) / 86400000);
      const badge = diff===0?"Hari ini":diff===1?"Besok":diff===2?"Lusa":"";
      map.set(key, { key, day:daysLong[d.getUTCDay()], date:`${d.getUTCDate()} ${monthsLong[d.getUTCMonth()]}`, badge });
    });
    return Array.from(map.values());
  }, [list, todayWib]);

  useEffect(() => {
    if (!dateTabs.length || selectedDateKey) return;
    const today = dateTabs.find(t => t.key === todayWib);
    const active = activeItem ? dateTabs.find(t => t.key === toDateKey(activeItem.valid_from)) : null;
    setSelectedDateKey(today?.key ?? active?.key ?? dateTabs[0].key);
  }, [dateTabs, selectedDateKey, todayWib, activeItem]);

  const filtered = selectedDateKey ? list.filter(it => toDateKey(it.valid_from) === selectedDateKey) : list;
  const hero = filtered[0] || list[0];

  if (loading) return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm text-slate-500">Memuat data cuaca perairan...</p>
      </div>
    </div>
  );

  if (error || !weatherData) return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="rounded-2xl border border-red-100 bg-red-50 px-8 py-10 text-center">
        <p className="text-3xl">⚠️</p>
        <p className="mt-2 font-semibold text-red-700">Gagal memuat data cuaca</p>
        <p className="mt-1 text-sm text-red-500">Periksa koneksi server atau coba lagi</p>
      </div>
    </div>
  );

  if (!list.length) return (
    <div className="flex min-h-[400px] items-center justify-center">
      <p className="text-slate-500">Tidak ada data cuaca tersedia</p>
    </div>
  );

  return (
    <section className="bg-slate-50 pb-16 pt-4">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* BREADCRUMB */}
        <div className="mb-5 flex items-center gap-2 text-xs text-slate-400">
          <span>Beranda</span><span>/</span>
          <span>Cuaca Laut</span><span>/</span>
          <span className="font-semibold text-blue-600">Detail Prakiraan</span>
        </div>

        {/* HERO BANNER */}
        <div className="relative mb-8 overflow-hidden rounded-3xl shadow-2xl"
          style={{
            backgroundImage:"linear-gradient(135deg,rgba(15,40,120,0.90) 0%,rgba(29,78,216,0.82) 50%,rgba(6,95,170,0.88) 100%),url('/images/uleelheue-bg2.png')",
            backgroundPosition:"center", backgroundSize:"cover",
          }}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-blue-300/10 blur-2xl" />

          <div className="relative p-6 md:p-8 text-white">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
              <span>⚓</span> BMKG · Prakiraan Cuaca Perairan
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">{weatherData.name}</h1>
            <p className="mt-1 text-sm text-blue-200">Diterbitkan: {fmtIssued(weatherData.issued)}</p>

            {hero && (
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {/* Cuaca */}
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Cuaca Saat Ini</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-4xl leading-none">{weatherIcon(hero.weather)}</span>
                    <p className="text-sm font-bold leading-tight">{hero.weather}</p>
                  </div>
                </div>

                {/* Angin */}
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Angin</p>
                  <div className="mt-2 flex items-center gap-3">
                    {/* Arrow arah angin */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"
                        style={{ transform: `rotate(${windDeg(hero.wind_from)}deg)` }}>
                        <path d="M12 2L7 14h3v8h4v-8h3L12 2z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-base font-extrabold">{hero.wind_speed_max} <span className="text-xs font-normal text-blue-200">kt</span></p>
                      <p className="text-[10px] text-blue-200">{hero.wind_from}</p>
                    </div>
                  </div>
                  <p className="mt-1.5 text-[10px] text-blue-200">{hero.wind_speed_min}–{hero.wind_speed_max} kt</p>
                </div>

                {/* Gelombang */}
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Gelombang</p>
                  <p className="mt-2 text-base font-extrabold">{hero.wave_desc}</p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold">
                    <span className={`h-1.5 w-1.5 rounded-full ${waveStyle(hero.wave_cat).dot}`}/>
                    {hero.wave_cat || "-"}
                  </span>
                </div>

                {/* Peringatan */}
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Status</p>
                  {hero.warning_desc && hero.warning_desc !== "NIL" ? (
                    <>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        <p className="text-xs font-bold text-yellow-200">{hero.warning_desc}</p>
                      </div>
                    </>
                  ) : (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      <p className="text-sm font-bold text-emerald-300">Kondisi Aman</p>
                    </div>
                  )}
                  <p className="mt-2 text-[10px] text-blue-200">Sumber: BMKG Maritim</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DAY TABS */}
        <div className="mb-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Pilih Hari</p>
          <div className="flex flex-wrap gap-2">
            {dateTabs.map(tab => {
              const isSelected = selectedDateKey === tab.key;
              const isToday    = tab.key === todayWib;
              return (
                <button key={tab.key} onClick={() => setSelectedDateKey(tab.key)}
                  className={`relative flex min-w-[110px] flex-col items-center rounded-2xl border px-4 py-3 text-center transition-all duration-150 ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                  }`}>
                  {tab.badge && (
                    <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      isSelected ? "bg-white text-blue-600" : isToday ? "bg-blue-600 text-white" : "bg-slate-500 text-white"
                    }`}>{tab.badge}</span>
                  )}
                  <span className={`text-xs font-bold ${tab.badge ? "mt-1" : ""}`}>{tab.day}</span>
                  <span className="text-xs opacity-75">{tab.date}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FORECAST CARDS — gaya BMKG */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {filtered.map((item, i) => {
            const fromMs   = parseUtcMs(item.valid_from);
            const toMs     = parseUtcMs(item.valid_to);
            const isActive = fromMs !== null && toMs !== null && nowMs >= fromMs && nowMs <= toMs;
            const period   = periodLabel(item.valid_from);
            const wave     = waveStyle(item.wave_cat);
            const wind     = windStyle(item.wind_speed_max);
            const hasWarn  = !!(item.warning_desc && item.warning_desc !== "NIL");

            return (
              <div key={`${item.valid_from}-${i}`}
                className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 ${
                  isActive ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-200 hover:shadow-md hover:border-blue-200"
                }`}>

                {/* Side accent bar */}
                <div className={`absolute left-0 top-0 h-full w-1.5 ${isActive ? "bg-emerald-500" : hasWarn ? "bg-amber-400" : "bg-blue-400"}`} />

                {/* Header periode */}
                <div className={`flex items-center justify-between px-5 py-3 ${period.bg} border-b border-slate-100`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{period.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-600">{period.label}</p>
                      <p className="text-[10px] text-slate-400">
                        {fmtTime(item.valid_from)} – {fmtTime(item.valid_to)} WIB · {fmtDate(item.valid_from)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />Sekarang
                      </span>
                    )}
                    {hasWarn && (
                      <span className="rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">⚠️ {item.warning_desc}</span>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4">
                  {/* Cuaca */}
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-5xl leading-none">{weatherIcon(item.weather)}</span>
                    <div>
                      <p className="text-base font-extrabold text-slate-800">{item.weather}</p>
                      {item.weather_desc && item.weather_desc !== item.weather && (
                        <p className="text-xs text-slate-400 mt-0.5">{item.weather_desc}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Angin */}
                    <div className="rounded-xl bg-sky-50 border border-sky-100 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-sky-500 mb-2">💨 Angin</p>

                      {/* Arah angin visual */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-sky-200 shadow-sm">
                          {/* Compass ticks */}
                          {["N","E","S","W"].map((dir, idx) => (
                            <span key={dir} className="absolute text-[7px] font-bold text-slate-300"
                              style={{ top: idx===0?"2px":idx===2?"auto":undefined, bottom: idx===2?"2px":undefined,
                                       left: idx===3?"2px":idx===1?"auto":undefined, right: idx===1?"2px":undefined,
                                       transform: idx===0||idx===2?"translateX(-50%)":"translateY(-50%)" }}>
                              {dir}
                            </span>
                          ))}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#0ea5e9"
                            style={{ transform: `rotate(${windDeg(item.wind_from)}deg)` }}>
                            <path d="M12 2L7 14h3v8h4v-8h3L12 2z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-700">{item.wind_speed_max} <span className="text-xs font-normal text-slate-400">kt</span></p>
                          <p className="text-[10px] text-slate-500">{item.wind_from}</p>
                        </div>
                      </div>

                      {/* Wind bar */}
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${wind.bar} transition-all`} style={{ width: `${wind.pct}%` }} />
                      </div>
                      <p className={`mt-1 text-[10px] font-semibold ${wind.color}`}>{wind.label} · {item.wind_speed_min}–{item.wind_speed_max} kt</p>
                    </div>

                    {/* Gelombang */}
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-2">🌊 Gelombang</p>
                      <p className="text-sm font-extrabold text-slate-700 leading-tight">{item.wave_desc}</p>

                      {/* Wave bar */}
                      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${wave.bar} transition-all`} style={{ width: `${wave.pct}%` }} />
                      </div>

                      <div className="mt-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${wave.pill}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${wave.dot}`} />
                          {item.wave_cat || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arah angin lengkap */}
                  {item.wind_to && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>🧭</span>
                      <span>Arah angin:</span>
                      <span className="font-semibold text-slate-700">{item.wind_from} → {item.wind_to}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <span className="mt-0.5 text-base shrink-0">ℹ️</span>
          <p className="text-xs leading-relaxed text-slate-500">
            Data prakiraan cuaca maritim bersumber dari{" "}
            <span className="font-semibold text-slate-700">BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)</span>.
            Prakiraan bersifat estimasi dan dapat berubah sesuai kondisi atmosfer terkini.
            {weatherData.info && <span className="ml-1 italic">{weatherData.info}</span>}
          </p>
        </div>

      </div>
    </section>
  );
}
