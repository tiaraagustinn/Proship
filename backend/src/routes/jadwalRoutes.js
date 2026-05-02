import express from "express";
import { getJadwal, postJadwal, putJadwal, removeJadwal } from "../controllers/jadwalController.js";

const router = express.Router();

router.get("/", getJadwal);
router.post("/", postJadwal);
router.put("/:id", putJadwal);
router.delete("/:id", removeJadwal);

export default router;
