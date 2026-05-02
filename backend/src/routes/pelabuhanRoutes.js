import express from "express";
import {
  getAllPelabuhan,
  getPelabuhanById,
  createPelabuhan,
  updatePelabuhan,
  deletePelabuhan
} from "../controllers/pelabuhanController.js";

const router = express.Router();

// Get all pelabuhan
router.get("/", getAllPelabuhan);

// Get pelabuhan by ID
router.get("/:id", getPelabuhanById);

// Create new pelabuhan
router.post("/", createPelabuhan);

// Update pelabuhan
router.put("/:id", updatePelabuhan);

// Delete pelabuhan
router.delete("/:id", deletePelabuhan);

export default router;
