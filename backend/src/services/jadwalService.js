import db from '../config/db.js';
import { evalMamdani } from '../utils/fuzzyMamdani.js';

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

async function createCuacaFromBMKG() {
  // Ambil cache BMKG terbaru
  const rows = await query(
    `SELECT data FROM bmkg_cache WHERE lokasi = 'sabang-bandaAceh' ORDER BY fetched_at DESC LIMIT 1`
  );
  if (!rows.length) return null;

  const bmkgData = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
  const entry = bmkgData?.data?.[0];
  if (!entry) return null;

  const waveM   = parseFloat(entry.wave_max)         || 0; // meter
  const windKt  = parseFloat(entry.wind_speed_max)   || 0; // knot
  const currCms = parseFloat(entry.current_speed_max)|| 0; // cm/s

  // Fuzzy pakai satuan asli BMKG (meter, knot, cm/s)
  const fuzzy = evalMamdani(waveM, windKt, currCms, { step: 0.5 });

  // Simpan ke DB dengan konversi ke satuan kecil agar muat decimal(3,2)
  // kec_angin: knot → m/s (max ~9.99 = ~19 knot, cukup untuk kondisi normal)
  // kec_arus : cm/s → m/s
  const kecAngin = Math.min(parseFloat((windKt  * 0.514).toFixed(2)), 9.99);
  const kecArus  = Math.min(parseFloat((currCms / 100  ).toFixed(2)), 9.99);
  const tinggi   = Math.min(parseFloat(waveM.toFixed(2)),             9.99);

  const result = await query(
    `INSERT INTO cuaca_laut
       (kec_angin, kec_arus, tinggi_gelombang, longitude, latitude, timestamp, kondisi_cuaca, tingkat_keselamatan)
     VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`,
    [kecAngin, kecArus, tinggi, LON, LAT, mapKondisi(entry.weather), fuzzy.category]
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
  // Auto-buat cuaca dari BMKG, gagal pun jadwal tetap tersimpan (id_cuaca = null)
  const id_cuaca = await createCuacaFromBMKG().catch(err => {
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
