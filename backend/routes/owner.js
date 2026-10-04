import express from "express";
import ownerController from "../controllers/ownerController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Store Owner Dashboard
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("owner"),
  ownerController.getDashboard
);

// Store Owner Add Store
router.post(
  "/store",
  authMiddleware,
  roleMiddleware("owner"),
  ownerController.addStore
);

router.post(
  "/stores",
  authMiddleware,
  roleMiddleware("owner"),
  ownerController.addStore
);

export default router;