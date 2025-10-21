import express from 'express';
import axios from 'axios';

const router = express.Router();

// Endpoint untuk Perairan Sabang - Banda Aceh
router.get('/sabang-bandaAceh', async (req, res) => {
  try {
    console.log('📍 Fetching sabang-bandaAceh data from BMKG...');
    
    const response = await axios.get(
      'https://peta-maritim.bmkg.go.id/public_api/perairan/A.03_Perairan%20Sabang%20-%20Banda%20Aceh.json'
    );
    
    console.log('✅ sabang-bandaAceh data received');
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Error sabang-bandaAceh:', error.message);
    res.status(500).json({ 
      error: 'Gagal mengambil data sabang-bandaAceh',
      details: error.message 
    });
  }
});

export default router;