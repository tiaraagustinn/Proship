import express from "express";
import axios from "axios";
import fs from "fs";
import path from "path";
import { evalMamdaniDebug } from "../utils/fuzzyMamdani.js";

const router = express.Router();

/**
 * Fetch dummy data from the provided URL and extract numeric inputs.
 * Uses averages of min/max where both are provided.
 * Returns an object { wave, wind, current, raw }
 */
export async function fetchAndPrepareInputs(url = "http://localhost:5000/api/dummy/perairan/dummy.json") {
  const resp = await axios.get(url);
  const data = resp.data;
  // The API appears to provide an object with a `data` array. Use the first entry.
  const entry = Array.isArray(data.data) && data.data.length ? data.data[0] : null;
  if (!entry) throw new Error("no data entry found in API response");

  const waveMin = Number(entry.wave_min ?? (entry.wave ?? 0));
  const waveMax = Number(entry.wave_max ?? (entry.wave ?? 0));
  const windMin = Number(entry.wind_speed_min ?? 0);
  const windMax = Number(entry.wind_speed_max ?? 0);
  const currentMin = Number(entry.current_speed_min ?? 0);
  const currentMax = Number(entry.current_speed_max ?? 0);

  // Use averages where possible
  const waveAvg = (Number.isFinite(waveMin) && Number.isFinite(waveMax)) ? (waveMin + waveMax) / 2 : (waveMin || waveMax || 0);
  const windAvg = (Number.isFinite(windMin) && Number.isFinite(windMax)) ? (windMin + windMax) / 2 : (windMin || windMax || 0);
  const currentAvg = (Number.isFinite(currentMin) && Number.isFinite(currentMax)) ? (currentMin + currentMax) / 2 : (currentMin || currentMax || 0);

  return {
    wave: Number(waveAvg),
    wind: Number(windAvg),
    current: Number(currentAvg),
    raw: entry,
  };
}

/**
 * Read the local dummy.json file (path expected relative to backend root) and
 * prepare inputs the same way as fetchAndPrepareInputs.
 */
export function fetchAndPrepareInputsFromFile(filePath = path.join(process.cwd(), 'data', 'dummy.json')) {
  if (!fs.existsSync(filePath)) throw new Error(`file not found: ${filePath}`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  const entry = Array.isArray(data.data) && data.data.length ? data.data[0] : null;
  if (!entry) throw new Error("no data entry found in file");

  const waveMin = Number(entry.wave_min ?? (entry.wave ?? 0));
  const waveMax = Number(entry.wave_max ?? (entry.wave ?? 0));
  const windMin = Number(entry.wind_speed_min ?? 0);
  const windMax = Number(entry.wind_speed_max ?? 0);
  const currentMin = Number(entry.current_speed_min ?? 0);
  const currentMax = Number(entry.current_speed_max ?? 0);

  const waveAvg = (Number.isFinite(waveMin) && Number.isFinite(waveMax)) ? (waveMin + waveMax) / 2 : (waveMin || waveMax || 0);
  const windAvg = (Number.isFinite(windMin) && Number.isFinite(windMax)) ? (windMin + windMax) / 2 : (windMin || windMax || 0);
  const currentAvg = (Number.isFinite(currentMin) && Number.isFinite(currentMax)) ? (currentMin + currentMax) / 2 : (currentMin || currentMax || 0);

  return {
    wave: Number(waveAvg),
    wind: Number(windAvg),
    current: Number(currentAvg),
    raw: entry,
  };
}

/**
 * Run the fuzzy Mamdani evaluation and print results to console.
 */
export async function runFuzzyFromUrl(url) {
  try {
    const inputs = await fetchAndPrepareInputs(url);
    console.log("Inputs used for fuzzy processing:", {
      wave: inputs.wave,
      wind: inputs.wind,
      current: inputs.current,
    });

    // call the existing eval function from utils. It returns score, category, and details.
    const result = evalMamdaniDebug(inputs.wave, inputs.wind, inputs.current, { step: 0.5 });

    console.log("Fuzzy result summary:");
    console.log("  score:", result.score);
    console.log("  category:", result.category);
    console.log("  rule count:", result.ruleDetails?.length ?? 0);

    // For debugging, print the first few rule details
    if (result.ruleDetails && result.ruleDetails.length) {
      console.log("  sample rules (first 6):");
      result.ruleDetails.slice(0,6).forEach(r => {
        console.log(`    rule ${r.idx}: antecedent=${r.antecedent.join(',')} degrees=${r.degrees.map(d=>d.toFixed(3)).join(',')} strength=${r.ruleStrength}`);
      });
    }

    return result;
  } catch (err) {
    console.error("Fuzzy processing failed:", err.message || err);
    throw err;
  }
}

// HTTP endpoint: GET /api/fuzzy/evaluate
// Optional query: ?source=file to use backend/data/dummy.json instead of fetching over HTTP
router.get('/evaluate', async (req, res) => {
  try {
    const useFile = req.query.source === 'file';
    const inputs = useFile ? fetchAndPrepareInputsFromFile() : await fetchAndPrepareInputs();
    const result = evalMamdaniDebug(inputs.wave, inputs.wind, inputs.current, { step: 0.5 });
    return res.json({ inputs: { wave: inputs.wave, wind: inputs.wind, current: inputs.current }, score: result.score, category: result.category, ruleDetails: result.ruleDetails });
  } catch (err) {
    console.error('Error /api/fuzzy/evaluate', err);
    return res.status(500).json({ error: String(err.message || err) });
  }
});

// Allow running directly for debugging
if (process.argv[1] && process.argv[1].endsWith('fuzzyRoutes.js')) {
  const url = process.argv[2] || undefined;
  runFuzzyFromUrl(url).catch(()=>process.exit(1));
}

export default router;
