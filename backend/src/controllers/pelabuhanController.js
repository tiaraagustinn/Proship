import db from '../config/db.js';

// Get all pelabuhan
export const getAllPelabuhan = async (req, res) => {
  try {
    const sql = `
      SELECT id_pelabuhan, nama_pelabuhan, alamat, latitude, longitude
      FROM Pelabuhan
      ORDER BY id_pelabuhan DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal mengambil data pelabuhan',
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

// Get pelabuhan by ID
export const getPelabuhanById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT id_pelabuhan, nama_pelabuhan, alamat, latitude, longitude
      FROM Pelabuhan
      WHERE id_pelabuhan = ?
    `;

    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal mengambil data pelabuhan',
          message: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          error: 'Pelabuhan tidak ditemukan'
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

// Create pelabuhan
export const createPelabuhan = async (req, res) => {
  try {
    const { nama_pelabuhan, lokasi, kapasitas, status } = req.body;

    // Validasi input
    if (!nama_pelabuhan || !lokasi || !kapasitas) {
      return res.status(400).json({
        message: 'Semua field harus diisi'
      });
    }

    const insertSql = `
      INSERT INTO Pelabuhan (nama_pelabuhan, lokasi, kapasitas, status)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertSql, [nama_pelabuhan, lokasi, kapasitas, status || 'aktif'], (err, result) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal membuat pelabuhan',
          message: err.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Pelabuhan berhasil ditambahkan',
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

// Update pelabuhan
export const updatePelabuhan = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_pelabuhan, lokasi, kapasitas, status } = req.body;

    // Validasi input
    if (!nama_pelabuhan || !lokasi || !kapasitas) {
      return res.status(400).json({
        message: 'Semua field harus diisi'
      });
    }

    const sql = `
      UPDATE Pelabuhan
      SET nama_pelabuhan = ?, lokasi = ?, kapasitas = ?, status = ?
      WHERE id_pelabuhan = ?
    `;

    db.query(sql, [nama_pelabuhan, lokasi, kapasitas, status, id], (err, result) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal mengupdate pelabuhan',
          message: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Pelabuhan tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Pelabuhan berhasil diupdate'
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan',
      message: error.message
    });
  }
};

// Delete pelabuhan
export const deletePelabuhan = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `DELETE FROM Pelabuhan WHERE id_pelabuhan = ?`;

    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal menghapus pelabuhan',
          message: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Pelabuhan tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Pelabuhan berhasil dihapus'
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan',
      message: error.message
    });
  }
};
