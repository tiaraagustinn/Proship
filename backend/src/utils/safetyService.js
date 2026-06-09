import { hitungKeselamatan } from "./fuzzySafety.js";

const BMKG_URL = "https://maritim.bmkg.go.id/marine2026-data/perairan/P.A.04.json";
let _cache = null, _cacheTime = 0;

async function fetchBMKG() {
  if (_cache && Date.now() - _cacheTime < 30 * 60 * 1000) return _cache;
  const res = await fetch(BMKG_URL);
  if (!res.ok) throw new Error("Gagal mengambil data BMKG");
  const data = await res.json();
  const all = [...(data.forecast_day1 || []), ...(data["forecast_day2-4"] || [])];
  _cache = all; _cacheTime = Date.now();
  return all;
}

function cariDataTerdekat(forecasts, jadwalDate, jadwalTime) {
  const [hh, mm] = jadwalTime.split(":").map(Number);
  const jadwalUTC = new Date(`${jadwalDate}T${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}:00+07:00`);
  return forecasts.reduce((best, item) => {
    const t = new Date(item.time.replace(" UTC", "Z"));
    return Math.abs(t - jadwalUTC) < Math.abs(new Date(best.time.replace(" UTC","Z")) - jadwalUTC)
      ? item : best;
  });
}

export async function hitungKeselamatanJadwal(jadwal) {
  const forecasts = await fetchBMKG();
  const fc = cariDataTerdekat(forecasts, jadwal.tanggal, jadwal.waktu);

  const hasil = hitungKeselamatan({
    wave_height:   fc.wave_height,   // meter
    wind_speed:    fc.wind_speed,    // km/j → dikonversi di dalam fuzzySafety
    current_speed: fc.current_speed, // knot → dikonversi di dalam fuzzySafety
  });

  return {
    jadwal,
    cuaca: {
      waktu:         fc.time,
      cuaca:         fc.weather,
      wave_height:   fc.wave_height,          // m
      wind_kmj:      fc.wind_speed,           // km/j (asli BMKG)
      wind_knot:     hasil.input.wind_knot,   // knot (setelah konversi)
      current_knot:  fc.current_speed,        // knot (asli BMKG)
      current_cms:   hasil.input.current_cms, // cm/s (setelah konversi)
    },
    hasil,
  };
}

export async function hitungSemuaJadwal(daftarJadwal) {
  return Promise.all(daftarJadwal.map(j => hitungKeselamatanJadwal(j)));
}