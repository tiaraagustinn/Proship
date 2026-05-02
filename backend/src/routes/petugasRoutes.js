import express from "express";
import {
  getAllPetugas,
  getPetugasById,
  createPetugas,
  updatePetugas,
  toggleStatus,
  deletePetugas
} from "../controllers/petugasController.js";

const router = express.Router();

// Get all petugas
router.get("/", getAllPetugas);

// Get petugas by ID
router.get("/:id", getPetugasById);

// Create new petugas
router.post("/", createPetugas);

// Update petugas
router.put("/:id", updatePetugas);

// Toggle status (aktif/nonaktif)
router.patch("/:id/toggle-status", toggleStatus);

// Delete petugas
router.delete("/:id", deletePetugas);

export default router;
