import express from "express";
import { getJadwal } from "../controllers/jadwalController.js";

const router = express.Router();

router.get("/", getJadwal);

export default router;