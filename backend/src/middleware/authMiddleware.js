// Middleware untuk proteksi route berdasarkan token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ 
      message: 'Token tidak ditemukan' 
    });
  }

  // Untuk sekarang simple validation
  // Bisa ditingkatkan dengan JWT di masa depan
  if (token.startsWith('token_')) {
    next();
  } else {
    return res.status(403).json({ 
      message: 'Token tidak valid' 
    });
  }
};

// Middleware untuk cek role
export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    const role = req.headers['x-user-role'];
    
    if (!role) {
      return res.status(401).json({ 
        message: 'Role tidak ditemukan di header' 
      });
    }

    if (roles.includes(role)) {
      next();
    } else {
      return res.status(403).json({ 
        message: 'Akses ditolak: Anda tidak memiliki akses ke resource ini' 
      });
    }
  };
};
