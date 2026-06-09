import { evalMamdani } from "../utils/fuzzyMamdani.js";

export const predictSafety = (req, res) => {
  const { wave, wind, current } = req.body;
  if (wave == null || wind == null || current == null) {
    return res.status(400).json({ error: "input missing" });
  }
  const result = evalMamdani(wave, wind, current);
  return res.json({ wave, wind, current, ...result });
};
