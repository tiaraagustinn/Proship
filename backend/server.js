// server.js
import express from "express";
import cors from "cors";
import db from './src/config/db.js';
import weatherCardRoutes from './src/routes/weatherCardRoutes.js';
import weatherForestRoutes from './src/routes/weatherForestRoutes.js';
import weatherDetailRoutes from './src/routes/weatherDetailRoutes.js';
import dummyRoutes from './src/routes/dummyRoutes.js';
import fuzzyRoutes from './src/routes/fuzzyRoutes.js';
import jadwalRoutes from './src/routes/jadwalRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import kapalRoutes from './src/routes/kapalRoutes.js';
import pelabuhanRoutes from './src/routes/pelabuhanRoutes.js';
import ruteRoutes from './src/routes/ruteRoutes.js';
import historisRoutes from './src/routes/historisRoutes.js';
import cron from 'node-cron';
import { refreshAll } from './src/services/bmkgCacheService.js';


const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Test endpoint
app.get("/", (req, res) => {
  res.json({ message: "Backend berjalan dengan baik" });
});

// ✅ NEW ROUTE BEFORE AUTH
app.get('/new-test', (req, res) => {
  res.json({ message: '/new-test works!' });
});

// ✅ TEST ROUTE before auth
app.get('/api/test-before', (req, res) => {
  res.json({ message: 'This test route is BEFORE auth middleware' });
});

// TEST at different path
app.get('/test-petugas', (req, res) => {
  res.json({ message: '/test-petugas works!' });
});

// ✅ Auth routes
app.use('/api/auth', authRoutes);

// ✅ Petugas routes - implemented directly
console.log('💾 Setting up petugas GET / handler');
app.get('/api/petugas', (req, res) => {
  console.log('📍 /api/petugas GET called');
  const sql = `SELECT id_petugas, username, nama, email, role, status FROM petugas ORDER BY id_petugas DESC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('SQL ERROR:', err);
      return res.status(500).json({ error: 'Gagal mengambil data petugas', message: err.message });
    }
    res.status(200).json({ success: true, data: results });
  });
});
console.log('💾 Setting up petugas GET /:id handler');
app.get('/api/petugas/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT id_petugas, username, nama, email, role, status FROM petugas WHERE id_petugas = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('SQL ERROR:', err);
      return res.status(500).json({ error: 'Gagal mengambil data petugas', message: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Petugas tidak ditemukan' });
    }
    res.status(200).json({ success: true, data: results[0] });
  });
});

app.post('/api/petugas', (req, res) => {
  const { username, nama, email, role, password } = req.body;
  if (!username || !nama || !email || !role || !password) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Format email tidak valid' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password minimal 8 karakter' });
  }
  
  const checkSql = `SELECT id_petugas FROM petugas WHERE username = ?`;
  db.query(checkSql, [username], (err, results) => {
    if (err) {
      console.error('SQL ERROR:', err);
      return res.status(500).json({ error: 'Gagal memeriksa username', message: err.message });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }
    
    // Generate ID based on max existing number
    const idSql = `SELECT MAX(CAST(SUBSTRING(id_petugas, 4) AS UNSIGNED)) as maxNum FROM petugas`;
    db.query(idSql, (err, idResults) => {
      const maxNum = idResults[0].maxNum || 0;
      const newId = 'PTG' + String(maxNum + 1).padStart(3, '0');
      const insertSql = `INSERT INTO petugas (id_petugas, username, nama, email, role, password, status) VALUES (?, ?, ?, ?, ?, ?, 'aktif')`;
      db.query(insertSql, [newId, username, nama, email, role, password], (err, result) => {
        if (err) {
          console.error('SQL ERROR:', err);
          return res.status(500).json({ error: 'Gagal membuat petugas', message: err.message });
        }
        res.status(201).json({ success: true, message: 'Petugas berhasil ditambahkan', id: newId });
      });
    });
  });
});

app.put('/api/petugas/:id', (req, res) => {
  const { id } = req.params;
  const { username, nama, email, role, status } = req.body;
  
  if (!username || !nama || !email || !role || !status) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }
  if (!['aktif', 'nonaktif'].includes(status.toLowerCase())) {
    return res.status(400).json({ message: 'Status hanya boleh aktif atau nonaktif' });
  }
  
  const sql = `UPDATE petugas SET username = ?, nama = ?, email = ?, role = ?, status = ? WHERE id_petugas = ?`;
  db.query(sql, [username, nama, email, role, status.toLowerCase(), id], (err, result) => {
    if (err) {
      console.error('SQL ERROR:', err);
      return res.status(500).json({ error: 'Gagal mengupdate petugas', message: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Petugas tidak ditemukan' });
    }
    res.status(200).json({ success: true, message: 'Petugas berhasil diupdate' });
  });
});

app.delete('/api/petugas/:id', (req, res) => {
  const { id } = req.params;
  // Cek apakah akun ini admin dan satu-satunya admin
  db.query(
    `SELECT role FROM petugas WHERE id_petugas = ?`, [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Gagal memeriksa data', message: err.message });
      if (rows.length === 0) return res.status(404).json({ error: 'Petugas tidak ditemukan' });
      if (rows[0].role === 'admin') {
        db.query(`SELECT COUNT(*) as total FROM petugas WHERE role = 'admin'`, (err2, countRows) => {
          if (err2) return res.status(500).json({ error: 'Gagal memeriksa data', message: err2.message });
          if (countRows[0].total <= 1) {
            return res.status(403).json({ error: 'Admin utama tidak dapat dihapus. Harus ada minimal satu admin.' });
          }
          db.query(`DELETE FROM petugas WHERE id_petugas = ?`, [id], (err3, result) => {
            if (err3) return res.status(500).json({ error: 'Gagal menghapus petugas', message: err3.message });
            res.status(200).json({ success: true, message: 'Petugas berhasil dihapus' });
          });
        });
      } else {
        db.query(`DELETE FROM petugas WHERE id_petugas = ?`, [id], (err2, result) => {
          if (err2) return res.status(500).json({ error: 'Gagal menghapus petugas', message: err2.message });
          res.status(200).json({ success: true, message: 'Petugas berhasil dihapus' });
        });
      }
    }
  );
});

// ✅ Petugas routes - OLD (commented out due to routing issues)
// app.use('/api/petugas', petugasRoutes);

// ✅ Weather routes
app.use('/api/weather', weatherCardRoutes);
app.use('/api/maritim-weather', weatherForestRoutes);
app.use('/api/detail', weatherDetailRoutes);
app.use('/api/dummy', dummyRoutes);
app.use('/api/fuzzy', fuzzyRoutes);
app.use('/api/jadwal', jadwalRoutes);

// ✅ Data Master routes
app.use('/api/kapal', kapalRoutes);
app.use('/api/pelabuhan', pelabuhanRoutes);
app.use('/api/rute', ruteRoutes);
app.use('/api/historis', historisRoutes);

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

// ✅ Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Server backend berjalan di http://localhost:${PORT}`);

  // Fetch BMKG saat server pertama kali nyala
  refreshAll();

  // Refresh otomatis setiap 6 jam: "0 */6 * * *"
  cron.schedule('0 */6 * * *', () => {
    console.log('🔄 Cron: refresh BMKG cache...');
    refreshAll();
  });
});