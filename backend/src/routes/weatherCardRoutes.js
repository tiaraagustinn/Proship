// routes/weather.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Endpoint untuk Pelabuhan Balohan
router.get('/balohan', async (req, res) => {
  try {
    console.log('📍 Fetching Balohan data from BMKG...');
    
    const response = await axios.get(
      'https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=11.72.02.2005'
    );
    
    console.log('✅ Balohan data received:', response.data);
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Error Balohan:', error.message);
    res.status(500).json({ 
      error: 'Gagal mengambil data Balohan',
      details: error.message 
    });
  }
});

// Endpoint untuk Pelabuhan Ulee Lheue
router.get('/ulee-lheue', async (req, res) => {
  try {
    console.log('📍 Fetching Ulee Lheue data from BMKG...');
    
    const response = await axios.get(
      'https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=11.71.03.2002'
    );
    
    console.log('✅ Ulee Lheue data received:', response.data);
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Error Ulee Lheue:', error.message);
    res.status(500).json({ 
      error: 'Gagal mengambil data Ulee Lheue',
      details: error.message 
    });
  }
});

module.exports = router;