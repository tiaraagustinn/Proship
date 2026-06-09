import db from '../config/db.js';
import { evalMamdani } from '../utils/fuzzyMamdani.js';
import { getBmkgEntryForTime } from './bmkgCacheService.js';

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

// Koordinat tengah perairan Sabang - Banda Aceh
const LON = 95.32000000;
const LAT = 5.71000000;

function mapKondisi(weatherStr) {
  const w = (weatherStr || '').toLowerCase();
  if (w.includes('cerah berawan')) return 'cerah berawan';
  if (w.includes('cerah'))        return 'cerah';
  return 'berawan';
}

/**
 * Buat record cuaca dari data BMKG, disesuaikan dengan jam jadwal.
 * Mencari prakiraan yang paling dekat dengan waktu keberangkatan.
 *
 * @param {string} tanggal - Format 'YYYY-MM-DD'
 * @param {string} jam     - Format 'HH:MM' atau 'HH:MM:SS'
 */
async function createCuacaFromBMKG(tanggal, jam) {
  // Cari entry forecast BMKG terdekat dengan jam jadwal
  const entry = await getBmkgEntryForTime('sabang-bandaAceh', tanggal, jam);
  if (!entry) return null;

  // Baca field dari API BMKG baru:
  // wave_height   → meter (m)
  // wind_speed    → knot (kt)
  // current_speed → KM/H (km/j) → dikonversi ke cm/s (1 km/h = 27.7778 cm/s)
  const waveM   = parseFloat(entry.wave_height)   || 0;
  const windKt  = parseFloat(entry.wind_speed)     || 0;
  const currCms = (parseFloat(entry.current_speed) || 0) * 27.7778; // km/h → cm/s

  // Jalankan fuzzy Mamdani: satuan (m, knot, cm/s)
  const fuzzy = evalMamdani(waveM, windKt, currCms);

  // Simpan ke DB dengan konversi ke satuan kecil agar muat kolom decimal(3,2)
  const kecAngin = Math.min(parseFloat((windKt  * 0.514).toFixed(2)), 9.99);
  const kecArus  = Math.min(parseFloat((currCms / 100  ).toFixed(2)), 9.99);
  const tinggi   = Math.min(parseFloat(waveM.toFixed(2)),             9.99);

  // Metadata kondisi cuaca dari entry
  const cuacaStr   = entry.weather || entry.weather_desc || '';
  const arahAngin  = entry.wind_from || null;
  const gelDesc    = entry.wave_cat
    ? `Gelombang ${entry.wave_cat}`
    : null;
  const kondisiDet = cuacaStr || null;
  const peringatan = entry.warning_desc || null;

  const result = await query(
    `INSERT INTO cuaca_laut
       (kec_angin, kec_arus, tinggi_gelombang, longitude, latitude, timestamp, kondisi_cuaca, tingkat_keselamatan,
        input_gelombang, input_angin, input_arus, skor_fuzzy, kondisi_detail, peringatan, arah_angin, gelombang_desc)
     VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [kecAngin, kecArus, tinggi, LON, LAT,
     mapKondisi(cuacaStr), fuzzy.category.toLowerCase(),
     waveM, windKt, currCms, fuzzy.score,
     kondisiDet, peringatan, arahAngin, gelDesc]
  );
  return result.insertId;
}

export const getAllJadwal = (tanggal) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT
        j.id_jadwal,
        j.id_rute,
        j.id_kapal,
        j.tanggal,
        j.waktu_berangkat  AS jam,
        j.status_jadwal,
        pa.nama_pelabuhan  AS asal,
        pt.nama_pelabuhan  AS tujuan,
        k.nama_kapal       AS armada,
        c.tingkat_keselamatan
      FROM jadwal_pelayaran j
      JOIN kapal k            ON j.id_kapal  = k.id_kapal
      JOIN rute_pelayaran r   ON j.id_rute   = r.id_rute
      JOIN pelabuhan pa       ON r.id_pelabuhan_asal    = pa.id_pelabuhan
      JOIN pelabuhan pt       ON r.id_pelabuhan_tujuan  = pt.id_pelabuhan
      LEFT JOIN cuaca_laut c  ON j.id_cuaca  = c.id_cuaca
    `;

    const params = [];
    if (tanggal) {
      sql += ` WHERE j.tanggal = ?`;
      params.push(tanggal);
    }
    sql += ` ORDER BY j.tanggal DESC, j.waktu_berangkat ASC`;

    db.query(sql, params, (err, results) => {
      if (err) { console.error('SQL ERROR:', err); reject(err); }
      else resolve(results);
    });
  });
};

