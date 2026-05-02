import express from 'express';
import { fetchAndCache, getCached } from '../services/bmkgCacheService.js';

const router = express.Router();

router.get('/sabang-bandaAceh', async (req, res) => {
  // Coba ambil langsung dari BMKG (sekaligus update cache jika berhasil)
  const fresh = await fetchAndCache('sabang-bandaAceh');
  if (fresh) {
    return res.json(fresh);
  }

  // BMKG tidak bisa diakses — sajikan dari cache DB
  const cached = await getCached('sabang-bandaAceh');
  if (cached) {
    const age = Math.round((Date.now() - new Date(cached.fetched_at).getTime()) / 60000);
    console.log(`📦 Serving BMKG cache (${age} menit lalu)`);
    const parsedData = typeof cached.data === 'string' ? JSON.parse(cached.data) : cached.data;
    return res.json({
      ...parsedData,
      _from_cache: true,
      _cached_at: cached.fetched_at,
    });
  }

  // Tidak ada sama sekali
  return res.status(503).json({
    error: 'Data BMKG tidak tersedia dan belum ada cache',
  });
});

export default router;
