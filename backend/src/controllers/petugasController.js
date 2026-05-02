import db from '../config/db.js';

// Get all petugas
export const getAllPetugas = async (req, res) => {
  try {
    const sql = `
      SELECT id_petugas, username, nama, email, role, status
      FROM petugas
      ORDER BY id_petugas DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal mengambil data petugas',
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

// Get petugas by ID
export const getPetugasById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT id_petugas, username, nama, email, role, status
      FROM petugas
      WHERE id_petugas = ?
    `;

    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal mengambil data petugas',
          message: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          error: 'Petugas tidak ditemukan'
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

// Create petugas
export const createPetugas = async (req, res) => {
  try {
    const { username, nama, email, role, password } = req.body;

    // Validasi input
    if (!username || !nama || !email || !role || !password) {
      return res.status(400).json({
        message: 'Semua field harus diisi'
      });
    }

    // Check if username already exists
    const checkSql = `
      SELECT id_petugas FROM petugas WHERE username = ?
    `;

    db.query(checkSql, [username], (err, results) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal memeriksa username',
          message: err.message
        });
      }

      if (results.length > 0) {
        return res.status(400).json({
          message: 'Username sudah digunakan'
        });
      }

      // Insert new petugas
      const insertSql = `
        INSERT INTO petugas (username, nama, email, role, password, status)
        VALUES (?, ?, ?, ?, ?, 'aktif')
      `;

      db.query(insertSql, [username, nama, email, role, password], (err, result) => {
        if (err) {
          console.error('SQL ERROR:', err);
          return res.status(500).json({
            error: 'Gagal membuat petugas',
            message: err.message
          });
        }

        res.status(201).json({
          success: true,
          message: 'Petugas berhasil ditambahkan',
          id: result.insertId
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan',
      message: error.message
    });
  }
};

// Update petugas
export const updatePetugas = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, nama, email, role, status } = req.body;

    // Validasi input
    if (!username || !nama || !email || !role || !status) {
      return res.status(400).json({
        message: 'Semua field harus diisi'
      });
    }

    // Validate status
    if (!['aktif', 'nonaktif'].includes(status.toLowerCase())) {
      return res.status(400).json({
        message: 'Status hanya boleh aktif atau nonaktif'
      });
    }

    const sql = `
      UPDATE petugas
      SET username = ?, nama = ?, email = ?, role = ?, status = ?
      WHERE id_petugas = ?
    `;

    db.query(sql, [username, nama, email, role, status.toLowerCase(), id], (err, result) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal mengupdate petugas',
          message: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Petugas tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Petugas berhasil diupdate'
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan',
      message: error.message
    });
  }
};

// Toggle status (aktif/nonaktif)
export const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current status
    const getSql = `SELECT status FROM petugas WHERE id_petugas = ?`;

    db.query(getSql, [id], (err, results) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal mengambil status petugas',
          message: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          error: 'Petugas tidak ditemukan'
        });
      }

      const currentStatus = results[0].status;
      const newStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';

      // Update status
      const updateSql = `
        UPDATE petugas
        SET status = ?
        WHERE id_petugas = ?
      `;

      db.query(updateSql, [newStatus, id], (err, result) => {
        if (err) {
          console.error('SQL ERROR:', err);
          return res.status(500).json({
            error: 'Gagal mengubah status petugas',
            message: err.message
          });
        }

        res.status(200).json({
          success: true,
          message: `Status petugas berhasil diubah menjadi ${newStatus}`,
          newStatus: newStatus
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan',
      message: error.message
    });
  }
};

// Delete petugas
export const deletePetugas = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `DELETE FROM petugas WHERE id_petugas = ?`;

    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({
          error: 'Gagal menghapus petugas',
          message: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Petugas tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Petugas berhasil dihapus'
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Terjadi kesalahan',
      message: error.message
    });
  }
};
