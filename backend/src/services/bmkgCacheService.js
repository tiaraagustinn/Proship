import axios from 'axios';
import db from '../config/db.js';

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

const SOURCES = [
  {
    lokasi: 'sabang-bandaAceh',
    url: 'https://peta-maritim.bmkg.go.id/public_api/perairan/A.03_Perairan%20Sabang%20-%20Banda%20Aceh.json',
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
