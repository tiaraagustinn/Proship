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
  const waveMin = Number(entry.wave_min ?? (entry.wave ?? 0));
  const waveMax = Number(entry.wave_max ?? (entry.wave ?? 0));
  const windMin = Number(entry.wind_speed_min ?? 0);
  const windMax = Number(entry.wind_speed_max ?? 0);
  const currentMin = Number(entry.current_speed_min ?? 0);
  const currentMax = Number(entry.current_speed_max ?? 0);

  const waveAvg = Number.isFinite(waveMin) && Number.isFinite(waveMax) ? (waveMin + waveMax) / 2 : waveMin || waveMax || 0;
  const windAvg = Number.isFinite(windMin) && Number.isFinite(windMax) ? (windMin + windMax) / 2 : windMin || windMax || 0;
  const currentAvg = Number.isFinite(currentMin) && Number.isFinite(currentMax) ? (currentMin + currentMax) / 2 : currentMin || currentMax || 0;

  return {
    wave: nudgeIfOnBreak(Number(waveAvg), [1.25, 2.5, 4.0]),
    wind: nudgeIfOnBreak(Number(windAvg), [10, 20, 30]),
    current: nudgeIfOnBreak(Number(currentAvg), [25, 75]),
    raw: entry,
  };
}

export async function fetchAndPrepareInputs(url = "http://localhost:5000/api/dummy/perairan/dummy.json") {
  const resp = await axios.get(url);
  const data = resp.data;
  const entry = Array.isArray(data.data) && data.data.length ? data.data[0] : null;
  if (!entry) throw new Error("no data entry found in API response");
  return normalizeInputs(entry);
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
    const result = evalMamdaniDebug(inputs.wave, inputs.wind, inputs.current, { step: 0.5 });
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
    const result = evalMamdaniDebug(inputs.wave, inputs.wind, inputs.current, { step: 0.5 });
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
  const debug = evalMamdaniDebug(Number(wave), Number(wind), Number(current), { step: step ?? 0.1 });
  return res.json(debug);
});

if (process.argv[1] && process.argv[1].endsWith("fuzzyRoutes.js")) {
  const url = process.argv[2] || undefined;
  runFuzzyFromUrl(url).catch(() => process.exit(1));
}

export default router;
