import axios from 'axios';
import db from '../config/db.js';

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

const SOURCES = [
  {
    lokasi: 'sabang-bandaAceh',
    url: 'https://maritim.bmkg.go.id/marine2026-data/perairan/P.A.04.json',
  },
];

// Ambil cache terbaru dari DB untuk satu lokasi
export async function getCached(lokasi) {
  const rows = await query(
    `SELECT data, fetched_at FROM bmkg_cache
     WHERE lokasi = ?
     ORDER BY fetched_at DESC LIMIT 1`,
    [lokasi]
  );
  return rows[0] ?? null;
}

// Simpan data baru, hapus yang lebih dari 3 hari
async function saveCache(lokasi, data) {
  await query(
    `INSERT INTO bmkg_cache (lokasi, data) VALUES (?, ?)`,
    [lokasi, JSON.stringify(data)]
  );
  await query(
    `DELETE FROM bmkg_cache
     WHERE lokasi = ? AND fetched_at < DATE_SUB(NOW(), INTERVAL 3 DAY)`,
    [lokasi]
  );
}

// Fetch dari BMKG dan simpan ke cache. Kembalikan data atau null jika gagal.
export async function fetchAndCache(lokasi) {
  const source = SOURCES.find(s => s.lokasi === lokasi);
  if (!source) return null;

  try {
    console.log(`📡 Fetching BMKG [${lokasi}]...`);
    const res = await axios.get(source.url, { timeout: 10000 });
    await saveCache(lokasi, res.data);
    console.log(`✅ BMKG [${lokasi}] cached`);
    return res.data;
  } catch (err) {
    console.warn(`⚠️  BMKG [${lokasi}] gagal: ${err.message}`);
    return null;
  }
}

// Dipanggil saat server start & oleh cron — refresh semua lokasi
export async function refreshAll() {
  for (const s of SOURCES) {
    await fetchAndCache(s.lokasi);
  }
}

/**
 * Ambil entry forecast BMKG yang paling dekat dengan jam jadwal (WIB).
 *
 * Membaca langsung dari DB cache (tidak perlu fetch ulang).
 * Struktur API baru BMKG: { forecast_day1: [...], "forecast_day2-4": [...] }
 * Setiap entry memiliki field: time ("2026-06-09 07:00 UTC"), wave_height, wind_speed, current_speed
 *
 * @param {string} lokasi   - Contoh: 'sabang-bandaAceh'
 * @param {string} tanggal  - Format 'YYYY-MM-DD' (WIB)
 * @param {string} jam      - Format 'HH:MM' atau 'HH:MM:SS' (WIB, UTC+7)
 * @returns {object|null}   - Entry BMKG terdekat atau null
 */
export async function getBmkgEntryForTime(lokasi, tanggal, jam) {
  let cached = await getCached(lokasi);
  
  // Auto-refresh cache jika kosong atau lebih lama dari 30 menit
  const cacheAgeMs = cached ? Date.now() - new Date(cached.fetched_at) : Infinity;
  const THIRTY_MINUTES_MS = 30 * 60 * 1000;
  if (!cached || cacheAgeMs > THIRTY_MINUTES_MS) {
    console.log(`🔄 Cache BMKG untuk ${lokasi} sudah usang (${(cacheAgeMs / 60000).toFixed(1)} menit atau kosong), me-refresh...`);
    const refreshed = await fetchAndCache(lokasi);
    if (refreshed) {
      cached = { data: refreshed, fetched_at: new Date() };
    }
  }

  if (!cached) return null;

  const bmkgData = typeof cached.data === 'string'
    ? JSON.parse(cached.data)
    : cached.data;

  // Gabungkan forecast_day1 dan forecast_day2-4 (key dengan tanda hubung)
  const forecasts = [
    ...(bmkgData.forecast_day1 || []),
    ...(bmkgData['forecast_day2-4'] || []),
  ];
  if (!forecasts.length) return null;

  // Konversi waktu jadwal WIB ke UTC: jadwal WIB - 7 jam = UTC
  const jamStr = String(jam).substring(0, 5); // pastikan format HH:MM
  const jadwalWIB = new Date(`${tanggal}T${jamStr}:00+07:00`);

  // Cari entry terdekat berdasarkan selisih waktu
  let closestEntry = null;
  let closestDiff = Infinity;

  for (const entry of forecasts) {
    // Format time BMKG: "2026-06-09 07:00 UTC" → parse ke Date UTC
    const timeUtc = new Date(entry.time.replace(' UTC', 'Z'));
    const diff = Math.abs(timeUtc - jadwalWIB);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestEntry = entry;
    }
  }

  // Batasi selisih waktu maksimum 12 jam (mencegah pencocokan tanggal historis/jauh dengan cache)
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  if (closestDiff > TWELVE_HOURS_MS) {
    console.warn(`⚠️ Selisih waktu jadwal dengan data prakiraan terdekat terlalu jauh: ${(closestDiff / 3600000).toFixed(1)} jam`);
    return null;
  }

  return closestEntry;
}
