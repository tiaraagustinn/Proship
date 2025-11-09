// server.js
import express from "express";
import cors from "cors";
import weatherCardRoutes from './src/routes/weatherCardRoutes.js';
import weatherForestRoutes from './src/routes/weatherForestRoutes.js';
import weatherDetailRoutes from './src/routes/weatherDetailRoutes.js';
import dummyRoutes from './src/routes/dummyRoutes.js';
// import fuzzyRoutes from './src/routes/fuzzyRoutes.js';


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

// ✅ Weather routes
app.use('/api/weather', weatherCardRoutes);
app.use('/api/maritim-weather', weatherForestRoutes);
app.use('/api/detail', weatherDetailRoutes);
app.use('/api/dummy', dummyRoutes);
// app.use('/api/fuzzy', fuzzyRoutes);

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
});