import db from '../config/db.js';

// Get all kapal
export const getAllKapal = async (req, res) => {
  try {
    const sql = `
      SELECT id_kapal, nama_kapal, tipe_kapal, kapasitas_muatan, kapasitas_kend_r2, kapasitas_kend_r4, kapasitas_penumpang, status_kapal
      FROM kapal
      ORDER BY id_kapal DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal mengambil data kapal',
          message: err.message
        });
      }

      res.status(200).json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan',
      message: error.message
    });
  }
};

// Get kapal by ID
export const getKapalById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT id_kapal, nama_kapal, tipe_kapal, kapasitas_muatan, kapasitas_kend_r2, kapasitas_kend_r4, kapasitas_penumpang, status_kapal
      FROM kapal
      WHERE id_kapal = ?
    `;

    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal mengambil data kapal',
          message: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          error: 'Kapal tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        data: results[0]
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan',
      message: error.message
    });
  }
};

// Create kapal
export const createKapal = async (req, res) => {
  try {
    const { nama_kapal, tipe_kapal, kapasitas_muatan, kapasitas_kend_r2, kapasitas_kend_r4, kapasitas_penumpang, status_kapal } = req.body;

    if (!nama_kapal || !tipe_kapal || !kapasitas_muatan) {
      return res.status(400).json({
        message: 'Semua field harus diisi'
      });
    }

    const insertSql = `
      INSERT INTO kapal (nama_kapal, tipe_kapal, kapasitas_muatan, kapasitas_kend_r2, kapasitas_kend_r4, kapasitas_penumpang, status_kapal)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertSql, [nama_kapal, tipe_kapal, kapasitas_muatan, kapasitas_kend_r2 || 0, kapasitas_kend_r4 || 0, kapasitas_penumpang || 0, status_kapal || 'aktif'], (err, result) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal membuat kapal',
          message: err.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Kapal berhasil ditambahkan',
        id: result.insertId
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan',
      message: error.message
    });
  }
};

// Update kapal
export const updateKapal = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kapal, tipe_kapal, kapasitas_muatan, kapasitas_kend_r2, kapasitas_kend_r4, kapasitas_penumpang, status_kapal } = req.body;

    if (!nama_kapal || !tipe_kapal || !kapasitas_muatan) {
      return res.status(400).json({
        message: 'Semua field harus diisi'
      });
    }

    const sql = `
      UPDATE kapal
      SET nama_kapal = ?, tipe_kapal = ?, kapasitas_muatan = ?, kapasitas_kend_r2 = ?, kapasitas_kend_r4 = ?, kapasitas_penumpang = ?, status_kapal = ?
      WHERE id_kapal = ?
    `;

    db.query(sql, [nama_kapal, tipe_kapal, kapasitas_muatan, kapasitas_kend_r2 || 0, kapasitas_kend_r4 || 0, kapasitas_penumpang || 0, status_kapal || 'aktif', id], (err, result) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal mengupdate kapal',
          message: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Kapal tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Kapal berhasil diupdate'
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan',
      message: error.message
    });
  }
};

// Delete kapal
export const deleteKapal = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `DELETE FROM kapal WHERE id_kapal = ?`;

    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal menghapus kapal',
          message: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Kapal tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Kapal berhasil dihapus'
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan',
      message: error.message
    });
  }
};
