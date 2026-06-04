import express from "express";
import { getJadwal, postJadwal, putJadwal, removeJadwal, getJadwalDetailById } from "../controllers/jadwalController.js";

const router = express.Router();

router.get("/", getJadwal);
router.get("/:id/detail", getJadwalDetailById);
router.post("/", postJadwal);
router.put("/:id", putJadwal);
router.delete("/:id", removeJadwal);

export default router;
