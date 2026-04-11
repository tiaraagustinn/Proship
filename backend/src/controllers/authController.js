import db from '../config/db.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username dan password harus diisi' 
      });
    }

    // Query database untuk mencari user
    const sql = `
      SELECT id_petugas, username, nama, role, status, email
      FROM petugas
      WHERE username = ? AND password = ? AND status = 'aktif'
    `;

    db.query(sql, [username, password], (err, results) => {
      if (err) {
        console.error('SQL ERROR:', err);
        return res.status(500).json({ 
          error: 'Gagal mengakses database',
          message: err.message 
        });
      }

      if (results.length === 0) {
        return res.status(401).json({ 
          message: 'Username atau password salah' 
        });
      }

      const user = results[0];

      // Periksa status
      if (user.status !== 'aktif') {
        return res.status(403).json({ 
          message: 'Akun Anda tidak aktif' 
        });
      }

      // Login berhasil
      res.status(200).json({
        success: true,
        token: `token_${user.id_petugas}_${Date.now()}`,
        userId: user.id_petugas,
        userName: user.nama,
        username: user.username,
        role: user.role,
        email: user.email,
        message: 'Login berhasil'
      });
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan pada server',
      message: error.message 
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Logout hanya menghapus token dari client
    // Bisa ditambahkan blacklist token jika diperlukan
    res.status(200).json({ 
      success: true,
      message: 'Logout berhasil' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Gagal logout',
      message: error.message 
    });
  }
};

// Verify token (optional untuk route protection)
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Token tidak ditemukan' 
      });
    }

    // Untuk sekarang, verifikasi simple
    // Bisa ditingkatkan dengan JWT di masa depan
    res.status(200).json({ 
      success: true,
      message: 'Token valid' 
    });
  } catch (error) {
    res.status(401).json({ 
      message: 'Token tidak valid' 
    });
  }
};
