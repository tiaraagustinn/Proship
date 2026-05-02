import express from "express";
import {
  getAllKapal,
  getKapalById,
  createKapal,
  updateKapal,
  deleteKapal
} from "../controllers/kapalController.js";

const router = express.Router();

// Get all kapal
router.get("/", getAllKapal);

// Get kapal by ID
router.get("/:id", getKapalById);

// Create new kapal
router.post("/", createKapal);

// Update kapal
router.put("/:id", updateKapal);

// Delete kapal
router.delete("/:id", deleteKapal);

export default router;
