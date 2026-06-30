import db from '../config/db.js';

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

// GET /api/manifes
export const getManifes = async (req, res) => {
  try {
    const sql = `
      SELECT
        id,
        timestamp,
        jenis_kapal,
        nama_kapal,
        trip_kapal,
        pelabuhan_asal,
        tujuan,
        jumlah_penumpang,
        kendaraan_gol_2    AS kendaraanRoda2,
        kendaraan_gol_4    AS kendaraanRoda4,
        jumlah_barang_ton  AS beratMuatan,
        kapasitas_kapal,
        load_factor_persen AS load_factor
      FROM manifes_angkutan
      ORDER BY timestamp DESC
    `;
    const data = await query(sql);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Gagal ambil data manifes', message: err.message });
  }
};

// POST /api/manifes
export const createManifes = async (req, res) => {
  const {
    timestamp, jenis_kapal, nama_kapal, trip_kapal,
    pelabuhan_asal, tujuan, jumlah_penumpang,
    kendaraan_gol_2, kendaraan_gol_4, jumlah_barang_ton,
    kapasitas_kapal, load_factor_persen
  } = req.body;

  if (!timestamp || !nama_kapal || !pelabuhan_asal || !tujuan || jumlah_penumpang == null) {
    return res.status(400).json({ message: 'Field wajib belum lengkap' });
  }
  try {
    const result = await query(
      `INSERT INTO manifes_angkutan
        (timestamp, jenis_kapal, nama_kapal, trip_kapal,
         pelabuhan_asal, tujuan, jumlah_penumpang,
         kendaraan_gol_2, kendaraan_gol_4, jumlah_barang_ton,
         kapasitas_kapal, load_factor_persen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        timestamp, jenis_kapal, nama_kapal, trip_kapal || 1,
        pelabuhan_asal, tujuan, jumlah_penumpang,
        kendaraan_gol_2 || 0, kendaraan_gol_4 || 0, jumlah_barang_ton || 0,
        kapasitas_kapal || 0, load_factor_persen || 0
      ]
    );
    res.status(201).json({ success: true, message: 'Data berhasil disimpan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Gagal simpan data', message: err.message });
  }
};

// PUT /api/manifes/:id
export const updateManifes = async (req, res) => {
  const { id } = req.params;
  const {
    timestamp, jenis_kapal, nama_kapal, trip_kapal,
    pelabuhan_asal, tujuan, jumlah_penumpang,
    kendaraan_gol_2, kendaraan_gol_4, jumlah_barang_ton,
    kapasitas_kapal, load_factor_persen
  } = req.body;

  try {
    await query(
      `UPDATE manifes_angkutan SET
        timestamp=?, jenis_kapal=?, nama_kapal=?, trip_kapal=?,
        pelabuhan_asal=?, tujuan=?, jumlah_penumpang=?,
        kendaraan_gol_2=?, kendaraan_gol_4=?, jumlah_barang_ton=?,
        kapasitas_kapal=?, load_factor_persen=?
       WHERE id=?`,
      [
        timestamp, jenis_kapal, nama_kapal, trip_kapal,
        pelabuhan_asal, tujuan, jumlah_penumpang,
        kendaraan_gol_2, kendaraan_gol_4, jumlah_barang_ton,
        kapasitas_kapal, load_factor_persen, id
      ]
    );
    res.json({ success: true, message: 'Data berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal update data', message: err.message });
  }
};

// DELETE /api/manifes/:id
export const deleteManifes = async (req, res) => {
  const { id } = req.params;
  try {
    await query(`DELETE FROM manifes_angkutan WHERE id=?`, [id]);
    res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal hapus data', message: err.message });
  }
};

// GET /api/manifes/dashboard
export const getDashboard = async (req, res) => {
  try {
    const { from, to } = req.query;

    let whereClause = '';
    let params = [];
    if (from && to) {
      whereClause = `WHERE DATE(timestamp) BETWEEN ? AND ?`;
      params = [from, to];
    } else if (from) {
      whereClause = `WHERE DATE(timestamp) >= ?`;
      params = [from];
    } else if (to) {
      whereClause = `WHERE DATE(timestamp) <= ?`;
      params = [to];
    }

    const baseFrom = `FROM manifes_angkutan ${whereClause}`;

    const [summary, byArah, kapalMonthly, trend] = await Promise.all([

      // Ringkasan total
      query(
        `SELECT
          COALESCE(SUM(jumlah_penumpang), 0)  AS total_penumpang,
          COALESCE(SUM(kendaraan_gol_2), 0)   AS total_kend_r2,
          COALESCE(SUM(kendaraan_gol_4), 0)   AS total_kend_r4,
          COALESCE(SUM(jumlah_barang_ton), 0) AS total_muatan,
          COUNT(*) AS total_trip
        ${baseFrom}`,
        params
      ),

      // Per arah — normalisasi alias nama pelabuhan sebelum GROUP BY
      // Sabang = Balohan, Banda Aceh = Ulee Lheue
      query(
        `SELECT
          CASE UPPER(TRIM(pelabuhan_asal))
            WHEN 'SABANG'      THEN 'BALOHAN'
            WHEN 'BANDA ACEH'  THEN 'ULEE LHEUE'
            ELSE UPPER(TRIM(pelabuhan_asal))
          END AS asal,
          CASE UPPER(TRIM(tujuan))
            WHEN 'SABANG'      THEN 'BALOHAN'
            WHEN 'BANDA ACEH'  THEN 'ULEE LHEUE'
            ELSE UPPER(TRIM(tujuan))
          END AS tujuan,
          COALESCE(SUM(jumlah_penumpang), 0)  AS penumpang,
          COALESCE(SUM(kendaraan_gol_2), 0)   AS kend_r2,
          COALESCE(SUM(kendaraan_gol_4), 0)   AS kend_r4,
          COALESCE(SUM(jumlah_barang_ton), 0) AS muatan,
          COUNT(*) AS total_trip
        ${baseFrom}
        GROUP BY
          CASE UPPER(TRIM(pelabuhan_asal))
            WHEN 'SABANG'      THEN 'BALOHAN'
            WHEN 'BANDA ACEH'  THEN 'ULEE LHEUE'
            ELSE UPPER(TRIM(pelabuhan_asal))
          END,
          CASE UPPER(TRIM(tujuan))
            WHEN 'SABANG'      THEN 'BALOHAN'
            WHEN 'BANDA ACEH'  THEN 'ULEE LHEUE'
            ELSE UPPER(TRIM(tujuan))
          END`,
        params
      ),

      // Per kapal per bulan
      query(
        `SELECT
          nama_kapal,
          DATE_FORMAT(timestamp, '%b %Y') AS bulan,
          DATE_FORMAT(timestamp, '%Y-%m') AS sort_key,
          COALESCE(SUM(jumlah_penumpang), 0) AS penumpang
        ${baseFrom}
        GROUP BY nama_kapal, bulan, sort_key
        ORDER BY sort_key ASC, nama_kapal`,
        params
      ),

      // Tren bulanan
      query(
        `SELECT
          DATE_FORMAT(timestamp, '%b %Y') AS bulan,
          DATE_FORMAT(timestamp, '%Y-%m') AS sort_key,
          COALESCE(SUM(jumlah_penumpang), 0)  AS penumpang,
          COALESCE(SUM(kendaraan_gol_2), 0)   AS kend_r2,
          COALESCE(SUM(kendaraan_gol_4), 0)   AS kend_r4
        ${baseFrom}
        GROUP BY bulan, sort_key
        ORDER BY sort_key ASC`,
        params
      ),
    ]);

    // Transform kapalMonthly → format recharts grouped bar
    const bulanMap = {};
    const kapalSet = new Set();
    for (const row of kapalMonthly) {
      kapalSet.add(row.nama_kapal);
      if (!bulanMap[row.sort_key]) {
        bulanMap[row.sort_key] = { bulan: row.bulan, sort_key: row.sort_key };
      }
      bulanMap[row.sort_key][row.nama_kapal] = Number(row.penumpang);
    }
    const kapalBulan = Object.values(bulanMap).sort((a, b) =>
      String(a.sort_key).localeCompare(String(b.sort_key))
    );
    const kapalList = Array.from(kapalSet);

    res.json({
      success: true,
      summary: summary[0],
      by_rute: byArah,
      kapal_bulan: kapalBulan,
      kapal_list: kapalList,
      trend,
    });
  } catch (err) {
    console.error('DASHBOARD ERROR:', err);
    res.status(500).json({ error: 'Gagal ambil data dashboard', message: err.message });
  }
};