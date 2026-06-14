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
        timestamp_keberangkatan,
        jenis_kapal,
        nama_kapal,
        trip_kapal,
        pelabuhan_asal,
        tujuan,
        jumlah_penumpang,
        kendaraan_gol_II   AS kendaraanRoda2,
        kendaraan_gol_IV   AS kendaraanRoda4,
        jumlah_barang_ton  AS beratMuatan,
        kapasitas_kapal,
        load_factor
      FROM manifes_angkutan
      ORDER BY timestamp_keberangkatan DESC
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
    timestamp_keberangkatan, jenis_kapal, nama_kapal, trip_kapal,
    pelabuhan_asal, tujuan, jumlah_penumpang,
    kendaraan_gol_II, kendaraan_gol_IV, jumlah_barang_ton,
    kapasitas_kapal, load_factor
  } = req.body;

  if (!timestamp_keberangkatan || !nama_kapal || !pelabuhan_asal || !tujuan || jumlah_penumpang == null) {
    return res.status(400).json({ message: 'Field wajib belum lengkap' });
  }
  try {
    const result = await query(
      `INSERT INTO manifes_angkutan
        (timestamp_keberangkatan, jenis_kapal, nama_kapal, trip_kapal,
         pelabuhan_asal, tujuan, jumlah_penumpang,
         kendaraan_gol_II, kendaraan_gol_IV, jumlah_barang_ton,
         kapasitas_kapal, load_factor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        timestamp_keberangkatan, jenis_kapal, nama_kapal, trip_kapal || 1,
        pelabuhan_asal, tujuan, jumlah_penumpang,
        kendaraan_gol_II || 0, kendaraan_gol_IV || 0, jumlah_barang_ton || 0,
        kapasitas_kapal || 0, load_factor || 0
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
    timestamp_keberangkatan, jenis_kapal, nama_kapal, trip_kapal,
    pelabuhan_asal, tujuan, jumlah_penumpang,
    kendaraan_gol_II, kendaraan_gol_IV, jumlah_barang_ton,
    kapasitas_kapal, load_factor
  } = req.body;

  try {
    await query(
      `UPDATE manifes_angkutan SET
        timestamp_keberangkatan=?, jenis_kapal=?, nama_kapal=?, trip_kapal=?,
        pelabuhan_asal=?, tujuan=?, jumlah_penumpang=?,
        kendaraan_gol_II=?, kendaraan_gol_IV=?, jumlah_barang_ton=?,
        kapasitas_kapal=?, load_factor=?
       WHERE id=?`,
      [
        timestamp_keberangkatan, jenis_kapal, nama_kapal, trip_kapal,
        pelabuhan_asal, tujuan, jumlah_penumpang,
        kendaraan_gol_II, kendaraan_gol_IV, jumlah_barang_ton,
        kapasitas_kapal, load_factor, id
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
      whereClause = `WHERE DATE(timestamp_keberangkatan) BETWEEN ? AND ?`;
      params = [from, to];
    } else if (from) {
      whereClause = `WHERE DATE(timestamp_keberangkatan) >= ?`;
      params = [from];
    } else if (to) {
      whereClause = `WHERE DATE(timestamp_keberangkatan) <= ?`;
      params = [to];
    }

    const baseFrom = `FROM manifes_angkutan ${whereClause}`;

    const [summary, byArah, kapalMonthly, trend] = await Promise.all([

      // Ringkasan total
      query(
        `SELECT
          COALESCE(SUM(jumlah_penumpang), 0)  AS total_penumpang,
          COALESCE(SUM(kendaraan_gol_II), 0)  AS total_kend_r2,
          COALESCE(SUM(kendaraan_gol_IV), 0)  AS total_kend_r4,
          COALESCE(SUM(jumlah_barang_ton), 0) AS total_muatan,
          COUNT(*) AS total_trip
        ${baseFrom}`,
        params
      ),

      // Per arah (Ulee Lheue->Balohan vs Balohan->Ulee Lheue)
      query(
        `SELECT
          pelabuhan_asal AS asal,
          tujuan,
          COALESCE(SUM(jumlah_penumpang), 0)  AS penumpang,
          COALESCE(SUM(kendaraan_gol_II), 0)  AS kend_r2,
          COALESCE(SUM(kendaraan_gol_IV), 0)  AS kend_r4,
          COALESCE(SUM(jumlah_barang_ton), 0) AS muatan,
          COUNT(*) AS total_trip
        ${baseFrom}
        GROUP BY pelabuhan_asal, tujuan`,
        params
      ),

      // Per kapal per bulan (grouped bar chart)
      query(
        `SELECT
          nama_kapal,
          DATE_FORMAT(timestamp_keberangkatan, '%b %Y') AS bulan,
          DATE_FORMAT(timestamp_keberangkatan, '%Y-%m') AS sort_key,
          COALESCE(SUM(jumlah_penumpang), 0) AS penumpang
        ${baseFrom}
        GROUP BY nama_kapal, bulan, sort_key
        ORDER BY sort_key ASC, nama_kapal`,
        params
      ),

      // Tren bulanan (area chart)
      query(
        `SELECT
          DATE_FORMAT(timestamp_keberangkatan, '%b %Y') AS bulan,
          DATE_FORMAT(timestamp_keberangkatan, '%Y-%m') AS sort_key,
          COALESCE(SUM(jumlah_penumpang), 0)  AS penumpang,
          COALESCE(SUM(kendaraan_gol_II), 0)  AS kend_r2,
          COALESCE(SUM(kendaraan_gol_IV), 0)  AS kend_r4
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