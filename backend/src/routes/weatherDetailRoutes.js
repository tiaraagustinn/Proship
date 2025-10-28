import express from 'express';
import axios from 'axios';

const router = express.Router();

// Endpoint untuk detail cuaca perairan
router.get('/detail-cuaca', async (req, res) => {
  try {
    console.log('Fetching detail cuaca data from BMKG...');
    
    const response = await axios.get(
      'https://peta-maritim.bmkg.go.id/public_api/perairan/A.03_Perairan%20Sabang%20-%20Banda%20Aceh.json'
    );
    
    console.log('detail cuaca data received');
    res.json(response.data);
    
  } catch (error) {
    console.error('Error detail cuaca:', error.message);
    res.status(500).json({ 
      error: 'Gagal mengambil data detail cuaca',
      details: error.message 
    });
  }
});

export default router;