import express from "express";
import { login, logout, verifyToken } from "../controllers/authController.js";

const router = express.Router();

// Login endpoint
router.post("/login", login);

// Logout endpoint
router.post("/logout", logout);

// Verify token endpoint
router.get("/verify", verifyToken);

export default router;
