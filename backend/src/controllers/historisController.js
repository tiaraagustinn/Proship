import db from '../config/db.js';

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

export const getHistoris = async (req, res) => {
  try {
    const sql = `
      SELECT
        h.id_historis,
        h.id_jadwal,
        h.id_petugas,
        h.jmlh_penumpang   AS jumlahPenumpang,
        h.jmlh_kend_r2     AS kendaraanRoda2,
        h.jmlh_kend_r4     AS kendaraanRoda4,
        h.berat_muatan     AS beratMuatan,
        j.tanggal,
        j.waktu_berangkat  AS jam,
        pa.nama_pelabuhan  AS keberangkatan,
        pt.nama_pelabuhan  AS tujuan,
        k.nama_kapal       AS armada
      FROM historis_angkutan h
      JOIN jadwal_pelayaran j ON h.id_jadwal = j.id_jadwal
      JOIN rute_pelayaran r   ON j.id_rute   = r.id_rute
      JOIN pelabuhan pa       ON r.id_pelabuhan_asal   = pa.id_pelabuhan
      JOIN pelabuhan pt       ON r.id_pelabuhan_tujuan = pt.id_pelabuhan
      JOIN kapal k            ON j.id_kapal  = k.id_kapal
      ORDER BY j.tanggal DESC, j.waktu_berangkat DESC
    `;
    const data = await query(sql);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Gagal ambil data historis', message: err.message });
  }
};

export const createHistoris = async (req, res) => {
  const { id_jadwal, id_petugas, jmlh_penumpang, jmlh_kend_r2, jmlh_kend_r4, berat_muatan } = req.body;
  if (!id_jadwal || jmlh_penumpang == null || jmlh_kend_r2 == null || jmlh_kend_r4 == null || berat_muatan == null) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }
  try {
    const result = await query(
      `INSERT INTO historis_angkutan (id_jadwal, id_petugas, jmlh_penumpang, jmlh_kend_r2, jmlh_kend_r4, berat_muatan)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_jadwal, id_petugas || null, jmlh_penumpang, jmlh_kend_r2, jmlh_kend_r4, berat_muatan]
    );
    res.status(201).json({ success: true, message: 'Data historis berhasil disimpan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Gagal simpan historis', message: err.message });
  }
};

export const updateHistoris = async (req, res) => {
  const { id } = req.params;
  const { id_jadwal, jmlh_penumpang, jmlh_kend_r2, jmlh_kend_r4, berat_muatan } = req.body;
  if (!id_jadwal || jmlh_penumpang == null || jmlh_kend_r2 == null || jmlh_kend_r4 == null || berat_muatan == null) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }
  try {
    await query(
      `UPDATE historis_angkutan SET id_jadwal=?, jmlh_penumpang=?, jmlh_kend_r2=?, jmlh_kend_r4=?, berat_muatan=? WHERE id_historis=?`,
      [id_jadwal, jmlh_penumpang, jmlh_kend_r2, jmlh_kend_r4, berat_muatan, id]
    );
    res.json({ success: true, message: 'Data historis berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal update historis', message: err.message });
  }
};

export const deleteHistoris = async (req, res) => {
  const { id } = req.params;
  try {
    await query(`DELETE FROM historis_angkutan WHERE id_historis=?`, [id]);
    res.json({ success: true, message: 'Data historis berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal hapus historis', message: err.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const { from, to } = req.query;

    let whereClause = '';
    let params = [];
    if (from && to) {
      whereClause = `WHERE j.tanggal BETWEEN ? AND ?`;
      params = [from, to];
    } else if (from) {
      whereClause = `WHERE j.tanggal >= ?`;
      params = [from];
    } else if (to) {
      whereClause = `WHERE j.tanggal <= ?`;
      params = [to];
    }

    const baseJoin = `
      FROM historis_angkutan h
      JOIN jadwal_pelayaran j ON h.id_jadwal = j.id_jadwal
      JOIN rute_pelayaran r   ON j.id_rute   = r.id_rute
      JOIN pelabuhan pa       ON r.id_pelabuhan_asal   = pa.id_pelabuhan
      JOIN pelabuhan pt       ON r.id_pelabuhan_tujuan = pt.id_pelabuhan
      JOIN kapal k            ON j.id_kapal  = k.id_kapal
      ${whereClause}
    `;

    const [summary, byRute, kapalMonthly, trend] = await Promise.all([
      // Ringkasan total
      query(
        `SELECT
          COALESCE(SUM(h.jmlh_penumpang), 0) AS total_penumpang,
          COALESCE(SUM(h.jmlh_kend_r2), 0)   AS total_kend_r2,
          COALESCE(SUM(h.jmlh_kend_r4), 0)   AS total_kend_r4,
          COALESCE(SUM(h.berat_muatan), 0)    AS total_muatan
        ${baseJoin}`,
        params
      ),

      // Per rute
      query(
        `SELECT
          pa.nama_pelabuhan AS asal,
          pt.nama_pelabuhan AS tujuan,
          COALESCE(SUM(h.jmlh_penumpang), 0) AS penumpang,
          COALESCE(SUM(h.jmlh_kend_r2), 0)   AS kend_r2,
          COALESCE(SUM(h.jmlh_kend_r4), 0)   AS kend_r4,
          COALESCE(SUM(h.berat_muatan), 0)    AS muatan
        ${baseJoin}
        GROUP BY pa.nama_pelabuhan, pt.nama_pelabuhan`,
        params
      ),

      // Per kapal per bulan (untuk grouped bar chart)
      query(
        `SELECT
          k.nama_kapal,
          DATE_FORMAT(j.tanggal, '%b %Y') AS bulan,
          DATE_FORMAT(j.tanggal, '%Y-%m') AS sort_key,
          COALESCE(SUM(h.jmlh_penumpang), 0) AS penumpang
        ${baseJoin}
        GROUP BY k.nama_kapal, bulan, sort_key
        ORDER BY sort_key ASC, k.nama_kapal`,
        params
      ),

      // Tren bulanan total (untuk area chart)
      query(
        `SELECT
          DATE_FORMAT(j.tanggal, '%b %Y') AS bulan,
          DATE_FORMAT(j.tanggal, '%Y-%m') AS sort_key,
          COALESCE(SUM(h.jmlh_penumpang), 0) AS penumpang,
          COALESCE(SUM(h.jmlh_kend_r2), 0)   AS kend_r2,
          COALESCE(SUM(h.jmlh_kend_r4), 0)   AS kend_r4
        ${baseJoin}
        GROUP BY bulan, sort_key
        ORDER BY sort_key ASC`,
        params
      ),
    ]);

    // Transform kapalMonthly → format recharts grouped bar
    // [ { bulan, 'KMP BRR': 120, 'KMP Aceh Hebat 2': 80 }, ... ]
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
      by_rute: byRute,
      kapal_bulan: kapalBulan,
      kapal_list: kapalList,
      trend,
    });
  } catch (err) {
    console.error('DASHBOARD ERROR:', err);
    res.status(500).json({ error: 'Gagal ambil data dashboard', message: err.message });
  }
};
