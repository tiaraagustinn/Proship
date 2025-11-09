import express from "express";
import axios from "axios";

const router = express.Router();

// Fungsi bantu untuk fuzzy logic Mamdani sederhana
function fuzzySafety(wave, wind, current) {
  // --- 1. Fuzzifikasi ---
  const waveLow = wave <= 1 ? 1 : wave <= 2 ? (2 - wave) / 1 : 0;
  const waveMed = wave >= 1 && wave <= 3 ? 1 - Math.abs(wave - 2) / 1 : 0;
  const waveHigh = wave >= 2 ? (wave - 2) / 2 : 0;

  const windLow = wind <= 5 ? 1 : wind <= 10 ? (10 - wind) / 5 : 0;
  const windMed = wind >= 5 && wind <= 15 ? 1 - Math.abs(wind - 10) / 5 : 0;
  const windHigh = wind >= 10 ? (wind - 10) / 10 : 0;

  const currentLow = current <= 30 ? 1 : current <= 50 ? (50 - current) / 20 : 0;
  const currentMed = current >= 30 && current <= 70 ? 1 - Math.abs(current - 50) / 20 : 0;
  const currentHigh = current >= 50 ? (current - 50) / 30 : 0;

  // --- 2. Aturan Fuzzy (Mamdani) ---
  const aman = Math.min(waveLow, windLow, currentLow);
  const waspada = Math.max(
    Math.min(waveMed, windMed),
    Math.min(waveMed, currentMed),
    Math.min(windMed, currentMed)
  );
  const bahaya = Math.max(waveHigh, windHigh, currentHigh);

  // --- 3. Defuzzifikasi (skor kasar) ---
  const score =
    (aman * 100 + waspada * 50 + bahaya * 10) / (aman + waspada + bahaya + 0.0001);

  let kategori = "Aman";
  if (score < 40) kategori = "Bahaya";
  else if (score < 70) kategori = "Waspada";

  return { score: score.toFixed(2), kategori };
}

// --- Endpoint utama ---
router.get("/predict", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/api/dummy/perairan/dummy.json");

    const data = response.data.data.map((item) => {
      const wave = (item.wave_desc.includes("-"))
        ? (parseFloat(item.wave_desc.split("-")[0]) + parseFloat(item.wave_desc.split("-")[1])) / 2
        : parseFloat(item.wave_desc);

      const wind = (item.wind_speed_min + item.wind_speed_max) / 2;
      const current = (item.current_speed_min + item.current_speed_max) / 2;

      const hasil = fuzzySafety(wave, wind, current);

      return {
        waktu: item.time_desc,
        tinggi_gelombang: wave,
        kecepatan_angin: wind,
        kecepatan_arus: current,
        tingkat_keselamatan: hasil.kategori,
        skor: hasil.score,
      };
    });

    res.json({ lokasi: response.data.name, hasil: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menghitung fuzzy" });
  }
});

export default router;
