import express from "express";
import adminController from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// All admin routes require admin authentication
router.use(authMiddleware, roleMiddleware("admin"));

// Dashboard metrics
router.get("/dashboard", adminController.getDashboard);

// Stores
router.post("/stores", adminController.addStore);
router.get("/stores", adminController.getStores);
router.delete("/stores/:id", adminController.deleteStore);

// Users
router.post("/users", adminController.addUser);
router.get("/users", adminController.getUsers);

export default router;