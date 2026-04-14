import express from "express";
import {
  getAllRute,
  getRuteById,
  createRute,
  updateRute,
  deleteRute
} from "../controllers/ruteController.js";

const router = express.Router();

// Get all rute
router.get("/", getAllRute);

// Get rute by ID
router.get("/:id", getRuteById);

// Create new rute
router.post("/", createRute);

// Update rute
router.put("/:id", updateRute);

// Delete rute
router.delete("/:id", deleteRute);

export default router;
