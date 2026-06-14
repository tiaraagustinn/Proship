import express from "express";
import axios from "axios";
import fs from "fs";
import path from "path";
import { evalMamdaniDebug } from "../utils/fuzzyMamdani.js";

const router = express.Router();

function nudgeIfOnBreak(val, breaks) {
  const EPS = 1e-3;
  for (const b of breaks) {
    if (Math.abs(val - b) < 1e-9) return val + EPS;
  }
  return val;
}

function normalizeInputs(entry) {
  // API BMKG: wave_height (m), wind_speed (knot), current_speed (KNOT → cm/s)
  const wave = Number(entry.wave_height ?? entry.wave_max ?? entry.wave ?? 0);
  const wind = Number(entry.wind_speed ?? entry.wind_speed_max ?? 0);
  // current_speed dari BMKG dalam satuan KM/H (km/j), konversi ke cm/s: 1 km/h = 27.7778 cm/s
  const current = Number(entry.current_speed ?? entry.current_speed_max ?? 0) * 27.7778;

  return {
    wave: nudgeIfOnBreak(wave, [1.25, 1.75, 2.0, 2.5, 2.75, 3.0]),   // Titik patah MFs wave
    wind: nudgeIfOnBreak(wind, [8.0, 10.0, 15.0, 20.0, 22.0, 25.0]), // Titik patah MFs wind
    current: nudgeIfOnBreak(current, [15.0, 25.0, 40.0, 55.0, 60.0, 70.0]),// Titik patah MFs arus
    raw: entry,
  };
}

export async function fetchAndPrepareInputs(url = "https://maritim.bmkg.go.id/marine2026-data/perairan/P.A.04.json") {
  const resp = await axios.get(url);
  const data = resp.data;

  // API BMKG baru: { forecast_day1: [...], "forecast_day2-4": [...] }
  const day1 = data.forecast_day1;
  if (Array.isArray(day1) && day1.length) {
    return normalizeInputs(day1[0]);
  }

  // Fallback: format lama { data: [...] }
  const legacy = Array.isArray(data.data) && data.data.length ? data.data[0] : null;
  if (legacy) return normalizeInputs(legacy);

  throw new Error("no data entry found in API response");
}


export function fetchAndPrepareInputsFromFile(filePath = path.join(process.cwd(), "data", "dummy.json")) {
  if (!fs.existsSync(filePath)) throw new Error(`file not found: ${filePath}`);
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  const entry = Array.isArray(data.data) && data.data.length ? data.data[0] : null;
  if (!entry) throw new Error("no data entry found in file");
  return normalizeInputs(entry);
}

export async function runFuzzyFromUrl(url) {
  try {
    const inputs = await fetchAndPrepareInputs(url);
    const result = evalMamdaniDebug(inputs.wave, inputs.wind, inputs.current);
    return result;
  } catch (err) {
    console.error("Fuzzy processing failed:", err.message || err);
    throw err;
  }
}

router.get("/evaluate", async (req, res) => {
  try {
    const useFile = req.query.source === "file";
    const inputs = useFile ? fetchAndPrepareInputsFromFile() : await fetchAndPrepareInputs();
    const result = evalMamdaniDebug(inputs.wave, inputs.wind, inputs.current);
    return res.json({
      inputs: { wave: inputs.wave, wind: inputs.wind, current: inputs.current },
      score: result.score,
      category: result.category,
      ruleDetails: result.ruleDetails,
    });
  } catch (err) {
    console.error("Error /api/fuzzy/evaluate", err);
    return res.status(500).json({ error: String(err.message || err) });
  }
});

router.post("/debug", (req, res) => {
  const { wave, wind, current, step } = req.body || {};
  if (wave == null || wind == null || current == null) {
    return res.status(400).json({ error: "wave/wind/current required in body" });
  }
  const debug = evalMamdaniDebug(Number(wave), Number(wind), Number(current));
  return res.json(debug);
});

if (process.argv[1] && process.argv[1].endsWith("fuzzyRoutes.js")) {
  const url = process.argv[2] || undefined;
  runFuzzyFromUrl(url).catch(() => process.exit(1));
}

export default router;
