// src/routes/weatherCardRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Endpoint untuk ambil data BMKG
router.get('/', async (req, res) => {
  try {
    // Default lokasi: Balohan
    const url = 'https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=11.71.03.2002';
    const { data } = await axios.get(url);
    res.json(data);
  } catch (error) {
    console.error('Gagal fetch BMKG:', error.message);
    res.status(500).json({ error: 'Gagal mengambil data dari BMKG' });
  }
});

module.exports = router;
