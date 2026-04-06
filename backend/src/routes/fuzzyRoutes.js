import express from "express";
import { evalMamdaniDebug } from "../utils/fuzzyMamdani.js";
const router = express.Router();

router.post("/debug", (req, res) => {
  const { wave, wind, current, step } = req.body || {};
  if (wave == null || wind == null || current == null) {
    return res.status(400).json({ error: "wave/wind/current required in body" });
  }
  const debug = evalMamdaniDebug(Number(wave), Number(wind), Number(current), { step: step ?? 0.1 });
  res.json(debug);
});

export default router;
