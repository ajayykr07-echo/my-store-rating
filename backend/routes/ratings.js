import express from "express";
import ratingController from "../controllers/ratingController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// All ratings routes require normal user authentication
router.use(authMiddleware, roleMiddleware("user"));

// Store listing for normal user
router.get("/stores", ratingController.getStoresForUser);

// Submit rating
router.post("/", ratingController.submitRating);

// Update rating
router.put("/:storeId", ratingController.updateRating);

export default router;