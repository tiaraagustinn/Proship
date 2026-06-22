import db from '../config/db.js';

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

// GET /api/historis
// Semua data dari manifes_angkutan (historis_angkutan sudah dihapus)
export const getHistoris = async (req, res) => {
  try {
    const sql = `
      SELECT
        CONCAT('M', id)                              AS id_historis,
        jumlah_barang_ton                            AS berat_muatan,
        jumlah_penumpang                             AS jmlh_penumpang,
        COALESCE(kendaraan_gol_2, 0)                 AS jmlh_kend_r2,
        COALESCE(kendaraan_gol_4, 0)                 AS jmlh_kend_r4,
        DATE(\`timestamp\`)                           AS tanggal,
        TIME(\`timestamp\`)                           AS jam,
        pelabuhan_asal                               AS asal,
        tujuan,
        nama_kapal                                   AS armada,
        kapasitas_kapal,
        load_factor_persen                           AS load_factor
      FROM manifes_angkutan
      ORDER BY \`timestamp\` DESC
    `;
    const data = await query(sql);
    res.json({ success: true, data });
  } catch (err) {
    console.error('GET HISTORIS ERROR:', err);
    res.status(500).json({ error: 'Gagal mengambil data historis', message: err.message });
  }
};

// POST /api/historis — sudah tidak aktif, input melalui /api/manifes
export const createHistoris = async (req, res) => {
  res.status(410).json({ message: 'Endpoint ini sudah tidak aktif. Gunakan POST /api/manifes.' });
};

// PUT /api/historis/:id
export const updateHistoris = async (req, res) => {
  const { id } = req.params;
  const { jmlh_penumpang, jmlh_kend_r2, jmlh_kend_r4, berat_muatan } = req.body;

  try {
    // id format: "M{angka}" → strip prefix M
    const realId = id.startsWith('M') ? id.substring(1) : id;
    await query(
      `UPDATE manifes_angkutan
       SET jumlah_penumpang=?, kendaraan_gol_2=?, kendaraan_gol_4=?, jumlah_barang_ton=?
       WHERE id=?`,
      [jmlh_penumpang, jmlh_kend_r2 || 0, jmlh_kend_r4 || 0, berat_muatan || 0, realId]
    );
    res.json({ success: true, message: 'Data historis berhasil diupdate' });
  } catch (err) {
    console.error('UPDATE HISTORIS ERROR:', err);
    res.status(500).json({ error: 'Gagal mengupdate data historis', message: err.message });
  }
};

// DELETE /api/historis/:id
export const deleteHistoris = async (req, res) => {
  const { id } = req.params;
  try {
    const realId = id.startsWith('M') ? id.substring(1) : id;
    await query(`DELETE FROM manifes_angkutan WHERE id=?`, [realId]);
    res.json({ success: true, message: 'Data historis berhasil dihapus' });
  } catch (err) {
    console.error('DELETE HISTORIS ERROR:', err);
    res.status(500).json({ error: 'Gagal menghapus data historis', message: err.message });
  }
};
