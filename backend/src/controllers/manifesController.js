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
      whereClause = `WHERE tanggal BETWEEN ? AND ?`;
      params = [from, to];
    } else if (from) {
      whereClause = `WHERE tanggal >= ?`;
      params = [from];
    } else if (to) {
      whereClause = `WHERE tanggal <= ?`;
      params = [to];
    }

    const cte = `
      WITH AllManifes AS (
        SELECT
          jumlah_penumpang,
          kendaraan_gol_II,
          kendaraan_gol_IV,
          jumlah_barang_ton,
          timestamp_keberangkatan,
          DATE(timestamp_keberangkatan) AS tanggal,
          pelabuhan_asal COLLATE utf8mb4_unicode_ci AS asal,
          tujuan COLLATE utf8mb4_unicode_ci AS tujuan,
          nama_kapal COLLATE utf8mb4_unicode_ci AS armada
        FROM manifes_angkutan
        
        UNION ALL
        
        SELECT
          h.jmlh_penumpang AS jumlah_penumpang,
          h.jmlh_kend_r2 AS kendaraan_gol_II,
          h.jmlh_kend_r4 AS kendaraan_gol_IV,
          h.berat_muatan AS jumlah_barang_ton,
          TIMESTAMP(j.tanggal, j.waktu_berangkat) AS timestamp_keberangkatan,
          j.tanggal AS tanggal,
          pa.nama_pelabuhan COLLATE utf8mb4_unicode_ci AS asal,
          pt.nama_pelabuhan COLLATE utf8mb4_unicode_ci AS tujuan,
          k.nama_kapal COLLATE utf8mb4_unicode_ci AS armada
        FROM historis_angkutan h
        JOIN jadwal_pelayaran j ON h.id_jadwal = j.id_jadwal
        LEFT JOIN rute_pelayaran r ON j.id_rute = r.id_rute
        LEFT JOIN pelabuhan pa ON r.id_pelabuhan_asal = pa.id_pelabuhan
        LEFT JOIN pelabuhan pt ON r.id_pelabuhan_tujuan = pt.id_pelabuhan
        LEFT JOIN kapal k ON j.id_kapal = k.id_kapal
      )
    `;

    const baseFrom = `FROM AllManifes ${whereClause}`;

    const [summary, byArah, kapalMonthly, trend] = await Promise.all([

      // Ringkasan total
      query(
        `${cte}
         SELECT
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
        `${cte}
         SELECT
          asal,
          tujuan,
          COALESCE(SUM(jumlah_penumpang), 0)  AS penumpang,
          COALESCE(SUM(kendaraan_gol_II), 0)  AS kend_r2,
          COALESCE(SUM(kendaraan_gol_IV), 0)  AS kend_r4,
          COALESCE(SUM(jumlah_barang_ton), 0) AS muatan,
          COUNT(*) AS total_trip
        ${baseFrom}
        GROUP BY asal, tujuan`,
        params
      ),

      // Per kapal per bulan (grouped bar chart)
      query(
        `${cte}
         SELECT
          armada AS nama_kapal,
          DATE_FORMAT(timestamp_keberangkatan, '%b %Y') AS bulan,
          DATE_FORMAT(timestamp_keberangkatan, '%Y-%m') AS sort_key,
          COALESCE(SUM(jumlah_penumpang), 0) AS penumpang
        ${baseFrom}
        GROUP BY armada, bulan, sort_key
        ORDER BY sort_key ASC, armada`,
        params
      ),

      // Tren bulanan (area chart)
      query(
        `${cte}
         SELECT
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