import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Konversi __dirname untuk ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Endpoint utama seperti BMKG
router.get('/perairan/dummy.json', (req, res) => {
  const filePath = path.join(__dirname, '../../data/dummy.json');

  if (fs.existsSync(filePath)) {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonData);
  } else {
    res.status(404).json({
      error: 'File dummy.json tidak ditemukan'
    });
  }
});


export default router;