export const createJadwal = async (id_rute, id_kapal, tanggal, jam, id_petugas = null, status_jadwal = 'terjadwal') => {
  // Auto-buat cuaca dari BMKG untuk jam jadwal ini, gagal pun jadwal tetap tersimpan (id_cuaca = null)
  const id_cuaca = await createCuacaFromBMKG(tanggal, jam).catch(err => {
    console.warn('Gagal buat cuaca otomatis:', err.message);
    return null;
  });

  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO jadwal_pelayaran (id_rute, id_kapal, tanggal, waktu_berangkat, id_petugas, status_jadwal, id_cuaca)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [id_rute, id_kapal, tanggal, jam, id_petugas, status_jadwal, id_cuaca], (err, result) => {
      if (err) { console.error('SQL ERROR:', err); reject(err); }
      else resolve(result.insertId);
    });
  });
};

export const updateJadwal = (id_jadwal, id_rute, id_kapal, tanggal, jam, status_jadwal = 'terjadwal') => {
  const tanggalBersih = String(tanggal).substring(0, 10);
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE jadwal_pelayaran
      SET id_rute = ?, id_kapal = ?, tanggal = ?, waktu_berangkat = ?, status_jadwal = ?
      WHERE id_jadwal = ?
    `;
    db.query(sql, [id_rute, id_kapal, tanggalBersih, jam, status_jadwal, id_jadwal], (err, result) => {
      if (err) { console.error('SQL ERROR:', err); reject(err); }
      else resolve(result.affectedRows);
    });
  });
};

export const deleteJadwal = (id_jadwal) => {
  return new Promise((resolve, reject) => {
    db.query(`DELETE FROM jadwal_pelayaran WHERE id_jadwal = ?`, [id_jadwal], (err, result) => {
      if (err) { console.error('SQL ERROR:', err); reject(err); }
      else resolve(result.affectedRows);
    });
  });
};

export const getJadwalDetail = async (id_jadwal) => {
  const rows = await query(
    `SELECT
       j.id_jadwal, j.tanggal, j.waktu_berangkat AS jam, j.status_jadwal,
       pa.nama_pelabuhan AS asal, pt.nama_pelabuhan AS tujuan,
       k.nama_kapal AS armada,
       c.tingkat_keselamatan, c.kondisi_cuaca,
       c.input_gelombang, c.input_angin, c.input_arus, c.skor_fuzzy,
       c.kondisi_detail, c.peringatan, c.arah_angin, c.gelombang_desc,
       c.kec_angin, c.kec_arus, c.tinggi_gelombang, c.timestamp AS waktu_cuaca
     FROM jadwal_pelayaran j
     JOIN kapal k          ON j.id_kapal = k.id_kapal
     JOIN rute_pelayaran r ON j.id_rute  = r.id_rute
     JOIN pelabuhan pa     ON r.id_pelabuhan_asal   = pa.id_pelabuhan
     JOIN pelabuhan pt     ON r.id_pelabuhan_tujuan = pt.id_pelabuhan
     LEFT JOIN cuaca_laut c ON j.id_cuaca = c.id_cuaca
     WHERE j.id_jadwal = ?`,
    [id_jadwal]
  );
  if (!rows.length) return null;

  const row = rows[0];
  let ruleDetails = [];

  // Tentukan input fuzzy: pakai yang tersimpan, atau hitung balik dari kec jika belum ada
  let wave  = parseFloat(row.input_gelombang) || 0;
  let wind  = parseFloat(row.input_angin)     || 0;
  let curr  = parseFloat(row.input_arus)      || 0;
  const storedScore = parseFloat(row.skor_fuzzy);
  let score = Number.isFinite(storedScore) && storedScore > 0 ? storedScore : null;
  let isEstimasi = false;

  const hasStoredInputs = wind > 0 || wave > 0 || curr > 0;
  if (!hasStoredInputs && row.kec_angin != null) {
    // Jadwal lama: hitung balik dari kec yang tersimpan (m/s → satuan BMKG)
    wave = parseFloat(row.tinggi_gelombang) || 0;
    wind = parseFloat(row.kec_angin) / 0.514;  // m/s → knot
    curr = (parseFloat(row.kec_arus) || 0) * 100; // m/s → cm/s
    isEstimasi = true;
    // Score tidak bisa dihitung akurat dari nilai yang sudah dikonversi, tampilkan null
    score = null;
  }

  if (!isEstimasi) {
    // Jadwal baru dengan data lengkap — hitung rule details
    try {
      const fuzzy = evalMamdani(wave, wind, curr);
      ruleDetails = fuzzy.ruleDetails;
      if (!score) score = fuzzy.score;
    } catch (_) {}
  }

  return {
    ...row,
    input_gelombang: wave,
    input_angin: parseFloat(wind.toFixed(1)),
    input_arus: parseFloat(curr.toFixed(1)),
    skor_fuzzy: score,
    isEstimasi,
    ruleDetails,
  };
};
