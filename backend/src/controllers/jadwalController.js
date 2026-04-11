import { getAllJadwal } from '../services/jadwalService.js';

export const getJadwal = async (req, res) => {
  try {
    const { tanggal } = req.query;
    const data = await getAllJadwal(tanggal);
    res.json(data);
  } catch (error) {
    console.error("JADWAL ERROR:", error);
    res.status(500).json({ 
      error: "Gagal ambil data",
      message: error.message,
      sqlError: error.sql || null
    });
  }
};