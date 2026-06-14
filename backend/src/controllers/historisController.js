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
        h.id_historis,
        h.id_jadwal,
        h.id_petugas,
        h.berat_muatan,
        h.jmlh_penumpang,
        h.jmlh_kend_r2,
        h.jmlh_kend_r4,
        j.tanggal,
        j.waktu_berangkat AS jam,
        pa.nama_pelabuhan AS asal,
        pt.nama_pelabuhan AS tujuan,
        k.nama_kapal AS armada,
        k.kapasitas_penumpang AS kapasitas_kapal,
        ROUND((h.jmlh_penumpang / NULLIF(k.kapasitas_penumpang, 0)) * 100, 2) AS load_factor
      FROM historis_angkutan h
      LEFT JOIN jadwal_pelayaran j ON h.id_jadwal = j.id_jadwal
      LEFT JOIN rute_pelayaran r ON j.id_rute = r.id_rute
      LEFT JOIN pelabuhan pa ON r.id_pelabuhan_asal = pa.id_pelabuhan
      LEFT JOIN pelabuhan pt ON r.id_pelabuhan_tujuan = pt.id_pelabuhan
      LEFT JOIN kapal k ON j.id_kapal = k.id_kapal
      ORDER BY h.id_historis DESC
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
    await query(
      `UPDATE historis_angkutan SET jmlh_penumpang=?, jmlh_kend_r2=?, jmlh_kend_r4=?, berat_muatan=? WHERE id_historis=?`,
      [jmlh_penumpang, jmlh_kend_r2 || 0, jmlh_kend_r4 || 0, berat_muatan || 0, id]
    );
    res.json({ success: true, message: 'Data historis berhasil diupdate' });
  } catch (err) {
    console.error('UPDATE HISTORIS ERROR:', err);
    res.status(500).json({ error: 'Gagal mengupdate data historis', message: err.message });
  }
};

export const deleteHistoris = async (req, res) => {
  const { id } = req.params;
  try {
    await query(`DELETE FROM historis_angkutan WHERE id_historis = ?`, [id]);
    res.json({ success: true, message: 'Data historis berhasil dihapus' });
  } catch (err) {
    console.error('DELETE HISTORIS ERROR:', err);
    res.status(500).json({ error: 'Gagal menghapus data historis', message: err.message });
  }
};
