import db from '../config/db.js';

// Get all rute
export const getAllRute = async (req, res) => {
  try {
    const sql = `
      SELECT 
        r.id_rute,
        CONCAT(p1.nama_pelabuhan, ' - ', p2.nama_pelabuhan) as nama_rute,
        p1.nama_pelabuhan as asal,
        p2.nama_pelabuhan as tujuan,
        r.jarak_tempuh,
        r.created_at,
        r.updated_at
      FROM rute_pelayaran r
      LEFT JOIN Pelabuhan p1 ON r.id_pelabuhan_asal = p1.id_pelabuhan
      LEFT JOIN Pelabuhan p2 ON r.id_pelabuhan_tujuan = p2.id_pelabuhan
      ORDER BY r.id_rute DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal mengambil data rute',
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

// Get rute by ID
export const getRuteById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        r.id_rute,
        CONCAT(p1.nama_pelabuhan, ' - ', p2.nama_pelabuhan) as nama_rute,
        p1.nama_pelabuhan as asal,
        p2.nama_pelabuhan as tujuan,
        r.id_pelabuhan_asal,
        r.id_pelabuhan_tujuan,
        r.jarak_tempuh,
        r.created_at,
        r.updated_at
      FROM rute_pelayaran r
      LEFT JOIN Pelabuhan p1 ON r.id_pelabuhan_asal = p1.id_pelabuhan
      LEFT JOIN Pelabuhan p2 ON r.id_pelabuhan_tujuan = p2.id_pelabuhan
      WHERE r.id_rute = ?
    `;

    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal mengambil data rute',
          message: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          error: 'Rute tidak ditemukan'
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

// Create rute
export const createRute = async (req, res) => {
  try {
    const { id_pelabuhan_asal, id_pelabuhan_tujuan, jarak_tempuh } = req.body;

    // Validasi input
    if (!id_pelabuhan_asal || !id_pelabuhan_tujuan) {
      return res.status(400).json({
        message: 'id_pelabuhan_asal dan id_pelabuhan_tujuan harus diisi'
      });
    }

    if (id_pelabuhan_asal === id_pelabuhan_tujuan) {
      return res.status(400).json({
        message: 'Pelabuhan asal dan tujuan tidak boleh sama'
      });
    }

    const insertSql = `
      INSERT INTO rute_pelayaran (id_pelabuhan_asal, id_pelabuhan_tujuan, jarak_tempuh)
      VALUES (?, ?, ?)
    `;

    db.query(insertSql, [id_pelabuhan_asal, id_pelabuhan_tujuan, jarak_tempuh || null], (err, result) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal membuat rute',
          message: err.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Rute berhasil ditambahkan',
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

// Update rute
export const updateRute = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_pelabuhan_asal, id_pelabuhan_tujuan, jarak_tempuh } = req.body;

    // Validasi input
    if (!id_pelabuhan_asal || !id_pelabuhan_tujuan) {
      return res.status(400).json({
        message: 'id_pelabuhan_asal dan id_pelabuhan_tujuan harus diisi'
      });
    }

    if (id_pelabuhan_asal === id_pelabuhan_tujuan) {
      return res.status(400).json({
        message: 'Pelabuhan asal dan tujuan tidak boleh sama'
      });
    }

    const sql = `
      UPDATE rute_pelayaran
      SET id_pelabuhan_asal = ?, id_pelabuhan_tujuan = ?, jarak_tempuh = ?
      WHERE id_rute = ?
    `;

    db.query(sql, [id_pelabuhan_asal, id_pelabuhan_tujuan, jarak_tempuh || null, id], (err, result) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal mengupdate rute',
          message: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Rute tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Rute berhasil diupdate'
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan',
      message: error.message
    });
  }
};

// Delete rute
export const deleteRute = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `DELETE FROM rute_pelayaran WHERE id_rute = ?`;

    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal menghapus rute',
          message: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Rute tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Rute berhasil dihapus'
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan',
      message: error.message
    });
  }
};
