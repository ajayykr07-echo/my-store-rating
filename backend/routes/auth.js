import express from "express";
import authController from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Protected routes
router.put("/password", authMiddleware, authController.updatePassword);

export default router;