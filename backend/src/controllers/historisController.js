import db from '../config/db.js';

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

// GET /api/historis
export const getHistoris = async (req, res) => {
  try {
    const sql = `
      SELECT
        CONCAT('H', h.id_historis) AS id_historis,
        h.id_jadwal,
        h.id_petugas,
        h.berat_muatan,
        h.jmlh_penumpang,
        h.jmlh_kend_r2,
        h.jmlh_kend_r4,
        j.tanggal,
        j.waktu_berangkat AS jam,
        pa.nama_pelabuhan COLLATE utf8mb4_unicode_ci AS asal,
        pt.nama_pelabuhan COLLATE utf8mb4_unicode_ci AS tujuan,
        k.nama_kapal COLLATE utf8mb4_unicode_ci AS armada,
        k.kapasitas_penumpang AS kapasitas_kapal,
        ROUND((h.jmlh_penumpang / NULLIF(k.kapasitas_penumpang, 0)) * 100, 2) AS load_factor
      FROM historis_angkutan h
      LEFT JOIN jadwal_pelayaran j ON h.id_jadwal = j.id_jadwal
      LEFT JOIN rute_pelayaran r ON j.id_rute = r.id_rute
      LEFT JOIN pelabuhan pa ON r.id_pelabuhan_asal = pa.id_pelabuhan
      LEFT JOIN pelabuhan pt ON r.id_pelabuhan_tujuan = pt.id_pelabuhan
      LEFT JOIN kapal k ON j.id_kapal = k.id_kapal

      UNION ALL

      SELECT
        CONCAT('M', id) AS id_historis,
        NULL AS id_jadwal,
        NULL AS id_petugas,
        jumlah_barang_ton AS berat_muatan,
        jumlah_penumpang AS jmlh_penumpang,
        kendaraan_gol_II AS jmlh_kend_r2,
        kendaraan_gol_IV AS jmlh_kend_r4,
        DATE(timestamp_keberangkatan) AS tanggal,
        TIME(timestamp_keberangkatan) AS jam,
        pelabuhan_asal AS asal,
        tujuan AS tujuan,
        nama_kapal AS armada,
        kapasitas_kapal AS kapasitas_kapal,
        load_factor
      FROM manifes_angkutan
      
      ORDER BY tanggal DESC
    `;
    const data = await query(sql);
    res.json({ success: true, data });
  } catch (err) {
    console.error('GET HISTORIS ERROR:', err);
    res.status(500).json({ error: 'Gagal mengambil data historis', message: err.message });
  }
};

// POST /api/historis
export const createHistoris = async (req, res) => {
  const { id_jadwal, id_petugas, jmlh_penumpang, jmlh_kend_r2, jmlh_kend_r4, berat_muatan } = req.body;

  if (!id_jadwal || jmlh_penumpang == null) {
    return res.status(400).json({ message: 'Field wajib belum lengkap (id_jadwal, jmlh_penumpang)' });
  }

  try {
    const result = await query(
      `INSERT INTO historis_angkutan (id_jadwal, id_petugas, jmlh_penumpang, jmlh_kend_r2, jmlh_kend_r4, berat_muatan)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_jadwal, id_petugas || null, jmlh_penumpang, jmlh_kend_r2 || 0, jmlh_kend_r4 || 0, berat_muatan || 0]
    );
    res.status(201).json({ success: true, message: 'Data historis berhasil disimpan', id: result.insertId });
  } catch (err) {
    console.error('CREATE HISTORIS ERROR:', err);
    res.status(500).json({ error: 'Gagal menyimpan data historis', message: err.message });
  }
};

// PUT /api/historis/:id
export const updateHistoris = async (req, res) => {
  const { id } = req.params;
  const { jmlh_penumpang, jmlh_kend_r2, jmlh_kend_r4, berat_muatan } = req.body;
  
  try {
    if (id.startsWith('M')) {
      const realId = id.substring(1);
      await query(
        `UPDATE manifes_angkutan SET jumlah_penumpang=?, kendaraan_gol_II=?, kendaraan_gol_IV=?, jumlah_barang_ton=? WHERE id=?`,
        [jmlh_penumpang, jmlh_kend_r2 || 0, jmlh_kend_r4 || 0, berat_muatan || 0, realId]
      );
    } else {
      const realId = id.startsWith('H') ? id.substring(1) : id;
      await query(
        `UPDATE historis_angkutan SET jmlh_penumpang=?, jmlh_kend_r2=?, jmlh_kend_r4=?, berat_muatan=? WHERE id_historis=?`,
        [jmlh_penumpang, jmlh_kend_r2 || 0, jmlh_kend_r4 || 0, berat_muatan || 0, realId]
      );
    }
    res.json({ success: true, message: 'Data historis berhasil diupdate' });
  } catch (err) {
    console.error('UPDATE HISTORIS ERROR:', err);
    res.status(500).json({ error: 'Gagal mengupdate data historis', message: err.message });
  }
};

export const deleteHistoris = async (req, res) => {
  const { id } = req.params;
  try {
    if (id.startsWith('M')) {
      const realId = id.substring(1);
      await query(`DELETE FROM manifes_angkutan WHERE id=?`, [realId]);
    } else {
      const realId = id.startsWith('H') ? id.substring(1) : id;
      await query(`DELETE FROM historis_angkutan WHERE id_historis=?`, [realId]);
    }
    res.json({ success: true, message: 'Data historis berhasil dihapus' });
  } catch (err) {
    console.error('DELETE HISTORIS ERROR:', err);
    res.status(500).json({ error: 'Gagal menghapus data historis', message: err.message });
  }
};
